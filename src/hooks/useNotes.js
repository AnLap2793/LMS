/**
 * React Query Hooks cho User Notes
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteService } from '../services/noteService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

// ==========================================
// CLIENT / LEARNER HOOKS
// ==========================================

/**
 * Hook lấy tất cả notes của user hiện tại
 * @param {Object} params - Filter params
 * @returns {Object} Query result
 */
export function useMyNotes(params = {}) {
    return useQuery({
        queryKey: queryKeys.userNotes.myNotes(),
        queryFn: () => noteService.getMyNotes(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy notes của một lesson
 * @param {string} lessonId - ID lesson
 * @param {Object} options - Query options
 * @returns {Object} Query result
 */
export function useNotesByLesson(lessonId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userNotes.byLesson(lessonId),
        queryFn: () => noteService.getByLesson(lessonId),
        enabled: !!lessonId,
        staleTime: CACHE_TIME.STALE_TIME,
        ...options,
    });
}

/**
 * Hook lấy notes với video timestamp
 * @param {string} lessonId - ID lesson
 * @returns {Object} Query result
 */
export function useVideoNotes(lessonId) {
    return useQuery({
        queryKey: [...queryKeys.userNotes.byLesson(lessonId), 'video'],
        queryFn: () => noteService.getByLessonWithTimestamp(lessonId),
        enabled: !!lessonId,
    });
}

/**
 * Hook lấy chi tiết note
 * @param {string} id - ID note
 * @returns {Object} Query result
 */
export function useNote(id) {
    return useQuery({
        queryKey: queryKeys.userNotes.detail(id),
        queryFn: () => noteService.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook tìm kiếm notes
 * @param {string} query - Từ khóa tìm kiếm
 * @returns {Object} Query result
 */
export function useSearchNotes(query) {
    return useQuery({
        queryKey: [...queryKeys.userNotes.all, 'search', query],
        queryFn: () => noteService.search(query),
        enabled: query?.length >= 2, // Chỉ search khi có ít nhất 2 ký tự
    });
}

/**
 * Hook tạo note mới
 * @returns {Object} Mutation object
 */
export function useCreateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: noteService.create,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.userNotes.all });
            if (variables.lesson_id) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.userNotes.byLesson(variables.lesson_id),
                });
            }
            showSuccess('Đã lưu ghi chú!');
        },
    });
}

/**
 * Hook tạo note tại timestamp video
 * @returns {Object} Mutation object
 */
export function useCreateVideoNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId, content, timestamp }) => noteService.createAtTimestamp(lessonId, content, timestamp),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.userNotes.byLesson(variables.lessonId),
            });
            showSuccess('Đã lưu ghi chú tại thời điểm video!');
        },
    });
}

/**
 * Hook cập nhật note
 * @returns {Object} Mutation object
 */
export function useUpdateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => noteService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.userNotes.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.userNotes.detail(variables.id),
            });
            showSuccess('Đã cập nhật ghi chú!');
        },
    });
}

/**
 * Hook xóa note
 * @returns {Object} Mutation object
 */
export function useDeleteNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: noteService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.userNotes.all });
            showSuccess('Đã xóa ghi chú!');
        },
    });
}

/**
 * Hook xóa tất cả notes của lesson
 * @returns {Object} Mutation object
 */
export function useDeleteNotesByLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: noteService.deleteByLesson,
        onSuccess: (_, lessonId) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.userNotes.byLesson(lessonId),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.userNotes.all });
            showSuccess('Đã xóa tất cả ghi chú của bài học!');
        },
    });
}

/**
 * Hook export notes
 * @param {Object} filter - { lessonId?, courseId? }
 * @returns {Object} Query result
 */
export function useExportNotes(filter = {}) {
    return useQuery({
        queryKey: [...queryKeys.userNotes.all, 'export', filter],
        queryFn: () => noteService.exportNotes(filter),
        enabled: !!(filter.lessonId || filter.courseId),
    });
}
