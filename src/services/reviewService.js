/**
 * Review Service - Quản lý đánh giá khóa học
 * Collection: course_reviews
 * Unique constraint: mỗi user chỉ có 1 review/course
 */
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const reviewService = {
    /**
     * Lấy reviews của một khóa học
     * @param {string} courseId - ID khóa học
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách reviews
     */
    getByCourse: async (courseId, params = {}) => {
        return await directus.request(
            readItems(COLLECTIONS.COURSE_REVIEWS, {
                fields: [
                    '*',
                    'user_created.id',
                    'user_created.first_name',
                    'user_created.last_name',
                    'user_created.avatar',
                ],
                filter: { course_id: { _eq: courseId } },
                sort: ['-date_created'],
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
        const result = await directus.request(
            readItems(COLLECTIONS.COURSE_REVIEWS, {
                fields: ['*'],
                filter: { course_id: { _eq: courseId } },
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
        const reviews = await reviewService.getByCourse(courseId, {
            fields: ['rating'],
        });

        if (reviews.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };
        }

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
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
        const result = await directus.request(
            readItems(COLLECTIONS.COURSE_REVIEWS, {
                fields: [
                    '*',
                    'user_created.id',
                    'user_created.first_name',
                    'user_created.last_name',
                    'course_id.id',
                    'course_id.title',
                ],
                filter: { id: { _eq: id } },
                limit: 1,
            })
        );
        return result[0] || null;
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
                fields: [
                    '*',
                    'user_created.id',
                    'user_created.first_name',
                    'user_created.last_name',
                    'course_id.id',
                    'course_id.title',
                ],
                sort: ['-date_created'],
                ...params,
            })
        );
    },

    /**
     * Lấy reviews của user hiện tại
     * @returns {Promise<Array>} Danh sách reviews của user
     */
    getMyReviews: async () => {
        return await directus.request(
            readItems(COLLECTIONS.COURSE_REVIEWS, {
                fields: ['*', 'course_id.id', 'course_id.title', 'course_id.thumbnail'],
                sort: ['-date_created'],
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
                fields: [
                    '*',
                    'user_created.id',
                    'user_created.first_name',
                    'user_created.last_name',
                    'user_created.avatar',
                    'course_id.id',
                    'course_id.title',
                ],
                sort: ['-date_created'],
                limit,
            })
        );
    },

    /**
     * Lấy top rated courses
     * @param {number} limit - Số lượng
     * @returns {Promise<Array>} Courses với rating cao nhất
     */
    getTopRatedCourses: async (limit = 10) => {
        // Lấy tất cả reviews và aggregate
        const reviews = await directus.request(
            readItems(COLLECTIONS.COURSE_REVIEWS, {
                fields: ['course_id', 'rating'],
            })
        );

        // Group by course_id và tính average
        const courseRatings = {};
        reviews.forEach(r => {
            const courseId = r.course_id;
            if (!courseRatings[courseId]) {
                courseRatings[courseId] = { total: 0, count: 0 };
            }
            courseRatings[courseId].total += r.rating;
            courseRatings[courseId].count++;
        });

        // Calculate averages và sort
        const sortedCourses = Object.entries(courseRatings)
            .map(([courseId, data]) => ({
                courseId,
                averageRating: Math.round((data.total / data.count) * 10) / 10,
                totalReviews: data.count,
            }))
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, limit);

        return sortedCourses;
    },
};
