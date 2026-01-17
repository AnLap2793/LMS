/**
 * Settings Service - Quản lý cấu hình hệ thống (Singleton)
 * Collection app_settings chỉ có 1 record duy nhất
 */
import { directus } from './directus';
import { readItems, updateItem, createItem } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

/**
 * Default settings khi chưa có record
 */
const DEFAULT_SETTINGS = {
    site_name: 'LMS System',
    site_description: 'Learning Management System',
    default_pass_score: 70,
    default_max_attempts: 3,
    auto_enroll_new_employees: false,
    allow_self_enrollment: true,
    require_course_completion_for_certificate: true,
    certificate_validity_months: 12,
    maintenance_mode: false,
};

export const settingsService = {
    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Cập nhật settings
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} Settings đã cập nhật
     */
    update: async data => {
        const currentSettings = await settingsService.get();

        if (currentSettings.id) {
            // Update existing record
            return await directus.request(updateItem(COLLECTIONS.APP_SETTINGS, currentSettings.id, data));
        } else {
            // Create new record if not exists
            return await directus.request(
                createItem(COLLECTIONS.APP_SETTINGS, {
                    ...DEFAULT_SETTINGS,
                    ...data,
                })
            );
        }
    },

    /**
     * Cập nhật một setting cụ thể
     * @param {string} key - Tên setting
     * @param {*} value - Giá trị mới
     * @returns {Promise<Object>} Settings đã cập nhật
     */
    setValue: async (key, value) => {
        return await settingsService.update({ [key]: value });
    },

    /**
     * Reset về default settings
     * @returns {Promise<Object>} Default settings
     */
    reset: async () => {
        return await settingsService.update(DEFAULT_SETTINGS);
    },

    // ==========================================
    // CLIENT / LEARNER ENDPOINTS
    // ==========================================

    /**
     * Lấy settings hiện tại (singleton - chỉ có 1 record)
     * @returns {Promise<Object>} App settings
     */
    get: async () => {
        const results = await directus.request(
            readItems(COLLECTIONS.APP_SETTINGS, {
                limit: 1,
            })
        );

        // Trả về record đầu tiên hoặc default settings
        return results[0] || DEFAULT_SETTINGS;
    },

    /**
     * Lấy giá trị của một setting cụ thể
     * @param {string} key - Tên setting
     * @param {*} defaultValue - Giá trị mặc định nếu không tìm thấy
     * @returns {Promise<*>} Giá trị setting
     */
    getValue: async (key, defaultValue = null) => {
        const settings = await settingsService.get();
        return settings[key] !== undefined ? settings[key] : defaultValue;
    },
};
