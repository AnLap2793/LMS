/**
 * Mock Data - Modules & Lessons
 */
export const mockModules = [
    // Course 1: Onboarding
    {
        id: 'm1',
        course_id: '1',
        title: 'Giới thiệu công ty',
        description: 'Tổng quan về lịch sử, văn hóa và giá trị cốt lõi của công ty',
        status: 'published',
        sort: 1,
        date_created: '2024-01-15T10:00:00Z',
    },
    {
        id: 'm2',
        course_id: '1',
        title: 'Quy trình làm việc',
        description: 'Hướng dẫn các quy trình cơ bản trong công ty',
        status: 'published',
        sort: 2,
        date_created: '2024-01-15T10:00:00Z',
    },
    {
        id: 'm3',
        course_id: '1',
        title: 'Công cụ và hệ thống',
        description: 'Giới thiệu các công cụ và hệ thống nội bộ',
        status: 'draft',
        sort: 3,
        date_created: '2024-01-16T10:00:00Z',
    },
    // Course 4: React Advanced
    {
        id: 'm4',
        course_id: '4',
        title: 'Custom Hooks',
        description: 'Tìm hiểu và xây dựng Custom Hooks',
        status: 'published',
        sort: 1,
        date_created: '2024-02-10T10:00:00Z',
    },
    {
        id: 'm5',
        course_id: '4',
        title: 'Compound Components',
        description: 'Pattern Compound Components trong React',
        status: 'published',
        sort: 2,
        date_created: '2024-02-10T10:00:00Z',
    },
];

export const mockLessons = [
    // Module 1: Giới thiệu công ty
    {
        id: 'l1',
        module_id: 'm1',
        title: 'Lịch sử hình thành công ty',
        type: 'video',
        content: null,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        video_provider: 'youtube',
        video_id: 'dQw4w9WgXcQ',
        external_link: null,
        file_attachment: null,
        duration: 15,
        is_required: true,
        status: 'published',
        sort: 1,
        date_created: '2024-01-15T10:00:00Z',
    },
    {
        id: 'l2',
        module_id: 'm1',
        title: 'Tầm nhìn và sứ mệnh',
        type: 'article',
        content:
            '# Tầm nhìn\n\nTrở thành công ty hàng đầu trong lĩnh vực...\n\n# Sứ mệnh\n\nMang đến giá trị tốt nhất cho khách hàng...',
        video_url: null,
        video_provider: null,
        video_id: null,
        external_link: null,
        file_attachment: null,
        duration: 10,
        is_required: true,
        status: 'published',
        sort: 2,
        date_created: '2024-01-15T10:00:00Z',
    },
    {
        id: 'l3',
        module_id: 'm1',
        title: 'Sổ tay nhân viên',
        type: 'file',
        content: null,
        video_url: null,
        video_provider: null,
        video_id: null,
        external_link: null,
        file_attachment: { id: 'f1', filename_download: 'so-tay-nhan-vien.pdf', type: 'application/pdf' },
        duration: null,
        is_required: true,
        status: 'published',
        sort: 3,
        date_created: '2024-01-15T10:00:00Z',
    },
    // Module 2: Quy trình làm việc
    {
        id: 'l4',
        module_id: 'm2',
        title: 'Quy trình nghỉ phép',
        type: 'video',
        content: null,
        video_url: 'https://vimeo.com/123456789',
        video_provider: 'vimeo',
        video_id: '123456789',
        external_link: null,
        file_attachment: null,
        duration: 8,
        is_required: true,
        status: 'published',
        sort: 1,
        date_created: '2024-01-15T10:00:00Z',
    },
    {
        id: 'l5',
        module_id: 'm2',
        title: 'Portal HR',
        type: 'link',
        content: null,
        video_url: null,
        video_provider: null,
        video_id: null,
        external_link: 'https://hr.company.com',
        file_attachment: null,
        duration: null,
        is_required: false,
        status: 'published',
        sort: 2,
        date_created: '2024-01-15T10:00:00Z',
    },
    {
        id: 'l6',
        module_id: 'm2',
        title: 'Kiểm tra kiến thức Module 2',
        type: 'quiz',
        content: null,
        video_url: null,
        video_provider: null,
        video_id: null,
        external_link: null,
        file_attachment: null,
        duration: 10,
        is_required: true,
        status: 'published',
        sort: 3,
        date_created: '2024-01-15T10:00:00Z',
    },
    // Module 4: Custom Hooks
    {
        id: 'l7',
        module_id: 'm4',
        title: 'Giới thiệu về Custom Hooks',
        type: 'video',
        content: null,
        video_url: 'https://www.youtube.com/watch?v=abc123',
        video_provider: 'youtube',
        video_id: 'abc123',
        external_link: null,
        file_attachment: null,
        duration: 20,
        is_required: true,
        status: 'published',
        sort: 1,
        date_created: '2024-02-10T10:00:00Z',
    },
    {
        id: 'l8',
        module_id: 'm4',
        title: 'Xây dựng useLocalStorage hook',
        type: 'article',
        content:
            '# useLocalStorage\n\nHook để lưu trữ state vào localStorage...\n\n```javascript\nfunction useLocalStorage(key, initialValue) {\n  // implementation\n}\n```',
        video_url: null,
        video_provider: null,
        video_id: null,
        external_link: null,
        file_attachment: null,
        duration: 15,
        is_required: true,
        status: 'published',
        sort: 2,
        date_created: '2024-02-10T10:00:00Z',
    },
];

/**
 * Helper function to get modules by course ID
 */
export const getModulesByCourseId = courseId => {
    return mockModules.filter(m => m.course_id === courseId);
};

/**
 * Helper function to get lessons by module ID
 */
export const getLessonsByModuleId = moduleId => {
    return mockLessons.filter(l => l.module_id === moduleId);
};

/**
 * Helper function to get modules with lessons for a course
 */
export const getModulesWithLessons = courseId => {
    const modules = getModulesByCourseId(courseId);
    return modules.map(module => ({
        ...module,
        lessons: getLessonsByModuleId(module.id),
    }));
};
