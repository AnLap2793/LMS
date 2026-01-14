/**
 * Mock data cho Question Bank
 * Dữ liệu mẫu để phát triển trước khi tích hợp Directus
 */

export const mockQuestionBank = [
    // ============================================
    // PROGRAMMING QUESTIONS
    // ============================================
    {
        id: 'qb-001',
        question: 'React là gì?',
        type: 'single',
        options: {
            A: 'Một thư viện JavaScript để xây dựng giao diện người dùng',
            B: 'Một framework CSS',
            C: 'Một ngôn ngữ lập trình mới',
            D: 'Một công cụ build automation',
            correct: ['A'],
        },
        explanation:
            'React là một thư viện JavaScript mã nguồn mở được phát triển bởi Facebook để xây dựng giao diện người dùng (UI).',
        points: 1,
        difficulty: 'easy',
        category: 'programming',
        tags: ['react', 'javascript', 'frontend'],
        status: 'active',
        date_created: '2024-01-15T10:00:00Z',
        user_created: 'user-001',
    },
    {
        id: 'qb-002',
        question: 'Những hooks nào sau đây là React Hooks chuẩn?',
        type: 'multiple',
        options: {
            A: 'useState',
            B: 'useEffect',
            C: 'useQuery',
            D: 'useMemo',
            correct: ['A', 'B', 'D'],
        },
        explanation:
            'useState, useEffect và useMemo là React Hooks chuẩn. useQuery là một hook từ thư viện TanStack Query, không phải React chuẩn.',
        points: 2,
        difficulty: 'medium',
        category: 'programming',
        tags: ['react', 'hooks', 'javascript'],
        status: 'active',
        date_created: '2024-01-16T09:30:00Z',
        user_created: 'user-001',
    },
    {
        id: 'qb-003',
        question: 'Virtual DOM trong React hoạt động như thế nào?',
        type: 'text',
        options: null,
        explanation:
            'Virtual DOM là bản sao của DOM thật trong bộ nhớ. React so sánh Virtual DOM mới với phiên bản trước (diffing) và chỉ cập nhật những phần thay đổi lên DOM thật (reconciliation).',
        points: 3,
        difficulty: 'hard',
        category: 'programming',
        tags: ['react', 'virtual-dom', 'performance'],
        status: 'active',
        date_created: '2024-01-17T14:00:00Z',
        user_created: 'user-001',
    },
    {
        id: 'qb-004',
        question: 'Từ khóa nào dùng để khai báo biến có phạm vi block trong JavaScript?',
        type: 'single',
        options: {
            A: 'var',
            B: 'let',
            C: 'const',
            D: 'Cả B và C',
            correct: ['D'],
        },
        explanation:
            'let và const đều có phạm vi block (block scope), trong khi var có phạm vi function (function scope).',
        points: 1,
        difficulty: 'easy',
        category: 'programming',
        tags: ['javascript', 'variables', 'scope'],
        status: 'active',
        date_created: '2024-01-18T08:00:00Z',
        user_created: 'user-002',
    },
    {
        id: 'qb-005',
        question: 'Trong TypeScript, sự khác biệt giữa interface và type là gì?',
        type: 'text',
        options: null,
        explanation:
            'Interface có thể được extend và merge, thường dùng cho object shapes. Type linh hoạt hơn, hỗ trợ union, intersection, và các kiểu phức tạp hơn.',
        points: 2,
        difficulty: 'medium',
        category: 'programming',
        tags: ['typescript', 'interface', 'type'],
        status: 'active',
        date_created: '2024-01-19T11:30:00Z',
        user_created: 'user-001',
    },

    // ============================================
    // DATABASE QUESTIONS
    // ============================================
    {
        id: 'qb-006',
        question: 'SQL là viết tắt của gì?',
        type: 'single',
        options: {
            A: 'Structured Query Language',
            B: 'Simple Query Language',
            C: 'Standard Query Logic',
            D: 'System Query Language',
            correct: ['A'],
        },
        explanation: 'SQL là viết tắt của Structured Query Language - ngôn ngữ truy vấn có cấu trúc.',
        points: 1,
        difficulty: 'easy',
        category: 'database',
        tags: ['sql', 'database', 'basics'],
        status: 'active',
        date_created: '2024-01-20T09:00:00Z',
        user_created: 'user-002',
    },
    {
        id: 'qb-007',
        question: 'Những loại JOIN nào sau đây có trong SQL?',
        type: 'multiple',
        options: {
            A: 'INNER JOIN',
            B: 'LEFT JOIN',
            C: 'OUTER JOIN',
            D: 'CROSS JOIN',
            correct: ['A', 'B', 'C', 'D'],
        },
        explanation: 'Tất cả các loại JOIN trên đều có trong SQL: INNER, LEFT, RIGHT, FULL OUTER, và CROSS JOIN.',
        points: 2,
        difficulty: 'medium',
        category: 'database',
        tags: ['sql', 'join', 'query'],
        status: 'active',
        date_created: '2024-01-21T10:00:00Z',
        user_created: 'user-002',
    },
    {
        id: 'qb-008',
        question: 'Giải thích sự khác biệt giữa cơ sở dữ liệu SQL và NoSQL.',
        type: 'text',
        options: null,
        explanation:
            'SQL: Cấu trúc bảng cố định, schema nghiêm ngặt, quan hệ, ACID. NoSQL: Linh hoạt schema, document/key-value/graph, horizontal scaling, eventual consistency.',
        points: 3,
        difficulty: 'hard',
        category: 'database',
        tags: ['sql', 'nosql', 'database-design'],
        status: 'active',
        date_created: '2024-01-22T14:30:00Z',
        user_created: 'user-001',
    },
    {
        id: 'qb-009',
        question: 'Index trong database dùng để làm gì?',
        type: 'single',
        options: {
            A: 'Tăng tốc độ truy vấn dữ liệu',
            B: 'Bảo mật dữ liệu',
            C: 'Sao lưu dữ liệu',
            D: 'Nén dữ liệu',
            correct: ['A'],
        },
        explanation:
            'Index giúp tăng tốc độ truy vấn bằng cách tạo cấu trúc dữ liệu phụ trợ để tìm kiếm nhanh hơn, tương tự như mục lục trong sách.',
        points: 1,
        difficulty: 'easy',
        category: 'database',
        tags: ['index', 'performance', 'optimization'],
        status: 'active',
        date_created: '2024-01-23T08:00:00Z',
        user_created: 'user-002',
    },

    // ============================================
    // DESIGN QUESTIONS
    // ============================================
    {
        id: 'qb-010',
        question: 'Nguyên tắc nào KHÔNG thuộc về SOLID trong thiết kế phần mềm?',
        type: 'single',
        options: {
            A: 'Single Responsibility',
            B: 'Open/Closed',
            C: 'Liskov Substitution',
            D: 'Data Abstraction',
            correct: ['D'],
        },
        explanation:
            'SOLID gồm: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. Data Abstraction không thuộc SOLID.',
        points: 2,
        difficulty: 'medium',
        category: 'design',
        tags: ['solid', 'design-patterns', 'architecture'],
        status: 'active',
        date_created: '2024-01-24T09:00:00Z',
        user_created: 'user-001',
    },
    {
        id: 'qb-011',
        question: 'Responsive Design là gì và tại sao nó quan trọng?',
        type: 'text',
        options: null,
        explanation:
            'Responsive Design là phương pháp thiết kế web giúp giao diện tự động điều chỉnh theo kích thước màn hình. Quan trọng vì người dùng truy cập từ nhiều thiết bị khác nhau.',
        points: 2,
        difficulty: 'easy',
        category: 'design',
        tags: ['responsive', 'css', 'mobile-first'],
        status: 'active',
        date_created: '2024-01-25T11:00:00Z',
        user_created: 'user-002',
    },
    {
        id: 'qb-012',
        question: 'Những nguyên tắc nào thuộc về UX Design?',
        type: 'multiple',
        options: {
            A: 'Consistency (Nhất quán)',
            B: 'Feedback (Phản hồi)',
            C: 'Visibility (Khả năng hiển thị)',
            D: 'Tất cả các đáp án trên',
            correct: ['A', 'B', 'C'],
        },
        explanation:
            'Consistency, Feedback, Visibility đều là nguyên tắc quan trọng trong UX Design, cùng với nhiều nguyên tắc khác như Affordance, Hierarchy.',
        points: 2,
        difficulty: 'medium',
        category: 'design',
        tags: ['ux', 'design-principles', 'usability'],
        status: 'active',
        date_created: '2024-01-26T13:00:00Z',
        user_created: 'user-001',
    },

    // ============================================
    // SOFT SKILLS QUESTIONS
    // ============================================
    {
        id: 'qb-013',
        question: 'Scrum là một framework thuộc phương pháp nào?',
        type: 'single',
        options: {
            A: 'Waterfall',
            B: 'Agile',
            C: 'DevOps',
            D: 'Lean',
            correct: ['B'],
        },
        explanation: 'Scrum là một trong những framework phổ biến nhất của phương pháp Agile.',
        points: 1,
        difficulty: 'easy',
        category: 'soft_skills',
        tags: ['scrum', 'agile', 'project-management'],
        status: 'active',
        date_created: '2024-01-27T09:00:00Z',
        user_created: 'user-002',
    },
    {
        id: 'qb-014',
        question: 'Những vai trò nào có trong Scrum Team?',
        type: 'multiple',
        options: {
            A: 'Product Owner',
            B: 'Scrum Master',
            C: 'Development Team',
            D: 'Project Manager',
            correct: ['A', 'B', 'C'],
        },
        explanation:
            'Scrum Team gồm 3 vai trò: Product Owner, Scrum Master, và Development Team. Project Manager không phải vai trò trong Scrum.',
        points: 2,
        difficulty: 'medium',
        category: 'soft_skills',
        tags: ['scrum', 'team', 'roles'],
        status: 'active',
        date_created: '2024-01-28T10:30:00Z',
        user_created: 'user-001',
    },
    {
        id: 'qb-015',
        question: 'Mô tả cách bạn xử lý khi có conflict trong team.',
        type: 'text',
        options: null,
        explanation:
            'Các bước xử lý conflict: Lắng nghe các bên, tìm hiểu nguyên nhân gốc, tìm điểm chung, đề xuất giải pháp win-win, theo dõi sau khi giải quyết.',
        points: 3,
        difficulty: 'hard',
        category: 'soft_skills',
        tags: ['conflict-resolution', 'teamwork', 'communication'],
        status: 'active',
        date_created: '2024-01-29T14:00:00Z',
        user_created: 'user-002',
    },
];

