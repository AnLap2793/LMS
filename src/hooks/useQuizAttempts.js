/**
 * React Query Hooks cho Quiz Attempts
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizAttemptService } from '../services/quizAttemptService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

// ==========================================
// ADMIN HOOKS
// ==========================================

/**
 * Hook lấy tất cả attempts (Admin)
 * @param {Object} params - Filter params { search, quizId, userId, passed, page, limit }
 */
export function useQuizAttempts(params = {}) {
    return useQuery({
        queryKey: [...queryKeys.quizAttempts.all, 'list', params],
        queryFn: () => quizAttemptService.getAll(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy attempts theo quiz ID (Admin)
 * @param {string} quizId - Quiz ID
 * @param {Object} params - Filter params
 */
export function useQuizAttemptsByQuiz(quizId, params = {}) {
    return useQuery({
        queryKey: [...queryKeys.quizAttempts.byQuiz(quizId), params],
        queryFn: () => quizAttemptService.getAll({ ...params, quizId }), // Use getAll with quizId filter
        enabled: !!quizId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy thống kê tổng quan (Admin)
 */
export function useQuizAttemptsStats() {
    return useQuery({
        queryKey: [...queryKeys.quizAttempts.all, 'stats'],
        queryFn: () => quizAttemptService.getStats(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy phân tích câu hỏi của một quiz
 * @param {string} quizId - Quiz ID
 */
export function useQuizAnalysis(quizId) {
    return useQuery({
        queryKey: [...queryKeys.quizAttempts.byQuiz(quizId), 'analysis'],
        queryFn: () => quizAttemptService.getQuizAnalysis(quizId),
        enabled: !!quizId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

// ==========================================
// CLIENT / LEARNER HOOKS
// ==========================================

/**
 * Hook lấy lịch sử làm bài của user hiện tại (Learner)
 * @param {Object} params - Filter params { search, passed, page, limit }
 */
export function useMyQuizAttempts(params = {}) {
    return useQuery({
        queryKey: [...queryKeys.quizAttempts.mine(), params],
        queryFn: () => quizAttemptService.getMyAttempts(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy chi tiết attempt
 * @param {string} attemptId - Attempt ID
 */
export function useQuizAttemptDetail(attemptId) {
    return useQuery({
        queryKey: queryKeys.quizAttempts.detail(attemptId),
        queryFn: () => quizAttemptService.getById(attemptId),
        enabled: !!attemptId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook đếm số lượt đã làm của user hiện tại cho một quiz
 * @param {string} quizId - Quiz ID
 */
export function useMyAttemptCount(quizId) {
    return useQuery({
        queryKey: [...queryKeys.quizAttempts.mine(), 'count', quizId],
        queryFn: () => quizAttemptService.countMyAttempts(quizId),
        enabled: !!quizId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy danh sách quizzes cho filter dropdown
 */
export function useQuizzesForFilter() {
    return useQuery({
        queryKey: [...queryKeys.quizzes.all, 'filter-options'],
        queryFn: () => quizAttemptService.getQuizzesForFilter(),
        staleTime: CACHE_TIME.STALE_TIME * 2,
    });
}

/**
 * Hook tạo quiz attempt mới (Submit bài)
 */
export function useCreateQuizAttempt() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: quizAttemptService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.quizAttempts.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.quizAttempts.mine() });
            showSuccess('Đã lưu kết quả bài kiểm tra!');
        },
    });
}
