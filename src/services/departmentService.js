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
                fields: ['id', 'ten_bo_phan', 'ma_bo_phan'],
                sort: ['ten_bo_phan'],
                limit: -1,
            })
        );
    },
};
