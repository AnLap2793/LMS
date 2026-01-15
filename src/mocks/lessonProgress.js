/**
 * Mock Data - Lesson Progress
 * Tiến độ học bài học của learner
 */
export const mockLessonProgress = [
    // User 1 - Nguyễn Văn A - Course 1 (45% progress)
    {
        id: 'lp1',
        enrollment_id: 'e1',
        user_id: 'u1',
        lesson_id: 'l1',
        lesson: { id: 'l1', title: 'Lịch sử hình thành công ty', type: 'video', duration: 15 },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 900, // seconds
        started_at: '2024-02-01T10:00:00Z',
        completed_at: '2024-02-01T10:15:00Z',
        last_position: null, // video position
    },
    {
        id: 'lp2',
        enrollment_id: 'e1',
        user_id: 'u1',
        lesson_id: 'l2',
        lesson: { id: 'l2', title: 'Tầm nhìn và sứ mệnh', type: 'article', duration: 10 },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 480,
        started_at: '2024-02-01T10:20:00Z',
        completed_at: '2024-02-01T10:28:00Z',
        last_position: null,
    },
    {
        id: 'lp3',
        enrollment_id: 'e1',
        user_id: 'u1',
        lesson_id: 'l3',
        lesson: { id: 'l3', title: 'Sổ tay nhân viên', type: 'file', duration: null },
        status: 'in_progress',
        progress_percentage: 50,
        time_spent: 120,
        started_at: '2024-02-02T09:00:00Z',
        completed_at: null,
        last_position: null,
    },
    {
        id: 'lp4',
        enrollment_id: 'e1',
        user_id: 'u1',
        lesson_id: 'l4',
        lesson: { id: 'l4', title: 'Quy trình nghỉ phép', type: 'video', duration: 8 },
        status: 'not_started',
        progress_percentage: 0,
        time_spent: 0,
        started_at: null,
        completed_at: null,
        last_position: null,
    },

    // User 1 - Course 4 React (60% progress)
    {
        id: 'lp5',
        enrollment_id: 'e2',
        user_id: 'u1',
        lesson_id: 'l7',
        lesson: { id: 'l7', title: 'Giới thiệu về Custom Hooks', type: 'video', duration: 20 },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 1200,
        started_at: '2024-02-15T10:00:00Z',
        completed_at: '2024-02-15T10:20:00Z',
        last_position: null,
    },
    {
        id: 'lp6',
        enrollment_id: 'e2',
        user_id: 'u1',
        lesson_id: 'l8',
        lesson: { id: 'l8', title: 'Xây dựng useLocalStorage hook', type: 'article', duration: 15 },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 720,
        started_at: '2024-02-15T10:30:00Z',
        completed_at: '2024-02-15T10:42:00Z',
        last_position: null,
    },
    {
        id: 'lp7',
        enrollment_id: 'e2',
        user_id: 'u1',
        lesson_id: 'l9',
        lesson: { id: 'l9', title: 'Giới thiệu Compound Components', type: 'video', duration: 25 },
        status: 'in_progress',
        progress_percentage: 60,
        time_spent: 900,
        started_at: '2024-02-16T14:00:00Z',
        completed_at: null,
        last_position: 900, // 15 minutes
    },

    // User 2 - Trần Thị B - Course 1 (100% completed)
    {
        id: 'lp8',
        enrollment_id: 'e3',
        user_id: 'u2',
        lesson_id: 'l1',
        lesson: { id: 'l1', title: 'Lịch sử hình thành công ty', type: 'video', duration: 15 },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 900,
        started_at: '2024-01-20T10:00:00Z',
        completed_at: '2024-01-20T10:15:00Z',
        last_position: null,
    },
    {
        id: 'lp9',
        enrollment_id: 'e3',
        user_id: 'u2',
        lesson_id: 'l2',
        lesson: { id: 'l2', title: 'Tầm nhìn và sứ mệnh', type: 'article', duration: 10 },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 600,
        started_at: '2024-01-20T10:20:00Z',
        completed_at: '2024-01-20T10:30:00Z',
        last_position: null,
    },
    {
        id: 'lp10',
        enrollment_id: 'e3',
        user_id: 'u2',
        lesson_id: 'l3',
        lesson: { id: 'l3', title: 'Sổ tay nhân viên', type: 'file', duration: null },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 300,
        started_at: '2024-01-21T09:00:00Z',
        completed_at: '2024-01-21T09:05:00Z',
        last_position: null,
    },
    {
        id: 'lp11',
        enrollment_id: 'e3',
        user_id: 'u2',
        lesson_id: 'l4',
        lesson: { id: 'l4', title: 'Quy trình nghỉ phép', type: 'video', duration: 8 },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 480,
        started_at: '2024-01-22T14:00:00Z',
        completed_at: '2024-01-22T14:08:00Z',
        last_position: null,
    },
    {
        id: 'lp12',
        enrollment_id: 'e3',
        user_id: 'u2',
        lesson_id: 'l5',
        lesson: { id: 'l5', title: 'Portal HR', type: 'link', duration: null },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 120,
        started_at: '2024-01-22T14:15:00Z',
        completed_at: '2024-01-22T14:17:00Z',
        last_position: null,
    },
    {
        id: 'lp13',
        enrollment_id: 'e3',
        user_id: 'u2',
        lesson_id: 'l6',
        lesson: { id: 'l6', title: 'Kiểm tra kiến thức Module 2', type: 'quiz', duration: 10 },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 600,
        started_at: '2024-01-25T14:00:00Z',
        completed_at: '2024-01-25T14:10:00Z',
        last_position: null,
    },

    // User 2 - Course 2 (30% progress)
    {
        id: 'lp14',
        enrollment_id: 'e4',
        user_id: 'u2',
        lesson_id: 'l11',
        lesson: { id: 'l11', title: 'Luật an toàn lao động', type: 'video', duration: 20 },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 1200,
        started_at: '2024-02-10T10:00:00Z',
        completed_at: '2024-02-10T10:20:00Z',
        last_position: null,
    },
    {
        id: 'lp15',
        enrollment_id: 'e4',
        user_id: 'u2',
        lesson_id: 'l12',
        lesson: { id: 'l12', title: 'Quy định nội bộ về an toàn', type: 'file', duration: null },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 300,
        started_at: '2024-02-10T10:30:00Z',
        completed_at: '2024-02-10T10:35:00Z',
        last_position: null,
    },
    {
        id: 'lp16',
        enrollment_id: 'e4',
        user_id: 'u2',
        lesson_id: 'l13',
        lesson: { id: 'l13', title: 'Các loại thiết bị bảo hộ', type: 'video', duration: 15 },
        status: 'in_progress',
        progress_percentage: 40,
        time_spent: 360,
        started_at: '2024-02-11T09:00:00Z',
        completed_at: null,
        last_position: 360,
    },

    // User 5 - Hoàng Văn E - Course 4 (100% completed)
    {
        id: 'lp17',
        enrollment_id: 'e9',
        user_id: 'u5',
        lesson_id: 'l7',
        lesson: { id: 'l7', title: 'Giới thiệu về Custom Hooks', type: 'video', duration: 20 },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 1200,
        started_at: '2024-02-05T10:00:00Z',
        completed_at: '2024-02-05T10:20:00Z',
        last_position: null,
    },
    {
        id: 'lp18',
        enrollment_id: 'e9',
        user_id: 'u5',
        lesson_id: 'l8',
        lesson: { id: 'l8', title: 'Xây dựng useLocalStorage hook', type: 'article', duration: 15 },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 900,
        started_at: '2024-02-05T10:30:00Z',
        completed_at: '2024-02-05T10:45:00Z',
        last_position: null,
    },
    {
        id: 'lp19',
        enrollment_id: 'e9',
        user_id: 'u5',
        lesson_id: 'l9',
        lesson: { id: 'l9', title: 'Giới thiệu Compound Components', type: 'video', duration: 25 },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 1500,
        started_at: '2024-02-06T14:00:00Z',
        completed_at: '2024-02-06T14:25:00Z',
        last_position: null,
    },
    {
        id: 'lp20',
        enrollment_id: 'e9',
        user_id: 'u5',
        lesson_id: 'l10',
        lesson: { id: 'l10', title: 'Context API trong React', type: 'article', duration: 20 },
        status: 'completed',
        progress_percentage: 100,
        time_spent: 1200,
        started_at: '2024-02-07T09:00:00Z',
        completed_at: '2024-02-07T09:20:00Z',
        last_position: null,
    },
];

