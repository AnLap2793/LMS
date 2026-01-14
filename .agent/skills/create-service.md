# Skill: Create Directus Service

## Description

Tao service layer moi de tuong tac voi Directus backend, su dung Directus SDK.

## Usage

```
/create-service <ServiceName> [--collection <collection_name>]
```

## Parameters

- `ServiceName`: Ten service (camelCase, ket thuc bang `Service`) - **bat buoc**
- `--collection`: Ten collection trong Directus

## Instructions

### 1. Them collection vao constants (neu chua co)

```javascript
// src/constants/collections.js
export const COLLECTIONS = {
    // ... existing collections
    NEW_COLLECTION: 'new_collection_name',
};
```

### 2. Tao service file

**Luu y quan trong:**

- Service KHONG co try-catch (errors propagate to global handler)
- Service KHONG co side effects (khong goi message, notification)
- Chi goi Directus SDK va return data

```javascript
// src/services/newService.js
import { directus } from './directus';
import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const newService = {
    /**
     * Lay danh sach items
     * @param {Object} params - Directus query params
     */
    getAll: async (params = {}) => {
        return await directus.request(readItems(COLLECTIONS.NEW_COLLECTION, params));
    },

    /**
     * Lay chi tiet item theo ID
     * @param {string|number} id - Item ID
     * @param {Object} params - Directus query params
     */
    getById: async (id, params = {}) => {
        return await directus.request(readItem(COLLECTIONS.NEW_COLLECTION, id, params));
    },

    /**
     * Tao item moi
     * @param {Object} data - Item data
     */
    create: async data => {
        return await directus.request(createItem(COLLECTIONS.NEW_COLLECTION, data));
    },

    /**
     * Cap nhat item
     * @param {string|number} id - Item ID
     * @param {Object} data - Updated data
     */
    update: async (id, data) => {
        return await directus.request(updateItem(COLLECTIONS.NEW_COLLECTION, id, data));
    },

    /**
     * Xoa item
     * @param {string|number} id - Item ID
     */
    delete: async id => {
        return await directus.request(deleteItem(COLLECTIONS.NEW_COLLECTION, id));
    },
};
```

### 3. Directus Query Params thuong dung

```javascript
// Filter
const params = {
    filter: {
        status: { _eq: 'published' },
        date_created: { _gte: '2024-01-01' },
    },
};

// Sort
const params = {
    sort: ['-date_created', 'title'],
};

// Fields (select specific fields)
const params = {
    fields: ['id', 'title', 'status', 'author.name'],
};

// Deep (nested relations)
const params = {
    fields: ['*', 'modules.*', 'modules.lessons.*'],
    deep: {
        modules: {
            _sort: ['sort_order'],
        },
    },
};

// Pagination
const params = {
    limit: 10,
    offset: 0,
    meta: 'total_count',
};

// Search
const params = {
    search: 'keyword',
};
```

### 4. Checklist sau khi tao

- [ ] Collection da duoc them vao `constants/collections.js`
- [ ] Service khong co try-catch
- [ ] Service khong co side effects
- [ ] JSDoc comments day du
- [ ] Export service object

## Example - Course Service

```javascript
// src/services/courseService.js
import { directus } from './directus';
import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const courseService = {
    getAll: async (params = {}) => {
        return await directus.request(
            readItems(COLLECTIONS.COURSES, {
                fields: ['*', 'instructor.*', 'tags.tags_id.*'],
                ...params,
            })
        );
    },

    getById: async (id, params = {}) => {
        return await directus.request(
            readItem(COLLECTIONS.COURSES, id, {
                fields: ['*', 'instructor.*', 'modules.*', 'modules.lessons.*'],
                ...params,
            })
        );
    },

    create: async data => {
        return await directus.request(createItem(COLLECTIONS.COURSES, data));
    },

    update: async (id, data) => {
        return await directus.request(updateItem(COLLECTIONS.COURSES, id, data));
    },

    delete: async id => {
        return await directus.request(deleteItem(COLLECTIONS.COURSES, id));
    },

    // Custom methods
    getPublished: async (params = {}) => {
        return await directus.request(
            readItems(COLLECTIONS.COURSES, {
                filter: { status: { _eq: 'published' } },
                ...params,
            })
        );
    },
};
```

## Related Files

- `src/services/directus.js` - Directus client setup
- `src/constants/collections.js` - Collection names
- `src/hooks/` - Hooks that use services
