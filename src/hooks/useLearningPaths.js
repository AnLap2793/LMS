/**
 * React Query Hooks cho Learning Paths
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningPathService } from '../services/learningPathService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

// ==========================================
// ADMIN HOOKS
// ==========================================

/**
 * Hook lấy danh sách learning paths (Admin)
 * @param {Object} params - Filter params { search, status, is_mandatory, page, limit }
 */
export function useLearningPaths(params = {}) {
    return useQuery({
        queryKey: queryKeys.learningPaths.list(params),
        queryFn: () => learningPathService.getAll(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy thống kê learning paths
 */
export function useLearningPathStats() {
    return useQuery({
        queryKey: [...queryKeys.learningPaths.all, 'stats'],
        queryFn: () => learningPathService.getStats(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook tạo learning path mới
 */
export function useCreateLearningPath() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: learningPathService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.all });
            showSuccess('Tạo lộ trình học tập thành công!');
        },
    });
}

/**
 * Hook cập nhật learning path
 */
export function useUpdateLearningPath() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => learningPathService.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.detail(variables.id) });
            showSuccess('Cập nhật lộ trình học tập thành công!');
        },
    });
}

/**
 * Hook xóa learning path
 */
export function useDeleteLearningPath() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: learningPathService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.all });
            showSuccess('Xóa lộ trình học tập thành công!');
        },
    });
}

// ==========================================
// CLIENT / LEARNER HOOKS
// ==========================================

/**
 * Hook lấy danh sách learning paths đã xuất bản (Learner)
 * @param {Object} params - Filter params
 */
export function usePublishedLearningPaths(params = {}) {
    return useQuery({
        queryKey: [...queryKeys.learningPaths.lists(), 'published', params],
        queryFn: () => learningPathService.getPublished(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook đếm tổng số learning paths
 * @param {Object} params - Filter params
 */
export function useLearningPathsCount(params = {}) {
    return useQuery({
        queryKey: [...queryKeys.learningPaths.lists(), 'count', params],
        queryFn: () => learningPathService.count(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy chi tiết learning path
 * @param {string} pathId - ID learning path
 */
export function useLearningPath(pathId) {
    return useQuery({
        queryKey: queryKeys.learningPaths.detail(pathId),
        queryFn: () => learningPathService.getById(pathId),
        enabled: !!pathId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy chi tiết learning path kèm courses
 * @param {string} pathId - ID learning path
 */
export function useLearningPathWithCourses(pathId) {
    return useQuery({
        queryKey: [...queryKeys.learningPaths.detail(pathId), 'with-courses'],
        queryFn: () => learningPathService.getWithCourses(pathId),
        enabled: !!pathId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy tiến độ lộ trình học tập của user
 */
export function useMyLearningPathProgress() {
    return useQuery({
        queryKey: ['my-learning-paths-progress'],
        queryFn: () => learningPathService.getMyProgress(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}
