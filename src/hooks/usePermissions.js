import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * usePermissions Hook
 *
 * Hook này cung cấp các phương thức để kiểm tra quyền truy cập (Permissions)
 * dựa trên dữ liệu đã được hydrate từ Directus SDK (readUserPermissions).
 *
 * Dữ liệu permissions được lấy từ user.all_permissions trong AuthContext.
 *
 * @returns {Object} Các hàm kiểm tra quyền
 */
export function usePermissions() {
    const { user } = useAuth();

    /**
     * Helper kiểm tra quyền cơ bản
     * @param {string} collection - Tên collection
     * @param {string} action - Hành động (read, create, update, delete, share)
     * @returns {boolean}
     */
    const hasPermission = useCallback(
        (collection, action) => {
            const perms = user?.all_permissions;
            if (!perms || typeof perms !== 'object') return false;

            const collectionPerms = perms[collection];
            if (!collectionPerms || !collectionPerms[action]) return false;

            const actionPerm = collectionPerms[action];

            // Kiểm tra access level
            return actionPerm.access === 'full' || actionPerm.access === 'partial';
        },
        [user]
    );

    /**
     * Helper kiểm tra quyền trên field cụ thể
     * @param {string} collection - Tên collection
     * @param {string} action - Hành động (read, update)
     * @param {string} fieldName - Tên field cần kiểm tra
     * @returns {boolean}
     */
    const hasFieldPermission = useCallback(
        (collection, action, fieldName) => {
            const perms = user?.all_permissions;
            if (!perms || typeof perms !== 'object') return false;

            const collectionPerms = perms[collection];
            if (!collectionPerms || !collectionPerms[action]) return false;

            const actionPerm = collectionPerms[action];

            // 1. Kiểm tra access level
            if (actionPerm.access === 'none') return false;

            // 2. Nếu access là full, thường fields sẽ là ["*"] hoặc không bị giới hạn
            // Tuy nhiên Directus vẫn trả về fields array.
            const allowedFields = actionPerm.fields;

            // Nếu fields là "*" hoặc undefined/null (trường hợp full access ngầm định) -> Cho phép
            if (!allowedFields || allowedFields === '*') return true;

            // Nếu là array, kiểm tra xem field có trong danh sách không
            if (Array.isArray(allowedFields)) {
                return allowedFields.includes('*') || allowedFields.includes(fieldName);
            }

            return false;
        },
        [user]
    );

    // ==========================================
    // Public API
    // ==========================================

    /**
     * Kiểm tra quyền ĐỌC (Read) trên collection
     * @param {string} collection
     * @returns {boolean}
     */
    const canRead = useCallback(collection => hasPermission(collection, 'read'), [hasPermission]);

    /**
     * Kiểm tra quyền TẠO (Create) trên collection
     * @param {string} collection
     * @returns {boolean}
     */
    const canCreate = useCallback(collection => hasPermission(collection, 'create'), [hasPermission]);

    /**
     * Kiểm tra quyền SỬA (Update) trên collection
     * @param {string} collection
     * @returns {boolean}
     */
    const canUpdate = useCallback(collection => hasPermission(collection, 'update'), [hasPermission]);

    /**
     * Kiểm tra quyền XÓA (Delete) trên collection
     * @param {string} collection
     * @returns {boolean}
     */
    const canDelete = useCallback(collection => hasPermission(collection, 'delete'), [hasPermission]);

    /**
     * Kiểm tra quyền SỬA trên một field cụ thể
     * Thường dùng để disable input form
     *
     * @param {string} collection
     * @param {string} fieldName
     * @returns {boolean}
     */
    const canEditField = useCallback(
        (collection, fieldName) => hasFieldPermission(collection, 'update', fieldName),
        [hasFieldPermission]
    );

    /**
     * Kiểm tra quyền ĐỌC trên một field cụ thể
     * Thường dùng để ẩn/hiện cột trong bảng hoặc thông tin nhạy cảm
     *
     * @param {string} collection
     * @param {string} fieldName
     * @returns {boolean}
     */
    const canReadField = useCallback(
        (collection, fieldName) => hasFieldPermission(collection, 'read', fieldName),
        [hasFieldPermission]
    );

    return {
        // Collection Level
        canRead,
        canCreate,
        canUpdate,
        canDelete,

        // Field Level
        canEditField,
        canReadField,

        // Raw Check (Advanced)
        hasPermission,
        hasFieldPermission,
    };
}
