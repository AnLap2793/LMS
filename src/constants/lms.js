/**
 * LMS-specific Constants
 * Các hằng số dành riêng cho hệ thống LMS
 */

// ============================================
// COURSE STATUS
// ============================================
export const COURSE_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
};

export const COURSE_STATUS_OPTIONS = [
    { value: 'draft', label: 'Nháp', color: 'default' },
    { value: 'published', label: 'Đã xuất bản', color: 'success' },
    { value: 'archived', label: 'Lưu trữ', color: 'warning' },
];

export const COURSE_STATUS_MAP = {
    draft: { label: 'Nháp', color: 'default' },
    published: { label: 'Đã xuất bản', color: 'success' },
    archived: { label: 'Lưu trữ', color: 'warning' },
};

// ============================================
// COURSE DIFFICULTY
// ============================================
export const COURSE_DIFFICULTY = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
};

export const COURSE_DIFFICULTY_OPTIONS = [
    { value: 'beginner', label: 'Cơ bản', color: 'green' },
    { value: 'intermediate', label: 'Trung bình', color: 'orange' },
    { value: 'advanced', label: 'Nâng cao', color: 'red' },
];

export const COURSE_DIFFICULTY_MAP = {
    beginner: { label: 'Cơ bản', color: 'green' },
    intermediate: { label: 'Trung bình', color: 'orange' },
    advanced: { label: 'Nâng cao', color: 'red' },
};

// ============================================
// LESSON TYPES
// ============================================
export const LESSON_TYPE = {
    VIDEO: 'video',
    ARTICLE: 'article',
    FILE: 'file',
    LINK: 'link',
    QUIZ: 'quiz',
};

export const LESSON_TYPE_OPTIONS = [
    { value: 'video', label: 'Video', icon: 'PlayCircleOutlined', color: '#1890ff' },
    { value: 'article', label: 'Bài viết', icon: 'FileTextOutlined', color: '#52c41a' },
    { value: 'file', label: 'Tài liệu', icon: 'FileOutlined', color: '#faad14' },
    { value: 'link', label: 'Liên kết', icon: 'LinkOutlined', color: '#722ed1' },
    { value: 'quiz', label: 'Bài kiểm tra', icon: 'FormOutlined', color: '#eb2f96' },
];

export const LESSON_TYPE_MAP = {
    video: { label: 'Video', icon: 'PlayCircleOutlined', color: '#1890ff' },
    article: { label: 'Bài viết', icon: 'FileTextOutlined', color: '#52c41a' },
    file: { label: 'Tài liệu', icon: 'FileOutlined', color: '#faad14' },
    link: { label: 'Liên kết', icon: 'LinkOutlined', color: '#722ed1' },
    quiz: { label: 'Bài kiểm tra', icon: 'FormOutlined', color: '#eb2f96' },
};

// ============================================
// VIDEO PROVIDERS
// ============================================
export const VIDEO_PROVIDER = {
    YOUTUBE: 'youtube',
    GOOGLE_DRIVE: 'google_drive',
};

export const VIDEO_PROVIDER_OPTIONS = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'google_drive', label: 'Google Drive' },
];

// ============================================
// ENROLLMENT STATUS
// ============================================
export const ENROLLMENT_STATUS = {
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    EXPIRED: 'expired',
};

export const ENROLLMENT_STATUS_OPTIONS = [
    { value: 'assigned', label: 'Đã giao', color: 'default' },
    { value: 'in_progress', label: 'Đang học', color: 'processing' },
    { value: 'completed', label: 'Hoàn thành', color: 'success' },
    { value: 'expired', label: 'Quá hạn', color: 'error' },
];

// ============================================
// MODULE STATUS
// ============================================
export const MODULE_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
};

export const MODULE_STATUS_OPTIONS = [
    { value: 'draft', label: 'Nháp', color: 'default' },
    { value: 'published', label: 'Đã xuất bản', color: 'success' },
];

// ============================================
// QUESTION TYPES
// ============================================
export const QUESTION_TYPE = {
    SINGLE: 'single',
    MULTIPLE: 'multiple',
    TEXT: 'text',
};

export const QUESTION_TYPE_OPTIONS = [
    { value: 'single', label: 'Một đáp án đúng', color: 'blue' },
    { value: 'multiple', label: 'Nhiều đáp án đúng', color: 'purple' },
    { value: 'text', label: 'Tự luận / Điền từ', color: 'orange' },
];

export const QUESTION_TYPE_MAP = {
    single: { label: 'Một đáp án', color: 'blue' },
    multiple: { label: 'Nhiều đáp án', color: 'purple' },
    text: { label: 'Tự luận', color: 'orange' },
};

// ============================================
// QUESTION DIFFICULTY
// ============================================
export const QUESTION_DIFFICULTY = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
};

export const QUESTION_DIFFICULTY_OPTIONS = [
    { value: 'easy', label: 'Dễ', color: 'green' },
    { value: 'medium', label: 'Trung bình', color: 'orange' },
    { value: 'hard', label: 'Khó', color: 'red' },
];

export const QUESTION_DIFFICULTY_MAP = {
    easy: { label: 'Dễ', color: 'green' },
    medium: { label: 'Trung bình', color: 'orange' },
    hard: { label: 'Khó', color: 'red' },
};

// ============================================
// QUESTION CATEGORY
// ============================================
export const QUESTION_CATEGORY = {
    PROGRAMMING: 'programming',
    DATABASE: 'database',
    DESIGN: 'design',
    SOFT_SKILLS: 'soft_skills',
};

export const QUESTION_CATEGORY_OPTIONS = [
    { value: 'programming', label: 'Lập trình', color: 'blue' },
    { value: 'database', label: 'Cơ sở dữ liệu', color: 'green' },
    { value: 'design', label: 'Thiết kế', color: 'purple' },
    { value: 'soft_skills', label: 'Kỹ năng mềm', color: 'cyan' },
];

export const QUESTION_CATEGORY_MAP = {
    programming: { label: 'Lập trình', color: 'blue' },
    database: { label: 'Cơ sở dữ liệu', color: 'green' },
    design: { label: 'Thiết kế', color: 'purple' },
    soft_skills: { label: 'Kỹ năng mềm', color: 'cyan' },
};

// ============================================
// QUESTION STATUS
// ============================================
export const QUESTION_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
};

export const QUESTION_STATUS_OPTIONS = [
    { value: 'active', label: 'Hoạt động', color: 'success' },
    { value: 'inactive', label: 'Không hoạt động', color: 'default' },
];

// ============================================
// DEFAULT VALUES
// ============================================
export const LMS_DEFAULTS = {
    COURSE_THUMBNAIL: '/images/course-placeholder.png',
    QUIZ_PASS_SCORE: 70,
    QUIZ_MAX_ATTEMPTS: 3,
    QUIZ_TIME_LIMIT: null, // No limit
};

// ============================================
// PAGINATION
// ============================================
export const LMS_PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
};
