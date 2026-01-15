/**
 * React Query Hooks cho Dashboard Statistics
 */
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';

// ============================================
// ADMIN DASHBOARD HOOKS
// ============================================

/**
 * Hook lấy thống kê tổng quan (Admin Dashboard)
 */
export function useDashboardStats() {
    return useQuery({
        queryKey: queryKeys.dashboard.stats,
        queryFn: () => dashboardService.getStats(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy khóa học phổ biến
 * @param {number} limit - Số lượng
 */
export function usePopularCourses(limit = 5) {
    return useQuery({
        queryKey: [...queryKeys.dashboard.popularCourses, { limit }],
        queryFn: () => dashboardService.getPopularCourses(limit),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy learners có nguy cơ
 * @param {number} limit - Số lượng
 */
export function useAtRiskLearners(limit = 5) {
    return useQuery({
        queryKey: [...queryKeys.dashboard.atRiskLearners, { limit }],
        queryFn: () => dashboardService.getAtRiskLearners(limit),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy hoạt động gần đây
 * @param {number} limit - Số lượng
 */
export function useRecentActivity(limit = 10) {
    return useQuery({
        queryKey: [...queryKeys.dashboard.recentActivity, { limit }],
        queryFn: () => dashboardService.getRecentActivity(limit),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy tiến độ theo tháng (cho chart)
 */
export function useMonthlyProgress() {
    return useQuery({
        queryKey: [...queryKeys.dashboard.stats, 'monthly-progress'],
        queryFn: () => dashboardService.getMonthlyProgress(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy tiến độ theo phòng ban
 */
export function useDepartmentProgress() {
    return useQuery({
        queryKey: [...queryKeys.dashboard.stats, 'department-progress'],
        queryFn: () => dashboardService.getDepartmentProgress(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy thống kê quiz
 */
export function useDashboardQuizStats() {
    return useQuery({
        queryKey: [...queryKeys.dashboard.stats, 'quiz-stats'],
        queryFn: () => dashboardService.getQuizStats(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy khóa học theo status
 */
export function useCoursesByStatus() {
    return useQuery({
        queryKey: [...queryKeys.dashboard.stats, 'courses-by-status'],
        queryFn: () => dashboardService.getCoursesByStatus(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy thống kê certificates cho dashboard
 */
export function useDashboardCertificateStats() {
    return useQuery({
        queryKey: [...queryKeys.dashboard.stats, 'certificate-stats'],
        queryFn: () => dashboardService.getCertificateStats(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy tất cả dữ liệu admin dashboard (batch - recommended)
 */
export function useAdminDashboard() {
    return useQuery({
        queryKey: [...queryKeys.dashboard.stats, 'admin-batch'],
        queryFn: () => dashboardService.getAdminDashboard(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

// ============================================
// LEARNER DASHBOARD HOOKS
// ============================================

/**
 * Hook lấy hoạt động học tập trong tuần
 */
export function useLearnerWeeklyActivity() {
    return useQuery({
        queryKey: [...queryKeys.home.recentActivity, 'weekly'],
        queryFn: () => dashboardService.getLearnerWeeklyActivity(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy radar skills của learner
 */
export function useLearnerSkills() {
    return useQuery({
        queryKey: [...queryKeys.home.recentActivity, 'skills'],
        queryFn: () => dashboardService.getLearnerSkills(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy thông tin learning streak
 */
export function useLearnerStreak() {
    return useQuery({
        queryKey: [...queryKeys.home.recentActivity, 'streak'],
        queryFn: () => dashboardService.getLearnerStreak(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy thống kê tổng quan của learner
 */
export function useLearnerStats() {
    return useQuery({
        queryKey: [...queryKeys.home.recentActivity, 'stats'],
        queryFn: () => dashboardService.getLearnerStats(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy tất cả dữ liệu learner dashboard (batch - recommended)
 */
export function useLearnerDashboard() {
    return useQuery({
        queryKey: [...queryKeys.home.recentActivity, 'learner-batch'],
        queryFn: () => dashboardService.getLearnerDashboard(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}
