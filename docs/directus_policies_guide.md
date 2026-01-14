# Hướng dẫn Đọc Phân quyền Directus với Policies System

## Tổng quan về Directus Policies (v10+)

Từ Directus v10, hệ thống phân quyền đã thay đổi từ mô hình **Roles → Permissions** sang **Roles → Policies (M2M) → Permissions**.

### Kiến trúc mới:
```
User → Role(s) → Policies (M2M) → Permissions
```

**Lợi ích:**
- Một role có thể có nhiều policies
- Một policy có thể được gán cho nhiều roles (tái sử dụng)
- Dễ quản lý permissions theo nhóm chức năng
- Linh hoạt hơn trong việc kết hợp quyền

---

## 1. Cấu trúc Collections

### `directus_roles`
```javascript
{
  id: "uuid",
  name: "Manager",
  description: "Quản lý nội dung",
  icon: "badge",
  // ... other fields
}
```

### `directus_policies` (Mới từ v10)
```javascript
{
  id: "uuid",
  name: "Content Editor Policy",
  description: "Quyền chỉnh sửa nội dung",
  icon: "edit",
  admin_access: false,
  app_access: true,
  // ... other fields
}
```

### `directus_access` (Junction table M2M)
```javascript
{
  id: "uuid",
  role: "role_uuid",        // FK to directus_roles
  policy: "policy_uuid",    // FK to directus_policies
  sort: 1
}
```

### `directus_permissions`
```javascript
{
  id: "uuid",
  policy: "policy_uuid",    // FK to directus_policies (không còn FK tới role)
  collection: "articles",
  action: "read",
  permissions: { "status": { "_eq": "published" } },
  validation: null,
  fields: ["*"]
}
```

---

## 2. Setup Directus SDK

### Installation
```bash
npm install @directus/sdk
```

### Initialize Client
```javascript
// src/lib/directus.js
import { createDirectus, rest, authentication } from '@directus/sdk';

const directus = createDirectus(process.env.REACT_APP_DIRECTUS_URL)
  .with(authentication('json', { 
    credentials: 'include',
    autoRefresh: true 
  }))
  .with(rest());

export default directus;
```

---

## 3. Đọc Thông tin User và Roles

### 3.1. Lấy User hiện tại với Roles
```javascript
// src/services/userService.js
import directus from '../lib/directus';
import { readMe } from '@directus/sdk';

export const getCurrentUser = async () => {
  try {
    const user = await directus.request(
      readMe({
        fields: [
          '*',
          'role.id',
          'role.name',
          'role.icon',
          'role.description'
        ]
      })
    );
    
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};
```

### 3.2. Lấy tất cả Roles của User (nếu hỗ trợ multi-roles)
```javascript
export const getUserRoles = async (userId) => {
  try {
    const response = await directus.request(
      readItem('directus_users', userId, {
        fields: [
          'role.*',
          // Nếu có custom M2M cho multi-roles
          'user_roles.role_id.*'
        ]
      })
    );
    
    return response;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
};
```

---

## 4. Đọc Policies từ Role (Quan hệ M2M)

### 4.1. Lấy tất cả Policies của một Role
```javascript
// src/services/policyService.js
import directus from '../lib/directus';
import { readItems } from '@directus/sdk';

export const getRolePolicies = async (roleId) => {
  try {
    // Đọc qua junction table directus_access
    const response = await directus.request(
      readItems('directus_access', {
        filter: {
          role: { _eq: roleId }
        },
        fields: [
          'id',
          'sort',
          'policy.id',
          'policy.name',
          'policy.description',
          'policy.icon',
          'policy.admin_access',
          'policy.app_access'
        ],
        sort: ['sort']
      })
    );
    
    // Extract policies từ junction records
    const policies = response.map(access => access.policy);
    
    return policies;
  } catch (error) {
    console.error('Error fetching role policies:', error);
    throw error;
  }
};
```

### 4.2. Kiểm tra User có Admin Access không
```javascript
export const hasAdminAccess = async (roleId) => {
  try {
    const policies = await getRolePolicies(roleId);
    
    // Nếu có bất kỳ policy nào có admin_access = true
    return policies.some(policy => policy.admin_access === true);
  } catch (error) {
    return false;
  }
};
```

