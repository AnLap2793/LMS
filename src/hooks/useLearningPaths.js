/**
 * React Query Hooks cho Learning Paths
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningPathService } from '../services/learningPathService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

// ============================================
// QUERY HOOKS
// ============================================

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
 * Hook lấy tiến độ learning paths của user hiện tại
 */
export function useMyLearningPathProgress() {
    return useQuery({
        queryKey: [...queryKeys.learningPaths.all, 'my-progress'],
        queryFn: () => learningPathService.getMyProgress(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy tiến độ của một learning path cụ thể
 * @param {string} pathId - ID learning path
 */
export function useMyPathProgress(pathId) {
    return useQuery({
        queryKey: [...queryKeys.learningPaths.detail(pathId), 'my-progress'],
        queryFn: () => learningPathService.getMyPathProgress(pathId),
        enabled: !!pathId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy learning paths nổi bật (Homepage)
 * @param {number} limit - Số lượng
 */
export function useFeaturedLearningPaths(limit = 4) {
    return useQuery({
        queryKey: [...queryKeys.learningPaths.all, 'featured', { limit }],
        queryFn: () => learningPathService.getFeatured(limit),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy learning paths bắt buộc
 */
export function useMandatoryLearningPaths() {
    return useQuery({
        queryKey: [...queryKeys.learningPaths.all, 'mandatory'],
        queryFn: () => learningPathService.getMandatory(),
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

// ============================================
// MUTATION HOOKS
// ============================================

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
        onSuccess: (_, variables) => {
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

/**
 * Hook thêm khóa học vào learning path
 */
export function useAddCourseToPath() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pathId, courseId, courseInfo }) => learningPathService.addCourse(pathId, courseId, courseInfo),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.detail(variables.pathId) });
            showSuccess('Thêm khóa học vào lộ trình thành công!');
        },
    });
}

/**
 * Hook xóa khóa học khỏi learning path
 */
export function useRemoveCourseFromPath() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pathId, courseId }) => learningPathService.removeCourse(pathId, courseId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.detail(variables.pathId) });
            showSuccess('Xóa khóa học khỏi lộ trình thành công!');
        },
    });
}

/**
 * Hook sắp xếp lại thứ tự khóa học trong learning path
 */
export function useReorderPathCourses() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pathId, courseIds }) => learningPathService.reorderCourses(pathId, courseIds),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.detail(variables.pathId) });
            showSuccess('Sắp xếp lại khóa học thành công!');
        },
    });
}
