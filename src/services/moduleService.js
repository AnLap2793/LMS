/**
 * Module Service - Quản lý modules trong khóa học
 * Tách riêng logic từ courseService để dễ maintain
 */
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const moduleService = {
    /**
     * Lấy tất cả modules với filter và pagination
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách modules
     */
    getAll: async (params = {}) => {
        return await directus.request(
            readItems(COLLECTIONS.MODULES, {
                fields: [
                    '*',
                    'course_id.id',
                    'course_id.title',
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
     * Lấy modules của một khóa học
     * @param {string} courseId - ID khóa học
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách modules
     */
    getByCourse: async (courseId, params = {}) => {
        return await moduleService.getAll({
            filter: { course_id: { _eq: courseId } },
            sort: ['sort'],
            ...params,
        });
    },

    /**
     * Lấy modules published của một khóa học (cho learner)
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Array>} Danh sách modules published
     */
    getPublishedByCourse: async courseId => {
        return await moduleService.getAll({
            filter: {
                course_id: { _eq: courseId },
                status: { _eq: 'published' },
            },
            sort: ['sort'],
        });
    },

    /**
     * Lấy chi tiết module theo ID
     * @param {string} id - ID module
     * @param {Object} params - Filter params
     * @returns {Promise<Object|null>} Chi tiết module
     */
    getById: async (id, params = {}) => {
        const result = await directus.request(
            readItems(COLLECTIONS.MODULES, {
                fields: [
                    '*',
                    'course_id.id',
                    'course_id.title',
                    'user_created.id',
                    'user_created.first_name',
                    'user_created.last_name',
                ],
                filter: { id: { _eq: id } },
                limit: 1,
                ...params,
            })
        );
        return result[0] || null;
    },

    /**
     * Lấy modules với lessons (nested)
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Array>} Modules kèm lessons
     */
    getWithLessons: async courseId => {
        return await directus.request(
            readItems(COLLECTIONS.MODULES, {
                fields: [
                    '*',
                    'lessons.id',
                    'lessons.title',
                    'lessons.type',
                    'lessons.duration_minutes',
                    'lessons.sort',
                    'lessons.status',
                    'lessons.is_preview',
                ],
                filter: { course_id: { _eq: courseId } },
                sort: ['sort'],
                deep: {
                    lessons: {
                        _sort: ['sort'],
                    },
                },
            })
        );
    },

    /**
     * Tạo module mới
     * @param {Object} data - Dữ liệu module
     * @returns {Promise<Object>} Module đã tạo
     */
    create: async data => {
        // Tự động set sort order nếu chưa có
        if (data.sort === undefined && data.course_id) {
            const existingModules = await moduleService.getByCourse(data.course_id);
            data.sort = existingModules.length;
        }

        return await directus.request(createItem(COLLECTIONS.MODULES, data));
    },

    /**
     * Cập nhật module
     * @param {string} id - ID module
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} Module đã cập nhật
     */
    update: async (id, data) => {
        return await directus.request(updateItem(COLLECTIONS.MODULES, id, data));
    },

    /**
     * Xóa module
     * @param {string} id - ID module
     * @returns {Promise<void>}
     */
    delete: async id => {
        return await directus.request(deleteItem(COLLECTIONS.MODULES, id));
    },

    /**
     * Cập nhật thứ tự modules (drag & drop)
     * @param {string} courseId - ID khóa học
     * @param {Array<string>} orderedIds - Danh sách ID theo thứ tự mới
     * @returns {Promise<void>}
     */
    updateOrder: async (courseId, orderedIds) => {
        const promises = orderedIds.map((id, index) =>
            directus.request(updateItem(COLLECTIONS.MODULES, id, { sort: index }))
        );
        await Promise.all(promises);
    },

    /**
     * Thay đổi status module
     * @param {string} id - ID module
     * @param {string} status - Status mới (draft, published, archived)
     * @returns {Promise<Object>} Module đã cập nhật
     */
    updateStatus: async (id, status) => {
        return await moduleService.update(id, { status });
    },

    /**
     * Publish module
     * @param {string} id - ID module
     * @returns {Promise<Object>} Module đã publish
     */
    publish: async id => {
        return await moduleService.updateStatus(id, 'published');
    },

    /**
     * Archive module
     * @param {string} id - ID module
     * @returns {Promise<Object>} Module đã archive
     */
    archive: async id => {
        return await moduleService.updateStatus(id, 'archived');
    },

    /**
     * Đếm số modules trong khóa học
     * @param {string} courseId - ID khóa học
     * @returns {Promise<number>} Số lượng modules
     */
    countByCourse: async courseId => {
        const result = await directus.request(
            readItems(COLLECTIONS.MODULES, {
                filter: { course_id: { _eq: courseId } },
                aggregate: { count: '*' },
            })
        );
        return result[0]?.count || 0;
    },
};
