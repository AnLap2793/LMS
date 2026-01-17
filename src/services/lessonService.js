/**
 * Lesson Service - Quản lý bài học
 * Tách riêng logic từ courseService để dễ maintain
 */
import { directus } from './directus';
import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const lessonService = {
    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Lấy tất cả lessons với filter và pagination
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách lessons
     */
    getAll: async (params = {}) => {
        return await directus.request(
            readItems(COLLECTIONS.LESSONS, {
                fields: [
                    '*',
                    'module_id.id',
                    'module_id.title',
                    'module_id.course_id.id',
                    'module_id.course_id.title',
                    'user_created.id',
                    'user_created.first_name',
                    'user_created.last_name',
                ],
                sort: ['sort'],
                ...params,
            })
        );
    },

    /**
     * Lấy lessons của một module
     * @param {string} moduleId - ID module
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách lessons
     */
    getByModule: async (moduleId, params = {}) => {
        return await lessonService.getAll({
            filter: { module_id: { _eq: moduleId } },
            sort: ['sort'],
            ...params,
        });
    },

    /**
     * Lấy chi tiết lesson theo ID
     * @param {string} id - ID lesson
     * @param {Object} params - Filter params
     * @returns {Promise<Object|null>} Chi tiết lesson
     */
    getById: async (id, params = {}) => {
        return await directus.request(
            readItem(COLLECTIONS.LESSONS, id, {
                fields: [
                    '*',
                    'module_id.id',
                    'module_id.title',
                    'module_id.course_id.id',
                    'module_id.course_id.title',
                    'user_created.id',
                    'user_created.first_name',
                    'user_created.last_name',
                ],
                ...params,
            })
        );
    },

    /**
     * Tạo lesson mới
     * @param {Object} data - Dữ liệu lesson
     * @returns {Promise<Object>} Lesson đã tạo
     */
    create: async data => {
        // Tự động set sort order nếu chưa có
        if (data.sort === undefined && data.module_id) {
            // Tối ưu: Dùng count aggregate thay vì fetch all items
            const count = await lessonService.countByModule(data.module_id);
            data.sort = count;
        }

        return await directus.request(createItem(COLLECTIONS.LESSONS, data));
    },

    /**
     * Cập nhật lesson
     * @param {string} id - ID lesson
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} Lesson đã cập nhật
     */
    update: async (id, data) => {
        return await directus.request(updateItem(COLLECTIONS.LESSONS, id, data));
    },

    /**
     * Xóa lesson
     * @param {string} id - ID lesson
     * @returns {Promise<void>}
     */
    delete: async id => {
        return await directus.request(deleteItem(COLLECTIONS.LESSONS, id));
    },

    /**
     * Cập nhật thứ tự lessons (drag & drop)
     * @param {string} moduleId - ID module
     * @param {Array<string>} orderedIds - Danh sách ID theo thứ tự mới
     * @returns {Promise<void>}
     */
    updateOrder: async (moduleId, orderedIds) => {
        const promises = orderedIds.map((id, index) =>
            directus.request(updateItem(COLLECTIONS.LESSONS, id, { sort: index }))
        );
        await Promise.all(promises);
    },

    /**
     * Thay đổi status lesson
     * @param {string} id - ID lesson
     * @param {string} status - Status mới (draft, published, archived)
     * @returns {Promise<Object>} Lesson đã cập nhật
     */
    updateStatus: async (id, status) => {
        return await lessonService.update(id, { status });
    },

    /**
     * Publish lesson
     * @param {string} id - ID lesson
     * @returns {Promise<Object>} Lesson đã publish
     */
    publish: async id => {
        return await lessonService.updateStatus(id, 'published');
    },

    /**
     * Archive lesson
     * @param {string} id - ID lesson
     * @returns {Promise<Object>} Lesson đã archive
     */
    archive: async id => {
        return await lessonService.updateStatus(id, 'archived');
    },

    // ==========================================
    // CLIENT / LEARNER ENDPOINTS
    // ==========================================

    /**
     * Lấy lessons published của một module (cho learner)
     * @param {string} moduleId - ID module
     * @returns {Promise<Array>} Danh sách lessons published
     */
    getPublishedByModule: async moduleId => {
        return await lessonService.getAll({
            filter: {
                module_id: { _eq: moduleId },
                status: { _eq: 'published' },
            },
            sort: ['sort'],
        });
    },

    /**
     * Lấy lesson kèm documents
     * @param {string} lessonId - ID lesson
     * @returns {Promise<Object|null>} Lesson kèm documents
     */
    getWithDocuments: async lessonId => {
        const result = await directus.request(
            readItems(COLLECTIONS.LESSONS, {
                fields: [
                    '*',
                    'module_id.id',
                    'module_id.title',
                    'module_id.course_id.id',
                    'module_id.course_id.title',
                    'documents.id',
                    'documents.documents_id.*',
                    'documents.documents_id.file.*',
                    'documents.sort',
                ],
                filter: { id: { _eq: lessonId } },
                limit: 1,
                deep: {
                    documents: {
                        _sort: ['sort'],
                    },
                },
            })
        );

        if (!result[0]) return null;

        // Transform documents
        const lesson = result[0];
        return {
            ...lesson,
            documents: (lesson.documents || []).map(d => ({
                junctionId: d.id,
                sort: d.sort,
                ...d.documents_id,
            })),
        };
    },

    /**
     * Đếm số lessons trong module
     * @param {string} moduleId - ID module
     * @returns {Promise<number>} Số lượng lessons
     */
    countByModule: async moduleId => {
        const result = await directus.request(
            readItems(COLLECTIONS.LESSONS, {
                filter: { module_id: { _eq: moduleId } },
                aggregate: { count: '*' },
            })
        );
        return result[0]?.count || 0;
    },

    /**
     * Lấy lesson tiếp theo trong module
     * @param {string} currentLessonId - ID lesson hiện tại
     * @returns {Promise<Object|null>} Lesson tiếp theo hoặc null
     */
    getNextLesson: async currentLessonId => {
        const currentLesson = await lessonService.getById(currentLessonId);
        if (!currentLesson || !currentLesson.module_id) return null;

        const result = await directus.request(
            readItems(COLLECTIONS.LESSONS, {
                fields: ['id', 'title', 'type', 'sort'],
                filter: {
                    module_id: { _eq: currentLesson.module_id.id || currentLesson.module_id },
                    sort: { _gt: currentLesson.sort },
                    status: { _eq: 'published' },
                },
                sort: ['sort'],
                limit: 1,
            })
        );

        return result[0] || null;
    },

    /**
     * Lấy lesson trước đó trong module
     * @param {string} currentLessonId - ID lesson hiện tại
     * @returns {Promise<Object|null>} Lesson trước hoặc null
     */
    getPreviousLesson: async currentLessonId => {
        const currentLesson = await lessonService.getById(currentLessonId);
        if (!currentLesson || !currentLesson.module_id) return null;

        const result = await directus.request(
            readItems(COLLECTIONS.LESSONS, {
                fields: ['id', 'title', 'type', 'sort'],
                filter: {
                    module_id: { _eq: currentLesson.module_id.id || currentLesson.module_id },
                    sort: { _lt: currentLesson.sort },
                    status: { _eq: 'published' },
                },
                sort: ['-sort'],
                limit: 1,
            })
        );

        return result[0] || null;
    },
};
