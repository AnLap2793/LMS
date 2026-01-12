/**
 * Mock Data - Enrollments
 * Dữ liệu đăng ký khóa học
 */
export const mockEnrollments = [
    // User 1 - Nguyễn Văn A
    {
        id: 'e1',
        user_id: 'u1',
        user: { id: 'u1', first_name: 'Nguyễn', last_name: 'Văn A', email: 'nguyenvana@company.com' },
        course_id: '1',
        course: { id: '1', title: 'Onboarding cho Nhân viên mới' },
        assigned_by: null,
        assignment_type: 'individual',
        status: 'in_progress',
        progress_percentage: 45,
        started_at: '2024-02-01T10:00:00Z',
        completed_at: null,
        due_date: '2024-03-15T23:59:59Z',
        date_created: '2024-01-15T10:00:00Z',
    },
    {
        id: 'e2',
        user_id: 'u1',
        user: { id: 'u1', first_name: 'Nguyễn', last_name: 'Văn A', email: 'nguyenvana@company.com' },
        course_id: '4',
        course: { id: '4', title: 'React Advanced Patterns' },
        assigned_by: { id: 'admin', first_name: 'Admin', last_name: 'User' },
        assignment_type: 'individual',
        status: 'in_progress',
        progress_percentage: 60,
        started_at: '2024-02-15T10:00:00Z',
        completed_at: null,
        due_date: '2024-04-01T23:59:59Z',
        date_created: '2024-02-10T10:00:00Z',
    },
    // User 2 - Trần Thị B
    {
        id: 'e3',
        user_id: 'u2',
        user: { id: 'u2', first_name: 'Trần', last_name: 'Thị B', email: 'tranthib@company.com' },
        course_id: '1',
        course: { id: '1', title: 'Onboarding cho Nhân viên mới' },
        assigned_by: null,
        assignment_type: 'department',
        status: 'completed',
        progress_percentage: 100,
        started_at: '2024-01-20T10:00:00Z',
        completed_at: '2024-02-05T15:30:00Z',
        due_date: '2024-02-28T23:59:59Z',
        date_created: '2024-01-15T10:00:00Z',
    },
    {
        id: 'e4',
        user_id: 'u2',
        user: { id: 'u2', first_name: 'Trần', last_name: 'Thị B', email: 'tranthib@company.com' },
        course_id: '2',
        course: { id: '2', title: 'An toàn lao động và PCCC' },
        assigned_by: null,
        assignment_type: 'auto',
        status: 'in_progress',
        progress_percentage: 30,
        started_at: '2024-02-10T10:00:00Z',
        completed_at: null,
        due_date: '2024-03-20T23:59:59Z',
        date_created: '2024-02-01T10:00:00Z',
    },
    // User 3 - Lê Văn C
    {
        id: 'e5',
        user_id: 'u3',
        user: { id: 'u3', first_name: 'Lê', last_name: 'Văn C', email: 'levanc@company.com' },
        course_id: '4',
        course: { id: '4', title: 'React Advanced Patterns' },
        assigned_by: { id: 'u9', first_name: 'Võ', last_name: 'Văn I' },
        assignment_type: 'individual',
        status: 'expired',
        progress_percentage: 60,
        started_at: '2024-01-10T10:00:00Z',
        completed_at: null,
        due_date: '2024-02-28T23:59:59Z',
        date_created: '2024-01-05T10:00:00Z',
    },
    {
        id: 'e6',
        user_id: 'u3',
        user: { id: 'u3', first_name: 'Lê', last_name: 'Văn C', email: 'levanc@company.com' },
        course_id: '3',
        course: { id: '3', title: 'Kỹ năng giao tiếp hiệu quả' },
        assigned_by: null,
        assignment_type: 'individual',
        status: 'assigned',
        progress_percentage: 0,
        started_at: null,
        completed_at: null,
        due_date: '2024-04-15T23:59:59Z',
        date_created: '2024-03-01T10:00:00Z',
    },
    // User 4 - Phạm Thị D
    {
        id: 'e7',
        user_id: 'u4',
        user: { id: 'u4', first_name: 'Phạm', last_name: 'Thị D', email: 'phamthid@company.com' },
        course_id: '5',
        course: { id: '5', title: 'Quản lý thời gian hiệu quả' },
        assigned_by: null,
        assignment_type: 'individual',
        status: 'in_progress',
        progress_percentage: 20,
        started_at: '2024-03-01T10:00:00Z',
        completed_at: null,
        due_date: '2024-03-20T23:59:59Z',
        date_created: '2024-02-25T10:00:00Z',
    },
    // User 5 - Hoàng Văn E
    {
        id: 'e8',
        user_id: 'u5',
        user: { id: 'u5', first_name: 'Hoàng', last_name: 'Văn E', email: 'hoangvane@company.com' },
        course_id: '1',
        course: { id: '1', title: 'Onboarding cho Nhân viên mới' },
        assigned_by: null,
        assignment_type: 'auto',
        status: 'completed',
        progress_percentage: 100,
        started_at: '2024-01-15T10:00:00Z',
        completed_at: '2024-02-01T14:30:00Z',
        due_date: '2024-02-28T23:59:59Z',
        date_created: '2024-01-10T10:00:00Z',
    },
    {
        id: 'e9',
        user_id: 'u5',
        user: { id: 'u5', first_name: 'Hoàng', last_name: 'Văn E', email: 'hoangvane@company.com' },
        course_id: '4',
        course: { id: '4', title: 'React Advanced Patterns' },
        assigned_by: null,
        assignment_type: 'individual',
        status: 'completed',
        progress_percentage: 100,
        started_at: '2024-02-05T10:00:00Z',
        completed_at: '2024-03-01T16:45:00Z',
        due_date: '2024-03-31T23:59:59Z',
        date_created: '2024-02-01T10:00:00Z',
    },
    // User 8 - Lê Thị H (new employee)
    {
        id: 'e10',
        user_id: 'u8',
        user: { id: 'u8', first_name: 'Lê', last_name: 'Thị H', email: 'lethih@company.com' },
        course_id: '1',
        course: { id: '1', title: 'Onboarding cho Nhân viên mới' },
        assigned_by: null,
        assignment_type: 'auto',
        status: 'in_progress',
        progress_percentage: 80,
        started_at: '2024-01-15T10:00:00Z',
        completed_at: null,
        due_date: '2024-02-28T23:59:59Z',
        date_created: '2024-01-12T10:00:00Z',
    },
    {
        id: 'e11',
        user_id: 'u8',
        user: { id: 'u8', first_name: 'Lê', last_name: 'Thị H', email: 'lethih@company.com' },
        course_id: '2',
        course: { id: '2', title: 'An toàn lao động và PCCC' },
        assigned_by: null,
        assignment_type: 'auto',
        status: 'completed',
        progress_percentage: 100,
        started_at: '2024-02-01T10:00:00Z',
        completed_at: '2024-02-20T11:30:00Z',
        due_date: '2024-03-15T23:59:59Z',
        date_created: '2024-01-25T10:00:00Z',
    },
    // User 10 - Đặng Thị K (intern)
    {
        id: 'e12',
        user_id: 'u10',
        user: { id: 'u10', first_name: 'Đặng', last_name: 'Thị K', email: 'dangthik@company.com' },
        course_id: '1',
        course: { id: '1', title: 'Onboarding cho Nhân viên mới' },
        assigned_by: null,
        assignment_type: 'auto',
        status: 'in_progress',
        progress_percentage: 25,
        started_at: '2024-02-05T10:00:00Z',
        completed_at: null,
        due_date: '2024-03-31T23:59:59Z',
        date_created: '2024-02-01T10:00:00Z',
    },
];

/**
 * Helper to get enrollments by user ID
 */
export const getEnrollmentsByUserId = userId => {
    return mockEnrollments.filter(e => e.user_id === userId);
};

/**
 * Helper to get enrollments by course ID
 */
export const getEnrollmentsByCourseId = courseId => {
    return mockEnrollments.filter(e => e.course_id === courseId);
};

/**
 * Helper to get enrollment statistics
 */
export const getEnrollmentStats = () => {
    const total = mockEnrollments.length;
    const completed = mockEnrollments.filter(e => e.status === 'completed').length;
    const inProgress = mockEnrollments.filter(e => e.status === 'in_progress').length;
    const assigned = mockEnrollments.filter(e => e.status === 'assigned').length;
    const expired = mockEnrollments.filter(e => e.status === 'expired').length;

    return {
        total,
        completed,
        inProgress,
        assigned,
        expired,
        completionRate: Math.round((completed / total) * 100),
    };
};
