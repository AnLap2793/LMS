/**
 * Mock Data - Learning Paths
 * Lộ trình học tập
 */
export const mockLearningPaths = [
    {
        id: 'lp1',
        title: 'Onboarding Nhân viên mới',
        description:
            'Lộ trình bắt buộc cho tất cả nhân viên mới, bao gồm các khóa học về công ty, quy trình và an toàn lao động.',
        is_mandatory: true,
        department_filter: [],
        position_filter: [],
        status: 'published',
        user_created: { id: 'admin', first_name: 'Admin', last_name: 'User' },
        date_created: '2024-01-10T10:00:00Z',
        courses: [
            { id: '1', title: 'Onboarding cho Nhân viên mới', sort: 1 },
            { id: '2', title: 'An toàn lao động và PCCC', sort: 2 },
            { id: '5', title: 'Quản lý thời gian hiệu quả', sort: 3 },
        ],
        total_duration: 270, // minutes
        enrollments_count: 45,
    },
    {
        id: 'lp2',
        title: 'Phát triển Kỹ năng mềm',
        description: 'Lộ trình nâng cao kỹ năng giao tiếp, quản lý thời gian và làm việc nhóm.',
        is_mandatory: false,
        department_filter: ['sales', 'hr', 'marketing'],
        position_filter: [],
        status: 'published',
        user_created: { id: 'admin', first_name: 'Admin', last_name: 'User' },
        date_created: '2024-02-01T10:00:00Z',
        courses: [
            { id: '3', title: 'Kỹ năng giao tiếp hiệu quả', sort: 1 },
            { id: '5', title: 'Quản lý thời gian hiệu quả', sort: 2 },
        ],
        total_duration: 240,
        enrollments_count: 28,
    },
    {
        id: 'lp3',
        title: 'Technical Training - Frontend',
        description: 'Lộ trình đào tạo kỹ thuật cho Frontend Developer, từ cơ bản đến nâng cao.',
        is_mandatory: true,
        department_filter: ['it'],
        position_filter: ['frontend-developer', 'fullstack-developer'],
        status: 'published',
        user_created: { id: 'admin', first_name: 'Admin', last_name: 'User' },
        date_created: '2024-02-15T10:00:00Z',
        courses: [{ id: '4', title: 'React Advanced Patterns', sort: 1 }],
        total_duration: 240,
        enrollments_count: 12,
    },
    {
        id: 'lp4',
        title: 'Leadership Development',
        description: 'Lộ trình phát triển kỹ năng lãnh đạo cho các quản lý cấp trung.',
        is_mandatory: false,
        department_filter: [],
        position_filter: ['team-lead', 'manager'],
        status: 'draft',
        user_created: { id: 'admin', first_name: 'Admin', last_name: 'User' },
        date_created: '2024-03-01T10:00:00Z',
        courses: [
            { id: '6', title: 'Kỹ năng lãnh đạo cơ bản', sort: 1 },
            { id: '3', title: 'Kỹ năng giao tiếp hiệu quả', sort: 2 },
        ],
        total_duration: 330,
        enrollments_count: 0,
    },
];
