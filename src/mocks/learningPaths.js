/**
 * Mock Data - Learning Paths
 * Lộ trình học tập
 */
export const mockLearningPaths = [
    {
        id: '1',
        title: 'Onboarding Nhân viên mới',
        description:
            'Lộ trình bắt buộc cho tất cả nhân viên mới, bao gồm các khóa học về công ty, quy trình và an toàn lao động.',
        is_mandatory: true,
        duration_days: 30,
        department_filter: [],
        position_filter: [],
        status: 'published',
        user_created: { id: 'admin', first_name: 'Admin', last_name: 'User' },
        date_created: '2024-01-10T10:00:00Z',
        courses: [
            { id: '1', title: 'Onboarding cho Nhân viên mới', sort: 1 },
            { id: '2', title: 'An toàn lao động và PCCC', sort: 2 },
        ],
        total_duration: 210, // minutes
        enrollments_count: 3200,
    },
    {
        id: '2',
        title: 'Kỹ năng lãnh đạo cho quản lý cấp trung',
        description:
            'Trang bị các kỹ năng quản lý đội nhóm, giao tiếp hiệu quả và giải quyết vấn đề cho các nhà quản lý.',
        is_mandatory: false,
        duration_days: 90,
        department_filter: ['sales', 'hr', 'marketing'],
        position_filter: [],
        status: 'published',
        user_created: { id: 'admin', first_name: 'Admin', last_name: 'User' },
        date_created: '2024-02-01T10:00:00Z',
        courses: [
            { id: '6', title: 'Kỹ năng lãnh đạo cơ bản', sort: 1 },
            { id: '3', title: 'Kỹ năng giao tiếp hiệu quả', sort: 2 },
            { id: '5', title: 'Quản lý thời gian hiệu quả', sort: 3 },
        ],
        total_duration: 390,
        enrollments_count: 850,
    },
    {
        id: '3',
        title: 'Lộ trình Frontend Developer cơ bản',
        description: 'Lộ trình đào tạo kỹ thuật cho Frontend Developer, từ cơ bản đến nâng cao.',
        is_mandatory: true,
        duration_days: 60,
        department_filter: ['it'],
        position_filter: ['frontend-developer', 'fullstack-developer'],
        status: 'published',
        user_created: { id: 'admin', first_name: 'Admin', last_name: 'User' },
        date_created: '2024-02-15T10:00:00Z',
        courses: [{ id: '4', title: 'React Advanced Patterns', sort: 1 }],
        total_duration: 240,
        enrollments_count: 1250,
    },
    {
        id: '4',
        title: 'Kỹ năng văn phòng chuyên nghiệp',
        description: 'Nâng cao hiệu suất làm việc với bộ kỹ năng quản lý thời gian và công việc.',
        is_mandatory: false,
        duration_days: 45,
        department_filter: [],
        position_filter: ['team-lead', 'manager'],
        status: 'published',
        user_created: { id: 'admin', first_name: 'Admin', last_name: 'User' },
        date_created: '2024-03-01T10:00:00Z',
        courses: [
            { id: '5', title: 'Quản lý thời gian hiệu quả', sort: 1 },
            { id: '3', title: 'Kỹ năng giao tiếp hiệu quả', sort: 2 },
        ],
        total_duration: 240,
        enrollments_count: 1500,
    },
    {
        id: '5',
        title: 'Digital Marketing toàn diện',
        description:
            'Khám phá thế giới Digital Marketing với các khóa học về SEO, Content Marketing, và Social Media. (Khóa học demo)',
        total_duration: 300,
        enrollments_count: 2100,
        courses: [
            { id: '3', title: 'Kỹ năng giao tiếp hiệu quả', sort: 1 },
            { id: '4', title: 'React Advanced Patterns', sort: 2 },
        ],
        is_mandatory: false,
    },
];

/**
 * Mock User Learning Path Progress
 * Tiến độ học tập của user trong các lộ trình
 */
export const mockUserLearningPaths = [
    {
        pathId: '1',
        title: 'Onboarding Nhân viên mới',
        progress: 100,
        status: 'completed',
        lastAccessed: '2024-03-15T10:00:00Z',
    },
    {
        pathId: '2',
        title: 'Kỹ năng lãnh đạo cho quản lý cấp trung',
        progress: 45,
        status: 'in_progress',
        lastAccessed: '2024-03-20T14:30:00Z',
    },
    {
        pathId: '3',
        title: 'Lộ trình Frontend Developer cơ bản',
        progress: 15,
        status: 'in_progress',
        lastAccessed: '2024-03-18T09:15:00Z',
    },
];
