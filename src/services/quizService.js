/**
 * Quiz Service - Quản lý bài kiểm tra và câu hỏi
 * Directus Implementation
 */
import { directus } from './directus';
import { readItems, readItem, createItem, updateItem, deleteItem, aggregate } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const quizService = {
    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Lấy danh sách tất cả quizzes
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách quizzes
     */
    getAll: async (params = {}) => {
        const { search, course_id, page = 1, limit = 10 } = params;

        const filter = {};

        if (search) {
            filter._or = [{ title: { _icontains: search } }, { description: { _icontains: search } }];
        }

        if (course_id) {
            filter.course_id = { _eq: course_id };
        }

        const items = await directus.request(
            readItems(COLLECTIONS.QUIZZES, {
                filter,
                limit,
                page,
                fields: ['*', 'user_created.first_name', 'user_created.last_name'],
                sort: ['-date_created'],
            })
        );

        return items;
    },

    /**
     * Tạo quiz mới
     * @param {Object} data - Dữ liệu quiz
     * @returns {Promise<Object>} Quiz đã tạo
     */
    create: async data => {
        return await directus.request(createItem(COLLECTIONS.QUIZZES, data));
    },

    /**
     * Cập nhật quiz
     * @param {string} id - ID quiz
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} Quiz đã cập nhật
     */
    update: async (id, data) => {
        return await directus.request(updateItem(COLLECTIONS.QUIZZES, id, data));
    },

    /**
     * Xóa quiz
     * @param {string} id - ID quiz
     * @returns {Promise<void>}
     */
    delete: async id => {
        // Directus should handle cascade delete if configured
        return await directus.request(deleteItem(COLLECTIONS.QUIZZES, id));
    },

    /**
     * Lấy danh sách câu hỏi của quiz (Admin quản lý)
     * @param {string} quizId - ID quiz
     * @returns {Promise<Array>} Danh sách câu hỏi
     */
    getQuestions: async quizId => {
        return await directus.request(
            readItems(COLLECTIONS.QUIZ_QUESTIONS, {
                filter: { quiz_id: { _eq: quizId } },
                sort: ['sort'],
                limit: -1,
            })
        );
    },

    /**
     * Lấy chi tiết một câu hỏi (Admin quản lý)
     * @param {string} questionId - ID câu hỏi
     * @returns {Promise<Object>} Chi tiết câu hỏi
     */
    getQuestionById: async questionId => {
        return await directus.request(readItem(COLLECTIONS.QUIZ_QUESTIONS, questionId));
    },

    /**
     * Thêm câu hỏi vào quiz
     * @param {string} quizId - ID quiz
     * @param {Object} questionData - Dữ liệu câu hỏi
     * @returns {Promise<Object>} Câu hỏi đã tạo
     */
    addQuestion: async (quizId, questionData) => {
        // Get max sort order
        const existingQuestions = await quizService.getQuestions(quizId);
        const maxSort = existingQuestions.length > 0 ? Math.max(...existingQuestions.map(q => q.sort || 0)) : 0;

        const question = await directus.request(
            createItem(COLLECTIONS.QUIZ_QUESTIONS, {
                quiz_id: quizId,
                ...questionData,
                sort: maxSort + 1,
            })
        );

        // Update question count in quiz
        await quizService.updateQuizQuestionCount(quizId);

        return question;
    },

    /**
     * Cập nhật câu hỏi
     * @param {string} questionId - ID câu hỏi
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} Câu hỏi đã cập nhật
     */
    updateQuestion: async (questionId, data) => {
        return await directus.request(updateItem(COLLECTIONS.QUIZ_QUESTIONS, questionId, data));
    },

    /**
     * Xóa câu hỏi khỏi quiz
     * @param {string} questionId - ID câu hỏi
     * @returns {Promise<void>}
     */
    deleteQuestion: async questionId => {
        const question = await quizService.getQuestionById(questionId);
        await directus.request(deleteItem(COLLECTIONS.QUIZ_QUESTIONS, questionId));

        if (question?.quiz_id) {
            await quizService.updateQuizQuestionCount(question.quiz_id);
        }
    },

    /**
     * Update quiz question count helper
     */
    updateQuizQuestionCount: async quizId => {
        const questions = await quizService.getQuestions(quizId);
        await directus.request(
            updateItem(COLLECTIONS.QUIZZES, quizId, {
                questions_count: questions.length,
            })
        );
    },

    /**
     * Lấy thống kê quizzes (Admin)
     * @returns {Promise<Object>} Thống kê
     */
    getStats: async () => {
        const totalQuizzesResult = await directus.request(
            aggregate(COLLECTIONS.QUIZZES, { aggregate: { count: '*' } })
        );

        const totalQuestionsResult = await directus.request(
            aggregate(COLLECTIONS.QUIZ_QUESTIONS, { aggregate: { count: '*' } })
        );

        const totalQuizzes = Number(totalQuizzesResult[0]?.count) || 0;
        const totalQuestions = Number(totalQuestionsResult[0]?.count) || 0;

        return {
            totalQuizzes,
            totalQuestions,
            averageQuestionsPerQuiz: totalQuizzes > 0 ? Math.round(totalQuestions / totalQuizzes) : 0,
        };
    },

    // ==========================================
    // CLIENT / LEARNER ENDPOINTS
    // ==========================================

    /**
     * Đếm tổng số quizzes
     * @param {Object} params - Filter params
     * @returns {Promise<number>} Tổng số quizzes
     */
    count: async (params = {}) => {
        const { search, course_id } = params;

        const filter = {};

        if (search) {
            filter._or = [{ title: { _icontains: search } }, { description: { _icontains: search } }];
        }

        if (course_id) {
            filter.course_id = { _eq: course_id };
        }

        const result = await directus.request(
            aggregate(COLLECTIONS.QUIZZES, {
                aggregate: { count: '*' },
                query: { filter },
            })
        );

        return Number(result[0]?.count) || 0;
    },

    /**
     * Lấy chi tiết quiz theo ID
     * @param {string} quizId - ID quiz
     * @returns {Promise<Object>} Chi tiết quiz
     */
    getById: async quizId => {
        return await directus.request(
            readItem(COLLECTIONS.QUIZZES, quizId, {
                fields: ['*', 'user_created.first_name', 'user_created.last_name'],
            })
        );
    },

    /**
     * Lấy quiz kèm questions
     * @param {string} quizId - ID quiz
     * @returns {Promise<Object>} Quiz với danh sách questions
     */
    getWithQuestions: async quizId => {
        const quiz = await quizService.getById(quizId);

        // Fetch questions separately to ensure proper sorting and fields
        const questions = await directus.request(
            readItems(COLLECTIONS.QUIZ_QUESTIONS, {
                filter: { quiz_id: { _eq: quizId } },
                sort: ['sort'],
                limit: -1,
            })
        );

        return {
            ...quiz,
            questions: questions || [],
        };
    },

    /**
     * Lấy quizzes theo course ID
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Array>} Danh sách quizzes
     */
    getByCourseId: async courseId => {
        return await directus.request(
            readItems(COLLECTIONS.QUIZZES, {
                filter: { course_id: { _eq: courseId } },
                sort: ['title'],
            })
        );
    },

    /**
     * Lấy quiz theo lesson ID
     * @param {string} lessonId - ID bài học
     * @returns {Promise<Object|null>} Quiz hoặc null
     */
    getByLessonId: async lessonId => {
        const items = await directus.request(
            readItems(COLLECTIONS.QUIZZES, {
                filter: { lesson_id: { _eq: lessonId } },
                limit: 1,
            })
        );
        return items[0] || null;
    },
};
