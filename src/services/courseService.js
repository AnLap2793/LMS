/**
 * Course Service - Directus Implementation
 * Replaces mock data with real API calls
 */
import { directus, getAssetUrl } from './directus';
import { readItems, readItem, aggregate, createItem, updateItem, deleteItem } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';
import { COURSE_STATUS } from '../constants/lms';

export const courseService = {
    /**
     * Lấy tất cả khóa học (cho Admin)
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách khóa học
     */
    getAllCourses: async (params = {}) => {
        const { search, tags, difficulty, status, page = 1, limit = 10 } = params;

        const filter = {};

        if (status) {
            filter.status = { _eq: status };
        }

        if (search) {
            filter._or = [{ title: { _icontains: search } }, { description: { _icontains: search } }];
        }

        if (difficulty) {
            filter.difficulty = { _eq: difficulty };
        }

        if (tags && tags.length > 0) {
            filter.tags = {
                tags_id: {
                    id: { _in: tags },
                },
            };
        }

        const items = await directus.request(
            readItems(COLLECTIONS.COURSES, {
                filter,
                limit,
                page,
                fields: [
                    '*',
                    'user_created.first_name',
                    'user_created.last_name',
                    'tags.tags_id.id',
                    'tags.tags_id.name',
                    'tags.tags_id.color',
                ],
                sort: ['-date_created'],
            })
        );

        return items.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            thumbnail: getAssetUrl(c.thumbnail),
            difficulty: c.difficulty,
            status: c.status,
            duration_hours: c.duration ? Math.round(c.duration / 60) : 0,
            duration_minutes: c.duration || 0,
            instructor: c.user_created
                ? `${c.user_created.first_name} ${c.user_created.last_name}`.trim()
                : 'Unknown Instructor',
            date_created: c.date_created,
            tags: c.tags || [],
        }));
    },

    /**
     * Lấy danh sách khóa học published cho catalog
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách khóa học
     */
    getPublishedCourses: async (params = {}) => {
        const { search, tags, difficulty, page = 1, limit = 12 } = params;

        const filter = {
            status: { _eq: COURSE_STATUS.PUBLISHED },
        };

        if (search) {
            filter._or = [{ title: { _icontains: search } }, { description: { _icontains: search } }];
        }

        if (difficulty) {
            filter.difficulty = { _eq: difficulty };
        }

        if (tags && tags.length > 0) {
            // Directus filtering for M2M is complex, using 'some' logic
            // Assuming 'tags' field in courses is the M2M alias
            filter.tags = {
                tags_id: {
                    id: { _in: tags },
                },
            };
        }

        const items = await directus.request(
            readItems(COLLECTIONS.COURSES, {
                filter,
                limit,
                page,
                fields: [
                    '*',
                    'user_created.first_name',
                    'user_created.last_name',
                    'tags.tags_id.id',
                    'tags.tags_id.name',
                    'tags.tags_id.color',
                ],
                sort: ['-date_created'],
            })
        );

        return items.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            thumbnail: getAssetUrl(c.thumbnail),
            difficulty: c.difficulty,
            duration_hours: c.duration ? Math.round(c.duration / 60) : 0,
            duration_minutes: c.duration || 0,
            instructor: c.user_created
                ? `${c.user_created.first_name} ${c.user_created.last_name}`.trim()
                : 'Unknown Instructor',
            date_created: c.date_created,
            tags: c.tags || [],
        }));
    },

    /**
     * Tạo khóa học mới
     * @param {Object} data
     */
    create: async data => {
        return await directus.request(createItem(COLLECTIONS.COURSES, data));
    },

    /**
     * Cập nhật khóa học
     * @param {string} id
     * @param {Object} data
     */
    update: async (id, data) => {
        return await directus.request(updateItem(COLLECTIONS.COURSES, id, data));
    },

    /**
     * Xóa khóa học
     * @param {string} id
     */
    delete: async id => {
        return await directus.request(deleteItem(COLLECTIONS.COURSES, id));
    },

    /**
     * Đếm tổng số khóa học published (cho pagination)
     * @param {Object} params - Filter params
     * @returns {Promise<number>} Tổng số khóa học
     */
    countPublishedCourses: async (params = {}) => {
        const { search, tags, difficulty } = params;

        const filter = {
            status: { _eq: COURSE_STATUS.PUBLISHED },
        };

        if (search) {
            filter._or = [{ title: { _icontains: search } }, { description: { _icontains: search } }];
        }

        if (difficulty) {
            filter.difficulty = { _eq: difficulty };
        }

        if (tags && tags.length > 0) {
            filter.tags = {
                tags_id: {
                    id: { _in: tags },
                },
            };
        }

        const result = await directus.request(
            aggregate(COLLECTIONS.COURSES, {
                aggregate: { count: '*' },
                query: { filter },
            })
        );

        return Number(result[0]?.count) || 0;
    },

    /**
     * Lấy chi tiết khóa học kèm modules và lessons
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Object>} Chi tiết khóa học
     */
    getCourseDetail: async courseId => {
        const course = await directus.request(
            readItem(COLLECTIONS.COURSES, courseId, {
                fields: [
                    '*',
                    'user_created.id',
                    'user_created.first_name',
                    'user_created.last_name',
                    'tags.tags_id.id',
                    'tags.tags_id.name',
                    'tags.tags_id.color',
                    // Fetch nested modules and lessons
                    'modules.*',
                    'modules.lessons.*',
                ],
            })
        );

        if (!course) {
            throw new Error('Course not found');
        }

        // Sort modules and lessons
        const sortedModules = (course.modules || [])
            // Admin needs to see all modules, filtering should be done in UI for learners
            .sort((a, b) => (a.sort || 0) - (b.sort || 0))
            .map(m => ({
                id: m.id,
                title: m.title,
                description: m.description,
                sort_order: m.sort,
                status: m.status,
                lessons: (m.lessons || [])
                    // Admin needs to see all lessons
                    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
                    .map(l => ({
                        id: l.id,
                        title: l.title,
                        type: l.type,
                        status: l.status, // Include status for filtering
                        duration_minutes: l.duration,
                        sort_order: l.sort,
                        is_preview: false, // Default to false for now
                    })),
            }));

        return {
            ...course,
            // Keep original thumbnail ID for editing
            thumbnail: course.thumbnail,
            duration_hours: course.duration ? Math.round(course.duration / 60) : 0,
            instructor: course.user_created
                ? {
                      id: course.user_created.id,
                      first_name: course.user_created.first_name,
                      last_name: course.user_created.last_name,
                      avatar: null, // Avatar logic if needed
                      title: 'Instructor',
                  }
                : null,
            tags: course.tags || [],
            modules: sortedModules,
        };
    },

    /**
     * Lấy khóa học nổi bật (cho HomePage)
     * @param {number} limit - Số lượng khóa học
     * @returns {Promise<Array>} Danh sách khóa học nổi bật
     */
    getFeaturedCourses: async (limit = 6) => {
        // Assume "featured" logic means published courses, potentially sorted by a specific flag or just recent
        // You might want to add a 'is_featured' field to your Directus schema
        const items = await directus.request(
            readItems(COLLECTIONS.COURSES, {
                filter: { status: { _eq: COURSE_STATUS.PUBLISHED } }, // Add { is_featured: { _eq: true } } if field exists
                limit,
                fields: [
                    '*',
                    'user_created.first_name',
                    'user_created.last_name',
                    'tags.tags_id.id',
                    'tags.tags_id.name',
                    'tags.tags_id.color',
                ],
                sort: ['-date_created'],
            })
        );

        return items.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            thumbnail: getAssetUrl(c.thumbnail),
            difficulty: c.difficulty,
            duration_hours: c.duration ? Math.round(c.duration / 60) : 0,
            duration_minutes: c.duration || 0,
            instructor: c.user_created
                ? `${c.user_created.first_name} ${c.user_created.last_name}`.trim()
                : 'Unknown Instructor',
            tags: c.tags || [],
        }));
    },

    /**
     * Lấy khóa học phổ biến (dựa trên số enrollment)
     * @param {number} limit - Số lượng khóa học
     * @returns {Promise<Array>} Danh sách khóa học phổ biến
     */
    getPopularCourses: async (limit = 6) => {
        // Directus doesn't support complex sorting by counted relationships easily in standard readItems
        // For now, we'll sort by date_created or a specific 'enrollments_count' field if you maintain one
        // If you need real dynamic count sorting, you might need a custom endpoint or Directus Insights
        const items = await directus.request(
            readItems(COLLECTIONS.COURSES, {
                filter: { status: { _eq: COURSE_STATUS.PUBLISHED } },
                limit,
                fields: [
                    '*',
                    'user_created.first_name',
                    'user_created.last_name',
                    'tags.tags_id.id',
                    'tags.tags_id.name',
                    'tags.tags_id.color',
                ],
                sort: ['-date_created'], // Placeholder: Should be sorted by popularity
            })
        );

        return items.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            thumbnail: getAssetUrl(c.thumbnail),
            difficulty: c.difficulty,
            duration_hours: c.duration ? Math.round(c.duration / 60) : 0,
            duration_minutes: c.duration || 0,
            instructor: c.user_created
                ? `${c.user_created.first_name} ${c.user_created.last_name}`.trim()
                : 'Unknown Instructor',
            tags: c.tags || [],
        }));
    },

    /**
     * Lấy modules của khóa học
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Array>} Danh sách modules
     */
    getCourseModules: async courseId => {
        const items = await directus.request(
            readItems(COLLECTIONS.MODULES, {
                filter: {
                    course_id: { _eq: courseId },
                    status: { _eq: 'published' },
                },
                fields: ['*', 'lessons.*'],
                sort: ['sort'],
            })
        );

        return items.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            sort_order: m.sort,
            lessons: (m.lessons || [])
                .filter(l => l.status === 'published')
                .sort((a, b) => (a.sort || 0) - (b.sort || 0))
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
        // Fetch lesson with module and course info
        const lesson = await directus.request(
            readItem(COLLECTIONS.LESSONS, lessonId, {
                fields: ['*', 'module_id.id', 'module_id.title', 'module_id.course_id.id', 'module_id.course_id.title'],
            })
        );

        if (!lesson) {
            throw new Error('Lesson not found');
        }

        return {
            ...lesson,
            duration_minutes: lesson.duration,
            module: lesson.module_id
                ? {
                      id: lesson.module_id.id,
                      title: lesson.module_id.title,
                      course: lesson.module_id.course_id
                          ? {
                                id: lesson.module_id.course_id.id,
                                title: lesson.module_id.course_id.title,
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
        const items = await directus.request(
            readItems(COLLECTIONS.TAGS, {
                fields: ['id', 'name', 'color'],
                sort: ['name'],
            })
        );

        return items;
    },
};
