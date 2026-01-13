/**
 * React Query Hooks cho Courses (Learner features)
 */
import { useQuery } from '@tanstack/react-query';
import { courseService } from '../services/courseService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';

/**
 * Hook lấy danh sách khóa học published cho catalog
 * @param {Object} params - Filter params { search, tags, difficulty, page, limit }
 */
export function usePublishedCourses(params = {}) {
    return useQuery({
        queryKey: queryKeys.courses.list(params),
        queryFn: () => courseService.getPublishedCourses(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook đếm tổng số khóa học (cho pagination)
 * @param {Object} params - Filter params
 */
export function useCoursesCount(params = {}) {
    return useQuery({
        queryKey: [...queryKeys.courses.lists(), 'count', params],
        queryFn: () => courseService.countPublishedCourses(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy chi tiết khóa học
 * @param {string} courseId - ID khóa học
 */
export function useCourseDetail(courseId) {
    return useQuery({
        queryKey: queryKeys.courses.detail(courseId),
        queryFn: () => courseService.getCourseDetail(courseId),
        enabled: !!courseId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy khóa học nổi bật (cho HomePage)
 * @param {number} limit - Số lượng
 */
export function useFeaturedCourses(limit = 6) {
    return useQuery({
        queryKey: [...queryKeys.home.featured, { limit }],
        queryFn: () => courseService.getFeaturedCourses(limit),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy khóa học phổ biến
 * @param {number} limit - Số lượng
 */
export function usePopularCourses(limit = 6) {
    return useQuery({
        queryKey: [...queryKeys.dashboard.popularCourses, { limit }],
        queryFn: () => courseService.getPopularCourses(limit),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy modules của khóa học
 * @param {string} courseId - ID khóa học
 */
export function useCourseModules(courseId) {
    return useQuery({
        queryKey: queryKeys.modules.byCourse(courseId),
        queryFn: () => courseService.getCourseModules(courseId),
        enabled: !!courseId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy chi tiết bài học
 * @param {string} lessonId - ID bài học
 */
export function useLessonDetail(lessonId) {
    return useQuery({
        queryKey: queryKeys.lessons.detail(lessonId),
        queryFn: () => courseService.getLessonDetail(lessonId),
        enabled: !!lessonId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy tất cả tags
 */
export function useTags() {
    return useQuery({
        queryKey: queryKeys.tags.all,
        queryFn: () => courseService.getAllTags(),
        staleTime: CACHE_TIME.STALE_TIME * 2, // Tags ít thay đổi
    });
}
