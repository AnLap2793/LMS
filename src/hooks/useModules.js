/**
 * React Query Hooks cho Modules
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moduleService } from '../services/moduleService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

/**
 * Helper to invalidate course detail
 */
const invalidateCourseDetail = (queryClient, courseId) => {
    if (courseId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(courseId) });
    }
};

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

/**
 * Hook lấy modules kèm lessons
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
            if (variables.course_id) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.modules.byCourse(variables.course_id),
                });
                invalidateCourseDetail(queryClient, variables.course_id);
            }
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
            // Invalidate course modules nếu có course_id
            if (data?.course_id) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.modules.byCourse(data.course_id),
                });
                invalidateCourseDetail(queryClient, data.course_id);
            }
            showSuccess('Cập nhật module thành công!');
        },
    });
}

/**
 * Hook xóa module
 * @returns {Object} Mutation object
 */
export function useDeleteModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: moduleService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modules.all });
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
            queryClient.invalidateQueries({
                queryKey: queryKeys.modules.byCourse(variables.courseId),
            });
            invalidateCourseDetail(queryClient, variables.courseId);
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
