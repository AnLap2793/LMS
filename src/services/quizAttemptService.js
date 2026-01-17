/**
 * Quiz Attempt Service
 * Service layer cho lịch sử làm bài kiểm tra
 * Directus Implementation
 */
import { directus } from './directus';
import { readItems, readItem, createItem, readMe, aggregate } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const quizAttemptService = {
    /**
     * Lấy user ID hiện tại (Helper)
     */
    getCurrentUserId: async () => {
        const user = await directus.request(readMe({ fields: ['id'] }));
        return user.id;
    },

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Lấy tất cả attempts (Admin)
     * @param {Object} params - Filter params { search, quizId, userId, passed, page, limit }
     * @returns {Promise<Object>} { data, total, page, limit }
     */
    getAll: async (params = {}) => {
        const { search, quizId, userId, passed, page = 1, limit = 10 } = params;

        const filter = {};

        if (quizId) filter.quiz_id = { _eq: quizId };
        if (userId) filter.user_id = { _eq: userId };

        if (passed !== undefined && passed !== null && passed !== '') {
            filter.is_passed = { _eq: passed === 'true' || passed === true };
        }

        if (search) {
            filter._or = [
                { quiz_id: { title: { _icontains: search } } },
                { user_id: { first_name: { _icontains: search } } },
                { user_id: { last_name: { _icontains: search } } },
            ];
        }

        const items = await directus.request(
            readItems(COLLECTIONS.QUIZ_ATTEMPTS, {
                filter,
                limit,
                page,
                sort: ['-submitted_at'],
                fields: ['*', 'user_id.first_name', 'user_id.last_name', 'quiz_id.title'],
            })
        );

        const totalResult = await directus.request(
            aggregate(COLLECTIONS.QUIZ_ATTEMPTS, {
                aggregate: { count: '*' },
                query: { filter },
            })
        );

        return {
            data: items,
            total: Number(totalResult[0]?.count) || 0,
            page,
            limit,
            totalPages: Math.ceil((Number(totalResult[0]?.count) || 0) / limit),
        };
    },

    /**
     * Lấy thống kê tổng quan (Admin)
     * @returns {Promise<Object>} Statistics
     */
    getStats: async () => {
        const totalResult = await directus.request(aggregate(COLLECTIONS.QUIZ_ATTEMPTS, { aggregate: { count: '*' } }));
        const total = Number(totalResult[0]?.count) || 0;

        const passedResult = await directus.request(
            aggregate(COLLECTIONS.QUIZ_ATTEMPTS, {
                aggregate: { count: '*' },
                query: { filter: { is_passed: { _eq: true } } },
            })
        );
        const passed = Number(passedResult[0]?.count) || 0;

        const scoreResult = await directus.request(
            aggregate(COLLECTIONS.QUIZ_ATTEMPTS, { aggregate: { avg: 'score' } })
        );
        const avgScore = Number(scoreResult[0]?.avg?.score) || 0;

        const quizzesResult = await directus.request(aggregate(COLLECTIONS.QUIZZES, { aggregate: { count: '*' } }));

        return {
            totalAttempts: total,
            passedAttempts: passed,
            failedAttempts: total - passed,
            passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
            averageScore: Math.round(avgScore),
            totalQuizzes: Number(quizzesResult[0]?.count) || 0,
        };
    },

    /**
     * Lấy phân tích chi tiết câu hỏi (Admin/Instructor view)
     */
    getQuizAnalysis: async quizId => {
        // 1. Get questions
        const questions = await directus.request(
            readItems(COLLECTIONS.QUIZ_QUESTIONS, {
                filter: { quiz_id: { _eq: quizId } },
                sort: ['sort'],
            })
        );

        // 2. Get attempts (limit to 100 recent for analysis performance)
        const attempts = await directus.request(
            readItems(COLLECTIONS.QUIZ_ATTEMPTS, {
                filter: { quiz_id: { _eq: quizId } },
                limit: 100,
                sort: ['-submitted_at'],
                fields: ['score', 'is_passed', 'answers'],
            })
        );

        const totalAttempts = attempts.length;

        if (totalAttempts === 0) {
            return {
                summary: { totalAttempts: 0, averageScore: 0, passRate: 0 },
                questions: questions.map(q => ({ ...q, stats: null })),
            };
        }

        // 3. Process data
        const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
        const passedCount = attempts.filter(a => a.is_passed).length;

        const summary = {
            totalAttempts,
            averageScore: Math.round(totalScore / totalAttempts),
            passRate: Math.round((passedCount / totalAttempts) * 100),
        };

        const questionAnalysis = questions.map(q => {
            let correctCount = 0;
            const answerDistribution = {};

            if (q.options && typeof q.options === 'object') {
                Object.keys(q.options).forEach(key => {
                    if (key !== 'correct') answerDistribution[key] = 0;
                });
            }

            attempts.forEach(attempt => {
                const userAnswer = attempt.answers?.[q.id];
                if (!userAnswer) return;

                let isCorrect = false;

                if (q.type === 'single') {
                    if (q.options?.correct && userAnswer === q.options.correct[0]) isCorrect = true;
                    answerDistribution[userAnswer] = (answerDistribution[userAnswer] || 0) + 1;
                } else if (q.type === 'multiple') {
                    const correctArr = q.options?.correct || [];
                    if (
                        Array.isArray(userAnswer) &&
                        userAnswer.length === correctArr.length &&
                        userAnswer.every(val => correctArr.includes(val))
                    ) {
                        isCorrect = true;
                    }
                    if (Array.isArray(userAnswer)) {
                        userAnswer.forEach(opt => {
                            answerDistribution[opt] = (answerDistribution[opt] || 0) + 1;
                        });
                    }
                }

                if (isCorrect) correctCount++;
            });

            const correctRate = Math.round((correctCount / totalAttempts) * 100);
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

        return { summary, questions: questionAnalysis };
    },

    // ==========================================
    // CLIENT / LEARNER ENDPOINTS
    // ==========================================

    /**
     * Lấy lịch sử làm bài của user hiện tại (Learner)
     * @param {Object} params - Filter params { search, passed, page, limit }
     * @returns {Promise<Object>} { data, total, page, limit }
     */
    getMyAttempts: async (params = {}) => {
        const { search, passed, page = 1, limit = 10 } = params;
        const userId = await quizAttemptService.getCurrentUserId();

        const filter = {
            user_id: { _eq: userId },
        };

        if (passed !== undefined && passed !== null && passed !== '') {
            filter.is_passed = { _eq: passed === 'true' || passed === true };
        }

        if (search) {
            filter.quiz_id = {
                title: { _icontains: search },
            };
        }

        const items = await directus.request(
            readItems(COLLECTIONS.QUIZ_ATTEMPTS, {
                filter,
                limit,
                page,
                sort: ['-submitted_at'],
                fields: ['*', 'quiz_id.id', 'quiz_id.title', 'quiz_id.passing_score', 'quiz_id.total_score'],
            })
        );

        const totalResult = await directus.request(
            aggregate(COLLECTIONS.QUIZ_ATTEMPTS, {
                aggregate: { count: '*' },
                query: { filter },
            })
        );

        return {
            data: items,
            total: Number(totalResult[0]?.count) || 0,
            page,
            limit,
            totalPages: Math.ceil((Number(totalResult[0]?.count) || 0) / limit),
        };
    },

    /**
     * Lấy chi tiết attempt theo ID
     * @param {string} attemptId - Attempt ID
     * @returns {Promise<Object>} Attempt với đầy đủ thông tin
     */
    getById: async attemptId => {
        const attempt = await directus.request(
            readItem(COLLECTIONS.QUIZ_ATTEMPTS, attemptId, {
                fields: ['*', 'user_id.first_name', 'user_id.last_name', 'quiz_id.*'],
            })
        );

        if (!attempt) throw new Error('Attempt not found');

        // Fetch questions for this quiz to map answers
        const questions = await directus.request(
            readItems(COLLECTIONS.QUIZ_QUESTIONS, {
                filter: { quiz_id: { _eq: attempt.quiz_id.id } },
                sort: ['sort'],
            })
        );

        return {
            ...attempt,
            quiz: attempt.quiz_id,
            questions,
        };
    },

    /**
     * Tạo attempt mới (khi user submit quiz)
     * @param {Object} data - Attempt data
     * @returns {Promise<Object>} Created attempt
     */
    create: async data => {
        const userId = await quizAttemptService.getCurrentUserId();

        return await directus.request(
            createItem(COLLECTIONS.QUIZ_ATTEMPTS, {
                ...data,
                user_id: userId,
                submitted_at: new Date().toISOString(),
            })
        );
    },

    /**
     * Đếm số lượt đã làm của user hiện tại cho một quiz
     * @param {string} quizId - Quiz ID
     * @returns {Promise<number>} Số lượt đã làm
     */
    countMyAttempts: async quizId => {
        const userId = await quizAttemptService.getCurrentUserId();

        const result = await directus.request(
            aggregate(COLLECTIONS.QUIZ_ATTEMPTS, {
                aggregate: { count: '*' },
                query: {
                    filter: {
                        user_id: { _eq: userId },
                        quiz_id: { _eq: quizId },
                    },
                },
            })
        );

        return Number(result[0]?.count) || 0;
    },

    /**
     * Lấy danh sách quizzes cho filter dropdown
     */
    getQuizzesForFilter: async () => {
        return await directus.request(
            readItems(COLLECTIONS.QUIZZES, {
                fields: ['id', 'title'],
                sort: ['title'],
            })
        );
    },
};
