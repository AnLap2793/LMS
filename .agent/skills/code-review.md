# Skill: Code Review

## Description

Review code theo cac tieu chuan cua du an LMS, phat hien van de va de xuat cai thien.

## Usage

```
/code-review [--file <filePath>] [--scope <all|component|hook|service>]
```

## Parameters

- `--file`: Duong dan file can review
- `--scope`: Pham vi review (`all`, `component`, `hook`, `service`)

## Review Checklist

### 1. Code Structure & Organization

#### Components

- [ ] Functional components (khong dung class components, tru Error Boundaries)
- [ ] Single responsibility - moi component 1 chuc nang
- [ ] File size < 300 dong
- [ ] Dung thu muc: `common/`, `admin/`, `layout/`

#### Naming Conventions

- [ ] Components: PascalCase - `UserCard.jsx`
- [ ] Files: camelCase - `userService.js`
- [ ] Constants: UPPER_SNAKE_CASE - `CACHE_TIME`
- [ ] Query keys: camelCase trong object

#### Import Order

1. React/external libraries
2. Internal services/hooks
3. Constants
4. Components
5. Styles

### 2. React Best Practices

#### Hooks

- [ ] useEffect co dung dependencies
- [ ] useMemo/useCallback cho expensive operations
- [ ] Khong vi pham Rules of Hooks

#### State Management

- [ ] Local state cho component-specific state
- [ ] React Query cho server state
- [ ] Context cho global app state (auth, theme)

#### Props

- [ ] PropTypes day du
- [ ] Default props khi can
- [ ] Props drilling <= 2-3 levels

### 3. Constants & Hardcoding

#### PHAI su dung Constants

- [ ] Collection names tu `COLLECTIONS`
- [ ] Query keys tu `queryKeys`
- [ ] Cache time tu `CACHE_TIME`
- [ ] Pagination tu `PAGINATION`
- [ ] Validation tu `VALIDATION`

#### KHONG hardcode

```javascript
// BAD
directus.request(readItems('directus_users'));
queryKey: ['users', params];
staleTime: 5 * 60 * 1000;

// GOOD
directus.request(readItems(COLLECTIONS.USERS));
queryKey: queryKeys.users.list(params);
staleTime: CACHE_TIME.STALE_TIME;
```

### 4. Error Handling

#### Services

- [ ] KHONG co try-catch trong services
- [ ] KHONG co side effects (message, notification)
- [ ] Errors propagate to global handler

#### Hooks (React Query)

- [ ] Khong can onError (global handler xu ly)
- [ ] showSuccess trong onSuccess
- [ ] invalidateQueries sau mutations

### 5. Ant Design Usage

#### Theme

- [ ] Su dung theme color #ea4544
- [ ] ConfigProvider voi theme config
- [ ] Khong override styles truc tiep

#### Components

- [ ] Named imports cho tree-shaking
- [ ] Su dung dung component cho use case

### 6. Performance

#### Optimization

- [ ] React.memo cho expensive components
- [ ] useMemo cho computed values
- [ ] useCallback cho callback functions
- [ ] Lazy loading cho routes

#### Queries

- [ ] enabled option cho conditional queries
- [ ] staleTime phu hop
- [ ] Khong fetch duplicate data

### 7. Security

#### Input

- [ ] Validate user input
- [ ] Sanitize HTML content voi DOMPurify
- [ ] Su dung formRules tu validation/

#### Environment

- [ ] Khong commit sensitive data
- [ ] Su dung env variables cho config

### 8. Testing

- [ ] Test file co-located voi source
- [ ] Test renders correctly
- [ ] Test user interactions
- [ ] Test loading/error states

## Common Issues & Fixes

### Issue 1: Hardcoded Collection Names

```javascript
// BAD
await directus.request(readItems('courses'));

// GOOD
import { COLLECTIONS } from '../constants/collections';
await directus.request(readItems(COLLECTIONS.COURSES));
```

### Issue 2: Hardcoded Query Keys

```javascript
// BAD
useQuery({
    queryKey: ['users', params],
    // ...
});

// GOOD
import { queryKeys } from '../constants/queryKeys';
useQuery({
    queryKey: queryKeys.users.list(params),
    // ...
});
```

### Issue 3: Try-catch in Services

```javascript
// BAD
export const userService = {
    getAll: async () => {
        try {
            return await directus.request(readItems(COLLECTIONS.USERS));
        } catch (error) {
            handleError(error); // Side effect!
            throw error;
        }
    },
};

// GOOD
export const userService = {
    getAll: async () => {
        return await directus.request(readItems(COLLECTIONS.USERS));
    },
};
```

### Issue 4: onError in Mutations

```javascript
// UNNECESSARY (global handler xu ly)
useMutation({
    mutationFn: userService.create,
    onError: error => {
        showError(error.message);
    },
});

// CORRECT
useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
        showSuccess('Created!');
    },
    // No onError needed
});
```

### Issue 5: Missing enabled in Queries

```javascript
// BAD - Will fetch with undefined id
const { data } = useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.getById(id),
});

// GOOD
const { data } = useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id, // Only fetch when id exists
});
```

## Review Output Format

```markdown
## Code Review: <FileName>

### Summary

- Overall: Good/Needs Improvement/Critical Issues
- Score: X/10

### Issues Found

#### Critical

1. [Line X] Description - How to fix

#### Warnings

1. [Line X] Description - Suggestion

#### Suggestions

1. [Line X] Description - Why it's better

### What's Good

- List positive aspects

### Recommended Actions

1. Action item 1
2. Action item 2
```

## Related Files

- `.agent/rules/` - Project rules
- `AGENTS.md` - Project conventions
- `src/constants/` - Constants to check against
