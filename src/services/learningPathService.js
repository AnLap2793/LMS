/**
 * Learning Path Service - Mock data cho lộ trình học tập
 * Sử dụng mock data thay vì Directus API
 */
import { mockLearningPaths, mockUserLearningPaths } from '../mocks/learningPaths';

// Helper: Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const learningPathService = {
    /**
     * Lấy danh sách tất cả learning paths
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách learning paths
     */
    getAll: async (params = {}) => {
        await delay();
        const { search, status, is_mandatory, page = 1, limit = 10 } = params;

        let filteredPaths = [...mockLearningPaths];

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            filteredPaths = filteredPaths.filter(
                p => p.title.toLowerCase().includes(searchLower) || p.description?.toLowerCase().includes(searchLower)
            );
        }

        // Filter by status
        if (status) {
            filteredPaths = filteredPaths.filter(p => p.status === status);
        }

        // Filter by mandatory
        if (is_mandatory !== undefined) {
            filteredPaths = filteredPaths.filter(p => p.is_mandatory === is_mandatory);
        }

        // Pagination
        const offset = (page - 1) * limit;
        const paginatedPaths = filteredPaths.slice(offset, offset + limit);

        return paginatedPaths;
    },

    /**
     * Đếm tổng số learning paths
     * @param {Object} params - Filter params
     * @returns {Promise<number>} Tổng số
     */
    count: async (params = {}) => {
        await delay(100);
        const { search, status, is_mandatory } = params;

        let filteredPaths = [...mockLearningPaths];

        if (search) {
            const searchLower = search.toLowerCase();
            filteredPaths = filteredPaths.filter(
                p => p.title.toLowerCase().includes(searchLower) || p.description?.toLowerCase().includes(searchLower)
            );
        }

        if (status) {
            filteredPaths = filteredPaths.filter(p => p.status === status);
        }

        if (is_mandatory !== undefined) {
            filteredPaths = filteredPaths.filter(p => p.is_mandatory === is_mandatory);
        }

        return filteredPaths.length;
    },

    /**
     * Lấy danh sách learning paths đã xuất bản (cho learner)
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách learning paths
     */
    getPublished: async (params = {}) => {
        await delay();
        const { search, is_mandatory, page = 1, limit = 10 } = params;

        let filteredPaths = mockLearningPaths.filter(p => p.status === 'published');

        if (search) {
            const searchLower = search.toLowerCase();
            filteredPaths = filteredPaths.filter(
                p => p.title.toLowerCase().includes(searchLower) || p.description?.toLowerCase().includes(searchLower)
            );
        }

        if (is_mandatory !== undefined) {
            filteredPaths = filteredPaths.filter(p => p.is_mandatory === is_mandatory);
        }

        // Pagination
        const offset = (page - 1) * limit;
        return filteredPaths.slice(offset, offset + limit);
    },

    /**
     * Lấy chi tiết learning path
     * @param {string} pathId - ID learning path
     * @returns {Promise<Object>} Chi tiết learning path
     */
    getById: async pathId => {
        await delay();
        const path = mockLearningPaths.find(p => p.id === pathId);

        if (!path) {
            throw new Error('Learning path not found');
        }

        return path;
    },

    /**
     * Lấy chi tiết learning path kèm khóa học
     * @param {string} pathId - ID learning path
     * @returns {Promise<Object>} Chi tiết learning path với courses
     */
    getWithCourses: async pathId => {
        await delay();
        const path = mockLearningPaths.find(p => p.id === pathId);

        if (!path) {
            throw new Error('Learning path not found');
        }

        return {
            ...path,
            courses: path.courses || [],
        };
    },

    /**
     * Lấy tiến độ learning paths của user hiện tại
     * @returns {Promise<Array>} Danh sách tiến độ
     */
    getMyProgress: async () => {
        await delay();
        return mockUserLearningPaths;
    },

    /**
     * Lấy tiến độ của một learning path cụ thể
     * @param {string} pathId - ID learning path
     * @returns {Promise<Object|null>} Tiến độ hoặc null
     */
    getMyPathProgress: async pathId => {
        await delay();
        return mockUserLearningPaths.find(p => p.pathId === pathId) || null;
    },

    /**
     * Lấy learning paths nổi bật (cho homepage)
     * @param {number} limit - Số lượng
     * @returns {Promise<Array>} Danh sách learning paths
     */
    getFeatured: async (limit = 4) => {
        await delay();
        return mockLearningPaths.filter(p => p.status === 'published').slice(0, limit);
    },

    /**
     * Lấy learning paths bắt buộc (cho user mới)
     * @returns {Promise<Array>} Danh sách learning paths bắt buộc
     */
    getMandatory: async () => {
        await delay();
        return mockLearningPaths.filter(p => p.is_mandatory && p.status === 'published');
    },

    /**
     * Tạo learning path mới
     * @param {Object} data - Dữ liệu learning path
     * @returns {Promise<Object>} Learning path đã tạo
     */
    create: async data => {
        await delay(500);
        const newPath = {
            id: `${Date.now()}`,
            ...data,
            status: data.status || 'draft',
            courses: data.courses || [],
            total_duration: 0,
            enrollments_count: 0,
            user_created: { id: 'admin', first_name: 'Admin', last_name: 'User' },
            date_created: new Date().toISOString(),
        };

        mockLearningPaths.push(newPath);
        return newPath;
    },

    /**
     * Cập nhật learning path
     * @param {string} id - ID learning path
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} Learning path đã cập nhật
     */
    update: async (id, data) => {
        await delay(500);
        const index = mockLearningPaths.findIndex(p => p.id === id);

        if (index === -1) {
            throw new Error('Learning path not found');
        }

        mockLearningPaths[index] = { ...mockLearningPaths[index], ...data };
        return mockLearningPaths[index];
    },

    /**
     * Xóa learning path
     * @param {string} id - ID learning path
     * @returns {Promise<void>}
     */
    delete: async id => {
        await delay(500);
        const index = mockLearningPaths.findIndex(p => p.id === id);

        if (index === -1) {
            throw new Error('Learning path not found');
        }

        mockLearningPaths.splice(index, 1);
    },

    /**
     * Thêm khóa học vào learning path
     * @param {string} pathId - ID learning path
     * @param {string} courseId - ID khóa học
     * @param {Object} courseInfo - Thông tin khóa học
     * @returns {Promise<Object>} Learning path đã cập nhật
     */
    addCourse: async (pathId, courseId, courseInfo = {}) => {
        await delay(500);
        const index = mockLearningPaths.findIndex(p => p.id === pathId);

        if (index === -1) {
            throw new Error('Learning path not found');
        }

        const courses = mockLearningPaths[index].courses || [];
        const maxSort = courses.length > 0 ? Math.max(...courses.map(c => c.sort || 0)) : 0;

        courses.push({
            id: courseId,
            title: courseInfo.title || 'Course',
            sort: maxSort + 1,
        });

        mockLearningPaths[index].courses = courses;
        return mockLearningPaths[index];
    },

    /**
     * Xóa khóa học khỏi learning path
     * @param {string} pathId - ID learning path
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Object>} Learning path đã cập nhật
     */
    removeCourse: async (pathId, courseId) => {
        await delay(500);
        const index = mockLearningPaths.findIndex(p => p.id === pathId);

        if (index === -1) {
            throw new Error('Learning path not found');
        }

        mockLearningPaths[index].courses = (mockLearningPaths[index].courses || []).filter(c => c.id !== courseId);

        return mockLearningPaths[index];
    },

    /**
     * Sắp xếp lại thứ tự khóa học trong learning path
     * @param {string} pathId - ID learning path
     * @param {Array<string>} courseIds - Danh sách ID khóa học theo thứ tự mới
     * @returns {Promise<Object>} Learning path đã cập nhật
     */
    reorderCourses: async (pathId, courseIds) => {
        await delay(500);
        const index = mockLearningPaths.findIndex(p => p.id === pathId);

        if (index === -1) {
            throw new Error('Learning path not found');
        }

        const existingCourses = mockLearningPaths[index].courses || [];
        const reorderedCourses = courseIds
            .map((id, idx) => {
                const course = existingCourses.find(c => c.id === id);
                return course ? { ...course, sort: idx + 1 } : null;
            })
            .filter(Boolean);

        mockLearningPaths[index].courses = reorderedCourses;
        return mockLearningPaths[index];
    },

    /**
     * Lấy thống kê learning paths
     * @returns {Promise<Object>} Thống kê
     */
    getStats: async () => {
        await delay(200);
        const published = mockLearningPaths.filter(p => p.status === 'published');
        const mandatory = published.filter(p => p.is_mandatory);

        return {
            total: mockLearningPaths.length,
            published: published.length,
            draft: mockLearningPaths.length - published.length,
            mandatory: mandatory.length,
            totalEnrollments: mockLearningPaths.reduce((sum, p) => sum + (p.enrollments_count || 0), 0),
        };
    },
};
