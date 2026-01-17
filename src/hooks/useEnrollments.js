/**
 * React Query Hooks cho Enrollments
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentService } from '../services/enrollmentService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

// ==========================================
// CLIENT / LEARNER HOOKS
// ==========================================

/**
 * Hook lấy danh sách enrollments của user hiện tại
 * @param {Object} params - Filter params { status, search, page, limit }
 */
export function useMyEnrollments(params = {}) {
    return useQuery({
        queryKey: [...queryKeys.enrollments.mine(), params],
        queryFn: () => enrollmentService.getMyEnrollments(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy thống kê enrollments của user
 */
export function useMyEnrollmentStats() {
    return useQuery({
        queryKey: [...queryKeys.enrollments.mine(), 'stats'],
        queryFn: () => enrollmentService.getMyEnrollmentStats(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy enrollments đang học (continue learning) cho HomePage
 * @param {number} limit - Số lượng
 */
export function useContinueLearning(limit = 4) {
    return useQuery({
        queryKey: [...queryKeys.home.continueLearning, { limit }],
        queryFn: () => enrollmentService.getContinueLearning(limit),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy chi tiết enrollment
 * @param {string} enrollmentId - ID enrollment
 */
export function useEnrollmentDetail(enrollmentId) {
    return useQuery({
        queryKey: [...queryKeys.enrollments.all, 'detail', enrollmentId],
        queryFn: () => enrollmentService.getEnrollmentDetail(enrollmentId),
        enabled: !!enrollmentId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy enrollment của user cho một khóa học
 * @param {string} courseId - ID khóa học
 */
export function useEnrollmentByCourse(courseId) {
    return useQuery({
        queryKey: queryKeys.enrollments.byCourse(courseId),
        queryFn: () => enrollmentService.getEnrollmentByCourse(courseId),
        enabled: !!courseId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Mutation hook để đăng ký khóa học
 */
export function useEnrollCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: enrollmentService.enrollCourse,
        onSuccess: (data, courseId) => {
            // Invalidate các queries liên quan
            queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.mine() });
            queryClient.invalidateQueries({
                queryKey: queryKeys.enrollments.byCourse(courseId),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.home.continueLearning });
            showSuccess('Đăng ký khóa học thành công!');
        },
    });
}

/**
 * Mutation hook để cập nhật last accessed
 */
export function useUpdateLastAccessed() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: enrollmentService.updateLastAccessed,
        onSuccess: () => {
            // Quietly invalidate, không cần show success
            queryClient.invalidateQueries({ queryKey: queryKeys.home.continueLearning });
        },
    });
}

/**
 * Mutation hook để cập nhật progress
 */
export function useUpdateProgress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ enrollmentId, progressPercentage }) =>
            enrollmentService.updateProgress(enrollmentId, progressPercentage),
        onSuccess: (data, variables) => {
            // Invalidate các queries liên quan
            queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.mine() });
            queryClient.invalidateQueries({ queryKey: queryKeys.home.continueLearning });

            // Nếu hoàn thành, show message
            if (variables.progressPercentage >= 100) {
                showSuccess('Chúc mừng! Bạn đã hoàn thành khóa học!');
            }
        },
    });
}
