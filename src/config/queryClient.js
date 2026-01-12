import { QueryClient } from '@tanstack/react-query';
import { CACHE_TIME, RETRY_CONFIG } from '../constants/api';
import { handleDirectusError } from '../utils/errorHandler';

/**
 * Cấu hình React Query Client
 * Được cấu hình với các tùy chọn mặc định cho caching và xử lý lỗi
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIME.STALE_TIME,
      gcTime: CACHE_TIME.GC_TIME,
      retry: RETRY_CONFIG.QUERY_RETRY,
      refetchOnWindowFocus: false,
      // Global error handler cho queries
      onError: (error) => {
        // handleDirectusError đã hiển thị thông báo lỗi
        handleDirectusError(error);
      },
    },
    mutations: {
      retry: RETRY_CONFIG.MUTATION_RETRY,
      // Global error handler cho mutations
      // Lưu ý: Các mutations riêng lẻ có thể ghi đè bằng onError của chính chúng
      onError: (error) => {
        // handleDirectusError đã hiển thị thông báo lỗi
        handleDirectusError(error);
      },
    },
  },
});

