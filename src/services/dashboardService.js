/**
 * Dashboard Service - Mock data cho thống kê dashboard
 * Sử dụng mock data thay vì Directus API
 */
import {
    mockDashboardStats,
    mockPopularCourses,
    mockAtRiskLearners,
    mockRecentActivity,
    mockMonthlyProgress,
    mockDepartmentProgress,
    mockQuizStats,
    mockCoursesByStatus,
    mockCertificateStats,
    mockLearnerWeeklyActivity,
    mockLearnerSkills,
    mockLearnerStreak,
} from '../mocks/dashboardStats';

// Helper: Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const dashboardService = {
    // ============================================
    // ADMIN DASHBOARD
    // ============================================

    /**
     * Lấy thống kê tổng quan (Admin Dashboard)
     * @returns {Promise<Object>} Thống kê tổng quan
     */
    getStats: async () => {
        await delay();
        return mockDashboardStats;
    },

    /**
     * Lấy danh sách khóa học phổ biến
     * @param {number} limit - Số lượng
     * @returns {Promise<Array>} Danh sách khóa học
     */
    getPopularCourses: async (limit = 5) => {
        await delay();
        return mockPopularCourses.slice(0, limit);
    },

    /**
     * Lấy danh sách learners có nguy cơ (sắp quá hạn / đang chậm tiến độ)
     * @param {number} limit - Số lượng
     * @returns {Promise<Array>} Danh sách learners
     */
    getAtRiskLearners: async (limit = 5) => {
        await delay();
        return mockAtRiskLearners.slice(0, limit);
    },

    /**
     * Lấy hoạt động gần đây
     * @param {number} limit - Số lượng
     * @returns {Promise<Array>} Danh sách hoạt động
     */
    getRecentActivity: async (limit = 10) => {
        await delay();
        return mockRecentActivity.slice(0, limit);
    },

    /**
     * Lấy dữ liệu tiến độ theo tháng (cho chart)
     * @returns {Promise<Array>} Dữ liệu tiến độ
     */
    getMonthlyProgress: async () => {
        await delay();
        return mockMonthlyProgress;
    },

    /**
     * Lấy tiến độ theo phòng ban
     * @returns {Promise<Array>} Dữ liệu tiến độ theo phòng ban
     */
    getDepartmentProgress: async () => {
        await delay();
        return mockDepartmentProgress;
    },

    /**
     * Lấy thống kê quiz
     * @returns {Promise<Object>} Thống kê quiz
     */
    getQuizStats: async () => {
        await delay();
        return mockQuizStats;
    },

    /**
     * Lấy thống kê khóa học theo status
     * @returns {Promise<Array>} Dữ liệu khóa học theo status
     */
    getCoursesByStatus: async () => {
        await delay();
        return mockCoursesByStatus;
    },

    /**
     * Lấy thống kê certificates
     * @returns {Promise<Object>} Thống kê certificates
     */
    getCertificateStats: async () => {
        await delay();
        return mockCertificateStats;
    },

    /**
     * Lấy tất cả dữ liệu admin dashboard (batch)
     * @returns {Promise<Object>} Tất cả dữ liệu dashboard
     */
    getAdminDashboard: async () => {
        await delay(400);
        return {
            stats: mockDashboardStats,
            popularCourses: mockPopularCourses.slice(0, 5),
            atRiskLearners: mockAtRiskLearners.slice(0, 5),
            recentActivity: mockRecentActivity.slice(0, 5),
            monthlyProgress: mockMonthlyProgress,
            coursesByStatus: mockCoursesByStatus,
        };
    },

    // ============================================
    // LEARNER DASHBOARD
    // ============================================

    /**
     * Lấy hoạt động học tập trong tuần của learner
     * @returns {Promise<Array>} Dữ liệu hoạt động theo ngày
     */
    getLearnerWeeklyActivity: async () => {
        await delay();
        return mockLearnerWeeklyActivity;
    },

    /**
     * Lấy radar skills của learner
     * @returns {Promise<Array>} Dữ liệu kỹ năng
     */
    getLearnerSkills: async () => {
        await delay();
        return mockLearnerSkills;
    },

    /**
     * Lấy thông tin learning streak của learner
     * @returns {Promise<Object>} Thông tin streak
     */
    getLearnerStreak: async () => {
        await delay();
        return mockLearnerStreak;
    },

    /**
     * Lấy thống kê tổng quan của learner
     * @returns {Promise<Object>} Thống kê learner
     */
    getLearnerStats: async () => {
        await delay();
        // Combine multiple stats
        return {
            streak: mockLearnerStreak,
            weeklyActivity: mockLearnerWeeklyActivity,
            totalMinutesThisWeek: mockLearnerWeeklyActivity.reduce((sum, d) => sum + d.minutes, 0),
            totalLessonsThisWeek: mockLearnerWeeklyActivity.reduce((sum, d) => sum + d.lessons, 0),
        };
    },

    /**
     * Lấy tất cả dữ liệu learner dashboard (batch)
     * @returns {Promise<Object>} Tất cả dữ liệu dashboard
     */
    getLearnerDashboard: async () => {
        await delay(400);
        return {
            streak: mockLearnerStreak,
            weeklyActivity: mockLearnerWeeklyActivity,
            skills: mockLearnerSkills,
            recentActivity: mockRecentActivity.slice(0, 5),
        };
    },
};
