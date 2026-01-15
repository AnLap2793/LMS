import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { USER_ROLES } from '../constants/roles';
import AppLayout from '../components/layout/AppLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';

// Error pages
const NotFoundPage = lazy(() => import('../pages/error/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../pages/error/UnauthorizedPage'));
const ErrorPage = lazy(() => import('../pages/error/ErrorPage'));

// Public pages
const HomePage = lazy(() => import('../pages/public/HomePage'));
const LoginPage = lazy(() => import('../pages/public/LoginPage'));
const RegisterPage = lazy(() => import('../pages/public/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/public/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/public/ResetPasswordPage'));

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

// Document Library (Admin)
const DocumentLibraryPage = lazy(() => import('../pages/private/admin/documents/DocumentLibraryPage'));

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
const AdminQuizAttemptDetailPage = lazy(() => import('../pages/private/admin/quiz-attempts/QuizAttemptDetailPage'));

/**
 * Cấu hình Routes của ứng dụng
 *
 * Route Structure:
 * - Public routes: /, /login
 * - Learner routes: /my-courses, /courses, /learn/:courseId, etc. (yêu cầu đăng nhập)
 * - Admin routes: /admin/* (yêu cầu đăng nhập + role Admin/Manager)
 * - Error routes: /unauthorized, /404, * (catch-all)
 */
export const router = createBrowserRouter([
    // ============================================
    // ERROR ROUTES
    // ============================================
    {
        path: '/unauthorized',
        element: <UnauthorizedPage />,
    },
    {
        path: '/404',
        element: <NotFoundPage />,
    },

    // ============================================
    // PUBLIC ROUTES
    // ============================================
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
    },
    {
        path: '/reset-password',
        element: <ResetPasswordPage />,
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <AppLayout>
                    <HomePage />
                </AppLayout>
            </ProtectedRoute>
        ),
    },

    // ============================================
    // LEARNER ROUTES (Yêu cầu đăng nhập)
    // ============================================
    {
        path: '/my-courses',
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <MyCoursesPage />,
            },
        ],
    },
    {
        path: '/courses',
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
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
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
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
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <MyCertificatesPage />,
            },
        ],
    },
    {
        path: '/profile',
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <ProfilePage />,
            },
        ],
    },
    {
        path: '/notifications',
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
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
        element: (
            <ProtectedRoute>
                <CourseLearningPage />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/learn/:courseId/:lessonId',
        element: (
            <ProtectedRoute>
                <CourseLearningPage />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
    },
    // Quiz routes (full screen)
    {
        path: '/quiz/:quizId',
        element: (
            <ProtectedRoute>
                <QuizTakingPage />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/quiz/:quizId/result',
        element: (
            <ProtectedRoute>
                <QuizResultPage />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
    },
    // Quiz History (Learner)
    {
        path: '/quiz-history',
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <QuizHistoryPage />,
            },
        ],
    },
    {
        path: '/quiz-history/:attemptId',
        element: (
            <ProtectedRoute>
                <QuizAttemptDetailPage />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
    },

    // ============================================
    // ADMIN ROUTES (Yêu cầu đăng nhập + role Admin/Manager)
    // ============================================
    {
        path: '/admin',
        element: (
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DIRECTOR, USER_ROLES.HEAD_OF_DEPARTMENT]}>
                <AdminLayout />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
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
            // Document Library
            {
                path: 'documents',
                element: <DocumentLibraryPage />,
            },
            // Quiz Attempts (Admin)
            {
                path: 'quiz-attempts/:id',
                element: <AdminQuizAttemptDetailPage />,
            },
        ],
    },

    // ============================================
    // CATCH-ALL ROUTE (404)
    // ============================================
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);
