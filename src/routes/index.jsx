import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

const HomePage = lazy(() => import('../pages/public/HomePage'));
const LoginPage = lazy(() => import('../pages/public/LoginPage'));

/**
 * Cấu hình Routes của ứng dụng
 * Xem TEMPLATE_GUIDE.md để biết hướng dẫn chi tiết
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout><HomePage /></AppLayout>,
  },
]);