/**
 * Progress Status Constants
 */
export const LESSON_PROGRESS_STATUS = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
};

/**
 * Helper to get lesson progress by enrollment ID
 */
export const getProgressByEnrollmentId = enrollmentId => {
    return mockLessonProgress.filter(lp => lp.enrollment_id === enrollmentId);
};

/**
 * Helper to get lesson progress by user ID
 */
export const getProgressByUserId = userId => {
    return mockLessonProgress.filter(lp => lp.user_id === userId);
};

/**
 * Helper to get progress for a specific lesson
 */
export const getProgressByLessonId = (enrollmentId, lessonId) => {
    return mockLessonProgress.find(lp => lp.enrollment_id === enrollmentId && lp.lesson_id === lessonId);
};

/**
 * Helper to calculate enrollment progress from lesson progress
 */
export const calculateEnrollmentProgress = (enrollmentId, totalLessons) => {
    const progress = getProgressByEnrollmentId(enrollmentId);
    const completedLessons = progress.filter(lp => lp.status === 'completed').length;
    return Math.round((completedLessons / totalLessons) * 100);
};

/**
 * Helper to get total time spent for an enrollment
 */
export const getTotalTimeSpent = enrollmentId => {
    const progress = getProgressByEnrollmentId(enrollmentId);
    return progress.reduce((total, lp) => total + (lp.time_spent || 0), 0);
};
