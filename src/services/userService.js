/**
 * User Service - Service layer pattern
 */
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem, updateMe, readUser } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const userService = {
    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Lấy danh sách users
     * @param {Object} params - Query params (filter, sort, limit, etc.)
     */
    getAll: async (params = {}) => {
        return await directus.request(readItems(COLLECTIONS.USERS, params));
    },

    /**
     * Lấy chi tiết user theo ID
     * @param {string} id - User ID
     * @param {Object} params - Query params
     */
    getById: async (id, params = {}) => {
        return await directus.request(readUser(id, params));
    },

    /**
     * Tạo user mới
     * @param {Object} data - User data
     */
    create: async data => {
        return await directus.request(createItem(COLLECTIONS.USERS, data));
    },

    /**
     * Cập nhật user
     * @param {string} id - User ID
     * @param {Object} data - Data to update
     */
    update: async (id, data) => {
        return await directus.request(updateItem(COLLECTIONS.USERS, id, data));
    },

    /**
     * Xóa user
     * @param {string} id - User ID
     */
    delete: async id => {
        return await directus.request(deleteItem(COLLECTIONS.USERS, id));
    },

    // ==========================================
    // CLIENT / LEARNER ENDPOINTS
    // ==========================================

    /**
     * Cập nhật profile cá nhân (Current User)
     * @param {Object} data - Data to update
     */
    updateMe: async data => {
        return await directus.request(updateMe(data));
    },
};
