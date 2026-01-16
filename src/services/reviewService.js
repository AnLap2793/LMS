/**
 * Review Service - Quản lý đánh giá khóa học
 * Directus Implementation
 */
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem, aggregate, readMe } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const reviewService = {
    /**
     * Lấy user ID hiện tại
     */
    getCurrentUserId: async () => {
        const user = await directus.request(readMe({ fields: ['id'] }));
        return user.id;
    },

    /**
     * Lấy reviews của một khóa học
     * @param {string} courseId - ID khóa học
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách reviews
     */
    getByCourse: async (courseId, params = {}) => {
        return await directus.request(
            readItems(COLLECTIONS.COURSE_REVIEWS, {
                filter: { course_id: { _eq: courseId } },
                sort: ['-date_created'],
                fields: ['*', 'user_created.first_name', 'user_created.last_name', 'user_created.avatar'],
                ...params,
            })
        );
    },

    /**
     * Lấy review của user hiện tại cho một khóa học
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Object|null>} Review hoặc null
     */
    getMyReview: async courseId => {
        const userId = await reviewService.getCurrentUserId();
        const result = await directus.request(
            readItems(COLLECTIONS.COURSE_REVIEWS, {
                filter: {
                    course_id: { _eq: courseId },
                    user_created: { _eq: userId },
                },
                limit: 1,
            })
        );
        return result[0] || null;
    },

    /**
     * Lấy thống kê rating của khóa học
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Object>} { averageRating, totalReviews, ratingDistribution }
     */
    getCourseStats: async courseId => {
        const reviews = await directus.request(
            readItems(COLLECTIONS.COURSE_REVIEWS, {
                filter: { course_id: { _eq: courseId } },
                fields: ['rating'],
            })
        );

        if (reviews.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };
        }

        const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

        // Calculate distribution
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) {
                ratingDistribution[r.rating]++;
            }
        });

        return {
            averageRating,
            totalReviews: reviews.length,
            ratingDistribution,
        };
    },

    /**
     * Lấy chi tiết review theo ID
     * @param {string} id - ID review
     * @returns {Promise<Object|null>} Chi tiết review
     */
    getById: async id => {
        return await directus.request(
            readItem(COLLECTIONS.COURSE_REVIEWS, id, {
                fields: ['*', 'user_created.first_name', 'user_created.last_name', 'course_id.title'],
            })
        );
    },

    /**
     * Tạo review mới (hoặc update nếu đã có)
     * @param {Object} data - Dữ liệu review { course_id, rating, comment? }
     * @returns {Promise<Object>} Review đã tạo
     */
    create: async data => {
        // Kiểm tra xem đã có review chưa
        const existing = await reviewService.getMyReview(data.course_id);
        if (existing) {
            // Update existing review thay vì tạo mới
            return await reviewService.update(existing.id, {
                rating: data.rating,
                comment: data.comment,
            });
        }

        return await directus.request(createItem(COLLECTIONS.COURSE_REVIEWS, data));
    },

    /**
     * Cập nhật review
     * @param {string} id - ID review
     * @param {Object} data - Dữ liệu cập nhật { rating?, comment? }
     * @returns {Promise<Object>} Review đã cập nhật
     */
    update: async (id, data) => {
        return await directus.request(updateItem(COLLECTIONS.COURSE_REVIEWS, id, data));
    },

    /**
     * Xóa review
     * @param {string} id - ID review
     * @returns {Promise<void>}
     */
    delete: async id => {
        return await directus.request(deleteItem(COLLECTIONS.COURSE_REVIEWS, id));
    },

    /**
     * Xóa review của user cho khóa học
     * @param {string} courseId - ID khóa học
     * @returns {Promise<void>}
     */
    deleteMyReview: async courseId => {
        const myReview = await reviewService.getMyReview(courseId);
        if (myReview) {
            await reviewService.delete(myReview.id);
        }
    },

    /**
     * Lấy tất cả reviews (cho admin)
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách reviews
     */
    getAll: async (params = {}) => {
        return await directus.request(
            readItems(COLLECTIONS.COURSE_REVIEWS, {
                sort: ['-date_created'],
                fields: ['*', 'user_created.first_name', 'user_created.last_name', 'course_id.title'],
                ...params,
            })
        );
    },

    /**
     * Lấy reviews của user hiện tại
     * @returns {Promise<Array>} Danh sách reviews của user
     */
    getMyReviews: async () => {
        const userId = await reviewService.getCurrentUserId();
        return await directus.request(
            readItems(COLLECTIONS.COURSE_REVIEWS, {
                filter: { user_created: { _eq: userId } },
                sort: ['-date_created'],
                fields: ['*', 'course_id.title', 'course_id.thumbnail'],
            })
        );
    },

    /**
     * Lấy reviews gần đây (cho dashboard)
     * @param {number} limit - Số lượng
     * @returns {Promise<Array>} Reviews gần đây
     */
    getRecent: async (limit = 10) => {
        return await directus.request(
            readItems(COLLECTIONS.COURSE_REVIEWS, {
                sort: ['-date_created'],
                limit,
                fields: [
                    '*',
                    'user_created.first_name',
                    'user_created.last_name',
                    'user_created.avatar',
                    'course_id.title',
                ],
            })
        );
    },

    /**
     * Lấy top rated courses
     * @param {number} limit - Số lượng
     * @returns {Promise<Array>} Courses với rating cao nhất
     */
    getTopRatedCourses: async (limit = 10) => {
        // Fetch aggregated data
        const result = await directus.request(
            aggregate(COLLECTIONS.COURSE_REVIEWS, {
                aggregate: { avg: 'rating', count: '*' },
                groupBy: ['course_id'],
                limit,
            })
        );

        // Result structure: [{ course_id: X, avg: { rating: 4.5 }, count: { '*': 10 } }]
        // We'd need to fetch course titles separately or use fields if supported in aggregate (usually not)

        const topCourses = result
            .map(r => ({
                courseId: r.course_id,
                averageRating: Number(r.avg?.rating) || 0,
                totalReviews: Number(r.count) || 0,
            }))
            .sort((a, b) => b.averageRating - a.averageRating);

        return topCourses;
    },
};
