/**
 * User Service - Service layer pattern
 */
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem, updateMe } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const userService = {
    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    getAll: async (params = {}) => {
        return await directus.request(readItems(COLLECTIONS.USERS, params));
    },

    getById: async (id, params = {}) => {
        const result = await directus.request(
            readItems(COLLECTIONS.USERS, {
                filter: { id: { _eq: id } },
                limit: 1,
                ...params,
            })
        );
        return result[0] || null;
    },

    create: async data => {
        return await directus.request(createItem(COLLECTIONS.USERS, data));
    },

    update: async (id, data) => {
        return await directus.request(updateItem(COLLECTIONS.USERS, id, data));
    },

    delete: async id => {
        return await directus.request(deleteItem(COLLECTIONS.USERS, id));
    },

    // ==========================================
    // CLIENT / LEARNER ENDPOINTS
    // ==========================================

    updateMe: async data => {
        return await directus.request(updateMe(data));
    },
};