---

## 5. Đọc Permissions từ Policies

### 5.1. Lấy tất cả Permissions của một Policy
```javascript
export const getPolicyPermissions = async (policyId) => {
  try {
    const permissions = await directus.request(
      readItems('directus_permissions', {
        filter: {
          policy: { _eq: policyId }
        },
        fields: [
          'id',
          'collection',
          'action',
          'permissions',
          'validation',
          'fields',
          'presets'
        ]
      })
    );
    
    return permissions;
  } catch (error) {
    console.error('Error fetching policy permissions:', error);
    throw error;
  }
};
```

### 5.2. Lấy tất cả Permissions của User (thông qua Roles → Policies)
```javascript
export const getUserPermissions = async (roleId) => {
  try {
    // Bước 1: Lấy tất cả policies của role
    const policies = await getRolePolicies(roleId);
    const policyIds = policies.map(p => p.id);
    
    if (policyIds.length === 0) return [];
    
    // Bước 2: Lấy tất cả permissions của các policies này
    const permissions = await directus.request(
      readItems('directus_permissions', {
        filter: {
          policy: { _in: policyIds }
        },
        fields: [
          'id',
          'policy',
          'collection',
          'action',
          'permissions',
          'validation',
          'fields',
          'presets'
        ]
      })
    );
    
    return permissions;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    throw error;
  }
};
```

---

## 6. Parse Permissions thành Object dễ sử dụng

### 6.1. Transform Permissions
```javascript
export const parsePermissions = (permissions) => {
  const parsed = {};
  
  permissions.forEach(perm => {
    const { collection, action, permissions: rules, fields } = perm;
    
    if (!parsed[collection]) {
      parsed[collection] = {};
    }
    
    parsed[collection][action] = {
      allowed: true,
      rules: rules || null,
      fields: fields || ['*'],
      hasFieldRestrictions: fields && !fields.includes('*')
    };
  });
  
  return parsed;
};
```

**Kết quả:**
```javascript
{
  "articles": {
    "read": {
      "allowed": true,
      "rules": { "status": { "_eq": "published" } },
      "fields": ["*"],
      "hasFieldRestrictions": false
    },
    "update": {
      "allowed": true,
      "rules": { "user_created": { "_eq": "$CURRENT_USER" } },
      "fields": ["title", "content"],
      "hasFieldRestrictions": true
    }
  }
}
```

---

## 7. Service Hoàn chỉnh

```javascript
// src/services/permissionService.js
import directus from '../lib/directus';
import { readItems } from '@directus/sdk';

class PermissionService {
  constructor() {
    this.cache = {
      permissions: null,
      timestamp: null,
      ttl: 5 * 60 * 1000 // 5 phút
    };
  }

  /**
   * Lấy đầy đủ thông tin phân quyền của user
   */
  async getUserFullPermissions(roleId, forceRefresh = false) {
    // Check cache
    if (!forceRefresh && this.isCacheValid()) {
      return this.cache.permissions;
    }

    try {
      // 1. Lấy policies từ role
      const accessRecords = await directus.request(
        readItems('directus_access', {
          filter: { role: { _eq: roleId } },
          fields: ['policy.*'],
          sort: ['sort']
        })
      );

      const policies = accessRecords.map(a => a.policy);
      const policyIds = policies.map(p => p.id);

      // 2. Check admin access
      const hasAdmin = policies.some(p => p.admin_access === true);

      if (hasAdmin) {
        return this.cacheAndReturn({
          isAdmin: true,
          policies,
          permissions: {},
          raw: []
        });
      }

      // 3. Lấy permissions từ policies
      if (policyIds.length === 0) {
        return this.cacheAndReturn({
          isAdmin: false,
          policies: [],
          permissions: {},
          raw: []
        });
      }

      const rawPermissions = await directus.request(
        readItems('directus_permissions', {
          filter: { policy: { _in: policyIds } },
          fields: ['*']
        })
      );

      // 4. Parse permissions
      const parsedPermissions = this.parsePermissions(rawPermissions);

      return this.cacheAndReturn({
        isAdmin: false,
        policies,
        permissions: parsedPermissions,
        raw: rawPermissions
      });

    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  }

  /**
   * Parse permissions thành cấu trúc dễ dùng
   */
  parsePermissions(permissions) {
    const parsed = {};

    permissions.forEach(perm => {
      const { collection, action, permissions: rules, fields, validation } = perm;

      if (!parsed[collection]) {
        parsed[collection] = {};
      }

      parsed[collection][action] = {
        allowed: true,
        rules: rules || null,
        validation: validation || null,
        fields: fields || ['*'],
        hasFieldRestrictions: fields && !fields.includes('*'),
        hasRowRestrictions: rules !== null
      };
    });

    return parsed;
  }

  /**
   * Kiểm tra quyền cụ thể
   */
  can(permissions, collection, action) {
    if (permissions.isAdmin) return true;
    return permissions.permissions[collection]?.[action]?.allowed || false;
  }

  /**
   * Kiểm tra quyền trên field
   */
  canAccessField(permissions, collection, action, field) {
    if (permissions.isAdmin) return true;

    const perm = permissions.permissions[collection]?.[action];
    if (!perm) return false;

    const fields = perm.fields;
    return fields.includes('*') || fields.includes(field);
  }

  /**
   * Lấy row-level rules
   */
  getRowRules(permissions, collection, action) {
    if (permissions.isAdmin) return null;
    return permissions.permissions[collection]?.[action]?.rules || null;
  }

  /**
   * Cache helpers
   */
  isCacheValid() {
    if (!this.cache.permissions || !this.cache.timestamp) return false;
    return Date.now() - this.cache.timestamp < this.cache.ttl;
  }

  cacheAndReturn(data) {
    this.cache.permissions = data;
    this.cache.timestamp = Date.now();
    return data;
  }

  clearCache() {
    this.cache.permissions = null;
    this.cache.timestamp = null;
  }
}

export default new PermissionService();
```

