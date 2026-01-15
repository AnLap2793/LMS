/**
 * Certificate Service - Mock data cho chứng chỉ
 * Sử dụng mock data thay vì Directus API
 */
import {
    mockCertificates,
    mockCertificateTemplates,
    getCertificatesByUserId,
    getCertificatesByCourseId,
    getActiveTemplate,
    generateCertificateNumber,
} from '../mocks/certificates';

// Helper: Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate current user ID
const CURRENT_USER_ID = 'u5';

export const certificateService = {
    /**
     * Lấy danh sách tất cả certificates (Admin)
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách certificates
     */
    getAll: async (params = {}) => {
        await delay();
        const { search, course_id, user_id, page = 1, limit = 10 } = params;

        let filteredCerts = [...mockCertificates];

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            filteredCerts = filteredCerts.filter(
                c =>
                    c.certificate_number.toLowerCase().includes(searchLower) ||
                    c.user?.first_name?.toLowerCase().includes(searchLower) ||
                    c.user?.last_name?.toLowerCase().includes(searchLower) ||
                    c.course?.title?.toLowerCase().includes(searchLower)
            );
        }

        // Filter by course
        if (course_id) {
            filteredCerts = filteredCerts.filter(c => c.course_id === course_id);
        }

        // Filter by user
        if (user_id) {
            filteredCerts = filteredCerts.filter(c => c.user_id === user_id);
        }

        // Sort by issued_at desc
        filteredCerts.sort((a, b) => new Date(b.issued_at) - new Date(a.issued_at));

        // Pagination
        const offset = (page - 1) * limit;
        return filteredCerts.slice(offset, offset + limit);
    },

    /**
     * Đếm tổng số certificates
     * @param {Object} params - Filter params
     * @returns {Promise<number>} Tổng số
     */
    count: async (params = {}) => {
        await delay(100);
        const { search, course_id, user_id } = params;

        let filteredCerts = [...mockCertificates];

        if (search) {
            const searchLower = search.toLowerCase();
            filteredCerts = filteredCerts.filter(
                c =>
                    c.certificate_number.toLowerCase().includes(searchLower) ||
                    c.user?.first_name?.toLowerCase().includes(searchLower) ||
                    c.user?.last_name?.toLowerCase().includes(searchLower)
            );
        }

        if (course_id) {
            filteredCerts = filteredCerts.filter(c => c.course_id === course_id);
        }

        if (user_id) {
            filteredCerts = filteredCerts.filter(c => c.user_id === user_id);
        }

        return filteredCerts.length;
    },

    /**
     * Lấy certificates của user hiện tại
     * @returns {Promise<Array>} Danh sách certificates
     */
    getMyCertificates: async () => {
        await delay();
        return getCertificatesByUserId(CURRENT_USER_ID).sort((a, b) => new Date(b.issued_at) - new Date(a.issued_at));
    },

    /**
     * Lấy chi tiết certificate
     * @param {string} certificateId - ID certificate
     * @returns {Promise<Object>} Chi tiết certificate
     */
    getById: async certificateId => {
        await delay();
        const cert = mockCertificates.find(c => c.id === certificateId);

        if (!cert) {
            throw new Error('Certificate not found');
        }

        return cert;
    },

    /**
     * Lấy certificate theo mã số
     * @param {string} certificateNumber - Mã số certificate
     * @returns {Promise<Object|null>} Certificate hoặc null
     */
    getByNumber: async certificateNumber => {
        await delay();
        return mockCertificates.find(c => c.certificate_number === certificateNumber) || null;
    },

    /**
     * Lấy certificates theo user ID
     * @param {string} userId - ID user
     * @returns {Promise<Array>} Danh sách certificates
     */
    getByUserId: async userId => {
        await delay();
        return getCertificatesByUserId(userId);
    },

    /**
     * Lấy certificates theo course ID
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Array>} Danh sách certificates
     */
    getByCourseId: async courseId => {
        await delay();
        return getCertificatesByCourseId(courseId);
    },

    /**
     * Kiểm tra user có certificate cho course không
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Object|null>} Certificate hoặc null
     */
    checkMyCertificate: async courseId => {
        await delay();
        return mockCertificates.find(c => c.user_id === CURRENT_USER_ID && c.course_id === courseId) || null;
    },

    /**
     * Cấp certificate mới
     * @param {Object} data - Dữ liệu { user_id, course_id }
     * @returns {Promise<Object>} Certificate đã cấp
     */
    issue: async data => {
        await delay(500);

        // Check if certificate already exists
        const existing = mockCertificates.find(c => c.user_id === data.user_id && c.course_id === data.course_id);

        if (existing) {
            throw new Error('Certificate already issued for this course');
        }

        const template = getActiveTemplate();
        const newCert = {
            id: `cert${Date.now()}`,
            user_id: data.user_id,
            user: data.user || { id: data.user_id },
            course_id: data.course_id,
            course: data.course || { id: data.course_id },
            certificate_number: generateCertificateNumber(),
            file: template?.file || null,
            issued_at: new Date().toISOString(),
        };

        mockCertificates.push(newCert);
        return newCert;
    },

    /**
     * Thu hồi certificate
     * @param {string} certificateId - ID certificate
     * @returns {Promise<void>}
     */
    revoke: async certificateId => {
        await delay(500);
        const index = mockCertificates.findIndex(c => c.id === certificateId);

        if (index === -1) {
            throw new Error('Certificate not found');
        }

        mockCertificates.splice(index, 1);
    },

    /**
     * Xác thực certificate
     * @param {string} certificateNumber - Mã số certificate
     * @returns {Promise<Object>} Kết quả xác thực
     */
    verify: async certificateNumber => {
        await delay();
        const cert = mockCertificates.find(c => c.certificate_number === certificateNumber);

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

    // ============================================
    // CERTIFICATE TEMPLATES
    // ============================================

    /**
     * Lấy danh sách certificate templates
     * @returns {Promise<Array>} Danh sách templates
     */
    getTemplates: async () => {
        await delay();
        return mockCertificateTemplates;
    },

    /**
     * Lấy template đang active
     * @returns {Promise<Object|null>} Template hoặc null
     */
    getActiveTemplate: async () => {
        await delay();
        return getActiveTemplate();
    },

    /**
     * Cập nhật template active
     * @param {string} templateId - ID template
     * @returns {Promise<Object>} Template đã cập nhật
     */
    setActiveTemplate: async templateId => {
        await delay(500);

        // Deactivate all templates
        mockCertificateTemplates.forEach(t => {
            t.is_active = false;
        });

        // Activate selected template
        const index = mockCertificateTemplates.findIndex(t => t.id === templateId);
        if (index === -1) {
            throw new Error('Template not found');
        }

        mockCertificateTemplates[index].is_active = true;
        return mockCertificateTemplates[index];
    },

    /**
     * Lấy thống kê certificates
     * @returns {Promise<Object>} Thống kê
     */
    getStats: async () => {
        await delay(200);

        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

        const thisMonthCerts = mockCertificates.filter(c => new Date(c.issued_at) >= thisMonth);
        const thisWeekCerts = mockCertificates.filter(c => new Date(c.issued_at) >= thisWeek);

        // Count by course
        const courseCounts = {};
        mockCertificates.forEach(c => {
            courseCounts[c.course_id] = (courseCounts[c.course_id] || 0) + 1;
        });

        const topCourse = Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0];

        return {
            totalIssued: mockCertificates.length,
            issuedThisMonth: thisMonthCerts.length,
            issuedThisWeek: thisWeekCerts.length,
            topCourse: topCourse
                ? {
                      id: topCourse[0],
                      title: mockCertificates.find(c => c.course_id === topCourse[0])?.course?.title || 'N/A',
                      count: topCourse[1],
                  }
                : null,
        };
    },
};
