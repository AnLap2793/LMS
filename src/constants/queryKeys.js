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
     * LMS - Lesson Documents query keys
     */
    lessonDocuments: {
        all: ['lesson-documents'],
        byLesson: lessonId => [...queryKeys.lessonDocuments.all, 'lesson', lessonId],
        detail: id => [...queryKeys.lessonDocuments.all, 'detail', id],
    },

    /**
     * LMS - Documents (Thư viện Tài liệu) query keys
     */
    documents: {
        all: ['documents'],
        lists: () => [...queryKeys.documents.all, 'list'],
        list: filters => [...queryKeys.documents.lists(), { filters }],
        details: () => [...queryKeys.documents.all, 'detail'],
        detail: id => [...queryKeys.documents.details(), id],
        byLesson: lessonId => [...queryKeys.documents.all, 'lesson', lessonId],
        usageStats: id => [...queryKeys.documents.all, 'usage', id],
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
     * LMS - Quizzes query keys
     */
    quizzes: {
        all: ['quizzes'],
        lists: () => [...queryKeys.quizzes.all, 'list'],
        list: filters => [...queryKeys.quizzes.lists(), { filters }],
        detail: id => [...queryKeys.quizzes.all, 'detail', id],
        byLesson: lessonId => [...queryKeys.quizzes.all, 'lesson', lessonId],
    },

    /**
     * LMS - Quiz Questions query keys
     */
    quizQuestions: {
        all: ['quiz-questions'],
        byQuiz: quizId => [...queryKeys.quizQuestions.all, 'quiz', quizId],
    },

    /**
     * LMS - Question Bank query keys
     */
    questionBank: {
        all: ['question-bank'],
        lists: () => [...queryKeys.questionBank.all, 'list'],
        list: filters => [...queryKeys.questionBank.lists(), { filters }],
        details: () => [...queryKeys.questionBank.all, 'detail'],
        detail: id => [...queryKeys.questionBank.details(), id],
    },

    /**
     * LMS - Quiz Attempts query keys
     */
    quizAttempts: {
        all: ['quiz-attempts'],
        mine: () => [...queryKeys.quizAttempts.all, 'mine'],
        byQuiz: quizId => [...queryKeys.quizAttempts.all, 'quiz', quizId],
        detail: id => [...queryKeys.quizAttempts.all, 'detail', id],
    },

    /**
     * LMS - Lesson Progress query keys
     */
    lessonProgress: {
        all: ['lesson-progress'],
        mine: () => [...queryKeys.lessonProgress.all, 'mine'],
        byEnrollment: enrollmentId => [...queryKeys.lessonProgress.all, 'enrollment', enrollmentId],
        byLesson: lessonId => [...queryKeys.lessonProgress.all, 'lesson', lessonId],
    },

    /**
     * LMS - Certificates query keys
     */
    certificates: {
        all: ['certificates'],
        mine: () => [...queryKeys.certificates.all, 'mine'],
        byUser: userId => [...queryKeys.certificates.all, 'user', userId],
        detail: id => [...queryKeys.certificates.all, 'detail', id],
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

    /**
     * Learner Home - Featured content
     */
    home: {
        featured: ['home', 'featured'],
        continueLearning: ['home', 'continue-learning'],
        recentActivity: ['home', 'recent-activity'],
    },
};
