/**
 * React Query Hooks cho Users
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

// ==========================================
// ADMIN HOOKS
// ==========================================

export function useUsers(params = {}) {
    return useQuery({
        queryKey: queryKeys.users.list(params),
        queryFn: () => userService.getAll(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

export function useUser(id) {
    return useQuery({
        queryKey: queryKeys.users.detail(id),
        queryFn: () => userService.getById(id),
        enabled: !!id,
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            showSuccess('Tạo user thành công!');
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => userService.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
            showSuccess('Cập nhật thành công!');
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            showSuccess('Xóa thành công!');
        },
    });
}

// ==========================================
// CLIENT / LEARNER HOOKS
// ==========================================

export function useUpdateMe() {
    return useMutation({
        mutationFn: userService.updateMe,
        onSuccess: () => {
            showSuccess('Cập nhật thông tin thành công!');
        },
    });
}
