/**
 * Tag Service - Quản lý tags
 * Directus Implementation
 */
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem, aggregate } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const tagService = {
    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Lấy danh sách tất cả tags
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách tags
     */
    getAll: async (params = {}) => {
        const { search, page = 1, limit = 50 } = params;

        const filter = {};

        if (search) {
            filter.name = { _icontains: search };
        }

        return await directus.request(
            readItems(COLLECTIONS.TAGS, {
                filter,
                sort: ['name'],
                limit,
                page,
            })
        );
    },

    /**
     * Đếm tổng số tags
     * @param {Object} params - Filter params
     * @returns {Promise<number>} Tổng số tags
     */
    count: async (params = {}) => {
        const { search } = params;

        const filter = {};

        if (search) {
            filter.name = { _icontains: search };
        }

        const result = await directus.request(
            aggregate(COLLECTIONS.TAGS, {
                aggregate: { count: '*' },
                query: { filter },
            })
        );

        return Number(result[0]?.count) || 0;
    },

    /**
     * Lấy chi tiết tag theo ID
     * @param {string} tagId - ID tag
     * @returns {Promise<Object>} Chi tiết tag
     */
    getById: async tagId => {
        return await directus
            .request(
                readItems(COLLECTIONS.TAGS, {
                    filter: { id: { _eq: tagId } },
                    limit: 1,
                })
            )
            .then(res => res[0]);
    },

    /**
     * Tạo tag mới
     * @param {Object} data - Dữ liệu tag { name, color }
     * @returns {Promise<Object>} Tag đã tạo
     */
    create: async data => {
        // Check duplicate name
        const existing = await directus.request(
            readItems(COLLECTIONS.TAGS, {
                filter: { name: { _eq: data.name } },
                limit: 1,
            })
        );

        if (existing.length > 0) {
            throw new Error('Tag với tên này đã tồn tại');
        }

        return await directus.request(
            createItem(COLLECTIONS.TAGS, {
                ...data,
                color: data.color || '#1890ff',
            })
        );
    },

    /**
     * Cập nhật tag
     * @param {string} id - ID tag
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} Tag đã cập nhật
     */
    update: async (id, data) => {
        if (data.name) {
            const existing = await directus.request(
                readItems(COLLECTIONS.TAGS, {
                    filter: {
                        name: { _eq: data.name },
                        id: { _neq: id },
                    },
                    limit: 1,
                })
            );

            if (existing.length > 0) {
                throw new Error('Tag với tên này đã tồn tại');
            }
        }

        return await directus.request(updateItem(COLLECTIONS.TAGS, id, data));
    },

    /**
     * Xóa tag
     * @param {string} id - ID tag
     * @returns {Promise<void>}
     */
    delete: async id => {
        return await directus.request(deleteItem(COLLECTIONS.TAGS, id));
    },

    /**
     * Xóa nhiều tags
     * @param {Array<string>} ids - Danh sách ID
     * @returns {Promise<void>}
     */
    deleteMany: async ids => {
        return await directus.request(deleteItem(COLLECTIONS.TAGS, ids));
    },

    /**
     * Lấy thống kê tags
     * @returns {Promise<Object>} Thống kê
     */
    getStats: async () => {
        const result = await directus.request(
            aggregate(COLLECTIONS.TAGS, {
                aggregate: { count: '*' },
                groupBy: ['color'],
            })
        );

        const totalResult = await directus.request(aggregate(COLLECTIONS.TAGS, { aggregate: { count: '*' } }));

        return {
            total: Number(totalResult[0]?.count) || 0,
            byColor: result.reduce((acc, item) => {
                acc[item.color || '#1890ff'] = Number(item.count);
                return acc;
            }, {}),
        };
    },

    // ==========================================
    // CLIENT / LEARNER ENDPOINTS
    // ==========================================

    /**
     * Lấy các tag phổ biến (dựa trên số khóa học sử dụng)
     * @param {number} limit - Số lượng
     * @returns {Promise<Array>} Danh sách tags
     */
    getPopular: async (limit = 10) => {
        // Directus aggregate requires junction table aggregation which is complex
        // Fallback: just return top tags for now
        return await directus.request(
            readItems(COLLECTIONS.TAGS, {
                limit,
                sort: ['name'], // Ideally sort by usage count if field exists
            })
        );
    },
};
