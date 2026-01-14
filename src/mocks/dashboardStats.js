/**
 * Mock Data - Dashboard Statistics
 */
export const mockDashboardStats = {
    totalCourses: 24,
    totalLearners: 156,
    completedEnrollments: 89,
    completionRate: 57,
    coursesThisWeek: 3,
    learnersThisWeek: 12,
    completedThisWeek: 8,
    rateChange: 5, // percentage change
};

export const mockPopularCourses = [
    { id: '1', title: 'Onboarding cho Nhân viên mới', completionRate: 85, enrollments: 45 },
    { id: '2', title: 'An toàn lao động và PCCC', completionRate: 72, enrollments: 120 },
    { id: '5', title: 'Quản lý thời gian hiệu quả', completionRate: 58, enrollments: 67 },
    { id: '4', title: 'React Advanced Patterns', completionRate: 34, enrollments: 23 },
];

export const mockAtRiskLearners = [
    {
        id: 'u1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@company.com',
        avatar: null,
        course: 'Onboarding cho Nhân viên mới',
        courseId: '1',
        daysUntilDeadline: 2,
        progress: 45,
    },
    {
        id: 'u2',
        name: 'Trần Thị B',
        email: 'tranthib@company.com',
        avatar: null,
        course: 'An toàn lao động và PCCC',
        courseId: '2',
        daysUntilDeadline: 1,
        progress: 30,
    },
    {
        id: 'u3',
        name: 'Lê Văn C',
        email: 'levanc@company.com',
        avatar: null,
        course: 'React Advanced Patterns',
        courseId: '4',
        daysUntilDeadline: -3, // overdue
        progress: 60,
    },
    {
        id: 'u4',
        name: 'Phạm Thị D',
        email: 'phamthid@company.com',
        avatar: null,
        course: 'Quản lý thời gian hiệu quả',
        courseId: '5',
        daysUntilDeadline: 5,
        progress: 20,
    },
];

export const mockRecentActivity = [
    {
        id: 'a1',
        type: 'completion',
        user: 'Hoàng Văn E',
        action: 'đã hoàn thành khóa học',
        target: 'Onboarding cho Nhân viên mới',
        timestamp: '2024-03-10T14:30:00Z',
    },
    {
        id: 'a2',
        type: 'enrollment',
        user: 'Nguyễn Thị F',
        action: 'đã đăng ký khóa học',
        target: 'React Advanced Patterns',
        timestamp: '2024-03-10T13:15:00Z',
    },
    {
        id: 'a3',
        type: 'quiz_pass',
        user: 'Trần Văn G',
        action: 'đã vượt qua bài kiểm tra',
        target: 'An toàn lao động - Module 2',
        timestamp: '2024-03-10T11:45:00Z',
    },
    {
        id: 'a4',
        type: 'course_created',
        user: 'Admin',
        action: 'đã tạo khóa học mới',
        target: 'Kỹ năng đàm phán',
        timestamp: '2024-03-10T09:00:00Z',
    },
    {
        id: 'a5',
        type: 'certificate',
        user: 'Lê Thị H',
        action: 'đã nhận chứng chỉ',
        target: 'Quản lý thời gian hiệu quả',
        timestamp: '2024-03-09T16:20:00Z',
    },
];

/**
 * Mock monthly progress data for charts
 */
export const mockMonthlyProgress = [
    { month: 'T1', enrollments: 45, completions: 32 },
    { month: 'T2', enrollments: 52, completions: 38 },
    { month: 'T3', enrollments: 48, completions: 41 },
    { month: 'T4', enrollments: 61, completions: 45 },
    { month: 'T5', enrollments: 55, completions: 48 },
    { month: 'T6', enrollments: 67, completions: 52 },
];

/**
 * Mock department progress data
 */
export const mockDepartmentProgress = [
    { department: 'IT', code: 'it', totalEmployees: 15, enrolled: 12, completed: 8, completionRate: 67 },
    { department: 'HR', code: 'hr', totalEmployees: 8, enrolled: 8, completed: 6, completionRate: 75 },
    { department: 'Sales', code: 'sales', totalEmployees: 25, enrolled: 20, completed: 12, completionRate: 60 },
    { department: 'Marketing', code: 'marketing', totalEmployees: 10, enrolled: 8, completed: 5, completionRate: 63 },
    { department: 'Finance', code: 'finance', totalEmployees: 6, enrolled: 6, completed: 5, completionRate: 83 },
    {
        department: 'Operations',
        code: 'operations',
        totalEmployees: 12,
        enrolled: 10,
        completed: 6,
        completionRate: 60,
    },
];

/**
 * Mock quiz statistics
 */
export const mockQuizStats = {
    totalQuizzes: 12,
    totalAttempts: 245,
    averageScore: 78,
    passRate: 82,
    attemptsThisWeek: 34,
};

/**
 * Mock course by status
 */
export const mockCoursesByStatus = [
    { status: 'published', label: 'Đã xuất bản', count: 18, color: '#52c41a' },
    { status: 'draft', label: 'Nháp', count: 4, color: '#faad14' },
    { status: 'archived', label: 'Lưu trữ', count: 2, color: '#999' },
];

/**
 * Mock certificates issued stats
 */
export const mockCertificateStats = {
    totalIssued: 89,
    issuedThisMonth: 12,
    issuedThisWeek: 5,
    topCourse: { id: '1', title: 'Onboarding cho Nhân viên mới', count: 45 },
};

// ============================================
// Learner Dashboard Statistics
// ============================================

/**
 * Mock learner weekly activity data
 * Số phút học tập trong 7 ngày gần nhất
 */
export const mockLearnerWeeklyActivity = [
    { day: 'T2', minutes: 45, lessons: 2 },
    { day: 'T3', minutes: 30, lessons: 1 },
    { day: 'T4', minutes: 60, lessons: 3 },
    { day: 'T5', minutes: 0, lessons: 0 },
    { day: 'T6', minutes: 90, lessons: 4 },
    { day: 'T7', minutes: 25, lessons: 1 },
    { day: 'CN', minutes: 45, lessons: 2 },
];

/**
 * Mock learner skills radar data
 * Dựa trên các khóa học đã hoàn thành theo tag
 */
export const mockLearnerSkills = [
    { skill: 'Chuyên môn', value: 85, fullMark: 100 },
    { skill: 'Kỹ năng mềm', value: 65, fullMark: 100 },
    { skill: 'Lãnh đạo', value: 40, fullMark: 100 },
    { skill: 'An toàn', value: 90, fullMark: 100 },
    { skill: 'Bán hàng', value: 55, fullMark: 100 },
    { skill: 'Onboarding', value: 100, fullMark: 100 },
];

/**
 * Mock learner learning streak
 */
export const mockLearnerStreak = {
    currentStreak: 5, // số ngày liên tục học
    longestStreak: 12,
    totalLearningDays: 45,
    totalMinutes: 1250,
    averageMinutesPerDay: 28,
};
