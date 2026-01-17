/**
 * Question Bank Service
 * Service layer cho Ngân hàng Câu hỏi
 * Directus Implementation
 */
import { directus } from './directus';
import { readItems, createItem, updateItem, deleteItem, aggregate, readItem } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const questionBankService = {
    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Lấy danh sách câu hỏi với filter và pagination
     * @param {Object} params - Filter params { category, difficulty, type, search, status, page, limit }
     * @returns {Promise<Object>} { data: Array, total: number, page: number, limit: number }
     */
    getAll: async (params = {}) => {
        const { category, difficulty, type, search, status = 'active', page = 1, limit = 10 } = params;

        const filter = {
            status: { _eq: status },
        };

        if (category) filter.category = { _eq: category };
        if (difficulty) filter.difficulty = { _eq: difficulty };
        if (type) filter.type = { _eq: type };

        if (search) {
            filter._or = [
                { question: { _icontains: search } },
                // Tags searching might require M2M filter depending on structure
                // Assuming simple text tags field or M2M relation 'tags'
                // { tags: { tags_id: { name: { _icontains: search } } } }
            ];
        }

        const items = await directus.request(
            readItems(COLLECTIONS.QUESTION_BANK, {
                filter,
                limit,
                page,
                sort: ['-date_created'],
            })
        );

        const totalResult = await directus.request(
            aggregate(COLLECTIONS.QUESTION_BANK, {
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
     * Lấy chi tiết câu hỏi theo ID
     * @param {string} id - Question ID
     * @returns {Promise<Object>} Question object
     */
    getById: async id => {
        return await directus.request(readItem(COLLECTIONS.QUESTION_BANK, id));
    },

    /**
     * Tạo câu hỏi mới
     * @param {Object} data - Question data
     * @returns {Promise<Object>} Created question
     */
    create: async data => {
        return await directus.request(
            createItem(COLLECTIONS.QUESTION_BANK, {
                ...data,
                status: data.status || 'active',
            })
        );
    },

    /**
     * Cập nhật câu hỏi
     * @param {string} id - Question ID
     * @param {Object} data - Updated data
     * @returns {Promise<Object>} Updated question
     */
    update: async (id, data) => {
        return await directus.request(updateItem(COLLECTIONS.QUESTION_BANK, id, data));
    },

    /**
     * Xóa câu hỏi
     * @param {string} id - Question ID
     * @returns {Promise<boolean>} Success
     */
    delete: async id => {
        await directus.request(deleteItem(COLLECTIONS.QUESTION_BANK, id));
        return true;
    },

    /**
     * Xóa nhiều câu hỏi
     * @param {Array<string>} ids - Array of question IDs
     * @returns {Promise<number>} Number of deleted questions
     */
    deleteMany: async ids => {
        await directus.request(deleteItem(COLLECTIONS.QUESTION_BANK, ids));
        return ids.length;
    },

    /**
     * Lấy thống kê câu hỏi
     * @returns {Promise<Object>} Statistics
     */
    getStats: async () => {
        // Run aggregations
        const totalResult = await directus.request(aggregate(COLLECTIONS.QUESTION_BANK, { aggregate: { count: '*' } }));
        const activeResult = await directus.request(
            aggregate(COLLECTIONS.QUESTION_BANK, {
                aggregate: { count: '*' },
                query: { filter: { status: { _eq: 'active' } } },
            })
        );

        // Grouping logic would ideally be done via aggregate groupBy, but let's do simplified fetch for distribution if dataset small,
        // OR rely on multiple aggregate calls.
        // For efficiency in Directus, separate aggregate calls for distributions:

        const [byCategory, byDifficulty, byType] = await Promise.all([
            directus.request(
                aggregate(COLLECTIONS.QUESTION_BANK, { aggregate: { count: '*' }, groupBy: ['category'] })
            ),
            directus.request(
                aggregate(COLLECTIONS.QUESTION_BANK, { aggregate: { count: '*' }, groupBy: ['difficulty'] })
            ),
            directus.request(aggregate(COLLECTIONS.QUESTION_BANK, { aggregate: { count: '*' }, groupBy: ['type'] })),
        ]);

        const mapCounts = (arr, key) =>
            arr.reduce((acc, item) => {
                if (item[key]) acc[item[key]] = Number(item.count);
                return acc;
            }, {});

        return {
            total: Number(totalResult[0]?.count) || 0,
            active: Number(activeResult[0]?.count) || 0,
            byCategory: mapCounts(byCategory, 'category'),
            byDifficulty: mapCounts(byDifficulty, 'difficulty'),
            byType: mapCounts(byType, 'type'),
        };
    },

    /**
     * Copy câu hỏi từ Question Bank sang Quiz
     * Tạo bản sao độc lập với quiz_id (trong collection QUIZ_QUESTIONS)
     * @param {Array<string>} questionIds - Array of question IDs từ Question Bank
     * @param {string} quizId - Target Quiz ID
     * @returns {Promise<Array>} Copied questions với quiz_id
     */
    copyToQuiz: async (questionIds, quizId) => {
        // 1. Fetch questions from bank
        const questionsToCopy = await directus.request(
            readItems(COLLECTIONS.QUESTION_BANK, {
                filter: { id: { _in: questionIds } },
            })
        );

        // 2. Get current max sort in quiz
        // We'd need to call quiz service or aggregate here.
        // Assuming we start appending at the end.
        const currentQuestions = await directus.request(
            readItems(COLLECTIONS.QUIZ_QUESTIONS, {
                filter: { quiz_id: { _eq: quizId } },
                aggregate: { max: 'sort' },
            })
        );
        // readItems with aggregate might not work directly, use aggregate()
        // But for simplicity let's assume we fetch max sort via aggregate:
        const maxSortResult = await directus.request(
            aggregate(COLLECTIONS.QUIZ_QUESTIONS, {
                aggregate: { max: 'sort' },
                query: { filter: { quiz_id: { _eq: quizId } } },
            })
        );
        let currentSort = Number(maxSortResult[0]?.max?.sort) || 0;

        // 3. Create new quiz questions
        const createPromises = questionsToCopy.map(q => {
            currentSort++;
            return directus.request(
                createItem(COLLECTIONS.QUIZ_QUESTIONS, {
                    quiz_id: quizId,
                    question: q.question,
                    type: q.type,
                    options: q.options, // Assuming structure matches
                    explanation: q.explanation,
                    points: q.points || 1, // Default points
                    sort: currentSort,
                    // Note: source_question_id tracking optional
                })
            );
        });

        return await Promise.all(createPromises);
    },

    // ==========================================
    // CLIENT / LEARNER ENDPOINTS
    // ==========================================
    // (Question Bank is Admin only)
};
