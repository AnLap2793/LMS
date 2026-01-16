/**
 * Position Service
 * Directus Implementation
 */
import { directus } from './directus';
import { readItems } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const positionService = {
    getAll: async () => {
        return await directus.request(
            readItems(COLLECTIONS.POSITIONS, {
                fields: ['id', 'ten_vi_tri', 'ma_vi_tri', 'phong_ban'],
                sort: ['ten_vi_tri'],
                limit: -1,
            })
        );
    },
};
