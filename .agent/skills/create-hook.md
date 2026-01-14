# Skill: Create React Query Hook

## Description

Tao custom React hook su dung TanStack Query de tuong tac voi Directus API.

## Usage

```
/create-hook <HookName> [--service <serviceName>] [--entity <entityName>]
```

## Parameters

- `HookName`: Ten hook (bat dau bang `use`, camelCase) - **bat buoc**
- `--service`: Ten service tuong ung
- `--entity`: Ten entity (plural form)

## Instructions

### 1. Them query keys vao constants (neu chua co)

```javascript
// src/constants/queryKeys.js
export const queryKeys = {
    // ... existing keys

    /**
     * New Entity query keys
     */
    newEntity: {
        all: ['new-entity'],
        lists: () => [...queryKeys.newEntity.all, 'list'],
        list: filters => [...queryKeys.newEntity.lists(), { filters }],
        details: () => [...queryKeys.newEntity.all, 'detail'],
        detail: id => [...queryKeys.newEntity.details(), id],
    },
};
```

### 2. Tao hook file

```javascript
// src/hooks/useNewEntity.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newEntityService } from '../services/newEntityService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

/**
 * Hook lay danh sach items
 * @param {Object} params - Query params
 */
export function useNewEntities(params = {}) {
    return useQuery({
        queryKey: queryKeys.newEntity.list(params),
        queryFn: () => newEntityService.getAll(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lay chi tiet item
 * @param {string|number} id - Item ID
 */
export function useNewEntity(id) {
    return useQuery({
        queryKey: queryKeys.newEntity.detail(id),
        queryFn: () => newEntityService.getById(id),
        enabled: !!id, // Chi fetch khi co id
    });
}

/**
 * Hook tao item moi
 */
export function useCreateNewEntity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: newEntityService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.newEntity.all });
            showSuccess('Tao thanh cong!');
        },
        // Error handled by global handler in queryClient
    });
}

/**
 * Hook cap nhat item
 */
export function useUpdateNewEntity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => newEntityService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.newEntity.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.newEntity.detail(variables.id),
            });
            showSuccess('Cap nhat thanh cong!');
        },
    });
}

/**
 * Hook xoa item
 */
export function useDeleteNewEntity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: newEntityService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.newEntity.all });
            showSuccess('Xoa thanh cong!');
        },
    });
}
```

### 3. Patterns nang cao

#### Infinite Query (Load more)

```javascript
export function useInfiniteNewEntities(params = {}) {
    return useInfiniteQuery({
        queryKey: queryKeys.newEntity.list(params),
        queryFn: ({ pageParam = 0 }) =>
            newEntityService.getAll({
                ...params,
                offset: pageParam,
                limit: 10,
            }),
        getNextPageParam: (lastPage, pages) => {
            if (lastPage.length < 10) return undefined;
            return pages.length * 10;
        },
    });
}
```

#### Prefetch

```javascript
export function usePrefetchNewEntity() {
    const queryClient = useQueryClient();

    return id => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.newEntity.detail(id),
            queryFn: () => newEntityService.getById(id),
        });
    };
}
```

#### Optimistic Updates

```javascript
export function useOptimisticUpdateNewEntity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => newEntityService.update(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({
                queryKey: queryKeys.newEntity.detail(id),
            });

            const previousData = queryClient.getQueryData(queryKeys.newEntity.detail(id));

            queryClient.setQueryData(queryKeys.newEntity.detail(id), old => ({ ...old, ...data }));

            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(queryKeys.newEntity.detail(variables.id), context.previousData);
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.newEntity.detail(variables.id),
            });
        },
    });
}
```

### 4. Checklist sau khi tao

- [ ] Query keys da duoc them vao `constants/queryKeys.js`
- [ ] Import service dung
- [ ] Su dung `CACHE_TIME` tu constants
- [ ] `enabled` option cho conditional queries
- [ ] `invalidateQueries` sau mutations
- [ ] `showSuccess` cho success messages
- [ ] Khong co `onError` (global handler xu ly)

## Example Usage in Component

```jsx
function EntityListPage() {
    const { data: entities, isLoading, error } = useNewEntities();
    const createEntity = useCreateNewEntity();
    const updateEntity = useUpdateNewEntity();
    const deleteEntity = useDeleteNewEntity();

    const handleCreate = async values => {
        await createEntity.mutateAsync(values);
    };

    const handleUpdate = async (id, values) => {
        await updateEntity.mutateAsync({ id, data: values });
    };

    const handleDelete = async id => {
        await deleteEntity.mutateAsync(id);
    };

    if (isLoading) return <Spin />;
    if (error) return <div>Error loading data</div>;

    return <Table dataSource={entities} loading={createEntity.isPending || updateEntity.isPending} />;
}
```

## Related Files

- `src/constants/queryKeys.js` - Query keys
- `src/constants/api.js` - Cache time config
- `src/services/` - Services
- `src/utils/errorHandler.js` - showSuccess, showError
