/**
 * Query Keys tập trung cho TanStack Query
 * Xem TEMPLATE_GUIDE.md để biết hướng dẫn chi tiết
 */
export const queryKeys = {
    /**
     * User query keys
     */
    users: {
        all: ['users'],
        lists: () => [...queryKeys.users.all, 'list'],
        list: filters => [...queryKeys.users.lists(), { filters }],
        details: () => [...queryKeys.users.all, 'detail'],
        detail: id => [...queryKeys.users.details(), id],
    },

    /**
     * LMS - Tags query keys
     */
    tags: {
        all: ['tags'],
        lists: () => [...queryKeys.tags.all, 'list'],
        list: filters => [...queryKeys.tags.lists(), { filters }],
        details: () => [...queryKeys.tags.all, 'detail'],
        detail: id => [...queryKeys.tags.details(), id],
    },

    /**
     * LMS - Courses query keys
     */
    courses: {
        all: ['courses'],
        lists: () => [...queryKeys.courses.all, 'list'],
        list: filters => [...queryKeys.courses.lists(), { filters }],
        details: () => [...queryKeys.courses.all, 'detail'],
        detail: id => [...queryKeys.courses.details(), id],
    },

    /**
     * LMS - Modules query keys
     */
    modules: {
        all: ['modules'],
        byCourse: courseId => [...queryKeys.modules.all, 'course', courseId],
        detail: id => [...queryKeys.modules.all, 'detail', id],
    },

    /**
     * LMS - Lessons query keys
     */
    lessons: {
        all: ['lessons'],
        byModule: moduleId => [...queryKeys.lessons.all, 'module', moduleId],
        detail: id => [...queryKeys.lessons.all, 'detail', id],
    },

    /**
     * LMS - Enrollments query keys
     */
    enrollments: {
        all: ['enrollments'],
        mine: () => [...queryKeys.enrollments.all, 'mine'],
        byCourse: courseId => [...queryKeys.enrollments.all, 'course', courseId],
        byUser: userId => [...queryKeys.enrollments.all, 'user', userId],
    },

    /**
     * LMS - Learning Paths query keys
     */
    learningPaths: {
        all: ['learning-paths'],
        lists: () => [...queryKeys.learningPaths.all, 'list'],
        list: filters => [...queryKeys.learningPaths.lists(), { filters }],
        detail: id => [...queryKeys.learningPaths.all, 'detail', id],
    },

    /**
     * LMS - Dashboard stats
     */
    dashboard: {
        stats: ['dashboard', 'stats'],
        popularCourses: ['dashboard', 'popular-courses'],
        atRiskLearners: ['dashboard', 'at-risk-learners'],
        recentActivity: ['dashboard', 'recent-activity'],
    },
};
