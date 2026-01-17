/**
 * React Query Hooks cho Lessons
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonService } from '../services/lessonService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

/**
 * Helper to invalidate lesson-related queries
 */
const invalidateLessonQueries = (queryClient, moduleId, courseId) => {
    if (moduleId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.lessons.byModule(moduleId) });
        // Invalidate modules để cập nhật lesson count
        queryClient.invalidateQueries({ queryKey: queryKeys.modules.all });
    }
    if (courseId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.modules.byCourse(courseId) });
    }
};

// ==========================================
// ADMIN HOOKS
// ==========================================

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
 * Hook tạo lesson mới
 * @param {string} courseId - ID khóa học (để invalidate module queries)
 * @returns {Object} Mutation object
 */
export function useCreateLesson(courseId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: lessonService.create,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
            invalidateLessonQueries(queryClient, variables.module_id, courseId);
            showSuccess('Tạo bài học thành công!');
        },
    });
}

/**
 * Hook cập nhật lesson
 * @param {string} courseId - ID khóa học (để invalidate module queries)
 * @returns {Object} Mutation object
 */
export function useUpdateLesson(courseId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => lessonService.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.lessons.detail(variables.id),
            });
            invalidateLessonQueries(queryClient, data?.module_id, courseId);
            showSuccess('Cập nhật bài học thành công!');
        },
    });
}

/**
 * Hook xóa lesson
 * @param {string} courseId - ID khóa học (để invalidate module queries)
 * @returns {Object} Mutation object
 */
export function useDeleteLesson(courseId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId, moduleId }) => lessonService.delete(lessonId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
            invalidateLessonQueries(queryClient, variables.moduleId, courseId);
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
            if (variables.courseId) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.modules.byCourse(variables.courseId),
                });
            }
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

// ==========================================
// CLIENT / LEARNER HOOKS
// ==========================================

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
