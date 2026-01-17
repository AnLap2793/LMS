/**
 * Certificate Service - Quản lý chứng chỉ
 * Directus Implementation
 */
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem, readMe, aggregate } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const certificateService = {
    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Lấy danh sách tất cả certificates (Admin)
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách certificates
     */
    getAll: async (params = {}) => {
        const { search, course_id, user_id, page = 1, limit = 10 } = params;

        const filter = {};

        if (course_id) filter.course_id = { _eq: course_id };
        if (user_id) filter.user_id = { _eq: user_id };

        if (search) {
            filter.certificate_number = { _icontains: search };
        }

        return await directus.request(
            readItems(COLLECTIONS.CERTIFICATES, {
                filter,
                fields: [
                    '*',
                    'user.id',
                    'user.first_name',
                    'user.last_name',
                    'user.email',
                    'course.id',
                    'course.title',
                ],
                sort: ['-issued_at'],
                limit,
                page,
            })
        );
    },

    /**
     * Cấp certificate mới
     * @param {Object} data - Dữ liệu { user_id, course_id }
     */
    issue: async data => {
        // Check existing
        const existing = await directus.request(
            readItems(COLLECTIONS.CERTIFICATES, {
                filter: {
                    user_id: { _eq: data.user_id },
                    course_id: { _eq: data.course_id },
                },
                limit: 1,
            })
        );

        if (existing.length > 0) {
            throw new Error('Certificate already issued for this course');
        }

        // Get active template
        const templates = await directus.request(
            readItems(COLLECTIONS.CERTIFICATE_TEMPLATES, {
                filter: { is_active: { _eq: true } },
                limit: 1,
            })
        );
        const template = templates[0];

        // Generate number (simple timestamp based for now, ideally backend logic)
        const certNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        return await directus.request(
            createItem(COLLECTIONS.CERTIFICATES, {
                user_id: data.user_id,
                course_id: data.course_id,
                certificate_number: certNumber,
                template_id: template?.id,
                issued_at: new Date().toISOString(),
            })
        );
    },

    /**
     * Thu hồi certificate
     */
    revoke: async certificateId => {
        return await directus.request(deleteItem(COLLECTIONS.CERTIFICATES, certificateId));
    },

    // --- Template Management (Admin) ---

    /**
     * Lấy danh sách certificate templates
     */
    getTemplates: async () => {
        return await directus.request(
            readItems(COLLECTIONS.CERTIFICATE_TEMPLATES, {
                sort: ['-date_created'],
            })
        );
    },

    /**
     * Tạo template mới
     */
    createTemplate: async data => {
        return await directus.request(createItem(COLLECTIONS.CERTIFICATE_TEMPLATES, data));
    },

    /**
     * Cập nhật template
     */
    updateTemplate: async (id, data) => {
        return await directus.request(updateItem(COLLECTIONS.CERTIFICATE_TEMPLATES, id, data));
    },

    /**
     * Xóa template
     */
    deleteTemplate: async id => {
        return await directus.request(deleteItem(COLLECTIONS.CERTIFICATE_TEMPLATES, id));
    },

    /**
     * Cập nhật template active
     */
    setActiveTemplate: async templateId => {
        // 1. Get all active templates
        const activeTemplates = await directus.request(
            readItems(COLLECTIONS.CERTIFICATE_TEMPLATES, {
                filter: { is_active: { _eq: true } },
                fields: ['id'],
            })
        );

        // 2. Deactivate them
        for (const t of activeTemplates) {
            if (t.id !== templateId) {
                await directus.request(updateItem(COLLECTIONS.CERTIFICATE_TEMPLATES, t.id, { is_active: false }));
            }
        }

        // 3. Activate target
        return await directus.request(updateItem(COLLECTIONS.CERTIFICATE_TEMPLATES, templateId, { is_active: true }));
    },

    // ==========================================
    // CLIENT / LEARNER ENDPOINTS
    // ==========================================

    /**
     * Đếm tổng số certificates
     */
    count: async (params = {}) => {
        const { search, course_id, user_id } = params;
        const filter = {};
        if (course_id) filter.course_id = { _eq: course_id };
        if (user_id) filter.user_id = { _eq: user_id };
        if (search) filter.certificate_number = { _icontains: search };

        const result = await directus.request(
            aggregate(COLLECTIONS.CERTIFICATES, {
                aggregate: { count: '*' },
                query: { filter },
            })
        );
        return Number(result[0]?.count) || 0;
    },

    /**
     * Lấy certificates của user hiện tại
     * @returns {Promise<Array>} Danh sách certificates
     */
    getMyCertificates: async () => {
        const user = await directus.request(readMe());

        return await directus.request(
            readItems(COLLECTIONS.CERTIFICATES, {
                filter: { user_id: { _eq: user.id } },
                fields: ['*', 'course.id', 'course.title'],
                sort: ['-issued_at'],
            })
        );
    },

    /**
     * Lấy chi tiết certificate
     * @param {string} certificateId - ID certificate
     * @returns {Promise<Object>} Chi tiết certificate
     */
    getById: async certificateId => {
        return await directus
            .request(
                readItems(COLLECTIONS.CERTIFICATES, {
                    filter: { id: { _eq: certificateId } },
                    fields: ['*', 'user.*', 'course.*'],
                    limit: 1,
                })
            )
            .then(res => res[0]);
    },

    /**
     * Lấy certificate theo mã số
     */
    getByNumber: async certificateNumber => {
        const result = await directus.request(
            readItems(COLLECTIONS.CERTIFICATES, {
                filter: { certificate_number: { _eq: certificateNumber } },
                fields: ['*', 'user.first_name', 'user.last_name', 'course.title'],
                limit: 1,
            })
        );
        return result[0] || null;
    },

    /**
     * Xác thực certificate
     */
    verify: async certificateNumber => {
        const cert = await certificateService.getByNumber(certificateNumber);

        if (!cert) {
            return {
                valid: false,
                message: 'Không tìm thấy chứng chỉ với mã số này',
            };
        }

        return {
            valid: true,
            message: 'Chứng chỉ hợp lệ',
            certificate: cert,
        };
    },
};
