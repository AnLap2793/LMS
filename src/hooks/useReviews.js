/**
 * React Query Hooks cho Course Reviews
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

// ==========================================
// ADMIN HOOKS
// ==========================================

/**
 * Hook lấy tất cả reviews (admin)
 * @param {Object} params - Filter params
 */
export function useAllReviews(params = {}) {
    return useQuery({
        queryKey: queryKeys.courseReviews.list(params),
        queryFn: () => reviewService.getAll(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook xóa review
 */
export function useDeleteReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: reviewService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courseReviews.all });
            showSuccess('Đã xóa đánh giá!');
        },
    });
}

// ==========================================
// CLIENT / LEARNER HOOKS
// ==========================================

/**
 * Hook lấy reviews của một khóa học
 * @param {string} courseId - ID khóa học
 * @param {Object} options - Query options
 */
export function useReviewsByCourse(courseId, options = {}) {
    return useQuery({
        queryKey: queryKeys.courseReviews.byCourse(courseId),
        queryFn: () => reviewService.getByCourse(courseId),
        enabled: !!courseId,
        staleTime: CACHE_TIME.STALE_TIME,
        ...options,
    });
}

/**
 * Hook lấy review của user cho khóa học
 * @param {string} courseId - ID khóa học
 */
export function useMyReview(courseId) {
    return useQuery({
        queryKey: queryKeys.courseReviews.myReview(courseId),
        queryFn: () => reviewService.getMyReview(courseId),
        enabled: !!courseId,
    });
}

/**
 * Hook lấy thống kê rating của khóa học
 * @param {string} courseId - ID khóa học
 */
export function useCourseRatingStats(courseId) {
    return useQuery({
        queryKey: queryKeys.courseReviews.stats(courseId),
        queryFn: () => reviewService.getCourseStats(courseId),
        enabled: !!courseId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy chi tiết review
 * @param {string} id - ID review
 */
export function useReview(id) {
    return useQuery({
        queryKey: queryKeys.courseReviews.detail(id),
        queryFn: () => reviewService.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook lấy tất cả reviews của user
 */
export function useMyReviews() {
    return useQuery({
        queryKey: [...queryKeys.courseReviews.all, 'mine'],
        queryFn: () => reviewService.getMyReviews(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy reviews gần đây (dashboard)
 * @param {number} limit - Số lượng
 */
export function useRecentReviews(limit = 10) {
    return useQuery({
        queryKey: [...queryKeys.courseReviews.all, 'recent', limit],
        queryFn: () => reviewService.getRecent(limit),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy top rated courses
 * @param {number} limit - Số lượng
 */
export function useTopRatedCourses(limit = 10) {
    return useQuery({
        queryKey: [...queryKeys.courseReviews.all, 'top-rated', limit],
        queryFn: () => reviewService.getTopRatedCourses(limit),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook tạo review mới (hoặc update nếu đã có)
 */
export function useCreateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: reviewService.create,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courseReviews.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.courseReviews.byCourse(variables.course_id),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.courseReviews.myReview(variables.course_id),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.courseReviews.stats(variables.course_id),
            });
            showSuccess('Cảm ơn bạn đã đánh giá!');
        },
    });
}

/**
 * Hook cập nhật review
 */
export function useUpdateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => reviewService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courseReviews.all });
            showSuccess('Đã cập nhật đánh giá!');
        },
    });
}

/**
 * Hook xóa review của user cho khóa học
 */
export function useDeleteMyReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: reviewService.deleteMyReview,
        onSuccess: (_, courseId) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.courseReviews.byCourse(courseId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.courseReviews.myReview(courseId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.courseReviews.stats(courseId),
            });
            showSuccess('Đã xóa đánh giá của bạn!');
        },
    });
}
