/**
 * File Service - Handle file uploads to Directus
 */
import { directus } from './directus';
import { uploadFiles } from '@directus/sdk';

export const fileService = {
    // ==========================================
    // SHARED ENDPOINTS
    // ==========================================

    /**
     * Upload một file lên Directus
     * @param {File} file - File object từ input
     * @returns {Promise<Object>} File object đã upload (chứa id)
     */
    upload: async file => {
        const formData = new FormData();
        formData.append('file', file);

        // Upload file vào folder mặc định hoặc root
        // Có thể thêm folder param nếu cần
        const result = await directus.request(uploadFiles(formData));

        // Directus uploadFiles trả về một object (nếu single) hoặc array
        // SDK v20 thường trả về object trực tiếp cho single file upload
        return result;
    },
};
