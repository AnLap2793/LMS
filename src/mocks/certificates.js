/**
 * Mock Data - Certificates
 * Chứng chỉ hoàn thành khóa học
 */
export const mockCertificates = [
    {
        id: 'cert1',
        user_id: 'u2',
        user: { id: 'u2', first_name: 'Trần', last_name: 'Thị B', email: 'tranthib@company.com' },
        course_id: '1',
        course: { id: '1', title: 'Onboarding cho Nhân viên mới' },
        certificate_number: 'CERT-2024-00001',
        file: { id: 'f-cert1', filename_download: 'certificate-00001.pdf', type: 'application/pdf' },
        issued_at: '2024-02-05T15:30:00Z',
    },
    {
        id: 'cert2',
        user_id: 'u5',
        user: { id: 'u5', first_name: 'Hoàng', last_name: 'Văn E', email: 'hoangvane@company.com' },
        course_id: '1',
        course: { id: '1', title: 'Onboarding cho Nhân viên mới' },
        certificate_number: 'CERT-2024-00002',
        file: { id: 'f-cert2', filename_download: 'certificate-00002.pdf', type: 'application/pdf' },
        issued_at: '2024-02-01T14:30:00Z',
    },
    {
        id: 'cert3',
        user_id: 'u5',
        user: { id: 'u5', first_name: 'Hoàng', last_name: 'Văn E', email: 'hoangvane@company.com' },
        course_id: '4',
        course: { id: '4', title: 'React Advanced Patterns' },
        certificate_number: 'CERT-2024-00003',
        file: { id: 'f-cert3', filename_download: 'certificate-00003.pdf', type: 'application/pdf' },
        issued_at: '2024-03-01T16:45:00Z',
    },
    {
        id: 'cert4',
        user_id: 'u8',
        user: { id: 'u8', first_name: 'Lê', last_name: 'Thị H', email: 'lethih@company.com' },
        course_id: '2',
        course: { id: '2', title: 'An toàn lao động và PCCC' },
        certificate_number: 'CERT-2024-00004',
        file: { id: 'f-cert4', filename_download: 'certificate-00004.pdf', type: 'application/pdf' },
        issued_at: '2024-02-20T11:30:00Z',
    },
    {
        id: 'cert5',
        user_id: 'u7',
        user: { id: 'u7', first_name: 'Trần', last_name: 'Văn G', email: 'tranvang@company.com' },
        course_id: '5',
        course: { id: '5', title: 'Quản lý thời gian hiệu quả' },
        certificate_number: 'CERT-2024-00005',
        file: { id: 'f-cert5', filename_download: 'certificate-00005.pdf', type: 'application/pdf' },
        issued_at: '2024-03-09T16:20:00Z',
    },
];

/**
 * Mock Certificate Templates
 */
export const mockCertificateTemplates = [
    {
        id: 'tpl1',
        name: 'Template Chuẩn',
        description: 'Template chứng chỉ mặc định với logo công ty',
        file: { id: 'f-tpl1', filename_download: 'template-standard.pdf', type: 'application/pdf' },
        is_active: true,
        preview_url: '/images/cert-template-standard.png',
        date_created: '2024-01-01T10:00:00Z',
    },
    {
        id: 'tpl2',
        name: 'Template Technical',
        description: 'Template cho các khóa học kỹ thuật',
        file: { id: 'f-tpl2', filename_download: 'template-technical.pdf', type: 'application/pdf' },
        is_active: false,
        preview_url: '/images/cert-template-technical.png',
        date_created: '2024-01-05T10:00:00Z',
    },
    {
        id: 'tpl3',
        name: 'Template Compliance',
        description: 'Template cho các khóa học bắt buộc (compliance)',
        file: { id: 'f-tpl3', filename_download: 'template-compliance.pdf', type: 'application/pdf' },
        is_active: false,
        preview_url: '/images/cert-template-compliance.png',
        date_created: '2024-01-10T10:00:00Z',
    },
];

/**
 * Helper to get certificates by user ID
 */
export const getCertificatesByUserId = userId => {
    return mockCertificates.filter(c => c.user_id === userId);
};

/**
 * Helper to get certificates by course ID
 */
export const getCertificatesByCourseId = courseId => {
    return mockCertificates.filter(c => c.course_id === courseId);
};

/**
 * Helper to get active certificate template
 */
export const getActiveTemplate = () => {
    return mockCertificateTemplates.find(t => t.is_active);
};

/**
 * Generate certificate number
 */
export const generateCertificateNumber = () => {
    const year = new Date().getFullYear();
    const count = mockCertificates.length + 1;
    return `CERT-${year}-${String(count).padStart(5, '0')}`;
};
