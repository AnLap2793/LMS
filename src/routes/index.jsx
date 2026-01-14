import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Public pages
const HomePage = lazy(() => import('../pages/public/HomePage'));
const LoginPage = lazy(() => import('../pages/public/LoginPage'));

// Admin pages
const AdminDashboardPage = lazy(() => import('../pages/private/admin/DashboardPage'));
const TagListPage = lazy(() => import('../pages/private/admin/tags/TagListPage'));
const CourseListPage = lazy(() => import('../pages/private/admin/courses/CourseListPage'));
const CourseFormPage = lazy(() => import('../pages/private/admin/courses/CourseFormPage'));
const CourseContentPage = lazy(() => import('../pages/private/admin/courses/CourseContentPage'));
const LearningPathListPage = lazy(() => import('../pages/private/admin/learning-paths/LearningPathListPage'));
const ReportsPage = lazy(() => import('../pages/private/admin/reports/ReportsPage'));
const EmployeeProgressPage = lazy(() => import('../pages/private/admin/reports/EmployeeProgressPage'));
const DepartmentReportPage = lazy(() => import('../pages/private/admin/reports/DepartmentReportPage'));
const CertificateTemplatesPage = lazy(() => import('../pages/private/admin/certificates/CertificateTemplatesPage'));
const SettingsPage = lazy(() => import('../pages/private/admin/settings/SettingsPage'));

// User Management
const UserListPage = lazy(() => import('../pages/private/admin/users/UserListPage'));

// Enrollment Management
const EnrollmentListPage = lazy(() => import('../pages/private/admin/enrollments/EnrollmentListPage'));

// Quiz Pages (Admin)
const QuizListPage = lazy(() => import('../pages/private/admin/quizzes/QuizListPage'));
const QuizQuestionsPage = lazy(() => import('../pages/private/admin/quizzes/QuizQuestionsPage'));
const QuizAnalysisPage = lazy(() => import('../pages/private/admin/quizzes/QuizAnalysisPage'));

// Question Bank (Admin)
const QuestionBankPage = lazy(() => import('../pages/private/admin/questions/QuestionBankPage'));

// Learner pages
const MyCoursesPage = lazy(() => import('../pages/private/learner/MyCoursesPage'));
const CourseLearningPage = lazy(() => import('../pages/private/learner/CourseLearningPage'));
const QuizTakingPage = lazy(() => import('../pages/private/learner/QuizTakingPage'));
const QuizResultPage = lazy(() => import('../pages/private/learner/QuizResultPage'));
const QuizHistoryPage = lazy(() => import('../pages/private/learner/QuizHistoryPage'));
const QuizAttemptDetailPage = lazy(() => import('../pages/private/learner/QuizAttemptDetailPage'));
const MyCertificatesPage = lazy(() => import('../pages/private/learner/MyCertificatesPage'));
const CourseCatalogPage = lazy(() => import('../pages/private/learner/CourseCatalogPage'));
const CourseDetailPage = lazy(() => import('../pages/private/learner/CourseDetailPage'));
const LearningPathCatalogPage = lazy(() => import('../pages/private/learner/LearningPathCatalogPage'));
const LearningPathDetailPage = lazy(() => import('../pages/private/learner/LearningPathDetailPage'));
const ProfilePage = lazy(() => import('../pages/private/learner/ProfilePage'));
const NotificationsPage = lazy(() => import('../pages/private/learner/NotificationsPage'));

// Admin Quiz Attempts
const QuizAttemptsPage = lazy(() => import('../pages/private/admin/quiz-attempts/QuizAttemptsPage'));

/**
 * Cấu hình Routes của ứng dụng
 * Xem TEMPLATE_GUIDE.md để biết hướng dẫn chi tiết
 */
export const router = createBrowserRouter([
    // Public routes
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/',
        element: (
            <AppLayout>
                <HomePage />
            </AppLayout>
        ),
    },

    // Learner routes
    {
        path: '/my-courses',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <MyCoursesPage />,
            },
        ],
    },
    {
        path: '/courses',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <CourseCatalogPage />,
            },
            {
                path: ':courseId',
                element: <CourseDetailPage />,
            },
        ],
    },
    {
        path: '/learning-paths',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <LearningPathCatalogPage />,
            },
            {
                path: ':pathId',
                element: <LearningPathDetailPage />,
            },
        ],
    },
    {
        path: '/my-certificates',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <MyCertificatesPage />,
            },
        ],
    },
    {
        path: '/profile',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <ProfilePage />,
            },
        ],
    },
    {
        path: '/notifications',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <NotificationsPage />,
            },
        ],
    },
    // Course Learning (full screen, no LearnerLayout)
    {
        path: '/learn/:courseId',
        element: <CourseLearningPage />,
    },
    {
        path: '/learn/:courseId/:lessonId',
        element: <CourseLearningPage />,
    },
    // Quiz routes (full screen)
    {
        path: '/quiz/:quizId',
        element: <QuizTakingPage />,
    },
    {
        path: '/quiz/:quizId/result',
        element: <QuizResultPage />,
    },
    // Quiz History (Learner)
    {
        path: '/quiz-history',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <QuizHistoryPage />,
            },
        ],
    },
    {
        path: '/quiz-history/:attemptId',
        element: <QuizAttemptDetailPage />,
    },

    // Admin routes
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <AdminDashboardPage />,
            },
            // Tags
            {
                path: 'tags',
                element: <TagListPage />,
            },
            // Users
            {
                path: 'users',
                element: <UserListPage />,
            },
            // Enrollments
            {
                path: 'enrollments',
                element: <EnrollmentListPage />,
            },
            // Courses
            {
                path: 'courses',
                element: <CourseListPage />,
            },
            {
                path: 'courses/create',
                element: <CourseFormPage />,
            },
            {
                path: 'courses/:id',
                element: <CourseFormPage isEdit />,
            },
            {
                path: 'courses/:id/edit',
                element: <CourseFormPage isEdit />,
            },
            {
                path: 'courses/:id/content',
                element: <CourseContentPage />,
            },
            // Learning Paths
            {
                path: 'learning-paths',
                element: <LearningPathListPage />,
            },
            // Reports
            {
                path: 'reports',
                element: <ReportsPage />,
            },
            {
                path: 'reports/employees',
                element: <EmployeeProgressPage />,
            },
            {
                path: 'reports/departments',
                element: <DepartmentReportPage />,
            },
            // Certificates
            {
                path: 'certificates/templates',
                element: <CertificateTemplatesPage />,
            },
            // Settings
            {
                path: 'settings',
                element: <SettingsPage />,
            },
            // Quiz Management
            {
                path: 'quizzes',
                element: <QuizListPage />,
            },
            {
                path: 'quizzes/:id/questions',
                element: <QuizQuestionsPage />,
            },
            {
                path: 'quizzes/:id/analysis',
                element: <QuizAnalysisPage />,
            },
            // Question Bank
            {
                path: 'questions',
                element: <QuestionBankPage />,
            },
            // Quiz Attempts (Admin)
            {
                path: 'quiz-attempts',
                element: <QuizAttemptsPage />,
            },
        ],
    },
]);
