/**
 * Quiz Attempt Service
 * Service layer cho lịch sử làm bài kiểm tra
 * Sử dụng mock data trong giai đoạn development
 */
import { mockQuizAttempts, mockQuizzes, mockQuizQuestions } from '../mocks/quizzes';

// Helper: Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store để simulate CRUD
let attemptStore = [...mockQuizAttempts];

// Mock current user ID (normally from AuthContext)
const CURRENT_USER_ID = 'u1';

export const quizAttemptService = {
    /**
     * Lấy lịch sử làm bài của user hiện tại (Learner)
     * @param {Object} params - Filter params { search, passed, page, limit }
     * @returns {Promise<Object>} { data, total, page, limit }
     */
    getMyAttempts: async (params = {}) => {
        await delay();

        const { search, passed, page = 1, limit = 10 } = params;

        // Filter by current user
        let filtered = attemptStore.filter(a => a.user_id === CURRENT_USER_ID);

        // Filter by passed status
        if (passed !== undefined && passed !== null && passed !== '') {
            const isPassed = passed === 'true' || passed === true;
            filtered = filtered.filter(a => a.is_passed === isPassed);
        }

        // Filter by search (quiz title)
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(a => a.quiz?.title?.toLowerCase().includes(searchLower));
        }

        // Sort by submitted_at descending
        filtered.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

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
     * Lấy tất cả attempts (Admin)
     * @param {Object} params - Filter params { search, quizId, userId, passed, page, limit }
     * @returns {Promise<Object>} { data, total, page, limit }
     */
    getAll: async (params = {}) => {
        await delay();

        const { search, quizId, userId, passed, page = 1, limit = 10 } = params;

        let filtered = [...attemptStore];

        // Filter by quiz
        if (quizId) {
            filtered = filtered.filter(a => a.quiz_id === quizId);
        }

        // Filter by user
        if (userId) {
            filtered = filtered.filter(a => a.user_id === userId);
        }

        // Filter by passed status
        if (passed !== undefined && passed !== null && passed !== '') {
            const isPassed = passed === 'true' || passed === true;
            filtered = filtered.filter(a => a.is_passed === isPassed);
        }

        // Filter by search (user name or quiz title)
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                a =>
                    a.quiz?.title?.toLowerCase().includes(searchLower) ||
                    `${a.user?.first_name} ${a.user?.last_name}`.toLowerCase().includes(searchLower)
            );
        }

        // Sort by submitted_at descending
        filtered.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

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
     * Lấy attempts theo quiz ID (Admin)
     * @param {string} quizId - Quiz ID
     * @param {Object} params - Filter params
     * @returns {Promise<Object>} { data, total, ... }
     */
    getByQuiz: async (quizId, params = {}) => {
        return quizAttemptService.getAll({ ...params, quizId });
    },

    /**
     * Lấy attempts theo user ID (Admin)
     * @param {string} userId - User ID
     * @param {Object} params - Filter params
     * @returns {Promise<Object>} { data, total, ... }
     */
    getByUser: async (userId, params = {}) => {
        return quizAttemptService.getAll({ ...params, userId });
    },

    /**
     * Lấy chi tiết attempt theo ID
     * @param {string} attemptId - Attempt ID
     * @returns {Promise<Object>} Attempt với đầy đủ thông tin
     */
    getById: async attemptId => {
        await delay(200);

        const attempt = attemptStore.find(a => a.id === attemptId);

        if (!attempt) {
            throw new Error('Attempt not found');
        }

        // Get quiz details
        const quiz = mockQuizzes.find(q => q.id === attempt.quiz_id);

        // Get questions for this quiz
        const questions = mockQuizQuestions.filter(q => q.quiz_id === attempt.quiz_id).sort((a, b) => a.sort - b.sort);

        return {
            ...attempt,
            quiz,
            questions,
        };
    },

    /**
     * Tạo attempt mới (khi user submit quiz)
     * @param {Object} data - Attempt data
     * @returns {Promise<Object>} Created attempt
     */
    create: async data => {
        await delay();

        const newAttempt = {
            id: `qa-${Date.now()}`,
            user_id: CURRENT_USER_ID,
            user: { id: CURRENT_USER_ID, first_name: 'Nguyễn', last_name: 'Văn A' }, // Mock user
            ...data,
            started_at: data.started_at || new Date().toISOString(),
            submitted_at: new Date().toISOString(),
        };

        attemptStore = [newAttempt, ...attemptStore];
        return newAttempt;
    },

    /**
     * Đếm số lượt đã làm của user hiện tại cho một quiz
     * @param {string} quizId - Quiz ID
     * @returns {Promise<number>} Số lượt đã làm
     */
    countMyAttempts: async quizId => {
        await delay(100);
        return attemptStore.filter(a => a.user_id === CURRENT_USER_ID && a.quiz_id === quizId).length;
    },

    /**
     * Lấy thống kê tổng quan (Admin)
     * @returns {Promise<Object>} Statistics
     */
    getStats: async () => {
        await delay(100);

        const total = attemptStore.length;
        const passed = attemptStore.filter(a => a.is_passed).length;
        const totalScore = attemptStore.reduce((sum, a) => sum + (a.score || 0), 0);

        return {
            totalAttempts: total,
            passedAttempts: passed,
            failedAttempts: total - passed,
            passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
            averageScore: total > 0 ? Math.round(totalScore / total) : 0,
            totalQuizzes: mockQuizzes.length,
        };
    },

    /**
     * Lấy danh sách quizzes cho filter dropdown
     * @returns {Promise<Array>} List of quizzes
     */
    getQuizzesForFilter: async () => {
        await delay(100);
        return mockQuizzes.map(q => ({
            id: q.id,
            title: q.title,
        }));
    },

    /**
     * Lấy phân tích chi tiết câu hỏi cho một bài kiểm tra
     * @param {string} quizId - Quiz ID
     * @returns {Promise<Object>} Analysis data
     */
    getQuizAnalysis: async quizId => {
        await delay(300);

        // 1. Get questions
        const questions = mockQuizQuestions.filter(q => q.quiz_id === quizId);

        // 2. Get attempts
        const attempts = attemptStore.filter(a => a.quiz_id === quizId);
        const totalAttempts = attempts.length;

        if (totalAttempts === 0) {
            return {
                summary: { totalAttempts: 0, averageScore: 0, passRate: 0 },
                questions: questions.map(q => ({ ...q, stats: null })),
            };
        }

        // 3. Calculate summary stats
        const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
        const passedCount = attempts.filter(a => a.is_passed).length;

        const summary = {
            totalAttempts,
            averageScore: Math.round(totalScore / totalAttempts),
            passRate: Math.round((passedCount / totalAttempts) * 100),
        };

        // 4. Analyze per question
        const questionAnalysis = questions.map(q => {
            let correctCount = 0;
            const answerDistribution = {}; // { 'A': 10, 'B': 5 ... }

            // Initialize distribution keys based on question type
            if (q.type === 'single' || q.type === 'multiple') {
                if (q.options) {
                    Object.keys(q.options).forEach(key => {
                        if (key !== 'correct') answerDistribution[key] = 0;
                    });
                }
            }

            attempts.forEach(attempt => {
                const userAnswer = attempt.answers?.[q.id];
                if (!userAnswer) return; // Skip if unanswered

                // Check correctness
                let isCorrect = false;
                if (q.type === 'single') {
                    if (q.options?.correct && userAnswer === q.options.correct[0]) isCorrect = true;
                    // Count distribution
                    answerDistribution[userAnswer] = (answerDistribution[userAnswer] || 0) + 1;
                } else if (q.type === 'multiple') {
                    // For multiple, exact match of array
                    const correctArr = q.options?.correct || [];
                    if (
                        Array.isArray(userAnswer) &&
                        userAnswer.length === correctArr.length &&
                        userAnswer.every(val => correctArr.includes(val))
                    ) {
                        isCorrect = true;
                    }
                    // Count distribution (each selected option counts)
                    if (Array.isArray(userAnswer)) {
                        userAnswer.forEach(opt => {
                            answerDistribution[opt] = (answerDistribution[opt] || 0) + 1;
                        });
                    }
                } else {
                    // Text - simplistic check for mock
                    if (userAnswer) isCorrect = true; // Assume graded correct if exists in mock
                }

                if (isCorrect) correctCount++;
            });

            const correctRate = Math.round((correctCount / totalAttempts) * 100);

            // Determine status
            let status = 'normal';
            if (correctRate < 40) status = 'hard';
            if (correctRate > 90) status = 'easy';

            return {
                ...q,
                stats: {
                    totalAnswers: totalAttempts,
                    correctCount,
                    correctRate,
                    distribution: answerDistribution,
                    status,
                },
            };
        });

        return {
            summary,
            questions: questionAnalysis,
        };
    },
};
