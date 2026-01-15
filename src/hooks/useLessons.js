/**
 * React Query Hooks cho Lessons
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonService } from '../services/lessonService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

/**
 * Hook lấy tất cả lessons
 * @param {Object} params - Filter params
 * @returns {Object} Query result
 */
export function useLessons(params = {}) {
    return useQuery({
        queryKey: queryKeys.lessons.all,
        queryFn: () => lessonService.getAll(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy lessons của một module
 * @param {string} moduleId - ID module
 * @param {Object} options - Query options
 * @returns {Object} Query result
 */
export function useLessonsByModule(moduleId, options = {}) {
    return useQuery({
        queryKey: queryKeys.lessons.byModule(moduleId),
        queryFn: () => lessonService.getByModule(moduleId),
        enabled: !!moduleId,
        staleTime: CACHE_TIME.STALE_TIME,
        ...options,
    });
}

/**
 * Hook lấy chi tiết lesson
 * @param {string} id - ID lesson
 * @returns {Object} Query result
 */
export function useLesson(id) {
    return useQuery({
        queryKey: queryKeys.lessons.detail(id),
        queryFn: () => lessonService.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook lấy lesson kèm documents
 * @param {string} lessonId - ID lesson
 * @returns {Object} Query result
 */
export function useLessonWithDocuments(lessonId) {
    return useQuery({
        queryKey: [...queryKeys.lessons.detail(lessonId), 'with-documents'],
        queryFn: () => lessonService.getWithDocuments(lessonId),
        enabled: !!lessonId,
    });
}

/**
 * Hook lấy lesson tiếp theo
 * @param {string} currentLessonId - ID lesson hiện tại
 * @returns {Object} Query result
 */
export function useNextLesson(currentLessonId) {
    return useQuery({
        queryKey: [...queryKeys.lessons.detail(currentLessonId), 'next'],
        queryFn: () => lessonService.getNextLesson(currentLessonId),
        enabled: !!currentLessonId,
    });
}

/**
 * Hook lấy lesson trước đó
 * @param {string} currentLessonId - ID lesson hiện tại
 * @returns {Object} Query result
 */
export function usePreviousLesson(currentLessonId) {
    return useQuery({
        queryKey: [...queryKeys.lessons.detail(currentLessonId), 'previous'],
        queryFn: () => lessonService.getPreviousLesson(currentLessonId),
        enabled: !!currentLessonId,
    });
}

/**
 * Hook tạo lesson mới
 * @returns {Object} Mutation object
 */
export function useCreateLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: lessonService.create,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
            if (variables.module_id) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.lessons.byModule(variables.module_id),
                });
                // Cũng invalidate modules để cập nhật lesson count
                queryClient.invalidateQueries({ queryKey: queryKeys.modules.all });
            }
            showSuccess('Tạo bài học thành công!');
        },
    });
}

/**
 * Hook cập nhật lesson
 * @returns {Object} Mutation object
 */
export function useUpdateLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => lessonService.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.lessons.detail(variables.id),
            });
            if (data?.module_id) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.lessons.byModule(data.module_id),
                });
            }
            showSuccess('Cập nhật bài học thành công!');
        },
    });
}

/**
 * Hook xóa lesson
 * @returns {Object} Mutation object
 */
export function useDeleteLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: lessonService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.modules.all });
            showSuccess('Xóa bài học thành công!');
        },
    });
}

/**
 * Hook cập nhật thứ tự lessons
 * @returns {Object} Mutation object
 */
export function useUpdateLessonOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ moduleId, orderedIds }) => lessonService.updateOrder(moduleId, orderedIds),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.lessons.byModule(variables.moduleId),
            });
        },
    });
}

/**
 * Hook publish lesson
 * @returns {Object} Mutation object
 */
export function usePublishLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: lessonService.publish,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons.detail(id) });
            showSuccess('Đã publish bài học!');
        },
    });
}

/**
 * Hook archive lesson
 * @returns {Object} Mutation object
 */
export function useArchiveLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: lessonService.archive,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons.detail(id) });
            showSuccess('Đã archive bài học!');
        },
    });
}
