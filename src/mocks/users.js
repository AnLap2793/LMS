/**
 * Mock Data - Users/Employees
 * Dữ liệu nhân viên cho báo cáo và enrollment
 */
export const mockUsers = [
    {
        id: 'u1',
        first_name: 'Nguyễn',
        last_name: 'Văn A',
        email: 'nguyenvana@company.com',
        avatar: null,
        department: { code: 'it', name: 'Công nghệ thông tin' },
        position: { code: 'frontend-developer', name: 'Frontend Developer' },
        status: 'active',
        date_created: '2023-06-15T10:00:00Z',
    },
    {
        id: 'u2',
        first_name: 'Trần',
        last_name: 'Thị B',
        email: 'tranthib@company.com',
        avatar: null,
        department: { code: 'hr', name: 'Nhân sự' },
        position: { code: 'hr-specialist', name: 'Chuyên viên Nhân sự' },
        status: 'active',
        date_created: '2023-08-01T10:00:00Z',
    },
    {
        id: 'u3',
        first_name: 'Lê',
        last_name: 'Văn C',
        email: 'levanc@company.com',
        avatar: null,
        department: { code: 'sales', name: 'Kinh doanh' },
        position: { code: 'sales-executive', name: 'Nhân viên Kinh doanh' },
        status: 'active',
        date_created: '2023-09-10T10:00:00Z',
    },
    {
        id: 'u4',
        first_name: 'Phạm',
        last_name: 'Thị D',
        email: 'phamthid@company.com',
        avatar: null,
        department: { code: 'marketing', name: 'Marketing' },
        position: { code: 'marketing-specialist', name: 'Chuyên viên Marketing' },
        status: 'active',
        date_created: '2023-10-01T10:00:00Z',
    },
    {
        id: 'u5',
        first_name: 'Hoàng',
        last_name: 'Văn E',
        email: 'hoangvane@company.com',
        avatar: null,
        department: { code: 'it', name: 'Công nghệ thông tin' },
        position: { code: 'backend-developer', name: 'Backend Developer' },
        status: 'active',
        date_created: '2023-11-15T10:00:00Z',
    },
    {
        id: 'u6',
        first_name: 'Nguyễn',
        last_name: 'Thị F',
        email: 'nguyenthif@company.com',
        avatar: null,
        department: { code: 'finance', name: 'Tài chính' },
        position: { code: 'accountant', name: 'Kế toán viên' },
        status: 'active',
        date_created: '2023-12-01T10:00:00Z',
    },
    {
        id: 'u7',
        first_name: 'Trần',
        last_name: 'Văn G',
        email: 'tranvang@company.com',
        avatar: null,
        department: { code: 'sales', name: 'Kinh doanh' },
        position: { code: 'team-lead', name: 'Trưởng nhóm Kinh doanh' },
        status: 'active',
        date_created: '2022-05-01T10:00:00Z',
    },
    {
        id: 'u8',
        first_name: 'Lê',
        last_name: 'Thị H',
        email: 'lethih@company.com',
        avatar: null,
        department: { code: 'it', name: 'Công nghệ thông tin' },
        position: { code: 'qa-engineer', name: 'QA Engineer' },
        status: 'active',
        date_created: '2024-01-10T10:00:00Z',
    },
    {
        id: 'u9',
        first_name: 'Võ',
        last_name: 'Văn I',
        email: 'vovani@company.com',
        avatar: null,
        department: { code: 'hr', name: 'Nhân sự' },
        position: { code: 'manager', name: 'Trưởng phòng Nhân sự' },
        status: 'active',
        date_created: '2021-03-01T10:00:00Z',
    },
    {
        id: 'u10',
        first_name: 'Đặng',
        last_name: 'Thị K',
        email: 'dangthik@company.com',
        avatar: null,
        department: { code: 'marketing', name: 'Marketing' },
        position: { code: 'intern', name: 'Thực tập sinh' },
        status: 'active',
        date_created: '2024-02-01T10:00:00Z',
    },
];

/**
 * Mock Departments
 */
export const mockDepartments = [
    { code: 'it', name: 'Công nghệ thông tin', employee_count: 15 },
    { code: 'hr', name: 'Nhân sự', employee_count: 8 },
    { code: 'sales', name: 'Kinh doanh', employee_count: 25 },
    { code: 'marketing', name: 'Marketing', employee_count: 10 },
    { code: 'finance', name: 'Tài chính', employee_count: 6 },
    { code: 'operations', name: 'Vận hành', employee_count: 12 },
];

/**
 * Mock Positions
 */
export const mockPositions = [
    { code: 'intern', name: 'Thực tập sinh' },
    { code: 'junior', name: 'Nhân viên' },
    { code: 'senior', name: 'Nhân viên cấp cao' },
    { code: 'team-lead', name: 'Trưởng nhóm' },
    { code: 'manager', name: 'Trưởng phòng' },
    { code: 'director', name: 'Giám đốc' },
    { code: 'frontend-developer', name: 'Frontend Developer' },
    { code: 'backend-developer', name: 'Backend Developer' },
    { code: 'fullstack-developer', name: 'Fullstack Developer' },
    { code: 'qa-engineer', name: 'QA Engineer' },
    { code: 'hr-specialist', name: 'Chuyên viên Nhân sự' },
    { code: 'sales-executive', name: 'Nhân viên Kinh doanh' },
    { code: 'marketing-specialist', name: 'Chuyên viên Marketing' },
    { code: 'accountant', name: 'Kế toán viên' },
];

/**
 * Helper to get user full name
 */
export const getUserFullName = user => {
    return `${user.first_name} ${user.last_name}`;
};
