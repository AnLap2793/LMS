/**
 * Department Service
 * Directus Implementation
 */
import { directus } from './directus';
import { readItems } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const departmentService = {
    // ==========================================
    // SHARED ENDPOINTS
    // ==========================================

    getAll: async () => {
        return await directus.request(
            readItems(COLLECTIONS.DEPARTMENTS, {
                fields: ['id', 'ten_phong_ban', 'ma_phong_ban'],
                sort: ['ten_phong_ban'],
                limit: -1,
            })
        );
    },
};