---

## 8. Sử dụng trong React App

### 8.1. Auth Context với Policies
```javascript
// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/userService';
import permissionService from '../services/permissionService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAndPermissions();
  }, []);

  const loadUserAndPermissions = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);

      if (userData.role?.id) {
        const perms = await permissionService.getUserFullPermissions(
          userData.role.id
        );
        setPermissions(perms);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setUser(null);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  };

  const can = (collection, action) => {
    if (!permissions) return false;
    return permissionService.can(permissions, collection, action);
  };

  const canAccessField = (collection, action, field) => {
    if (!permissions) return false;
    return permissionService.canAccessField(
      permissions,
      collection,
      action,
      field
    );
  };

  const getRowRules = (collection, action) => {
    if (!permissions) return null;
    return permissionService.getRowRules(permissions, collection, action);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        loading,
        can,
        canAccessField,
        getRowRules,
        refresh: loadUserAndPermissions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 8.2. Custom Hook
```javascript
// src/hooks/usePermission.js
import { useAuth } from '../contexts/AuthContext';

export const usePermission = () => {
  const { permissions, can, canAccessField, getRowRules } = useAuth();

  return {
    isAdmin: permissions?.isAdmin || false,
    policies: permissions?.policies || [],
    can,
    canAccessField,
    getRowRules,
    hasPermissions: !!permissions
  };
};
```

### 8.3. Sử dụng trong Component
```javascript
// src/components/ArticleManager.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';

const ArticleManager = () => {
  const { user } = useAuth();
  const { can, canAccessField, isAdmin, policies } = usePermission();

  // Hiển thị policies của user
  console.log('User policies:', policies);

  return (
    <div>
      <h1>Quản lý Bài viết</h1>
      
      {isAdmin && <div className="badge">Admin Access</div>}

      {can('articles', 'create') && (
        <button>Tạo bài viết mới</button>
      )}

      {can('articles', 'read') && (
        <div>
          <h2>Danh sách bài viết</h2>
          {/* List articles */}
        </div>
      )}

      {canAccessField('articles', 'update', 'status') && (
        <select name="status">
          <option>Draft</option>
          <option>Published</option>
        </select>
      )}
    </div>
  );
};
```

---

## 9. Advanced: Áp dụng Row-level Rules

```javascript
// src/services/articleService.js
import directus from '../lib/directus';
import { readItems } from '@directus/sdk';
import permissionService from './permissionService';

