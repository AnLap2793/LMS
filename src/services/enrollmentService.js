/**
 * Enrollment Service - Mock data cho đăng ký khóa học và tiến độ học
 * Sử dụng mock data thay vì Directus API
 */
import { mockEnrollments, getEnrollmentStats } from '../mocks/enrollments';
import { mockCourses } from '../mocks/courses';
import { ENROLLMENT_STATUS } from '../constants/lms';

// Helper: Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for mutations (để test mutations)
let enrollmentsData = [...mockEnrollments];

// Helper: Get course by ID
const getCourseById = courseId => mockCourses.find(c => c.id === courseId);

// Helper: Transform enrollment to API response format
const transformEnrollment = enrollment => {
    const course = getCourseById(enrollment.course_id);
    return {
        id: enrollment.id,
        status: enrollment.status,
        progress_percentage: enrollment.progress_percentage,
        enrolled_at: enrollment.date_created,
        completed_at: enrollment.completed_at,
        last_accessed_at: enrollment.started_at || enrollment.date_created,
        course: course
            ? {
                  id: course.id,
                  title: course.title,
                  description: course.description,
                  thumbnail: course.thumbnail,
                  difficulty: course.difficulty,
                  duration_hours: Math.round(course.duration / 60),
                  instructor: course.user_created
                      ? {
                            first_name: course.user_created.first_name,
                            last_name: course.user_created.last_name,
                            avatar: null,
                        }
                      : null,
                  tags: course.tags?.map(t => ({ tags_id: t })) || [],
              }
            : enrollment.course,
    };
};

