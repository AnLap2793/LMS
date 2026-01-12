import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { readMe, readUserPermissions } from '@directus/sdk';
import { directus } from '../services/directus';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Lấy permissions của user sử dụng readUserPermissions() từ SDK
   * Đây là cách đơn giản và đáng tin cậy nhất để lấy tất cả permissions cho user hiện tại.
   * Định dạng response: { data: { collection_name: { action: { access, fields } } } }
   */
  const hydratePermissions = useCallback(async () => {
    try {
      const response = await directus.request(readUserPermissions());
      // Trích xuất thuộc tính data từ response
      const permissions = response?.data || response || {};
      return permissions;
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      return {};
    }
  }, []);

  const processAuth = useCallback(async (currentUser) => {
    if (!currentUser) return null;
    
    // Hydrate permissions sử dụng readUserPermissions()
    const permissions = await hydratePermissions();
    
    // Gắn permissions vào đối tượng user
    return {
      ...currentUser,
      all_permissions: permissions
    };
  }, [hydratePermissions]);

  // Khởi tạo Auth khi mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await directus.request(readMe());
        const enhancedUser = await processAuth(currentUser);
        setUser(enhancedUser);
      } catch {
        // Token không hợp lệ hoặc đã hết hạn
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [processAuth]);

  const refreshAuth = useCallback(async () => {
    try {
      const currentUser = await directus.request(readMe());
      const enhancedUser = await processAuth(currentUser);
      setUser(enhancedUser);
    } catch (error) {
      console.error("Refresh auth error:", error);
      setUser(null);
    }
  }, [processAuth]);

  const login = useCallback(async (email, password) => {
    try {
      await directus.login({ email, password });
      const currentUser = await directus.request(readMe());
      const enhancedUser = await processAuth(currentUser);
      setUser(enhancedUser);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }, [processAuth]);

  const logout = useCallback(async () => {
    try {
      await directus.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn set user về null ngay cả khi logout fail
      setUser(null);
    }
  }, []);

  const contextValue = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    refreshAuth
  }), [user, login, logout, loading, refreshAuth]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
