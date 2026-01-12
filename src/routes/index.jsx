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
const CertificateTemplatesPage = lazy(() => import('../pages/private/admin/certificates/CertificateTemplatesPage'));
const SettingsPage = lazy(() => import('../pages/private/admin/settings/SettingsPage'));

// Quiz Pages
const QuizListPage = lazy(() => import('../pages/private/admin/quizzes/QuizListPage'));
const QuizQuestionsPage = lazy(() => import('../pages/private/admin/quizzes/QuizQuestionsPage'));

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
        ],
    },
]);