/**
 * Helper function để lấy câu hỏi theo filters
 * @param {Object} filters - Các bộ lọc { category, difficulty, type, search, status }
 * @returns {Array} Danh sách câu hỏi đã lọc
 */
export const getFilteredQuestions = (filters = {}) => {
    const { category, difficulty, type, search, status = 'active' } = filters;

    return mockQuestionBank.filter(q => {
        // Filter by status
        if (status && q.status !== status) return false;

        // Filter by category
        if (category && q.category !== category) return false;

        // Filter by difficulty
        if (difficulty && q.difficulty !== difficulty) return false;

        // Filter by type
        if (type && q.type !== type) return false;

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            const matchQuestion = q.question.toLowerCase().includes(searchLower);
            const matchTags = q.tags?.some(tag => tag.toLowerCase().includes(searchLower));
            if (!matchQuestion && !matchTags) return false;
        }

        return true;
    });
};

/**
 * Helper function để lấy câu hỏi theo ID
 * @param {string} id - ID câu hỏi
 * @returns {Object|null} Câu hỏi hoặc null
 */
export const getQuestionById = id => {
    return mockQuestionBank.find(q => q.id === id) || null;
};

/**
 * Helper function để lấy statistics
 * @returns {Object} Thống kê câu hỏi
 */
export const getQuestionStats = () => {
    const active = mockQuestionBank.filter(q => q.status === 'active');

    return {
        total: mockQuestionBank.length,
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
};
