---
name: react-best-practices
description: React performance optimization guidelines adapted for Vite/SPA architecture. Use this skill when writing, reviewing, or refactoring React components, hooks, and client-side logic. FOCUS: React Query, Bundle Size, Re-renders, and Waterfall elimination. IGNORE: Next.js specific features (SSR, RSC).
license: MIT
metadata:
  author: vercel-adapted
  version: "1.0.0-spa"
---

# React Best Practices (SPA/Vite Edition)

Optimization guide for React applications using Vite and Client-Side Rendering. Adapted from Vercel Engineering guidelines.

## When to Apply

Reference these guidelines when:

- Writing new React components
- Optimizing Client-side Data Fetching (React Query)
- Reducing Re-renders
- Optimizing Bundle Size (Lazy loading, Imports)

## Rule Categories by Priority

| Priority | Category                  | Impact      | Prefix       |
| -------- | ------------------------- | ----------- | ------------ |
| 1        | Eliminating Waterfalls    | CRITICAL    | `async-`     |
| 2        | Bundle Size Optimization  | CRITICAL    | `bundle-`    |
| 3        | Client-Side Data Fetching | MEDIUM-HIGH | `client-`    |
| 4        | Re-render Optimization    | MEDIUM      | `rerender-`  |
| 5        | Rendering Performance     | MEDIUM      | `rendering-` |
| 6        | JavaScript Performance    | LOW-MEDIUM  | `js-`        |

## Quick Reference

### 1. Eliminating Waterfalls (CRITICAL)

- `async-parallel` - Use Promise.all() for independent operations
- `async-defer-await` - Move await into branches where actually used
- `async-dependencies` - Optimize dependent promises

### 2. Bundle Size Optimization (CRITICAL)

- `bundle-barrel-imports` - Import directly, avoid barrel files (Critical for Vite tree-shaking)
- `bundle-preload` - Preload on hover/focus
- `bundle-conditional` - Load modules only when feature is activated

### 3. Client-Side Data Fetching

- `client-swr-dedup` - Logic applies to React Query: Deduplicate requests
- `client-event-listeners` - Deduplicate global event listeners

### 4. Re-render Optimization

- `rerender-memo` - Extract expensive work into memoized components
- `rerender-dependencies` - Use primitive dependencies in effects
- `rerender-functional-setstate` - Use functional setState for stable callbacks
- `rerender-derived-state` - Subscribe to derived booleans

### 5. Rendering Performance

- `rendering-conditional-render` - Use ternary, not &&
- `rendering-content-visibility` - Use content-visibility for long lists

## How to Use

The agent will automatically reference these rules when you ask for "optimization", "refactoring", or "code review".
