/**
 * Course Service - Mock data cho khóa học (Learner features)
 * Sử dụng mock data thay vì Directus API
 */
import { mockCourses } from '../mocks/courses';
import { mockTags } from '../mocks/tags';
import { mockModules, mockLessons, getModulesWithLessons } from '../mocks/modules';
import { COURSE_STATUS } from '../constants/lms';

// Helper: Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const courseService = {
    /**
     * Lấy danh sách khóa học published cho catalog
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách khóa học
     */
    getPublishedCourses: async (params = {}) => {
        await delay();
        const { search, tags, difficulty, page = 1, limit = 12 } = params;

        let filteredCourses = mockCourses.filter(c => c.status === COURSE_STATUS.PUBLISHED);

        // Filter tìm kiếm
        if (search) {
            const searchLower = search.toLowerCase();
            filteredCourses = filteredCourses.filter(
                c => c.title.toLowerCase().includes(searchLower) || c.description.toLowerCase().includes(searchLower)
            );
        }

        // Filter difficulty
        if (difficulty) {
            filteredCourses = filteredCourses.filter(c => c.difficulty === difficulty);
        }

        // Filter tags
        if (tags && tags.length > 0) {
            filteredCourses = filteredCourses.filter(c => c.tags?.some(t => tags.includes(t.id)));
        }

        // Pagination
        const offset = (page - 1) * limit;
        const paginatedCourses = filteredCourses.slice(offset, offset + limit);

        // Transform to match API response format
        return paginatedCourses.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            thumbnail: c.thumbnail,
            difficulty: c.difficulty,
            duration_hours: Math.round(c.duration / 60),
            instructor: c.user_created?.first_name + ' ' + c.user_created?.last_name,
            date_created: c.date_created,
            tags: c.tags?.map(t => ({ tags_id: t })) || [],
        }));
    },

    /**
     * Đếm tổng số khóa học published (cho pagination)
     * @param {Object} params - Filter params
     * @returns {Promise<number>} Tổng số khóa học
     */
    countPublishedCourses: async (params = {}) => {
        await delay(100);
        const { search, tags, difficulty } = params;

        let filteredCourses = mockCourses.filter(c => c.status === COURSE_STATUS.PUBLISHED);

        if (search) {
            const searchLower = search.toLowerCase();
            filteredCourses = filteredCourses.filter(
                c => c.title.toLowerCase().includes(searchLower) || c.description.toLowerCase().includes(searchLower)
            );
        }

        if (difficulty) {
            filteredCourses = filteredCourses.filter(c => c.difficulty === difficulty);
        }

        if (tags && tags.length > 0) {
            filteredCourses = filteredCourses.filter(c => c.tags?.some(t => tags.includes(t.id)));
        }

        return filteredCourses.length;
    },

    /**
     * Lấy chi tiết khóa học kèm modules và lessons
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Object>} Chi tiết khóa học
     */
    getCourseDetail: async courseId => {
        await delay();
        const course = mockCourses.find(c => c.id === courseId);

        if (!course) {
            throw new Error('Course not found');
        }

        // Get modules with lessons
        const modulesWithLessons = getModulesWithLessons(courseId);

        return {
            ...course,
            duration_hours: Math.round(course.duration / 60),
            instructor: course.user_created
                ? {
                      id: course.user_created.id,
                      first_name: course.user_created.first_name,
                      last_name: course.user_created.last_name,
                      avatar: null,
                      title: 'Instructor',
                  }
                : null,
            tags: course.tags?.map(t => ({ tags_id: t })) || [],
            modules: modulesWithLessons
                .filter(m => m.status === 'published')
                .map(m => ({
                    id: m.id,
                    title: m.title,
                    description: m.description,
                    sort_order: m.sort,
                    status: m.status,
                    lessons: m.lessons
                        .filter(l => l.status === 'published')
                        .map(l => ({
                            id: l.id,
                            title: l.title,
                            type: l.type,
                            duration_minutes: l.duration,
                            sort_order: l.sort,
                            is_preview: false,
                        })),
                })),
        };
    },

    /**
     * Lấy khóa học nổi bật (cho HomePage)
     * @param {number} limit - Số lượng khóa học
     * @returns {Promise<Array>} Danh sách khóa học nổi bật
     */
    getFeaturedCourses: async (limit = 6) => {
        await delay();
        const publishedCourses = mockCourses.filter(c => c.status === COURSE_STATUS.PUBLISHED);

        // Simulate featured courses (first N courses)
        const featuredCourses = publishedCourses.slice(0, limit);

        return featuredCourses.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            thumbnail: c.thumbnail,
            difficulty: c.difficulty,
            duration_hours: Math.round(c.duration / 60),
            instructor: c.user_created?.first_name + ' ' + c.user_created?.last_name,
            tags: c.tags?.map(t => ({ tags_id: t })) || [],
        }));
    },

    /**
     * Lấy khóa học phổ biến (dựa trên số enrollment)
     * @param {number} limit - Số lượng khóa học
     * @returns {Promise<Array>} Danh sách khóa học phổ biến
     */
    getPopularCourses: async (limit = 6) => {
        await delay();
        const publishedCourses = mockCourses.filter(c => c.status === COURSE_STATUS.PUBLISHED);

        // Sort by enrollments_count descending
        const sortedCourses = [...publishedCourses].sort(
            (a, b) => (b.enrollments_count || 0) - (a.enrollments_count || 0)
        );

        return sortedCourses.slice(0, limit).map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            thumbnail: c.thumbnail,
            difficulty: c.difficulty,
            duration_hours: Math.round(c.duration / 60),
            instructor: c.user_created?.first_name + ' ' + c.user_created?.last_name,
            tags: c.tags?.map(t => ({ tags_id: t })) || [],
        }));
    },

    /**
     * Lấy modules của khóa học
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Array>} Danh sách modules
     */
    getCourseModules: async courseId => {
        await delay();
        const modulesWithLessons = getModulesWithLessons(courseId);

        return modulesWithLessons
            .filter(m => m.status === 'published')
            .sort((a, b) => a.sort - b.sort)
            .map(m => ({
                id: m.id,
                title: m.title,
                description: m.description,
                sort_order: m.sort,
                lessons: m.lessons
                    .filter(l => l.status === 'published')
                    .sort((a, b) => a.sort - b.sort)
                    .map(l => ({
                        id: l.id,
                        title: l.title,
                        type: l.type,
                        duration_minutes: l.duration,
                        sort_order: l.sort,
                        is_preview: false,
                    })),
            }));
    },

    /**
     * Lấy chi tiết bài học
     * @param {string} lessonId - ID bài học
     * @returns {Promise<Object>} Chi tiết bài học
     */
    getLessonDetail: async lessonId => {
        await delay();
        const lesson = mockLessons.find(l => l.id === lessonId);

        if (!lesson) {
            throw new Error('Lesson not found');
        }

        const module = mockModules.find(m => m.id === lesson.module_id);
        const course = module ? mockCourses.find(c => c.id === module.course_id) : null;

        return {
            ...lesson,
            duration_minutes: lesson.duration,
            module: module
                ? {
                      id: module.id,
                      title: module.title,
                      course: course
                          ? {
                                id: course.id,
                                title: course.title,
                            }
                          : null,
                  }
                : null,
        };
    },

    /**
     * Lấy tất cả tags
     * @returns {Promise<Array>} Danh sách tags
     */
    getAllTags: async () => {
        await delay(100);
        return mockTags.map(t => ({
            id: t.id,
            name: t.name,
            color: t.color,
        }));
    },
};
