/**
 * Note Service - Quản lý ghi chú của user trong bài học
 * Collection: user_notes
 */
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem, readMe } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const noteService = {
    /**
     * Lấy tất cả notes của user hiện tại
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách notes
     */
    getMyNotes: async (params = {}) => {
        return await directus.request(
            readItems(COLLECTIONS.USER_NOTES, {
                fields: [
                    '*',
                    'lesson_id.id',
                    'lesson_id.title',
                    'lesson_id.module_id.id',
                    'lesson_id.module_id.title',
                    'lesson_id.module_id.course_id.id',
                    'lesson_id.module_id.course_id.title',
                ],
                sort: ['-date_created'],
                // Directus tự động filter theo user hiện tại nếu có permissions
                ...params,
            })
        );
    },

    /**
     * Lấy notes theo lesson
     * @param {string} lessonId - ID lesson
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách notes
     */
    getByLesson: async (lessonId, params = {}) => {
        return await noteService.getMyNotes({
            filter: { lesson_id: { _eq: lessonId } },
            sort: ['-date_created'],
            ...params,
        });
    },

    /**
     * Lấy notes theo video timestamp (cho video lessons)
     * @param {string} lessonId - ID lesson
     * @returns {Promise<Array>} Notes sorted by timestamp
     */
    getByLessonWithTimestamp: async lessonId => {
        return await directus.request(
            readItems(COLLECTIONS.USER_NOTES, {
                fields: ['*'],
                filter: {
                    lesson_id: { _eq: lessonId },
                    video_timestamp: { _nnull: true },
                },
                sort: ['video_timestamp'],
            })
        );
    },

    /**
     * Lấy chi tiết note theo ID
     * @param {string} id - ID note
     * @returns {Promise<Object|null>} Chi tiết note
     */
    getById: async id => {
        const result = await directus.request(
            readItems(COLLECTIONS.USER_NOTES, {
                fields: ['*', 'lesson_id.id', 'lesson_id.title', 'lesson_id.module_id.id', 'lesson_id.module_id.title'],
                filter: { id: { _eq: id } },
                limit: 1,
            })
        );
        return result[0] || null;
    },

    /**
     * Tạo note mới
     * @param {Object} data - Dữ liệu note { lesson_id, content, video_timestamp? }
     * @returns {Promise<Object>} Note đã tạo
     */
    create: async data => {
        return await directus.request(createItem(COLLECTIONS.USER_NOTES, data));
    },

    /**
     * Tạo note tại timestamp video
     * @param {string} lessonId - ID lesson
     * @param {string} content - Nội dung note
     * @param {number} timestamp - Video timestamp (seconds)
     * @returns {Promise<Object>} Note đã tạo
     */
    createAtTimestamp: async (lessonId, content, timestamp) => {
        return await noteService.create({
            lesson_id: lessonId,
            content,
            video_timestamp: timestamp,
        });
    },

    /**
     * Cập nhật note
     * @param {string} id - ID note
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} Note đã cập nhật
     */
    update: async (id, data) => {
        return await directus.request(updateItem(COLLECTIONS.USER_NOTES, id, data));
    },

    /**
     * Xóa note
     * @param {string} id - ID note
     * @returns {Promise<void>}
     */
    delete: async id => {
        return await directus.request(deleteItem(COLLECTIONS.USER_NOTES, id));
    },

    /**
     * Xóa tất cả notes của một lesson
     * @param {string} lessonId - ID lesson
     * @returns {Promise<void>}
     */
    deleteByLesson: async lessonId => {
        const notes = await noteService.getByLesson(lessonId);
        const promises = notes.map(note => noteService.delete(note.id));
        await Promise.all(promises);
    },

    /**
     * Tìm kiếm notes theo content
     * @param {string} query - Từ khóa tìm kiếm
     * @returns {Promise<Array>} Notes matching query
     */
    search: async query => {
        return await directus.request(
            readItems(COLLECTIONS.USER_NOTES, {
                fields: [
                    '*',
                    'lesson_id.id',
                    'lesson_id.title',
                    'lesson_id.module_id.course_id.id',
                    'lesson_id.module_id.course_id.title',
                ],
                filter: {
                    content: { _icontains: query },
                },
                sort: ['-date_created'],
            })
        );
    },

    /**
     * Đếm số notes của user
     * @returns {Promise<number>} Số lượng notes
     */
    countMyNotes: async () => {
        const result = await directus.request(
            readItems(COLLECTIONS.USER_NOTES, {
                aggregate: { count: '*' },
            })
        );
        return result[0]?.count || 0;
    },

    /**
     * Export notes theo lesson hoặc course
     * @param {Object} filter - { lessonId?, courseId? }
     * @returns {Promise<Array>} Notes để export
     */
    exportNotes: async (filter = {}) => {
        const queryFilter = {};

        if (filter.lessonId) {
            queryFilter.lesson_id = { _eq: filter.lessonId };
        }

        if (filter.courseId) {
            queryFilter['lesson_id.module_id.course_id'] = { _eq: filter.courseId };
        }

        return await directus.request(
            readItems(COLLECTIONS.USER_NOTES, {
                fields: [
                    'id',
                    'content',
                    'video_timestamp',
                    'date_created',
                    'lesson_id.title',
                    'lesson_id.module_id.title',
                    'lesson_id.module_id.course_id.title',
                ],
                filter: queryFilter,
                sort: [
                    'lesson_id.module_id.course_id.id',
                    'lesson_id.module_id.sort',
                    'lesson_id.sort',
                    'video_timestamp',
                ],
            })
        );
    },
};
