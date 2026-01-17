/**
 * React Query Hooks cho Lesson Progress
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonProgressService } from '../services/lessonProgressService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

// ============================================
// CLIENT / LEARNER HOOKS
// ============================================

/**
 * Hook lấy tiến độ học của user hiện tại
 */
export function useMyLessonProgress() {
    return useQuery({
        queryKey: queryKeys.lessonProgress.mine(),
        queryFn: () => lessonProgressService.getMyProgress(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy tiến độ theo enrollment
 * @param {string} enrollmentId - ID enrollment
 */
export function useLessonProgressByEnrollment(enrollmentId) {
    return useQuery({
        queryKey: queryKeys.lessonProgress.byEnrollment(enrollmentId),
        queryFn: () => lessonProgressService.getByEnrollmentId(enrollmentId),
        enabled: !!enrollmentId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy tiến độ của một bài học cụ thể
 * @param {string} enrollmentId - ID enrollment
 * @param {string} lessonId - ID bài học
 */
export function useLessonProgress(enrollmentId, lessonId) {
    return useQuery({
        queryKey: [...queryKeys.lessonProgress.byLesson(lessonId), enrollmentId],
        queryFn: () => lessonProgressService.getByLessonId(enrollmentId, lessonId),
        enabled: !!enrollmentId && !!lessonId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy thống kê tiến độ của user hiện tại
 */
export function useMyProgressStats() {
    return useQuery({
        queryKey: [...queryKeys.lessonProgress.mine(), 'stats'],
        queryFn: () => lessonProgressService.getMyStats(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy tổng thời gian học của enrollment
 * @param {string} enrollmentId - ID enrollment
 */
export function useEnrollmentTimeSpent(enrollmentId) {
    return useQuery({
        queryKey: [...queryKeys.lessonProgress.byEnrollment(enrollmentId), 'time-spent'],
        queryFn: () => lessonProgressService.getTotalTimeSpent(enrollmentId),
        enabled: !!enrollmentId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook bắt đầu học bài học
 */
export function useStartLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ enrollmentId, lessonId, lessonInfo }) =>
            lessonProgressService.startLesson(enrollmentId, lessonId, lessonInfo),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessonProgress.byEnrollment(variables.enrollmentId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.lessonProgress.mine() });
        },
    });
}

/**
 * Hook cập nhật tiến độ bài học
 */
export function useUpdateLessonProgress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ progressId, data }) => lessonProgressService.updateProgress(progressId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessonProgress.all });
        },
    });
}

/**
 * Hook đánh dấu bài học hoàn thành
 */
export function useCompleteLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ enrollmentId, lessonId }) => lessonProgressService.completeLesson(enrollmentId, lessonId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessonProgress.byEnrollment(variables.enrollmentId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.lessonProgress.mine() });
            queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all });
            showSuccess('Hoàn thành bài học!');
        },
    });
}

/**
 * Hook cập nhật vị trí video
 */
export function useUpdateVideoPosition() {
    return useMutation({
        mutationFn: ({ progressId, position, duration }) =>
            lessonProgressService.updateVideoPosition(progressId, position, duration),
        // Silent update - không invalidate query để tránh re-render
    });
}
