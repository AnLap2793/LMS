/**
 * Learning Path Service - Quản lý lộ trình học tập
 * Directus Implementation
 */
import { directus } from './directus';
import { readItems, readItem, createItem, updateItem, deleteItem, aggregate } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const learningPathService = {
    /**
     * Lấy danh sách tất cả learning paths
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách learning paths
     */
    getAll: async (params = {}) => {
        const { search, status, is_mandatory, page = 1, limit = 10 } = params;

        const filter = {};

        if (search) {
            filter._or = [{ title: { _icontains: search } }, { description: { _icontains: search } }];
        }

        if (status) {
            filter.status = { _eq: status };
        }

        if (is_mandatory !== undefined) {
            filter.is_mandatory = { _eq: is_mandatory };
        }

        const items = await directus.request(
            readItems(COLLECTIONS.LEARNING_PATHS, {
                filter,
                limit,
                page,
                sort: ['-date_created'],
                fields: [
                    '*',
                    'user_created.first_name',
                    'user_created.last_name',
                    // Count courses (M2M) - Directus doesn't return count directly in fields easily without specific setup
                    // We will fetch relations or rely on a calculated field if available.
                    // For now fetching courses array to count length
                    'courses.id',
                ],
            })
        );

        return items.map(p => ({
            ...p,
            courses_count: p.courses?.length || 0,
        }));
    },

    /**
     * Đếm tổng số learning paths
     * @param {Object} params - Filter params
     * @returns {Promise<number>} Tổng số
     */
    count: async (params = {}) => {
        const { search, status, is_mandatory } = params;

        const filter = {};

        if (search) {
            filter._or = [{ title: { _icontains: search } }, { description: { _icontains: search } }];
        }

        if (status) {
            filter.status = { _eq: status };
        }

        if (is_mandatory !== undefined) {
            filter.is_mandatory = { _eq: is_mandatory };
        }

        const result = await directus.request(
            aggregate(COLLECTIONS.LEARNING_PATHS, {
                aggregate: { count: '*' },
                query: { filter },
            })
        );

        return Number(result[0]?.count) || 0;
    },

    /**
     * Lấy danh sách learning paths đã xuất bản (cho learner)
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách learning paths
     */
    getPublished: async (params = {}) => {
        return await learningPathService.getAll({ ...params, status: 'published' });
    },

    /**
     * Lấy chi tiết learning path
     * @param {string} pathId - ID learning path
     * @returns {Promise<Object>} Chi tiết learning path
     */
    getById: async pathId => {
        return await directus.request(
            readItem(COLLECTIONS.LEARNING_PATHS, pathId, {
                fields: ['*', 'user_created.first_name', 'user_created.last_name'],
            })
        );
    },

    /**
     * Lấy chi tiết learning path kèm khóa học
     * @param {string} pathId - ID learning path
     * @returns {Promise<Object>} Chi tiết learning path với courses
     */
    getWithCourses: async pathId => {
        const path = await learningPathService.getById(pathId);

        // Fetch M2M courses
        // Collection: learning_paths_courses (Junction)
        // Fields: learning_path_id, course_id.*, sort
        const relations = await directus.request(
            readItems(COLLECTIONS.LEARNING_PATHS_COURSES, {
                filter: { learning_path_id: { _eq: pathId } },
                sort: ['sort'],
                fields: [
                    'id',
                    'sort',
                    'course_id.id',
                    'course_id.title',
                    'course_id.description',
                    'course_id.thumbnail',
                    'course_id.duration',
                    'course_id.difficulty',
                ],
            })
        );

        return {
            ...path,
            courses: relations.map(r => ({
                ...r.course_id,
                junction_id: r.id,
                sort: r.sort,
            })),
        };
    },

    /**
     * Tạo learning path mới
     * @param {Object} data - Dữ liệu learning path
     * @returns {Promise<Object>} Learning path đã tạo
     */
    create: async data => {
        const { courses, ...pathData } = data;

        const newPath = await directus.request(createItem(COLLECTIONS.LEARNING_PATHS, pathData));

        if (courses && courses.length > 0) {
            // Add courses to M2M
            await Promise.all(
                courses.map(async (c, index) => {
                    await directus.request(
                        createItem(COLLECTIONS.LEARNING_PATHS_COURSES, {
                            learning_path_id: newPath.id,
                            course_id: c.id,
                            sort: index + 1,
                        })
                    );
                })
            );
        }

        return newPath;
    },

    /**
     * Cập nhật learning path
     * @param {string} id - ID learning path
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} Learning path đã cập nhật
     */
    update: async (id, data) => {
        const { courses, ...pathData } = data;

        const updatedPath = await directus.request(updateItem(COLLECTIONS.LEARNING_PATHS, id, pathData));

        if (courses) {
            // Update M2M relations is complex (diffing).
            // Simplest strategy: Delete all and re-create (careful with IDs) or sync.
            // For MVP, we might assume the UI handles list management or we just wipe and recreate for now.
            // A better approach is to handle Add/Remove/Reorder separate actions, but if the form sends full list:

            // 1. Get existing
            const existing = await directus.request(
                readItems(COLLECTIONS.LEARNING_PATHS_COURSES, {
                    filter: { learning_path_id: { _eq: id } },
                    fields: ['id'],
                })
            );

            // 2. Delete existing
            if (existing.length > 0) {
                await directus.request(
                    deleteItem(
                        COLLECTIONS.LEARNING_PATHS_COURSES,
                        existing.map(e => e.id)
                    )
                );
            }

            // 3. Create new
            if (courses.length > 0) {
                await Promise.all(
                    courses.map(async (c, index) => {
                        await directus.request(
                            createItem(COLLECTIONS.LEARNING_PATHS_COURSES, {
                                learning_path_id: id,
                                course_id: c.id,
                                sort: index + 1,
                            })
                        );
                    })
                );
            }
        }

        return updatedPath;
    },

    /**
     * Xóa learning path
     * @param {string} id - ID learning path
     * @returns {Promise<void>}
     */
    delete: async id => {
        return await directus.request(deleteItem(COLLECTIONS.LEARNING_PATHS, id));
    },

    /**
     * Lấy thống kê learning paths (Admin)
     * @returns {Promise<Object>} Thống kê
     */
    getStats: async () => {
        const totalResult = await directus.request(
            aggregate(COLLECTIONS.LEARNING_PATHS, { aggregate: { count: '*' } })
        );
        const total = Number(totalResult[0]?.count) || 0;

        const publishedResult = await directus.request(
            aggregate(COLLECTIONS.LEARNING_PATHS, {
                aggregate: { count: '*' },
                query: { filter: { status: { _eq: 'published' } } },
            })
        );
        const published = Number(publishedResult[0]?.count) || 0;

        const mandatoryResult = await directus.request(
            aggregate(COLLECTIONS.LEARNING_PATHS, {
                aggregate: { count: '*' },
                query: { filter: { is_mandatory: { _eq: true } } },
            })
        );
        const mandatory = Number(mandatoryResult[0]?.count) || 0;

        return {
            total,
            published,
            draft: total - published,
            mandatory,
            // totalEnrollments: requires complex aggregation on enrollments via paths
            totalEnrollments: 0, // Placeholder
        };
    },
};
