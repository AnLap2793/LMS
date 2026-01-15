/**
 * Quiz Service - Mock data cho quizzes và quiz questions
 * Sử dụng mock data thay vì Directus API
 */
import { mockQuizzes, mockQuizQuestions, getQuestionsByQuizId } from '../mocks/quizzes';

// Helper: Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const quizService = {
    /**
     * Lấy danh sách tất cả quizzes
     * @param {Object} params - Filter params
     * @returns {Promise<Array>} Danh sách quizzes
     */
    getAll: async (params = {}) => {
        await delay();
        const { search, course_id, page = 1, limit = 10 } = params;

        let filteredQuizzes = [...mockQuizzes];

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            filteredQuizzes = filteredQuizzes.filter(
                q => q.title.toLowerCase().includes(searchLower) || q.description?.toLowerCase().includes(searchLower)
            );
        }

        // Filter by course
        if (course_id) {
            filteredQuizzes = filteredQuizzes.filter(q => q.course_id === course_id);
        }

        // Pagination
        const offset = (page - 1) * limit;
        const paginatedQuizzes = filteredQuizzes.slice(offset, offset + limit);

        return paginatedQuizzes;
    },

    /**
     * Đếm tổng số quizzes
     * @param {Object} params - Filter params
     * @returns {Promise<number>} Tổng số quizzes
     */
    count: async (params = {}) => {
        await delay(100);
        const { search, course_id } = params;

        let filteredQuizzes = [...mockQuizzes];

        if (search) {
            const searchLower = search.toLowerCase();
            filteredQuizzes = filteredQuizzes.filter(
                q => q.title.toLowerCase().includes(searchLower) || q.description?.toLowerCase().includes(searchLower)
            );
        }

        if (course_id) {
            filteredQuizzes = filteredQuizzes.filter(q => q.course_id === course_id);
        }

        return filteredQuizzes.length;
    },

    /**
     * Lấy chi tiết quiz theo ID
     * @param {string} quizId - ID quiz
     * @returns {Promise<Object>} Chi tiết quiz
     */
    getById: async quizId => {
        await delay();
        const quiz = mockQuizzes.find(q => q.id === quizId);

        if (!quiz) {
            throw new Error('Quiz not found');
        }

        return quiz;
    },

    /**
     * Lấy quiz kèm questions
     * @param {string} quizId - ID quiz
     * @returns {Promise<Object>} Quiz với danh sách questions
     */
    getWithQuestions: async quizId => {
        await delay();
        const quiz = mockQuizzes.find(q => q.id === quizId);

        if (!quiz) {
            throw new Error('Quiz not found');
        }

        const questions = getQuestionsByQuizId(quizId).sort((a, b) => a.sort - b.sort);

        return {
            ...quiz,
            questions,
        };
    },

    /**
     * Lấy quizzes theo course ID
     * @param {string} courseId - ID khóa học
     * @returns {Promise<Array>} Danh sách quizzes
     */
    getByCourseId: async courseId => {
        await delay();
        return mockQuizzes.filter(q => q.course_id === courseId);
    },

    /**
     * Lấy quiz theo lesson ID
     * @param {string} lessonId - ID bài học
     * @returns {Promise<Object|null>} Quiz hoặc null
     */
    getByLessonId: async lessonId => {
        await delay();
        return mockQuizzes.find(q => q.lesson_id === lessonId) || null;
    },

    /**
     * Lấy danh sách câu hỏi của quiz
     * @param {string} quizId - ID quiz
     * @returns {Promise<Array>} Danh sách câu hỏi
     */
    getQuestions: async quizId => {
        await delay();
        return getQuestionsByQuizId(quizId).sort((a, b) => a.sort - b.sort);
    },

    /**
     * Lấy chi tiết một câu hỏi
     * @param {string} questionId - ID câu hỏi
     * @returns {Promise<Object>} Chi tiết câu hỏi
     */
    getQuestionById: async questionId => {
        await delay();
        const question = mockQuizQuestions.find(q => q.id === questionId);

        if (!question) {
            throw new Error('Question not found');
        }

        return question;
    },

    /**
     * Tạo quiz mới
     * @param {Object} data - Dữ liệu quiz
     * @returns {Promise<Object>} Quiz đã tạo
     */
    create: async data => {
        await delay(500);
        const newQuiz = {
            id: `q${Date.now()}`,
            ...data,
            questions_count: 0,
            user_created: { id: 'admin', first_name: 'Admin', last_name: 'User' },
            date_created: new Date().toISOString(),
        };

        mockQuizzes.push(newQuiz);
        return newQuiz;
    },

    /**
     * Cập nhật quiz
     * @param {string} id - ID quiz
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} Quiz đã cập nhật
     */
    update: async (id, data) => {
        await delay(500);
        const index = mockQuizzes.findIndex(q => q.id === id);

        if (index === -1) {
            throw new Error('Quiz not found');
        }

        mockQuizzes[index] = { ...mockQuizzes[index], ...data };
        return mockQuizzes[index];
    },

    /**
     * Xóa quiz
     * @param {string} id - ID quiz
     * @returns {Promise<void>}
     */
    delete: async id => {
        await delay(500);
        const index = mockQuizzes.findIndex(q => q.id === id);

        if (index === -1) {
            throw new Error('Quiz not found');
        }

        mockQuizzes.splice(index, 1);
    },

    /**
     * Thêm câu hỏi vào quiz
     * @param {string} quizId - ID quiz
     * @param {Object} questionData - Dữ liệu câu hỏi
     * @returns {Promise<Object>} Câu hỏi đã tạo
     */
    addQuestion: async (quizId, questionData) => {
        await delay(500);
        const existingQuestions = getQuestionsByQuizId(quizId);
        const maxSort = existingQuestions.length > 0 ? Math.max(...existingQuestions.map(q => q.sort)) : 0;

        const newQuestion = {
            id: `qq${Date.now()}`,
            quiz_id: quizId,
            ...questionData,
            sort: maxSort + 1,
        };

        mockQuizQuestions.push(newQuestion);

        // Update questions count
        const quizIndex = mockQuizzes.findIndex(q => q.id === quizId);
        if (quizIndex !== -1) {
            mockQuizzes[quizIndex].questions_count = (mockQuizzes[quizIndex].questions_count || 0) + 1;
        }

        return newQuestion;
    },

    /**
     * Cập nhật câu hỏi
     * @param {string} questionId - ID câu hỏi
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} Câu hỏi đã cập nhật
     */
    updateQuestion: async (questionId, data) => {
        await delay(500);
        const index = mockQuizQuestions.findIndex(q => q.id === questionId);

        if (index === -1) {
            throw new Error('Question not found');
        }

        mockQuizQuestions[index] = { ...mockQuizQuestions[index], ...data };
        return mockQuizQuestions[index];
    },

    /**
     * Xóa câu hỏi khỏi quiz
     * @param {string} questionId - ID câu hỏi
     * @returns {Promise<void>}
     */
    deleteQuestion: async questionId => {
        await delay(500);
        const index = mockQuizQuestions.findIndex(q => q.id === questionId);

        if (index === -1) {
            throw new Error('Question not found');
        }

        const quizId = mockQuizQuestions[index].quiz_id;
        mockQuizQuestions.splice(index, 1);

        // Update questions count
        const quizIndex = mockQuizzes.findIndex(q => q.id === quizId);
        if (quizIndex !== -1) {
            mockQuizzes[quizIndex].questions_count = Math.max(0, (mockQuizzes[quizIndex].questions_count || 1) - 1);
        }
    },

    /**
     * Lấy thống kê quizzes
     * @returns {Promise<Object>} Thống kê
     */
    getStats: async () => {
        await delay(200);
        return {
            totalQuizzes: mockQuizzes.length,
            totalQuestions: mockQuizQuestions.length,
            averageQuestionsPerQuiz: Math.round(mockQuizQuestions.length / mockQuizzes.length),
        };
    },
};
