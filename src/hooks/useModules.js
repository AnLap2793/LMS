/**
 * React Query Hooks cho Modules
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moduleService } from '../services/moduleService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

/**
 * Helper to invalidate all module-related queries for a course
 */
const invalidateModuleQueries = (queryClient, courseId) => {
    if (courseId) {
        // Invalidate modules list
        queryClient.invalidateQueries({ queryKey: queryKeys.modules.byCourse(courseId) });
        // Invalidate course info (để cập nhật module count nếu có)
        queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(courseId) });
    }
};

// ==========================================
// ADMIN HOOKS
// ==========================================

/**
 * Hook lấy tất cả modules
 * @param {Object} params - Filter params
 * @returns {Object} Query result
 */
export function useModules(params = {}) {
    return useQuery({
        queryKey: queryKeys.modules.all,
        queryFn: () => moduleService.getAll(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy modules với số lượng lessons (không fetch full lesson data)
 * Tối ưu cho Admin CourseContentPage - lazy loading
 * @param {string} courseId - ID khóa học
 * @param {Object} options - Query options
 * @returns {Object} Query result
 */
export function useModulesWithLessonCount(courseId, options = {}) {
    return useQuery({
        queryKey: [...queryKeys.modules.byCourse(courseId), 'with-count'],
        queryFn: () => moduleService.getByCourseWithLessonCount(courseId),
        enabled: !!courseId,
        staleTime: CACHE_TIME.STALE_TIME,
        ...options,
    });
}

/**
 * Hook lấy modules kèm lessons (nested)
 * Dùng cho CourseContentPage để hiển thị toàn bộ nội dung
 * @param {string} courseId - ID khóa học
 * @returns {Object} Query result
 */
export function useModulesWithLessons(courseId) {
    return useQuery({
        queryKey: [...queryKeys.modules.byCourse(courseId), 'with-lessons'],
        queryFn: () => moduleService.getWithLessons(courseId),
        enabled: !!courseId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy chi tiết module
 * @param {string} id - ID module
 * @returns {Object} Query result
 */
export function useModule(id) {
    return useQuery({
        queryKey: queryKeys.modules.detail(id),
        queryFn: () => moduleService.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook tạo module mới
 * @returns {Object} Mutation object
 */
export function useCreateModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: moduleService.create,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modules.all });
            invalidateModuleQueries(queryClient, variables.course_id);
            showSuccess('Tạo module thành công!');
        },
    });
}

/**
 * Hook cập nhật module
 * @returns {Object} Mutation object
 */
export function useUpdateModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => moduleService.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modules.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.modules.detail(variables.id),
            });
            // Invalidate course modules
            invalidateModuleQueries(queryClient, data?.course_id);
            showSuccess('Cập nhật module thành công!');
        },
    });
}

/**
 * Hook xóa module
 * @param {string} courseId - ID khóa học (để invalidate queries sau khi xóa)
 * @returns {Object} Mutation object
 */
export function useDeleteModule(courseId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: moduleService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modules.all });
            invalidateModuleQueries(queryClient, courseId);
            showSuccess('Xóa module thành công!');
        },
    });
}

/**
 * Hook cập nhật thứ tự modules
 * @returns {Object} Mutation object
 */
export function useUpdateModuleOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ courseId, orderedIds }) => moduleService.updateOrder(courseId, orderedIds),
        onSuccess: (_, variables) => {
            invalidateModuleQueries(queryClient, variables.courseId);
        },
    });
}

/**
 * Hook publish module
 * @returns {Object} Mutation object
 */
export function usePublishModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: moduleService.publish,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modules.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.modules.detail(id) });
            showSuccess('Đã publish module!');
        },
    });
}

/**
 * Hook archive module
 * @returns {Object} Mutation object
 */
export function useArchiveModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: moduleService.archive,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modules.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.modules.detail(id) });
            showSuccess('Đã archive module!');
        },
    });
}

// ==========================================
// CLIENT / LEARNER HOOKS
// ==========================================

/**
 * Hook lấy modules của một khóa học
 * @param {string} courseId - ID khóa học
 * @param {Object} options - Query options
 * @returns {Object} Query result
 */
export function useModulesByCourse(courseId, options = {}) {
    return useQuery({
        queryKey: queryKeys.modules.byCourse(courseId),
        queryFn: () => moduleService.getByCourse(courseId),
        enabled: !!courseId,
        staleTime: CACHE_TIME.STALE_TIME,
        ...options,
    });
}
