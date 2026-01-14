/**
 * React Query Hooks cho Document Library
 * Quản lý thư viện tài liệu tập trung
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/documentService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

// ==================== Query Hooks ====================

/**
 * Lấy tất cả documents với filter
 */
export function useDocuments(params = {}) {
    return useQuery({
        queryKey: queryKeys.documents.list(params),
        queryFn: () => documentService.getAll(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Lấy documents đang active
 */
export function useActiveDocuments(params = {}) {
    return useQuery({
        queryKey: queryKeys.documents.list({ ...params, status: 'active' }),
        queryFn: () => documentService.getActive(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Lấy document theo ID
 */
export function useDocument(id) {
    return useQuery({
        queryKey: queryKeys.documents.detail(id),
        queryFn: () => documentService.getById(id),
        enabled: !!id,
    });
}

/**
 * Tìm kiếm documents
 */
export function useSearchDocuments(query, params = {}) {
    return useQuery({
        queryKey: queryKeys.documents.list({ search: query, ...params }),
        queryFn: () => documentService.search(query, params),
        enabled: !!query && query.length >= 2,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Lấy documents của một lesson
 */
export function useLessonDocuments(lessonId) {
    return useQuery({
        queryKey: queryKeys.documents.byLesson(lessonId),
        queryFn: () => documentService.getByLesson(lessonId),
        enabled: !!lessonId,
    });
}

/**
 * Lấy danh sách bài học đang sử dụng document
 */
export function useDocumentUsage(documentId) {
    return useQuery({
        queryKey: queryKeys.documents.usageStats(documentId),
        queryFn: () => documentService.getUsageLessons(documentId),
        enabled: !!documentId,
    });
}

// ==================== Mutation Hooks ====================

/**
 * Tạo document mới (data object)
 */
export function useCreateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: documentService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
            showSuccess('Tạo tài liệu thành công!');
        },
    });
}

/**
 * Upload file và tạo document
 */
export function useUploadDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ file, metadata }) => documentService.uploadAndCreate(file, metadata),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
            showSuccess('Upload tài liệu thành công!');
        },
    });
}

/**
 * Tạo document dạng URL
 */
export function useCreateUrlDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ url, metadata }) => documentService.createUrl(url, metadata),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
            showSuccess('Thêm liên kết thành công!');
        },
    });
}

/**
 * Cập nhật document
 */
export function useUpdateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => documentService.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(variables.id) });
            showSuccess('Cập nhật tài liệu thành công!');
        },
    });
}

/**
 * Archive document (soft delete)
 */
export function useArchiveDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: documentService.archive,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
            showSuccess('Đã lưu trữ tài liệu!');
        },
    });
}

/**
 * Archive nhiều documents
 */
export function useArchiveDocuments() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: documentService.archiveMany,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
            showSuccess('Đã lưu trữ các tài liệu đã chọn!');
        },
    });
}

/**
 * Restore document từ archived
 */
export function useRestoreDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: documentService.restore,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
            showSuccess('Đã khôi phục tài liệu!');
        },
    });
}

/**
 * Xóa document vĩnh viễn
 */
export function useDeleteDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: documentService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
            showSuccess('Đã xóa tài liệu vĩnh viễn!');
        },
    });
}

// ==================== Lesson-Document Junction Mutations ====================

/**
 * Thêm document vào lesson
 */
export function useAddDocumentToLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId, documentId, sort }) => documentService.addToLesson(lessonId, documentId, sort),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documents.byLesson(variables.lessonId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.documents.usageStats(variables.documentId) });
            showSuccess('Đã thêm tài liệu vào bài học!');
        },
    });
}

/**
 * Xóa document khỏi lesson
 */
export function useRemoveDocumentFromLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId, documentId }) => documentService.removeFromLesson(lessonId, documentId),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documents.byLesson(variables.lessonId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.documents.usageStats(variables.documentId) });
            showSuccess('Đã xóa tài liệu khỏi bài học!');
        },
    });
}

/**
 * Đồng bộ danh sách documents cho lesson
 */
export function useSyncLessonDocuments() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId, documentIds }) => documentService.syncLessonDocuments(lessonId, documentIds),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documents.byLesson(variables.lessonId) });
            showSuccess('Đã cập nhật tài liệu cho bài học!');
        },
    });
}

/**
 * Cập nhật thứ tự documents trong lesson
 */
export function useUpdateLessonDocumentsOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId, orderedDocumentIds }) =>
            documentService.updateLessonDocumentsOrder(lessonId, orderedDocumentIds),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documents.byLesson(variables.lessonId) });
        },
    });
}
