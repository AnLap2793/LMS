/**
 * Question Bank Service
 * Service layer cho Ngân hàng Câu hỏi
 * Sử dụng mock data trong giai đoạn development
 */
import { mockQuestionBank, getFilteredQuestions, getQuestionById, getQuestionStats } from '../mocks/questionBank';

// Helper: Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store để simulate CRUD (vì mock data là immutable)
let questionStore = [...mockQuestionBank];

export const questionBankService = {
    /**
     * Lấy danh sách câu hỏi với filter và pagination
     * @param {Object} params - Filter params { category, difficulty, type, search, status, page, limit }
     * @returns {Promise<Object>} { data: Array, total: number, page: number, limit: number }
     */
    getAll: async (params = {}) => {
        await delay();

        const { category, difficulty, type, search, status = 'active', page = 1, limit = 10 } = params;

        // Filter questions
        let filtered = questionStore.filter(q => {
            if (status && q.status !== status) return false;
            if (category && q.category !== category) return false;
            if (difficulty && q.difficulty !== difficulty) return false;
            if (type && q.type !== type) return false;

            if (search) {
                const searchLower = search.toLowerCase();
                const matchQuestion = q.question.toLowerCase().includes(searchLower);
                const matchTags = q.tags?.some(tag => tag.toLowerCase().includes(searchLower));
                if (!matchQuestion && !matchTags) return false;
            }

            return true;
        });

        // Sort by date_created descending
        filtered.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));

        // Pagination
        const total = filtered.length;
        const offset = (page - 1) * limit;
        const data = filtered.slice(offset, offset + limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },

    /**
     * Lấy chi tiết câu hỏi theo ID
     * @param {string} id - Question ID
     * @returns {Promise<Object>} Question object
     */
    getById: async id => {
        await delay(200);
        const question = questionStore.find(q => q.id === id);

        if (!question) {
            throw new Error('Question not found');
        }

        return question;
    },

    /**
     * Tạo câu hỏi mới
     * @param {Object} data - Question data
     * @returns {Promise<Object>} Created question
     */
    create: async data => {
        await delay();

        const newQuestion = {
            id: `qb-${Date.now()}`,
            ...data,
            status: data.status || 'active',
            date_created: new Date().toISOString(),
            user_created: 'current-user', // TODO: Get from auth context
        };

        questionStore = [newQuestion, ...questionStore];
        return newQuestion;
    },

    /**
     * Cập nhật câu hỏi
     * @param {string} id - Question ID
     * @param {Object} data - Updated data
     * @returns {Promise<Object>} Updated question
     */
    update: async (id, data) => {
        await delay();

        const index = questionStore.findIndex(q => q.id === id);
        if (index === -1) {
            throw new Error('Question not found');
        }

        const updatedQuestion = {
            ...questionStore[index],
            ...data,
            date_updated: new Date().toISOString(),
        };

        questionStore[index] = updatedQuestion;
        return updatedQuestion;
    },

    /**
     * Xóa câu hỏi
     * @param {string} id - Question ID
     * @returns {Promise<boolean>} Success
     */
    delete: async id => {
        await delay();

        const index = questionStore.findIndex(q => q.id === id);
        if (index === -1) {
            throw new Error('Question not found');
        }

        questionStore = questionStore.filter(q => q.id !== id);
        return true;
    },

    /**
     * Xóa nhiều câu hỏi
     * @param {Array<string>} ids - Array of question IDs
     * @returns {Promise<number>} Number of deleted questions
     */
    deleteMany: async ids => {
        await delay();

        const initialLength = questionStore.length;
        questionStore = questionStore.filter(q => !ids.includes(q.id));

        return initialLength - questionStore.length;
    },

    /**
     * Lấy thống kê câu hỏi
     * @returns {Promise<Object>} Statistics
     */
    getStats: async () => {
        await delay(100);

        const active = questionStore.filter(q => q.status === 'active');

        return {
            total: questionStore.length,
            active: active.length,
            byCategory: {
                programming: active.filter(q => q.category === 'programming').length,
                database: active.filter(q => q.category === 'database').length,
                design: active.filter(q => q.category === 'design').length,
                soft_skills: active.filter(q => q.category === 'soft_skills').length,
            },
            byDifficulty: {
                easy: active.filter(q => q.difficulty === 'easy').length,
                medium: active.filter(q => q.difficulty === 'medium').length,
                hard: active.filter(q => q.difficulty === 'hard').length,
            },
            byType: {
                single: active.filter(q => q.type === 'single').length,
                multiple: active.filter(q => q.type === 'multiple').length,
                text: active.filter(q => q.type === 'text').length,
            },
        };
    },

    /**
     * Copy câu hỏi từ Question Bank sang Quiz
     * Tạo bản sao độc lập với quiz_id
     * @param {Array<string>} questionIds - Array of question IDs từ Question Bank
     * @param {string} quizId - Target Quiz ID
     * @returns {Promise<Array>} Copied questions với quiz_id
     */
    copyToQuiz: async (questionIds, quizId) => {
        await delay();

        const questionsToCopy = questionStore.filter(q => questionIds.includes(q.id));

        const copiedQuestions = questionsToCopy.map((q, index) => ({
            id: `qq-${Date.now()}-${index}`,
            quiz_id: quizId,
            question: q.question,
            type: q.type,
            options: q.options ? { ...q.options } : null,
            explanation: q.explanation,
            points: q.points,
            sort: index + 1,
            // Không copy: difficulty, category, tags (những field này chỉ có trong Question Bank)
            source_question_id: q.id, // Reference đến câu hỏi gốc (optional, để tracking)
        }));

        return copiedQuestions;
    },
};
