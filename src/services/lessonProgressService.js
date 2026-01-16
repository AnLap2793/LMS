/**
 * Lesson Progress Service - Quản lý tiến độ học bài
 * Directus Implementation
 */
import { directus } from './directus';
import { readItems, createItem, updateItem, readMe, aggregate } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const lessonProgressService = {
    /**
     * Lấy user ID hiện tại
     * @returns {Promise<string>} User ID
     */
    getCurrentUserId: async () => {
        const user = await directus.request(readMe({ fields: ['id'] }));
        return user.id;
    },

    /**
     * Lấy tiến độ học của user hiện tại
     * @returns {Promise<Array>} Danh sách tiến độ
     */
    getMyProgress: async () => {
        const userId = await lessonProgressService.getCurrentUserId();
        return await directus.request(
            readItems(COLLECTIONS.LESSON_PROGRESS, {
                filter: { user: { _eq: userId } },
                limit: -1,
            })
        );
    },

    /**
     * Lấy tiến độ theo enrollment ID
     * @param {string} enrollmentId - ID enrollment
     * @returns {Promise<Array>} Danh sách tiến độ các bài học
     */
    getByEnrollmentId: async enrollmentId => {
        // Assume user permission handles "mine" check, or explicit filter
        // If enrollment is mine, I can see its progress
        return await directus.request(
            readItems(COLLECTIONS.LESSON_PROGRESS, {
                filter: { enrollment: { _eq: enrollmentId } },
                limit: -1,
            })
        );
    },

    /**
     * Lấy tiến độ của một bài học cụ thể
     * @param {string} enrollmentId - ID enrollment
     * @param {string} lessonId - ID bài học
     * @returns {Promise<Object|null>} Tiến độ hoặc null
     */
    getByLessonId: async (enrollmentId, lessonId) => {
        const items = await directus.request(
            readItems(COLLECTIONS.LESSON_PROGRESS, {
                filter: {
                    enrollment: { _eq: enrollmentId },
                    lesson: { _eq: lessonId },
                },
                limit: 1,
            })
        );
        return items[0] || null;
    },

    /**
     * Tính toán tiến độ enrollment từ lesson progress
     * @param {string} enrollmentId - ID enrollment
     * @param {number} totalLessons - Tổng số bài học
     * @returns {Promise<number>} Phần trăm hoàn thành
     */
    calculateProgress: async (enrollmentId, totalLessons) => {
        if (totalLessons === 0) return 0;

        const result = await directus.request(
            aggregate(COLLECTIONS.LESSON_PROGRESS, {
                aggregate: { count: '*' },
                query: {
                    filter: {
                        enrollment: { _eq: enrollmentId },
                        status: { _eq: 'completed' },
                    },
                },
            })
        );

        const completedCount = Number(result[0]?.count) || 0;
        return Math.round((completedCount / totalLessons) * 100);
    },

    /**
     * Lấy tổng thời gian học của enrollment
     * @param {string} enrollmentId - ID enrollment
     * @returns {Promise<number>} Tổng thời gian (seconds)
     */
    getTotalTimeSpent: async enrollmentId => {
        const result = await directus.request(
            aggregate(COLLECTIONS.LESSON_PROGRESS, {
                aggregate: { sum: 'time_spent' },
                query: {
                    filter: { enrollment: { _eq: enrollmentId } },
                },
            })
        );
        return Number(result[0]?.sum?.time_spent) || 0;
    },

    /**
     * Bắt đầu học một bài học
     * @param {string} enrollmentId - ID enrollment
     * @param {string} lessonId - ID bài học
     * @returns {Promise<Object>} Tiến độ mới
     */
    startLesson: async (enrollmentId, lessonId) => {
        const existing = await lessonProgressService.getByLessonId(enrollmentId, lessonId);
        if (existing) return existing;

        const userId = await lessonProgressService.getCurrentUserId();

        return await directus.request(
            createItem(COLLECTIONS.LESSON_PROGRESS, {
                enrollment: enrollmentId,
                lesson: lessonId,
                user: userId,
                status: 'in_progress',
                progress_percentage: 0,
                time_spent: 0,
                started_at: new Date().toISOString(),
            })
        );
    },

    /**
     * Cập nhật tiến độ bài học
     * @param {string} progressId - ID tiến độ
     * @param {Object} data - Dữ liệu cập nhật { progress_percentage, time_spent, last_position }
     * @returns {Promise<Object>} Tiến độ đã cập nhật
     */
    updateProgress: async (progressId, data) => {
        const updates = { ...data };

        // Auto-complete
        if (data.progress_percentage >= 100) {
            updates.status = 'completed';
            updates.completed_at = new Date().toISOString();
        }

        return await directus.request(updateItem(COLLECTIONS.LESSON_PROGRESS, progressId, updates));
    },

    /**
     * Đánh dấu bài học hoàn thành
     * @param {string} enrollmentId - ID enrollment
     * @param {string} lessonId - ID bài học
     * @returns {Promise<Object>} Tiến độ đã cập nhật
     */
    completeLesson: async (enrollmentId, lessonId) => {
        let progress = await lessonProgressService.getByLessonId(enrollmentId, lessonId);

        if (!progress) {
            progress = await lessonProgressService.startLesson(enrollmentId, lessonId);
        }

        return await directus.request(
            updateItem(COLLECTIONS.LESSON_PROGRESS, progress.id, {
                status: 'completed',
                progress_percentage: 100,
                completed_at: new Date().toISOString(),
            })
        );
    },

    /**
     * Cập nhật vị trí video
     * @param {string} progressId - ID tiến độ
     * @param {number} position - Vị trí video (seconds)
     * @param {number} duration - Tổng thời lượng video (seconds)
     * @returns {Promise<Object>} Tiến độ đã cập nhật
     */
    updateVideoPosition: async (progressId, position, duration) => {
        const progressPercentage = duration > 0 ? Math.round((position / duration) * 100) : 0;
        const updates = {
            last_position: position,
            progress_percentage: Math.min(progressPercentage, 100),
            // Note: time_spent should ideally be accumulated, but here we might need to fetch first.
            // For simplicity, we just update last_position and percentage here.
            // Or we rely on client to send accumulated time_spent in updateProgress.
        };

        if (progressPercentage >= 90) {
            updates.status = 'completed';
            updates.completed_at = new Date().toISOString();
            updates.progress_percentage = 100;
        }

        return await directus.request(updateItem(COLLECTIONS.LESSON_PROGRESS, progressId, updates));
    },

    /**
     * Lấy thống kê tiến độ của user
     * @returns {Promise<Object>} Thống kê
     */
    getMyStats: async () => {
        const userId = await lessonProgressService.getCurrentUserId();

        const result = await directus.request(
            aggregate(COLLECTIONS.LESSON_PROGRESS, {
                aggregate: { count: '*', sum: 'time_spent' },
                groupBy: ['status'],
                query: {
                    filter: { user: { _eq: userId } },
                },
            })
        );

        let totalLessons = 0;
        let completedLessons = 0;
        let inProgressLessons = 0;
        let totalTimeSpent = 0; // Requires sum aggregation on total, or per group

        // Getting total time spent requires separate aggregation if group by status
        // Actually aggregate returns array of groups.
        // Directus aggregate: { status: 'completed', count: '10', sum: { time_spent: '500' } }

        result.forEach(item => {
            const count = Number(item.count);
            const time = Number(item.sum?.time_spent) || 0;
            totalLessons += count;
            totalTimeSpent += time;

            if (item.status === 'completed') completedLessons = count;
            if (item.status === 'in_progress') inProgressLessons = count;
        });

        return {
            totalLessons,
            completedLessons,
            inProgressLessons,
            totalTimeSpent,
            completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        };
    },
};
