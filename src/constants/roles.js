/**
 * User Roles Constants
 * Định nghĩa các role trong hệ thống LMS tương ứng với Directus
 */

export const USER_ROLES = {
    ADMIN: 'Administrator',
    DIRECTOR: 'Giám đốc',
    HEAD_OF_DEPARTMENT: 'Trưởng phòng',
    TEAM_LEADER: 'Trưởng nhóm',
    SENIOR_STAFF: 'Nhân viên cấp cao',
    STAFF: 'Nhân Viên',
    INTERN: 'Thực tập sinh',
};

/**
 * Kiểm tra user có role admin hệ thống không
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isAdmin = user => {
    const role = user?.role?.name || user?.role;
    return role?.toLowerCase() === USER_ROLES.ADMIN.toLowerCase();
};

/**
 * Kiểm tra user có quyền truy cập Admin Dashboard không
 * Chỉ cho phép: Administrator, Giám đốc, Trưởng phòng
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const hasAdminAccess = user => {
    const role = user?.role?.name || user?.role;
    if (!role) return false;

    const roleName = role.toLowerCase();
    const allowedRoles = [
        USER_ROLES.ADMIN.toLowerCase(),
        USER_ROLES.DIRECTOR.toLowerCase(),
        USER_ROLES.HEAD_OF_DEPARTMENT.toLowerCase(),
    ];

    return allowedRoles.includes(roleName);
};

/**
 * Lấy tên role hiển thị
 * @param {Object} user - User object
 * @returns {string}
 */
export const getRoleDisplayName = user => {
    const role = user?.role?.name || user?.role;
    return role || 'Không xác định';
};
