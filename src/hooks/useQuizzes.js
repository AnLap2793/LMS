/**
 * React Query Hooks cho Quizzes và Quiz Questions
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizService } from '../services/quizService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook lấy danh sách quizzes
 * @param {Object} params - Filter params { search, course_id, page, limit }
 */
export function useQuizzes(params = {}) {
    return useQuery({
        queryKey: queryKeys.quizzes.list(params),
        queryFn: () => quizService.getAll(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook đếm tổng số quizzes
 * @param {Object} params - Filter params
 */
export function useQuizzesCount(params = {}) {
    return useQuery({
        queryKey: [...queryKeys.quizzes.lists(), 'count', params],
        queryFn: () => quizService.count(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy chi tiết quiz
 * @param {string} quizId - ID quiz
 */
export function useQuiz(quizId) {
    return useQuery({
        queryKey: queryKeys.quizzes.detail(quizId),
        queryFn: () => quizService.getById(quizId),
        enabled: !!quizId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy quiz kèm questions (cho làm bài)
 * @param {string} quizId - ID quiz
 */
export function useQuizWithQuestions(quizId) {
    return useQuery({
        queryKey: [...queryKeys.quizzes.detail(quizId), 'with-questions'],
        queryFn: () => quizService.getWithQuestions(quizId),
        enabled: !!quizId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy quizzes theo course
 * @param {string} courseId - ID khóa học
 */
export function useQuizzesByCourse(courseId) {
    return useQuery({
        queryKey: [...queryKeys.quizzes.all, 'course', courseId],
        queryFn: () => quizService.getByCourseId(courseId),
        enabled: !!courseId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy quiz theo lesson
 * @param {string} lessonId - ID bài học
 */
export function useQuizByLesson(lessonId) {
    return useQuery({
        queryKey: queryKeys.quizzes.byLesson(lessonId),
        queryFn: () => quizService.getByLessonId(lessonId),
        enabled: !!lessonId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy danh sách câu hỏi của quiz
 * @param {string} quizId - ID quiz
 */
export function useQuizQuestions(quizId) {
    return useQuery({
        queryKey: queryKeys.quizQuestions.byQuiz(quizId),
        queryFn: () => quizService.getQuestions(quizId),
        enabled: !!quizId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy chi tiết một câu hỏi
 * @param {string} questionId - ID câu hỏi
 */
export function useQuizQuestion(questionId) {
    return useQuery({
        queryKey: [...queryKeys.quizQuestions.all, 'detail', questionId],
        queryFn: () => quizService.getQuestionById(questionId),
        enabled: !!questionId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy thống kê quizzes
 */
export function useQuizStats() {
    return useQuery({
        queryKey: [...queryKeys.quizzes.all, 'stats'],
        queryFn: () => quizService.getStats(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook tạo quiz mới
 */
export function useCreateQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: quizService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.all });
            showSuccess('Tạo bài kiểm tra thành công!');
        },
    });
}

/**
 * Hook cập nhật quiz
 */
export function useUpdateQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => quizService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.detail(variables.id) });
            showSuccess('Cập nhật bài kiểm tra thành công!');
        },
    });
}

/**
 * Hook xóa quiz
 */
export function useDeleteQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: quizService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.all });
            showSuccess('Xóa bài kiểm tra thành công!');
        },
    });
}

/**
 * Hook thêm câu hỏi vào quiz
 */
export function useAddQuizQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ quizId, data }) => quizService.addQuestion(quizId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.quizQuestions.byQuiz(variables.quizId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.detail(variables.quizId) });
            showSuccess('Thêm câu hỏi thành công!');
        },
    });
}

/**
 * Hook cập nhật câu hỏi
 */
export function useUpdateQuizQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ questionId, data }) => quizService.updateQuestion(questionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.quizQuestions.all });
            showSuccess('Cập nhật câu hỏi thành công!');
        },
    });
}

/**
 * Hook xóa câu hỏi
 */
export function useDeleteQuizQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: quizService.deleteQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.quizQuestions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.all });
            showSuccess('Xóa câu hỏi thành công!');
        },
    });
}
