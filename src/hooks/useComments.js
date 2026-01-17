/**
 * React Query Hooks cho Lesson Comments
 * Hỗ trợ threaded comments và resolved status
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services/commentService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

// ==========================================
// ADMIN HOOKS
// ==========================================

/**
 * Hook lấy tất cả comments (admin)
 * @param {Object} params - Filter params
 */
export function useAllComments(params = {}) {
    return useQuery({
        queryKey: queryKeys.lessonComments.list(params),
        queryFn: () => commentService.getAll(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook xóa comment
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
 * Hook đánh dấu comment đã resolved
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

// ==========================================
// CLIENT / LEARNER HOOKS
// ==========================================

/**
 * Hook lấy comments của một lesson
 * @param {string} lessonId - ID lesson
 * @param {Object} options - Query options
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
 */
export function useUnresolvedCount(lessonId) {
    return useQuery({
        queryKey: [...queryKeys.lessonComments.byLesson(lessonId), 'unresolved-count'],
        queryFn: () => commentService.countUnresolved(lessonId),
        enabled: !!lessonId,
    });
}

/**
 * Hook lấy comments của user (my comments)
 * @param {Object} params - Filter params
 */
export function useMyComments(params = {}) {
    return useQuery({
        queryKey: [...queryKeys.lessonComments.all, 'mine'],
        queryFn: () => commentService.getMyComments(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook tạo comment mới
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
