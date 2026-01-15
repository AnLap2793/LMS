/**
 * Tag Service - Mock data cho quản lý tags
 * Sử dụng mock data thay vì Directus API
 */
import { mockTags } from '../mocks/tags';

// Helper: Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const tagService = {
    /**
     * Lấy danh sách tất cả tags
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách tags
     */
    getAll: async (params = {}) => {
        await delay();
        const { search, page = 1, limit = 50 } = params;

        let filteredTags = [...mockTags];

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            filteredTags = filteredTags.filter(t => t.name.toLowerCase().includes(searchLower));
        }

        // Sort by name
        filteredTags.sort((a, b) => a.name.localeCompare(b.name));

        // Pagination
        const offset = (page - 1) * limit;
        return filteredTags.slice(offset, offset + limit);
    },

    /**
     * Đếm tổng số tags
     * @param {Object} params - Filter params
     * @returns {Promise<number>} Tổng số tags
     */
    count: async (params = {}) => {
        await delay(100);
        const { search } = params;

        let filteredTags = [...mockTags];

        if (search) {
            const searchLower = search.toLowerCase();
            filteredTags = filteredTags.filter(t => t.name.toLowerCase().includes(searchLower));
        }

        return filteredTags.length;
    },

    /**
     * Lấy chi tiết tag theo ID
     * @param {string} tagId - ID tag
     * @returns {Promise<Object>} Chi tiết tag
     */
    getById: async tagId => {
        await delay();
        const tag = mockTags.find(t => t.id === tagId);

        if (!tag) {
            throw new Error('Tag not found');
        }

        return tag;
    },

    /**
     * Tạo tag mới
     * @param {Object} data - Dữ liệu tag { name, color }
     * @returns {Promise<Object>} Tag đã tạo
     */
    create: async data => {
        await delay(500);

        // Check duplicate name
        const existing = mockTags.find(t => t.name.toLowerCase() === data.name.toLowerCase());
        if (existing) {
            throw new Error('Tag với tên này đã tồn tại');
        }

        const newTag = {
            id: `tag${Date.now()}`,
            name: data.name,
            color: data.color || '#1890ff',
            date_created: new Date().toISOString(),
        };

        mockTags.push(newTag);
        return newTag;
    },

    /**
     * Cập nhật tag
     * @param {string} id - ID tag
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} Tag đã cập nhật
     */
    update: async (id, data) => {
        await delay(500);
        const index = mockTags.findIndex(t => t.id === id);

        if (index === -1) {
            throw new Error('Tag not found');
        }

        // Check duplicate name
        if (data.name) {
            const existing = mockTags.find(t => t.id !== id && t.name.toLowerCase() === data.name.toLowerCase());
            if (existing) {
                throw new Error('Tag với tên này đã tồn tại');
            }
        }

        mockTags[index] = { ...mockTags[index], ...data };
        return mockTags[index];
    },

    /**
     * Xóa tag
     * @param {string} id - ID tag
     * @returns {Promise<void>}
     */
    delete: async id => {
        await delay(500);
        const index = mockTags.findIndex(t => t.id === id);

        if (index === -1) {
            throw new Error('Tag not found');
        }

        mockTags.splice(index, 1);
    },

    /**
     * Xóa nhiều tags
     * @param {Array<string>} ids - Danh sách ID
     * @returns {Promise<void>}
     */
    deleteMany: async ids => {
        await delay(500);

        ids.forEach(id => {
            const index = mockTags.findIndex(t => t.id === id);
            if (index !== -1) {
                mockTags.splice(index, 1);
            }
        });
    },

    /**
     * Lấy các tag phổ biến (dựa trên số khóa học sử dụng)
     * @param {number} limit - Số lượng
     * @returns {Promise<Array>} Danh sách tags
     */
    getPopular: async (limit = 10) => {
        await delay();
        // For mock, just return first N tags
        return mockTags.slice(0, limit);
    },

    /**
     * Lấy thống kê tags
     * @returns {Promise<Object>} Thống kê
     */
    getStats: async () => {
        await delay(200);
        return {
            total: mockTags.length,
            // Group by color
            byColor: mockTags.reduce((acc, tag) => {
                acc[tag.color] = (acc[tag.color] || 0) + 1;
                return acc;
            }, {}),
        };
    },
};
