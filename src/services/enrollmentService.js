/**
 * Enrollment Service - Quản lý đăng ký khóa học
 * Directus Implementation
 */
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem, readMe, aggregate } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';
import { ENROLLMENT_STATUS } from '../constants/lms';

export const enrollmentService = {
    /**
     * Lấy danh sách enrollments của user hiện tại
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách enrollments
     */
    getMyEnrollments: async (params = {}) => {
        const { status, search, page = 1, limit = 12 } = params;

        // Get current user ID
        const user = await directus.request(readMe());
        const userId = user.id;

        const filter = {
            user_id: { _eq: userId },
        };

        if (status && status !== 'all') {
            filter.status = { _eq: status };
        }

        if (search) {
            filter.course = {
                title: { _icontains: search },
            };
        }

        return await directus.request(
            readItems(COLLECTIONS.ENROLLMENTS, {
                filter,
                fields: [
                    '*',
                    'course.id',
                    'course.title',
                    'course.slug',
                    'course.thumbnail',
                    'course.difficulty',
                    'course.duration',
                    'course.user_created.first_name',
                    'course.user_created.last_name',
                ],
                sort: ['-last_accessed_at', '-date_created'], // Sort by last accessed desc
                limit,
                page,
            })
        );
    },

    /**
     * Đếm số enrollments theo status (cho statistics)
     * @returns {Promise<Object>} Thống kê enrollments
     */
    getMyEnrollmentStats: async () => {
        const user = await directus.request(readMe());
        const userId = user.id;

        const result = await directus.request(
            aggregate(COLLECTIONS.ENROLLMENTS, {
                aggregate: { count: '*' },
                groupBy: ['status'],
                query: {
                    filter: { user_id: { _eq: userId } },
                },
            })
        );

        // Calculate stats map
        const stats = result.reduce(
            (acc, item) => {
                acc[item.status] = Number(item.count);
                acc.total += Number(item.count);
                return acc;
            },
            { total: 0, [ENROLLMENT_STATUS.IN_PROGRESS]: 0, [ENROLLMENT_STATUS.COMPLETED]: 0, assigned: 0 } // 'assigned' might be pending or another status? Assuming 'assigned' isn't a direct status in DB based on code, but typically it is.
        );

        return {
            total: stats.total,
            inProgress: stats[ENROLLMENT_STATUS.IN_PROGRESS] || 0,
            completed: stats[ENROLLMENT_STATUS.COMPLETED] || 0,
            assigned: stats.assigned || 0, // Adjust key if 'assigned' is different in DB
        };
    },

    /**
     * Lấy enrollments đang học (continue learning) cho HomePage
     * @param {number} limit - Số lượng
     * @returns {Promise<Array>} Danh sách enrollments đang học
     */
    getContinueLearning: async (limit = 4) => {
        const user = await directus.request(readMe());
        const userId = user.id;

        return await directus.request(
            readItems(COLLECTIONS.ENROLLMENTS, {
                filter: {
                    user_id: { _eq: userId },
                    status: { _eq: ENROLLMENT_STATUS.IN_PROGRESS },
                },
                fields: ['*', 'course.id', 'course.title', 'course.thumbnail', 'course.difficulty', 'course.duration'],
                sort: ['-last_accessed_at'],
                limit,
            })
        );
    },

    /**
     * Lấy chi tiết enrollment
     * @param {string} enrollmentId - ID enrollment
     * @returns {Promise<Object>} Chi tiết enrollment
     */
    getEnrollmentDetail: async enrollmentId => {
        return await directus
            .request(
                readItems(COLLECTIONS.ENROLLMENTS, {
                    filter: { id: { _eq: enrollmentId } },
                    fields: ['*', 'course.*', 'course.user_created.first_name', 'course.user_created.last_name'],
                    limit: 1,
                })
            )
            .then(res => res[0]);
    },

    /**
     * Lấy enrollment của user cho một khóa học cụ thể
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Object|null>} Enrollment hoặc null
     */
    getEnrollmentByCourse: async courseId => {
        const user = await directus.request(readMe());
        const userId = user.id;

        const result = await directus.request(
            readItems(COLLECTIONS.ENROLLMENTS, {
                filter: {
                    user_id: { _eq: userId },
                    course_id: { _eq: courseId },
                },
                limit: 1,
            })
        );

        return result[0] || null;
    },

    /**
     * Đăng ký khóa học (self-enrollment)
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Object>} Enrollment mới
     */
    enrollCourse: async courseId => {
        const user = await directus.request(readMe());
        const userId = user.id;

        // Check if already enrolled
        const existing = await directus.request(
            readItems(COLLECTIONS.ENROLLMENTS, {
                filter: {
                    user_id: { _eq: userId },
                    course_id: { _eq: courseId },
                },
                limit: 1,
            })
        );

        if (existing.length > 0) {
            throw new Error('Bạn đã đăng ký khóa học này rồi');
        }

        return await directus.request(
            createItem(COLLECTIONS.ENROLLMENTS, {
                user_id: userId,
                course_id: courseId,
                status: ENROLLMENT_STATUS.IN_PROGRESS,
                progress_percentage: 0,
                started_at: new Date().toISOString(),
                assignment_type: 'self', // Default for self-enrollment
            })
        );
    },

    /**
     * Cập nhật last_accessed_at khi user truy cập khóa học
     * @param {string} enrollmentId - ID enrollment
     * @returns {Promise<Object>} Enrollment đã cập nhật
     */
    updateLastAccessed: async enrollmentId => {
        return await directus.request(
            updateItem(COLLECTIONS.ENROLLMENTS, enrollmentId, {
                last_accessed_at: new Date().toISOString(),
            })
        );
    },

    /**
     * Cập nhật progress percentage
     * @param {string} enrollmentId - ID enrollment
     * @param {number} progressPercentage - Phần trăm tiến độ
     * @returns {Promise<Object>} Enrollment đã cập nhật
     */
    updateProgress: async (enrollmentId, progressPercentage) => {
        const updates = {
            progress_percentage: progressPercentage,
            last_accessed_at: new Date().toISOString(),
        };

        // Nếu hoàn thành 100%, cập nhật status và completed_at
        if (progressPercentage >= 100) {
            updates.status = ENROLLMENT_STATUS.COMPLETED;
            updates.completed_at = new Date().toISOString();
        } else if (progressPercentage > 0) {
            updates.status = ENROLLMENT_STATUS.IN_PROGRESS;
        }

        return await directus.request(updateItem(COLLECTIONS.ENROLLMENTS, enrollmentId, updates));
    },

    /**
     * Admin: Lấy danh sách tất cả enrollments
     * @param {Object} params - Filter params
     */
    getAll: async (params = {}) => {
        const { search, status, courseId, userId, page = 1, limit = 10 } = params;

        const filter = {};

        if (status) filter.status = { _eq: status };
        if (courseId) filter.course_id = { _eq: courseId };
        if (userId) filter.user_id = { _eq: userId };

        // Note: Deep search in Directus needs configuration or specific fields
        if (search) {
            // Simplified search (might need adjustment based on requirements)
            // Searching across related collections (user.email, course.title) requires permission and specific filter structure
            // Or just search by ID if search is simple string
        }

        return await directus.request(
            readItems(COLLECTIONS.ENROLLMENTS, {
                filter,
                fields: ['*', 'user.first_name', 'user.last_name', 'user.email', 'course.title'],
                sort: ['-date_created'],
                page,
                limit,
            })
        );
    },

    /**
     * Admin: Assign course to user
     */
    assignCourse: async data => {
        // data: { user_id, course_id, due_date, ... }
        return await directus.request(
            createItem(COLLECTIONS.ENROLLMENTS, {
                ...data,
                status: ENROLLMENT_STATUS.IN_PROGRESS, // or 'assigned' if supported
                progress_percentage: 0,
                assigned_by: (await directus.request(readMe())).id, // Current admin ID
                assignment_type: 'assigned',
            })
        );
    },

    /**
     * Admin: Delete enrollment
     */
    delete: async id => {
        return await directus.request(deleteItem(COLLECTIONS.ENROLLMENTS, id));
    },
};
