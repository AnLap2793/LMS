/**
 * Comment Service - Quản lý comments trong bài học
 * Collection: lesson_comments
 * Hỗ trợ threaded comments (parent_id) và resolved status
 */
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const commentService = {
    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Lấy tất cả comments (cho admin)
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách comments
     */
    getAll: async (params = {}) => {
        return await directus.request(
            readItems(COLLECTIONS.LESSON_COMMENTS, {
                fields: [
                    '*',
                    'user_created.id',
                    'user_created.first_name',
                    'user_created.last_name',
                    'lesson_id.id',
                    'lesson_id.title',
                    'lesson_id.module_id.course_id.title',
                ],
                sort: ['-date_created'],
                ...params,
            })
        );
    },

    /**
     * Đánh dấu comment đã resolved
     * @param {string} id - ID comment
     * @returns {Promise<Object>} Comment đã resolved
     */
    resolve: async id => {
        return await commentService.update(id, {
            is_resolved: true,
            resolved_at: new Date().toISOString(),
        });
    },

    /**
     * Đánh dấu comment chưa resolved
     * @param {string} id - ID comment
     * @returns {Promise<Object>} Comment đã unresolve
     */
    unresolve: async id => {
        return await commentService.update(id, {
            is_resolved: false,
            resolved_at: null,
            resolved_by: null,
        });
    },

    /**
     * Xóa comment (và tất cả replies) - Admin/Moderation
     * @param {string} id - ID comment
     * @returns {Promise<void>}
     */
    delete: async id => {
        // Xóa tất cả replies trước
        const replies = await commentService.getReplies(id);
        for (const reply of replies) {
            await directus.request(deleteItem(COLLECTIONS.LESSON_COMMENTS, reply.id));
        }

        // Xóa comment chính
        return await directus.request(deleteItem(COLLECTIONS.LESSON_COMMENTS, id));
    },

    // ==========================================
    // CLIENT / LEARNER ENDPOINTS
    // ==========================================

    /**
     * Lấy comments của một lesson (top-level comments)
     * @param {string} lessonId - ID lesson
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách comments
     */
    getByLesson: async (lessonId, params = {}) => {
        return await directus.request(
            readItems(COLLECTIONS.LESSON_COMMENTS, {
                fields: [
                    '*',
                    'user_created.id',
                    'user_created.first_name',
                    'user_created.last_name',
                    'user_created.avatar',
                    'resolved_by.id',
                    'resolved_by.first_name',
                    'resolved_by.last_name',
                ],
                filter: {
                    lesson_id: { _eq: lessonId },
                    parent_id: { _null: true }, // Chỉ lấy top-level comments
                },
                sort: ['-date_created'],
                ...params,
            })
        );
    },

    /**
     * Lấy comments kèm replies (nested)
     * @param {string} lessonId - ID lesson
     * @returns {Promise<Array>} Comments với replies
     */
    getWithReplies: async lessonId => {
        // Lấy tất cả comments của lesson
        const allComments = await directus.request(
            readItems(COLLECTIONS.LESSON_COMMENTS, {
                fields: [
                    '*',
                    'user_created.id',
                    'user_created.first_name',
                    'user_created.last_name',
                    'user_created.avatar',
                    'resolved_by.id',
                    'resolved_by.first_name',
                    'resolved_by.last_name',
                ],
                filter: { lesson_id: { _eq: lessonId } },
                sort: ['date_created'],
            })
        );

        // Build tree structure
        const commentMap = new Map();
        const rootComments = [];

        // First pass: create map
        allComments.forEach(comment => {
            commentMap.set(comment.id, { ...comment, replies: [] });
        });

        // Second pass: build tree
        allComments.forEach(comment => {
            if (comment.parent_id) {
                const parent = commentMap.get(comment.parent_id);
                if (parent) {
                    parent.replies.push(commentMap.get(comment.id));
                }
            } else {
                rootComments.push(commentMap.get(comment.id));
            }
        });

        // Sort root comments by date (newest first)
        rootComments.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));

        return rootComments;
    },

    /**
     * Lấy replies của một comment
     * @param {string} parentId - ID comment cha
     * @returns {Promise<Array>} Danh sách replies
     */
    getReplies: async parentId => {
        return await directus.request(
            readItems(COLLECTIONS.LESSON_COMMENTS, {
                fields: [
                    '*',
                    'user_created.id',
                    'user_created.first_name',
                    'user_created.last_name',
                    'user_created.avatar',
                ],
                filter: { parent_id: { _eq: parentId } },
                sort: ['date_created'],
            })
        );
    },

    /**
     * Lấy chi tiết comment theo ID
     * @param {string} id - ID comment
     * @returns {Promise<Object|null>} Chi tiết comment
     */
    getById: async id => {
        const result = await directus.request(
            readItems(COLLECTIONS.LESSON_COMMENTS, {
                fields: [
                    '*',
                    'user_created.id',
                    'user_created.first_name',
                    'user_created.last_name',
                    'user_created.avatar',
                    'lesson_id.id',
                    'lesson_id.title',
                ],
                filter: { id: { _eq: id } },
                limit: 1,
            })
        );
        return result[0] || null;
    },

    /**
     * Tạo comment mới
     * @param {Object} data - Dữ liệu comment { lesson_id, content, parent_id?, video_timestamp? }
     * @returns {Promise<Object>} Comment đã tạo
     */
    create: async data => {
        return await directus.request(
            createItem(COLLECTIONS.LESSON_COMMENTS, {
                ...data,
                is_resolved: false,
            })
        );
    },

    /**
     * Reply to a comment
     * @param {string} parentId - ID comment cha
     * @param {string} content - Nội dung reply
     * @returns {Promise<Object>} Reply đã tạo
     */
    reply: async (parentId, content) => {
        // Lấy thông tin comment cha để lấy lesson_id
        const parentComment = await commentService.getById(parentId);
        if (!parentComment) {
            throw new Error('Parent comment not found');
        }

        return await commentService.create({
            lesson_id: parentComment.lesson_id?.id || parentComment.lesson_id,
            parent_id: parentId,
            content,
        });
    },

    /**
     * Cập nhật comment (User update own comment)
     * @param {string} id - ID comment
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} Comment đã cập nhật
     */
    update: async (id, data) => {
        return await directus.request(updateItem(COLLECTIONS.LESSON_COMMENTS, id, data));
    },

    /**
     * Đếm số comments chưa resolved của lesson
     * @param {string} lessonId - ID lesson
     * @returns {Promise<number>} Số comments chưa resolved
     */
    countUnresolved: async lessonId => {
        const result = await directus.request(
            readItems(COLLECTIONS.LESSON_COMMENTS, {
                filter: {
                    lesson_id: { _eq: lessonId },
                    is_resolved: { _eq: false },
                    parent_id: { _null: true }, // Chỉ đếm top-level
                },
                aggregate: { count: '*' },
            })
        );
        return result[0]?.count || 0;
    },

    /**
     * Lấy comments của user hiện tại
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách comments của user
     */
    getMyComments: async (params = {}) => {
        return await directus.request(
            readItems(COLLECTIONS.LESSON_COMMENTS, {
                fields: [
                    '*',
                    'lesson_id.id',
                    'lesson_id.title',
                    'lesson_id.module_id.title',
                    'lesson_id.module_id.course_id.title',
                ],
                sort: ['-date_created'],
                ...params,
            })
        );
    },
};
