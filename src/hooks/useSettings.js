/**
 * React Query Hooks cho App Settings (Singleton)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settingsService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

/**
 * Hook lấy app settings hiện tại
 * @returns {Object} Query result với data là settings object
 */
export function useSettings() {
    return useQuery({
        queryKey: queryKeys.appSettings.current(),
        queryFn: () => settingsService.get(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy giá trị một setting cụ thể
 * @param {string} key - Tên setting
 * @param {*} defaultValue - Giá trị mặc định
 * @returns {*} Giá trị setting hoặc defaultValue
 */
export function useSettingValue(key, defaultValue = null) {
    const { data: settings } = useSettings();
    return settings?.[key] !== undefined ? settings[key] : defaultValue;
}

/**
 * Hook cập nhật settings
 * @returns {Object} Mutation object
 */
export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: settingsService.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.appSettings.all });
            showSuccess('Cập nhật cài đặt thành công!');
        },
    });
}

/**
 * Hook cập nhật một setting cụ thể
 * @returns {Object} Mutation object
 */
export function useUpdateSettingValue() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ key, value }) => settingsService.setValue(key, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.appSettings.all });
            showSuccess('Cập nhật cài đặt thành công!');
        },
    });
}

/**
 * Hook reset settings về mặc định
 * @returns {Object} Mutation object
 */
export function useResetSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: settingsService.reset,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.appSettings.all });
            showSuccess('Đã khôi phục cài đặt mặc định!');
        },
    });
}
