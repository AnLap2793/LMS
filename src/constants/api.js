/**
 * Constants liên quan đến API
 * Timeouts, retries, và các giá trị cấu hình API khác
 */

// React Query Cache Times (tính bằng milliseconds)
export const CACHE_TIME = {
  STALE_TIME: 5 * 60 * 1000,      // 5 minutes
  GC_TIME: 10 * 60 * 1000,        // 10 phút (thời gian garbage collection)
};

// Cấu hình Retry cho API
export const RETRY_CONFIG = {
  QUERY_RETRY: 1,
  MUTATION_RETRY: 1,
};

// Pagination mặc định
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
};

