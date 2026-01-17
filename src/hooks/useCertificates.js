/**
 * React Query Hooks cho Certificates
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificateService } from '../services/certificateService';
import { CACHE_TIME } from '../constants/api';
import { queryKeys } from '../constants/queryKeys';
import { showSuccess } from '../utils/errorHandler';

// ============================================
// ADMIN HOOKS
// ============================================

/**
 * Hook lấy danh sách certificates (Admin)
 * @param {Object} params - Filter params { search, course_id, user_id, page, limit }
 */
export function useCertificates(params = {}) {
    return useQuery({
        queryKey: [...queryKeys.certificates.all, 'list', params],
        queryFn: () => certificateService.getAll(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy certificates theo user ID
 * @param {string} userId - ID user
 */
export function useCertificatesByUser(userId) {
    return useQuery({
        queryKey: queryKeys.certificates.byUser(userId),
        queryFn: () => certificateService.getByUserId(userId),
        enabled: !!userId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy certificates theo course ID
 * @param {string} courseId - ID khóa học
 */
export function useCertificatesByCourse(courseId) {
    return useQuery({
        queryKey: [...queryKeys.certificates.all, 'course', courseId],
        queryFn: () => certificateService.getByCourseId(courseId),
        enabled: !!courseId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy danh sách certificate templates
 */
export function useCertificateTemplates() {
    return useQuery({
        queryKey: [...queryKeys.certificates.all, 'templates'],
        queryFn: () => certificateService.getTemplates(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy template đang active
 */
export function useActiveTemplate() {
    return useQuery({
        queryKey: [...queryKeys.certificates.all, 'templates', 'active'],
        queryFn: () => certificateService.getActiveTemplate(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy thống kê certificates
 */
export function useCertificateStats() {
    return useQuery({
        queryKey: [...queryKeys.certificates.all, 'stats'],
        queryFn: () => certificateService.getStats(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook cấp certificate
 */
export function useIssueCertificate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: certificateService.issue,
        onSuccess: data => {
            queryClient.invalidateQueries({ queryKey: queryKeys.certificates.all });
            showSuccess(`Cấp chứng chỉ ${data.certificate_number} thành công!`);
        },
    });
}

/**
 * Hook thu hồi certificate
 */
export function useRevokeCertificate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: certificateService.revoke,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.certificates.all });
            showSuccess('Thu hồi chứng chỉ thành công!');
        },
    });
}

/**
 * Hook đặt template active
 */
export function useSetActiveTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: certificateService.setActiveTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...queryKeys.certificates.all, 'templates'] });
            showSuccess('Cập nhật template thành công!');
        },
    });
}

// ============================================
// CLIENT / LEARNER HOOKS
// ============================================

/**
 * Hook đếm tổng số certificates
 * @param {Object} params - Filter params
 */
export function useCertificatesCount(params = {}) {
    return useQuery({
        queryKey: [...queryKeys.certificates.all, 'count', params],
        queryFn: () => certificateService.count(params),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy certificates của user hiện tại
 */
export function useMyCertificates() {
    return useQuery({
        queryKey: queryKeys.certificates.mine(),
        queryFn: () => certificateService.getMyCertificates(),
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook lấy chi tiết certificate
 * @param {string} certificateId - ID certificate
 */
export function useCertificate(certificateId) {
    return useQuery({
        queryKey: queryKeys.certificates.detail(certificateId),
        queryFn: () => certificateService.getById(certificateId),
        enabled: !!certificateId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook kiểm tra user có certificate cho course không
 * @param {string} courseId - ID khóa học
 */
export function useCheckMyCertificate(courseId) {
    return useQuery({
        queryKey: [...queryKeys.certificates.mine(), 'course', courseId],
        queryFn: () => certificateService.checkMyCertificate(courseId),
        enabled: !!courseId,
        staleTime: CACHE_TIME.STALE_TIME,
    });
}

/**
 * Hook xác thực certificate
 * @param {string} certificateNumber - Mã số certificate
 */
export function useVerifyCertificate(certificateNumber) {
    return useQuery({
        queryKey: [...queryKeys.certificates.all, 'verify', certificateNumber],
        queryFn: () => certificateService.verify(certificateNumber),
        enabled: !!certificateNumber,
        staleTime: 0, // Always fetch fresh
    });
}
