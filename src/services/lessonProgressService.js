/**
 * Lesson Progress Service - Mock data cho tiến độ học bài
 * Sử dụng mock data thay vì Directus API
 */
import {
    mockLessonProgress,
    getProgressByEnrollmentId,
    getProgressByUserId,
    getProgressByLessonId,
    calculateEnrollmentProgress,
    getTotalTimeSpent,
} from '../mocks/lessonProgress';

// Helper: Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate current user ID
const CURRENT_USER_ID = 'u1';

export const lessonProgressService = {
    /**
     * Lấy tiến độ học của user hiện tại
     * @returns {Promise<Array>} Danh sách tiến độ
     */
    getMyProgress: async () => {
        await delay();
        return getProgressByUserId(CURRENT_USER_ID);
    },

    /**
     * Lấy tiến độ theo enrollment ID
     * @param {string} enrollmentId - ID enrollment
     * @returns {Promise<Array>} Danh sách tiến độ các bài học
     */
    getByEnrollmentId: async enrollmentId => {
        await delay();
        return getProgressByEnrollmentId(enrollmentId);
    },

    /**
     * Lấy tiến độ của một bài học cụ thể
     * @param {string} enrollmentId - ID enrollment
     * @param {string} lessonId - ID bài học
     * @returns {Promise<Object|null>} Tiến độ hoặc null
     */
    getByLessonId: async (enrollmentId, lessonId) => {
        await delay();
        return getProgressByLessonId(enrollmentId, lessonId) || null;
    },

    /**
     * Tính toán tiến độ enrollment từ lesson progress
     * @param {string} enrollmentId - ID enrollment
     * @param {number} totalLessons - Tổng số bài học
     * @returns {Promise<number>} Phần trăm hoàn thành
     */
    calculateProgress: async (enrollmentId, totalLessons) => {
        await delay(100);
        return calculateEnrollmentProgress(enrollmentId, totalLessons);
    },

    /**
     * Lấy tổng thời gian học của enrollment
     * @param {string} enrollmentId - ID enrollment
     * @returns {Promise<number>} Tổng thời gian (seconds)
     */
    getTotalTimeSpent: async enrollmentId => {
        await delay(100);
        return getTotalTimeSpent(enrollmentId);
    },

    /**
     * Bắt đầu học một bài học
     * @param {string} enrollmentId - ID enrollment
     * @param {string} lessonId - ID bài học
     * @param {Object} lessonInfo - Thông tin bài học
     * @returns {Promise<Object>} Tiến độ mới
     */
    startLesson: async (enrollmentId, lessonId, lessonInfo = {}) => {
        await delay(500);

        // Check if progress already exists
        const existing = getProgressByLessonId(enrollmentId, lessonId);
        if (existing) {
            // Update started_at if not started yet
            if (!existing.started_at) {
                existing.started_at = new Date().toISOString();
                existing.status = 'in_progress';
            }
            return existing;
        }

        // Create new progress
        const newProgress = {
            id: `lp${Date.now()}`,
            enrollment_id: enrollmentId,
            user_id: CURRENT_USER_ID,
            lesson_id: lessonId,
            lesson: lessonInfo,
            status: 'in_progress',
            progress_percentage: 0,
            time_spent: 0,
            started_at: new Date().toISOString(),
            completed_at: null,
            last_position: null,
        };

        mockLessonProgress.push(newProgress);
        return newProgress;
    },

    /**
     * Cập nhật tiến độ bài học
     * @param {string} progressId - ID tiến độ
     * @param {Object} data - Dữ liệu cập nhật { progress_percentage, time_spent, last_position }
     * @returns {Promise<Object>} Tiến độ đã cập nhật
     */
    updateProgress: async (progressId, data) => {
        await delay(300);

        const index = mockLessonProgress.findIndex(lp => lp.id === progressId);
        if (index === -1) {
            throw new Error('Progress not found');
        }

        const updatedProgress = {
            ...mockLessonProgress[index],
            ...data,
        };

        // Auto-complete if progress reaches 100%
        if (data.progress_percentage >= 100 && mockLessonProgress[index].status !== 'completed') {
            updatedProgress.status = 'completed';
            updatedProgress.completed_at = new Date().toISOString();
            updatedProgress.progress_percentage = 100;
        }

        mockLessonProgress[index] = updatedProgress;
        return updatedProgress;
    },

    /**
     * Đánh dấu bài học hoàn thành
     * @param {string} enrollmentId - ID enrollment
     * @param {string} lessonId - ID bài học
     * @returns {Promise<Object>} Tiến độ đã cập nhật
     */
    completeLesson: async (enrollmentId, lessonId) => {
        await delay(500);

        const progress = getProgressByLessonId(enrollmentId, lessonId);
        if (!progress) {
            throw new Error('Progress not found. Please start the lesson first.');
        }

        const index = mockLessonProgress.findIndex(lp => lp.id === progress.id);
        if (index === -1) {
            throw new Error('Progress not found');
        }

        mockLessonProgress[index] = {
            ...mockLessonProgress[index],
            status: 'completed',
            progress_percentage: 100,
            completed_at: new Date().toISOString(),
        };

        return mockLessonProgress[index];
    },

    /**
     * Cập nhật vị trí video
     * @param {string} progressId - ID tiến độ
     * @param {number} position - Vị trí video (seconds)
     * @param {number} duration - Tổng thời lượng video (seconds)
     * @returns {Promise<Object>} Tiến độ đã cập nhật
     */
    updateVideoPosition: async (progressId, position, duration) => {
        await delay(200);

        const index = mockLessonProgress.findIndex(lp => lp.id === progressId);
        if (index === -1) {
            throw new Error('Progress not found');
        }

        const progressPercentage = duration > 0 ? Math.round((position / duration) * 100) : 0;

        mockLessonProgress[index] = {
            ...mockLessonProgress[index],
            last_position: position,
            progress_percentage: Math.min(progressPercentage, 100),
            time_spent: (mockLessonProgress[index].time_spent || 0) + 1, // increment
        };

        // Auto-complete if video watched 90%+
        if (progressPercentage >= 90 && mockLessonProgress[index].status !== 'completed') {
            mockLessonProgress[index].status = 'completed';
            mockLessonProgress[index].completed_at = new Date().toISOString();
            mockLessonProgress[index].progress_percentage = 100;
        }

        return mockLessonProgress[index];
    },

    /**
     * Lấy thống kê tiến độ của user
     * @returns {Promise<Object>} Thống kê
     */
    getMyStats: async () => {
        await delay(200);

        const myProgress = getProgressByUserId(CURRENT_USER_ID);
        const completed = myProgress.filter(lp => lp.status === 'completed').length;
        const inProgress = myProgress.filter(lp => lp.status === 'in_progress').length;
        const totalTimeSpent = myProgress.reduce((sum, lp) => sum + (lp.time_spent || 0), 0);

        return {
            totalLessons: myProgress.length,
            completedLessons: completed,
            inProgressLessons: inProgress,
            totalTimeSpent,
            completionRate: myProgress.length > 0 ? Math.round((completed / myProgress.length) * 100) : 0,
        };
    },
};
