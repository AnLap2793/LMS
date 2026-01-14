/**
 * React Query Hooks cho Question Bank
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionBankService } from '../services/questionBankService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

/**
 * Hook lấy danh sách câu hỏi với filter và pagination
 * @param {Object} params - Filter params { category, difficulty, type, search, status, page, limit }
 */
export function useQuestionBank(params = {}) {
    return useQuery({
        queryKey: queryKeys.questionBank.list(params),
        queryFn: () => questionBankService.getAll(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy chi tiết câu hỏi
 * @param {string} id - Question ID
 */
export function useQuestionBankDetail(id) {
    return useQuery({
        queryKey: queryKeys.questionBank.detail(id),
        queryFn: () => questionBankService.getById(id),
        enabled: !!id,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy thống kê câu hỏi
 */
export function useQuestionBankStats() {
    return useQuery({
        queryKey: [...queryKeys.questionBank.all, 'stats'],
        queryFn: () => questionBankService.getStats(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook tạo câu hỏi mới
 */
export function useCreateQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: questionBankService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.questionBank.all });
            showSuccess('Tạo câu hỏi thành công!');
        },
    });
}

/**
 * Hook cập nhật câu hỏi
 */
export function useUpdateQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => questionBankService.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.questionBank.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.questionBank.detail(variables.id) });
            showSuccess('Cập nhật câu hỏi thành công!');
        },
    });
}

/**
 * Hook xóa câu hỏi
 */
export function useDeleteQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: questionBankService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.questionBank.all });
            showSuccess('Xóa câu hỏi thành công!');
        },
    });
}

/**
 * Hook xóa nhiều câu hỏi
 */
export function useDeleteManyQuestions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: questionBankService.deleteMany,
        onSuccess: deletedCount => {
            queryClient.invalidateQueries({ queryKey: queryKeys.questionBank.all });
            showSuccess(`Đã xóa ${deletedCount} câu hỏi!`);
        },
    });
}

/**
 * Hook copy câu hỏi từ Question Bank sang Quiz
 */
export function useCopyQuestionsToQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ questionIds, quizId }) => questionBankService.copyToQuiz(questionIds, quizId),
        onSuccess: (copiedQuestions, variables) => {
            // Invalidate quiz questions cache
            queryClient.invalidateQueries({ queryKey: queryKeys.quizQuestions.byQuiz(variables.quizId) });
            showSuccess(`Đã thêm ${copiedQuestions.length} câu hỏi vào bài kiểm tra!`);
        },
    });
}
