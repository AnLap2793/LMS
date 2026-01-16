/**
 * React Query Hooks cho Dashboard Stats
 */
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';

/**
 * Hook lấy thống kê tổng quan Admin
 */
export function useAdminDashboardStats() {
    return useQuery({
        queryKey: ['admin', 'dashboard', 'stats'],
        queryFn: () => dashboardService.getAdminStats(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy dữ liệu biểu đồ
 */
export function useDashboardCharts() {
    return useQuery({
        queryKey: ['admin', 'dashboard', 'charts'],
        queryFn: async () => {
            // Fetch chart data in parallel
            const [monthly, status, popular, activity] = await Promise.all([
                dashboardService.getMonthlyProgress(),
                dashboardService.getCoursesByStatus(),
                dashboardService.getPopularCourses(),
                dashboardService.getRecentActivity(),
            ]);
            return { monthly, status, popular, activity };
        },
        staleTime: CACHE_TIME.STALE_TIME,
    });
}
