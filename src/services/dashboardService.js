/**
 * Dashboard Service - Aggregates data for Admin Dashboard
 * Directus Implementation
 */
import { directus } from './directus';
import { readItems, aggregate, readUsers } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

export const dashboardService = {
    /**
     * Lấy thống kê tổng quan (Admin Dashboard)
     */
    getAdminStats: async () => {
        // Run aggregations in parallel
        const [coursesCount, learnersCount, completedEnrollmentsCount, totalEnrollmentsCount] = await Promise.all([
            // Total Courses
            directus.request(aggregate(COLLECTIONS.COURSES, { aggregate: { count: '*' } })),

            // Total Learners (Users)
            // Note: Reading users count might require specific permissions or aggregation on directus_users
            // Fallback: simplified count if aggregate fails or return list length (limit)
            directus.request(readUsers({ limit: 0, meta: 'total_count' })).catch(() => ({ meta: { total_count: 0 } })),

            // Completed Enrollments
            directus.request(
                aggregate(COLLECTIONS.ENROLLMENTS, {
                    aggregate: { count: '*' },
                    query: { filter: { status: { _eq: 'completed' } } },
                })
            ),

            // Total Enrollments (for completion rate)
            directus.request(aggregate(COLLECTIONS.ENROLLMENTS, { aggregate: { count: '*' } })),
        ]);

        const totalCourses = Number(coursesCount[0]?.count) || 0;
        // Directus readUsers with meta returns { data: [], meta: { total_count: X } }
        const totalLearners = learnersCount?.meta?.total_count || 0;
        const completed = Number(completedEnrollmentsCount[0]?.count) || 0;
        const totalEnrollments = Number(totalEnrollmentsCount[0]?.count) || 0;

        const completionRate = totalEnrollments > 0 ? Math.round((completed / totalEnrollments) * 100) : 0;

        return {
            totalCourses,
            coursesThisWeek: 0, // Requires date filter logic
            totalLearners,
            learnersThisWeek: 0,
            completedEnrollments: completed,
            completedThisWeek: 0,
            completionRate,
            rateChange: 0,
        };
    },

    /**
     * Lấy dữ liệu biểu đồ xu hướng học tập
     */
    getMonthlyProgress: async () => {
        // Mocking trend data for now as efficient time-series aggregation
        // requires complex querying or custom endpoints in Directus
        return [
            { month: 'T1', enrollments: 65, completions: 40 },
            { month: 'T2', enrollments: 59, completions: 45 },
            { month: 'T3', enrollments: 80, completions: 50 },
            { month: 'T4', enrollments: 81, completions: 60 },
            { month: 'T5', enrollments: 56, completions: 70 },
            { month: 'T6', enrollments: 55, completions: 65 },
            { month: 'T7', enrollments: 40, completions: 85 },
        ];
    },

    /**
     * Lấy trạng thái khóa học (Pie Chart)
     */
    getCoursesByStatus: async () => {
        const result = await directus.request(
            aggregate(COLLECTIONS.COURSES, {
                aggregate: { count: '*' },
                groupBy: ['status'],
            })
        );

        // Map status to colors and labels
        const map = {
            published: { label: 'Đã xuất bản', color: '#52c41a' },
            draft: { label: 'Nháp', color: '#faad14' },
            archived: { label: 'Lưu trữ', color: '#bfbfbf' },
        };

        return result.map(item => ({
            name: item.status,
            count: Number(item.count),
            label: map[item.status]?.label || item.status,
            color: map[item.status]?.color || '#1890ff',
        }));
    },

    /**
     * Lấy khóa học phổ biến
     */
    getPopularCourses: async (limit = 5) => {
        const items = await directus.request(
            readItems(COLLECTIONS.COURSES, {
                limit,
                sort: ['-date_created'], // Fallback since we don't have enrollment count field yet
                fields: ['id', 'title', 'status'],
            })
        );

        return items.map(c => ({
            id: c.id,
            title: c.title,
            completionRate: Math.floor(Math.random() * 100), // Mock completion rate
        }));
    },

    /**
     * Lấy danh sách learners có nguy cơ
     */
    getAtRiskLearners: async (limit = 5) => {
        // Mock logic: return empty or random for now
        // Real logic: query enrollments where due_date < now AND status != completed
        return [];
    },

    /**
     * Lấy hoạt động gần đây
     */
    getRecentActivity: async (limit = 5) => {
        // Fetch recent enrollments as a proxy for activity
        const items = await directus.request(
            readItems(COLLECTIONS.ENROLLMENTS, {
                limit,
                sort: ['-date_created'],
                fields: ['id', 'date_created', 'status', 'user.first_name', 'user.last_name', 'course.title'],
            })
        );

        return items.map(item => ({
            id: item.id,
            user: `${item.user?.first_name} ${item.user?.last_name}`.trim(),
            action: item.status === 'completed' ? 'đã hoàn thành' : 'đã đăng ký',
            target: item.course?.title,
            timestamp: item.date_created,
            type: item.status === 'completed' ? 'completion' : 'enrollment',
        }));
    },

    /**
     * Lấy hoạt động tuần này của learner
     */
    getLearnerWeeklyActivity: async () => {
        // Mocking this based on current date for visual purposes
        // Real implementation requires aggregating logs/progress by date
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return days.map(day => ({
            day,
            minutes: Math.floor(Math.random() * 60), // Mock data
            lessons: Math.floor(Math.random() * 5),
        }));
    },

    /**
     * Lấy streak của learner
     */
    getLearnerStreak: async () => {
        return {
            currentStreak: 0, // Placeholder
            longestStreak: 0,
            averageMinutesPerDay: 0,
        };
    },
};
