/**
 * React Query Hooks cho Tags
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagService } from '../services/tagService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook lấy danh sách tags
 * @param {Object} params - Filter params { search, page, limit }
 */
export function useTagsList(params = {}) {
    return useQuery({
        queryKey: queryKeys.tags.list(params),
        queryFn: () => tagService.getAll(params),
        staleTime: CACHE_TIME.STALE_TIME * 2, // Tags ít thay đổi
    });
}

/**
 * Hook lấy tất cả tags (không phân trang - cho select/filter)
 */
export function useAllTags() {
    return useQuery({
        queryKey: queryKeys.tags.all,
        queryFn: () => tagService.getAll({ limit: 1000 }),
        staleTime: CACHE_TIME.STALE_TIME * 2,
    });
}

/**
 * Hook đếm tổng số tags
 * @param {Object} params - Filter params
 */
export function useTagsCount(params = {}) {
    return useQuery({
        queryKey: [...queryKeys.tags.lists(), 'count', params],
        queryFn: () => tagService.count(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy chi tiết tag
 * @param {string} tagId - ID tag
 */
export function useTag(tagId) {
    return useQuery({
        queryKey: queryKeys.tags.detail(tagId),
        queryFn: () => tagService.getById(tagId),
        enabled: !!tagId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy tags phổ biến
 * @param {number} limit - Số lượng
 */
export function usePopularTags(limit = 10) {
    return useQuery({
        queryKey: [...queryKeys.tags.all, 'popular', { limit }],
        queryFn: () => tagService.getPopular(limit),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy thống kê tags
 */
export function useTagsStats() {
    return useQuery({
        queryKey: [...queryKeys.tags.all, 'stats'],
        queryFn: () => tagService.getStats(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook tạo tag mới
 */
export function useCreateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: tagService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
            showSuccess('Tạo tag thành công!');
        },
    });
}

/**
 * Hook cập nhật tag
 */
export function useUpdateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => tagService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.tags.detail(variables.id) });
            showSuccess('Cập nhật tag thành công!');
        },
    });
}

/**
 * Hook xóa tag
 */
export function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: tagService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
            showSuccess('Xóa tag thành công!');
        },
    });
}

/**
 * Hook xóa nhiều tags
 */
export function useDeleteManyTags() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: tagService.deleteMany,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
            showSuccess('Xóa các tag thành công!');
        },
    });
}