export const enrollmentService = {
    /**
     * Lấy danh sách enrollments của user hiện tại
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách enrollments
     */
    getMyEnrollments: async (params = {}) => {
        await delay();
        const { status, search, page = 1, limit = 12 } = params;

        let filteredEnrollments = [...enrollmentsData];

        // Filter theo status
        if (status && status !== 'all') {
            filteredEnrollments = filteredEnrollments.filter(e => e.status === status);
        }

        // Search theo tên khóa học
        if (search) {
            const searchLower = search.toLowerCase();
            filteredEnrollments = filteredEnrollments.filter(e => {
                const course = getCourseById(e.course_id);
                return course?.title?.toLowerCase().includes(searchLower);
            });
        }

        // Sort by last accessed
        filteredEnrollments.sort((a, b) => {
            const dateA = new Date(a.started_at || a.date_created);
            const dateB = new Date(b.started_at || b.date_created);
            return dateB - dateA;
        });

        // Pagination
        const offset = (page - 1) * limit;
        const paginatedEnrollments = filteredEnrollments.slice(offset, offset + limit);

        return paginatedEnrollments.map(transformEnrollment);
    },

    /**
     * Đếm số enrollments theo status (cho statistics)
     * @returns {Promise<Object>} Thống kê enrollments
     */
    getMyEnrollmentStats: async () => {
        await delay(100);
        const stats = getEnrollmentStats();

        return {
            total: stats.total,
            inProgress: stats.inProgress,
            completed: stats.completed,
            assigned: stats.assigned,
        };
    },

    /**
     * Lấy enrollments đang học (continue learning) cho HomePage
     * @param {number} limit - Số lượng
     * @returns {Promise<Array>} Danh sách enrollments đang học
     */
    getContinueLearning: async (limit = 4) => {
        await delay();

        const inProgressEnrollments = enrollmentsData
            .filter(e => e.status === ENROLLMENT_STATUS.IN_PROGRESS)
            .sort((a, b) => {
                const dateA = new Date(a.started_at || a.date_created);
                const dateB = new Date(b.started_at || b.date_created);
                return dateB - dateA;
            })
            .slice(0, limit);

        return inProgressEnrollments.map(e => {
            const course = getCourseById(e.course_id);
            return {
                id: e.id,
                status: e.status,
                progress_percentage: e.progress_percentage,
                last_accessed_at: e.started_at || e.date_created,
                course: course
                    ? {
                          id: course.id,
                          title: course.title,
                          thumbnail: course.thumbnail,
                          difficulty: course.difficulty,
                          duration_hours: Math.round(course.duration / 60),
                      }
                    : e.course,
            };
        });
    },

    /**
     * Lấy chi tiết enrollment
     * @param {string} enrollmentId - ID enrollment
     * @returns {Promise<Object>} Chi tiết enrollment
     */
    getEnrollmentDetail: async enrollmentId => {
        await delay();
        const enrollment = enrollmentsData.find(e => e.id === enrollmentId);

        if (!enrollment) {
            throw new Error('Enrollment not found');
        }

        return transformEnrollment(enrollment);
    },

    /**
     * Lấy enrollment của user cho một khóa học cụ thể
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Object|null>} Enrollment hoặc null
     */
    getEnrollmentByCourse: async courseId => {
        await delay(100);
        const enrollment = enrollmentsData.find(e => e.course_id === courseId);

        if (!enrollment) {
            return null;
        }

        return {
            id: enrollment.id,
            status: enrollment.status,
            progress_percentage: enrollment.progress_percentage,
            enrolled_at: enrollment.date_created,
            last_accessed_at: enrollment.started_at || enrollment.date_created,
        };
    },

    /**
     * Đăng ký khóa học (self-enrollment)
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Object>} Enrollment mới
     */
    enrollCourse: async courseId => {
        await delay();

        // Check if already enrolled
        const existingEnrollment = enrollmentsData.find(e => e.course_id === courseId);
        if (existingEnrollment) {
            throw new Error('Bạn đã đăng ký khóa học này rồi');
        }

        const course = getCourseById(courseId);
        if (!course) {
            throw new Error('Không tìm thấy khóa học');
        }

        const newEnrollment = {
            id: `e${Date.now()}`,
            user_id: 'current_user',
            user: { id: 'current_user', first_name: 'Current', last_name: 'User', email: 'user@company.com' },
            course_id: courseId,
            course: { id: course.id, title: course.title },
            assigned_by: null,
            assignment_type: 'individual',
            status: ENROLLMENT_STATUS.IN_PROGRESS,
            progress_percentage: 0,
            started_at: new Date().toISOString(),
            completed_at: null,
            due_date: null,
            date_created: new Date().toISOString(),
        };

        enrollmentsData.push(newEnrollment);

        return {
            id: newEnrollment.id,
            course: courseId,
            status: newEnrollment.status,
            progress_percentage: newEnrollment.progress_percentage,
            enrolled_at: newEnrollment.date_created,
        };
    },

    /**
     * Cập nhật last_accessed_at khi user truy cập khóa học
     * @param {string} enrollmentId - ID enrollment
     * @returns {Promise<Object>} Enrollment đã cập nhật
     */
    updateLastAccessed: async enrollmentId => {
        await delay(100);

        const enrollmentIndex = enrollmentsData.findIndex(e => e.id === enrollmentId);
        if (enrollmentIndex === -1) {
            throw new Error('Enrollment not found');
        }

        enrollmentsData[enrollmentIndex] = {
            ...enrollmentsData[enrollmentIndex],
            started_at: new Date().toISOString(),
        };

        return {
            id: enrollmentId,
            last_accessed_at: new Date().toISOString(),
        };
    },

    /**
     * Cập nhật progress percentage
     * @param {string} enrollmentId - ID enrollment
     * @param {number} progressPercentage - Phần trăm tiến độ
     * @returns {Promise<Object>} Enrollment đã cập nhật
     */
    updateProgress: async (enrollmentId, progressPercentage) => {
        await delay();

        const enrollmentIndex = enrollmentsData.findIndex(e => e.id === enrollmentId);
        if (enrollmentIndex === -1) {
            throw new Error('Enrollment not found');
        }

        const updates = {
            progress_percentage: progressPercentage,
            started_at: new Date().toISOString(),
        };

        // Nếu hoàn thành 100%, cập nhật status và completed_at
        if (progressPercentage >= 100) {
            updates.status = ENROLLMENT_STATUS.COMPLETED;
            updates.completed_at = new Date().toISOString();
        } else if (progressPercentage > 0) {
            updates.status = ENROLLMENT_STATUS.IN_PROGRESS;
        }

        enrollmentsData[enrollmentIndex] = {
            ...enrollmentsData[enrollmentIndex],
            ...updates,
        };

        return {
            id: enrollmentId,
            ...updates,
        };
    },
};