export const getArticles = async (roleId) => {
  try {
    // Lấy permissions
    const permissions = await permissionService.getUserFullPermissions(roleId);
    
    // Nếu là admin, không cần filter
    if (permissions.isAdmin) {
      return await directus.request(readItems('articles'));
    }

    // Lấy row-level rules
    const rules = permissionService.getRowRules(permissions, 'articles', 'read');
    
    // Áp dụng filter
    const filter = rules || {};

    const articles = await directus.request(
      readItems('articles', {
        filter,
        fields: ['*']
      })
    );

    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};
```

---

## 10. Testing

```javascript
// __tests__/permissionService.test.js
import permissionService from '../services/permissionService';

describe('PermissionService', () => {
  const mockPermissions = {
    isAdmin: false,
    policies: [
      { id: '1', name: 'Editor Policy' }
    ],
    permissions: {
      articles: {
        read: { allowed: true, rules: null, fields: ['*'] },
        update: { allowed: true, rules: { user_created: { _eq: '$CURRENT_USER' } }, fields: ['title'] }
      }
    }
  };

  it('should check basic permissions', () => {
    expect(permissionService.can(mockPermissions, 'articles', 'read')).toBe(true);
    expect(permissionService.can(mockPermissions, 'articles', 'delete')).toBe(false);
  });

  it('should check field-level permissions', () => {
    expect(permissionService.canAccessField(mockPermissions, 'articles', 'read', 'title')).toBe(true);
    expect(permissionService.canAccessField(mockPermissions, 'articles', 'update', 'title')).toBe(true);
    expect(permissionService.canAccessField(mockPermissions, 'articles', 'update', 'status')).toBe(false);
  });

  it('should return row rules', () => {
    const rules = permissionService.getRowRules(mockPermissions, 'articles', 'update');
    expect(rules).toEqual({ user_created: { _eq: '$CURRENT_USER' } });
  });
});
```

---

## 11. Debug Tools

```javascript
// src/utils/debugPermissions.js
export const debugPermissions = (permissions) => {
  console.group('🔐 Permission Debug Info');
  
  console.log('Is Admin:', permissions.isAdmin);
  console.log('Policies:', permissions.policies.map(p => p.name));
  
  console.group('Permissions by Collection:');
  Object.entries(permissions.permissions).forEach(([collection, actions]) => {
    console.group(collection);
    Object.entries(actions).forEach(([action, details]) => {
      console.log(`${action}:`, details);
    });
    console.groupEnd();
  });
  console.groupEnd();
  
  console.groupEnd();
};

// Sử dụng
const permissions = await permissionService.getUserFullPermissions(roleId);
debugPermissions(permissions);
```

---

## 12. Best Practices

### ✅ Nên làm:
- Cache permissions trong memory với TTL hợp lý
- Luôn validate quyền ở backend (Directus tự động làm)
- Sử dụng Context API để chia sẻ permissions
- Test permissions thoroughly
- Log unauthorized access attempts

### ❌ Không nên:
- Tin tưởng hoàn toàn vào frontend checks
- Hardcode policy IDs hoặc permission rules
- Bỏ qua row-level rules khi query data
- Cache permissions quá lâu (>10 phút)
- Expose sensitive permission details ra UI

---

## 13. Troubleshooting

### Vấn đề: Không lấy được policies
```javascript
// Kiểm tra directus_access junction table
const access = await directus.request(
  readItems('directus_access', {
    filter: { role: { _eq: roleId } }
  })
);
console.log('Access records:', access);
```

### Vấn đề: Permissions không đúng
```javascript
// Kiểm tra policy IDs
const policyIds = policies.map(p => p.id);
console.log('Policy IDs:', policyIds);

// Kiểm tra permissions
const perms = await directus.request(
  readItems('directus_permissions', {
    filter: { policy: { _in: policyIds } }
  })
);
console.log('Raw permissions:', perms);
```

---

## Kết luận

Hệ thống Policies mới của Directus v10+ mang lại:
- **Tính linh hoạt cao** với quan hệ M2M
- **Dễ bảo trì** với policy reusability
- **Phân quyền chi tiết** ở cả row-level và field-level
- **Mở rộng tốt** cho các hệ thống phức tạp

Sử dụng Directus SDK để đọc và áp dụng permissions một cách chính xác và hiệu quả!