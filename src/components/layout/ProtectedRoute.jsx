import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../constants/roles';

// Mapping role -> default route
const ROLE_DEFAULT_ROUTES = {
    [USER_ROLES.ADMIN.toLowerCase()]: '/admin',
    [USER_ROLES.DIRECTOR.toLowerCase()]: '/admin',
    [USER_ROLES.HEAD_OF_DEPARTMENT.toLowerCase()]: '/admin',
    [USER_ROLES.TEAM_LEADER.toLowerCase()]: '/my-courses',
    [USER_ROLES.SENIOR_STAFF.toLowerCase()]: '/my-courses',
    [USER_ROLES.STAFF.toLowerCase()]: '/my-courses',
    [USER_ROLES.INTERN.toLowerCase()]: '/my-courses',
};

const getUserRole = user => {
    if (!user) return null;
    const role = user.role?.name || (typeof user.role === 'string' ? user.role : null);
    return role;
};

const getDefaultRouteForRole = roleName => {
    if (!roleName) return '/login';
    const roleKey = roleName.toLowerCase();
    return ROLE_DEFAULT_ROUTES[roleKey] || '/my-courses';
};

function ProtectedRoute({ children, allowedRoles, redirectTo, requireAuth = true }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Đang kiểm tra authentication
    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5f5f5',
                }}
            >
                <Spin size="large" tip="Đang tải..." />
            </div>
        );
    }

    // Kiểm tra authentication - chưa đăng nhập thì redirect về login
    if (requireAuth && !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Nếu không yêu cầu auth và không có user, cho phép truy cập
    if (!requireAuth && !user) {
        return children;
    }

    // Kiểm tra authorization (role-based) - chỉ khi có allowedRoles và có user
    if (allowedRoles && user) {
        const userRole = getUserRole(user);
        const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!userRole) {
            console.warn('ProtectedRoute: User không có role, redirect về login', {
                user: { id: user.id, email: user.email, role: user.role },
            });
            return <Navigate to="/login" state={{ from: location }} replace />;
        }

        // Kiểm tra user có role phù hợp không
        const hasPermission = rolesArray.some(role => {
            // So sánh không phân biệt hoa thường
            const userRoleLower = userRole.toLowerCase().trim();
            const allowedRoleLower = role.toLowerCase().trim();
            return userRoleLower === allowedRoleLower;
        });

        if (!hasPermission) {
            // Nếu có redirectTo custom thì dùng, không thì redirect về trang mặc định của role user
            const targetRedirect = redirectTo || getDefaultRouteForRole(userRole);

            // Redirect đến trang phù hợp với role của user
            return (
                <Navigate
                    to={targetRedirect}
                    state={{
                        from: location,
                        requiredRole: rolesArray.join(' hoặc '),
                        userRole: userRole,
                        message: `Bạn không có quyền truy cập trang này. Yêu cầu role: ${rolesArray.join(' hoặc ')}`,
                    }}
                    replace
                />
            );
        }
    }

    return <>{children}</>;
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    redirectTo: PropTypes.string,
    requireAuth: PropTypes.bool,
};

export default ProtectedRoute;
