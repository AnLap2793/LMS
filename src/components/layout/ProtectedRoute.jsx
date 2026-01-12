import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute Component
 * Bảo vệ routes yêu cầu authentication
 * 
 * @example
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Lưu ý: Nếu cần kiểm tra role cụ thể, có thể thêm prop role và logic:
  // if (role && user.role?.name !== role) {
  //   return <Navigate to="/unauthorized" replace />;
  // }
  
  return children;
}
