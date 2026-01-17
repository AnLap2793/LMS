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
     * Lấy modules kèm số lượng lessons (không fetch full lesson data)
     * Tối ưu cho Admin CourseContentPage - chỉ cần hiển thị số bài học
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Array>} Modules với lesson_count
     */
    getByCourseWithLessonCount: async courseId => {
        const modules = await directus.request(
            readItems(COLLECTIONS.MODULES, {
                fields: [
                    '*',
                    'course_id.id',
                    'course_id.title',
                    // Chỉ lấy id của lessons để đếm
                    'lessons.id',
                ],
                filter: { course_id: { _eq: courseId } },
                sort: ['sort'],
            })
        );

        // Transform: thêm lesson_count, không trả về full lessons array
        return modules.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            sort: m.sort,
            status: m.status,
            course_id: m.course_id,
            date_created: m.date_created,
            date_updated: m.date_updated,
            lesson_count: (m.lessons || []).length,
        }));
    },

    /**
     * Lấy modules kèm lessons đầy đủ
     * Dùng cho CourseContentPage để hiển thị cây thư mục đầy đủ
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Array>} Modules kèm lessons
     */
    getWithLessons: async courseId => {
        const [modules, lessons] = await Promise.all([
            // 1. Fetch Modules
            directus.request(
                readItems(COLLECTIONS.MODULES, {
                    fields: ['*'],
                    filter: { course_id: { _eq: courseId } },
                    sort: ['sort'],
                })
            ),
            // 2. Fetch all Lessons for this course
            directus.request(
                readItems(COLLECTIONS.LESSONS, {
                    fields: ['*'],
                    filter: {
                        module_id: {
                            course_id: { _eq: courseId }
                        }
                    },
                    sort: ['sort'],
                })
            ),
        ]);

        // 3. Manual Join
        return modules.map(m => ({
            ...m,
            lessons: (lessons || [])
                .filter(l => l.module_id === m.id || l.module_id?.id === m.id)
                .sort((a, b) => (a.sort || 0) - (b.sort || 0))
                .map(l => ({
                    ...l,
                    duration: l.duration || l.duration_minutes || 0,
                })),
        }));
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
