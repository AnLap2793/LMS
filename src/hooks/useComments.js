/**
 * React Query Hooks cho Lesson Comments
 * Hỗ trợ threaded comments và resolved status
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services/commentService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

/**
 * Hook lấy comments của một lesson
 * @param {string} lessonId - ID lesson
 * @param {Object} options - Query options
 * @returns {Object} Query result
 */
export function useCommentsByLesson(lessonId, options = {}) {
    return useQuery({
        queryKey: queryKeys.lessonComments.byLesson(lessonId),
        queryFn: () => commentService.getByLesson(lessonId),
        enabled: !!lessonId,
        staleTime: CACHE_TIME.STALE_TIME,
        ...options,
    });
}

/**
 * Hook lấy comments kèm replies (nested tree)
 * @param {string} lessonId - ID lesson
 * @returns {Object} Query result với tree structure
 */
export function useCommentsWithReplies(lessonId) {
    return useQuery({
        queryKey: [...queryKeys.lessonComments.byLesson(lessonId), 'with-replies'],
        queryFn: () => commentService.getWithReplies(lessonId),
        enabled: !!lessonId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy replies của một comment
 * @param {string} parentId - ID comment cha
 * @returns {Object} Query result
 */
export function useCommentReplies(parentId) {
    return useQuery({
        queryKey: queryKeys.lessonComments.replies(parentId),
        queryFn: () => commentService.getReplies(parentId),
        enabled: !!parentId,
    });
}

/**
 * Hook lấy chi tiết comment
 * @param {string} id - ID comment
 * @returns {Object} Query result
 */
export function useComment(id) {
    return useQuery({
        queryKey: queryKeys.lessonComments.detail(id),
        queryFn: () => commentService.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook đếm comments chưa resolved
 * @param {string} lessonId - ID lesson
 * @returns {Object} Query result
 */
export function useUnresolvedCount(lessonId) {
    return useQuery({
        queryKey: [...queryKeys.lessonComments.byLesson(lessonId), 'unresolved-count'],
        queryFn: () => commentService.countUnresolved(lessonId),
        enabled: !!lessonId,
    });
}

/**
 * Hook tạo comment mới
 * @returns {Object} Mutation object
 */
export function useCreateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: commentService.create,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessonComments.all });
            if (variables.lesson_id) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.lessonComments.byLesson(variables.lesson_id),
                });
            }
            showSuccess('Đã đăng bình luận!');
        },
    });
}

/**
 * Hook reply to comment
 * @returns {Object} Mutation object
 */
export function useReplyComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ parentId, content }) => commentService.reply(parentId, content),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessonComments.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.lessonComments.replies(variables.parentId),
            });
            showSuccess('Đã trả lời bình luận!');
        },
    });
}

/**
 * Hook cập nhật comment
 * @returns {Object} Mutation object
 */
export function useUpdateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => commentService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessonComments.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.lessonComments.detail(variables.id),
            });
            showSuccess('Đã cập nhật bình luận!');
        },
    });
}

/**
 * Hook đánh dấu comment đã resolved
 * @returns {Object} Mutation object
 */
export function useResolveComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: commentService.resolve,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessonComments.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.lessonComments.detail(id),
            });
            showSuccess('Đã đánh dấu đã giải quyết!');
        },
    });
}

/**
 * Hook đánh dấu comment chưa resolved
 * @returns {Object} Mutation object
 */
export function useUnresolveComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: commentService.unresolve,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessonComments.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.lessonComments.detail(id),
            });
            showSuccess('Đã bỏ đánh dấu giải quyết!');
        },
    });
}

/**
 * Hook xóa comment
 * @returns {Object} Mutation object
 */
export function useDeleteComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: commentService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessonComments.all });
            showSuccess('Đã xóa bình luận!');
        },
    });
}

/**
 * Hook lấy comments của user (my comments)
 * @param {Object} params - Filter params
 * @returns {Object} Query result
 */
export function useMyComments(params = {}) {
    return useQuery({
        queryKey: [...queryKeys.lessonComments.all, 'mine'],
        queryFn: () => commentService.getMyComments(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy tất cả comments (admin)
 * @param {Object} params - Filter params
 * @returns {Object} Query result
 */
export function useAllComments(params = {}) {
    return useQuery({
        queryKey: queryKeys.lessonComments.list(params),
        queryFn: () => commentService.getAll(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}
