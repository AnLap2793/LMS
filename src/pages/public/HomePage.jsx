/**
 * HomePage - Trang chủ dành cho learner
 * Hiển thị: Continue Learning, Featured Courses, Learning Paths, Quick Stats
 */
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Progress, Tag, Skeleton, Empty, Statistic, Space, Avatar } from 'antd';
import {
    BookOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    RightOutlined,
    PlayCircleOutlined,
    FireOutlined,
    RocketOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { useAuth } from '../../context/AuthContext';
import { useFeaturedCourses, usePopularCourses } from '../../hooks/useCourses';
import { useContinueLearning, useMyEnrollmentStats } from '../../hooks/useEnrollments';
import DifficultyTag from '../../components/common/DifficultyTag';
import { getAssetUrl } from '../../utils/directusHelpers';
import { useLearnerWeeklyActivity, useLearnerStreak } from '../../hooks/useDashboard';

// ... (imports)

function WeeklyActivitySection() {
    const { data: weeklyData = [] } = useLearnerWeeklyActivity();
    const { data: streak = {} } = useLearnerStreak();

    const totalMinutesThisWeek = weeklyData.reduce((sum, d) => sum + (d.minutes || 0), 0);
    const totalLessonsThisWeek = weeklyData.reduce((sum, d) => sum + (d.lessons || 0), 0);

    return (
        <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                    <ThunderboltOutlined style={{ marginRight: 8, color: '#faad14' }} />
                    Hoạt động tuần này
                </Title>
                <Space>
                    <Tag color="orange" icon={<FireOutlined />}>
                        Streak: {streak.currentStreak || 0} ngày
                    </Tag>
                </Space>
            </div>

            <Row gutter={[16, 16]}>
                {/* Chart */}
                <Col xs={24} md={16}>
                    <Card bodyStyle={{ padding: '16px 16px 8px 0' }}>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={weeklyData}>
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="minutes" radius={[4, 4, 0, 0]} barSize={32}>
                                    {weeklyData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.minutes > 0 ? '#ea4544' : '#f0f0f0'}
                                            fillOpacity={entry.minutes > 0 ? 0.8 : 0.5}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Stats */}
                <Col xs={24} md={8}>
                    <Card style={{ height: '100%' }}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Statistic
                                    title="Tổng phút học"
                                    value={totalMinutesThisWeek}
                                    suffix="phút"
                                    valueStyle={{ color: '#ea4544' }}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Bài học hoàn thành"
                                    value={totalLessonsThisWeek}
                                    suffix="bài"
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Col>
                            <Col span={24}>
                                <Text type="secondary">
                                    Trung bình: <Text strong>{streak.averageMinutesPerDay || 0} phút/ngày</Text>
                                </Text>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

/**
 * Card hiển thị khóa học đang học (với progress)
 */
function ContinueLearningCard({ enrollment }) {
    const navigate = useNavigate();
    const course = enrollment.course;
    const thumbnailUrl = getAssetUrl(course?.thumbnail);

    const handleContinue = () => {
        navigate(`/learn/${course.id}`);
    };

    return (
        <Card
            hoverable
            onClick={handleContinue}
            cover={
                <div style={{ height: 140, overflow: 'hidden', position: 'relative' }}>
                    <img
                        alt={course?.title}
                        src={thumbnailUrl || '/images/course-placeholder.png'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            background: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 12,
                        }}
                    >
                        <ClockCircleOutlined /> {course?.duration_hours || 0}h
                    </div>
                </div>
            }
            bodyStyle={{ padding: 16 }}
        >
            <Text strong ellipsis style={{ display: 'block', marginBottom: 8 }}>
                {course?.title}
            </Text>
            <Progress percent={enrollment.progress_percentage || 0} size="small" strokeColor="#ea4544" />
            <div style={{ marginTop: 12, textAlign: 'center' }}>
                <Button type="primary" size="middle" icon={<PlayCircleOutlined />}>
                    Tiếp tục học
                </Button>
            </div>
        </Card>
    );
}

/**
 * Card hiển thị khóa học (catalog/featured)
 */
function CourseCard({ course }) {
    const navigate = useNavigate();
    const thumbnailUrl = getAssetUrl(course?.thumbnail);

    // Flatten tags từ M2M relation
    const tags = course?.tags?.map(t => t.tags_id).filter(Boolean) || [];

    const handleClick = () => {
        navigate(`/courses/${course.id}`);
    };

    return (
        <Card
            hoverable
            onClick={handleClick}
            cover={
                <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                    <img
                        alt={course?.title}
                        src={thumbnailUrl || '/images/course-placeholder.png'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                        }}
                    >
                        <DifficultyTag difficulty={course?.difficulty} />
                    </div>
                </div>
            }
            bodyStyle={{ padding: 16 }}
        >
            <Text strong ellipsis={{ rows: 2 }} style={{ display: 'block', minHeight: 44 }}>
                {course?.title}
            </Text>
            <div style={{ marginTop: 8 }}>
                {tags.slice(0, 2).map(tag => (
                    <Tag key={tag.id} color={tag.color} style={{ marginBottom: 4 }}>
                        {tag.name}
                    </Tag>
                ))}
            </div>
            <div
                style={{
                    marginTop: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#8c8c8c',
                    fontSize: 13,
                }}
            >
                <span>
                    <ClockCircleOutlined /> {course?.duration_hours || 0} giờ
                </span>
                <Button type="link" size="small" style={{ padding: 0 }}>
                    Xem chi tiết <RightOutlined />
                </Button>
            </div>
        </Card>
    );
}

/**
 * Section Continue Learning
 */
function ContinueLearningSection() {
    const { data: enrollments, isLoading, error } = useContinueLearning(4);

    if (isLoading) {
        return (
            <div style={{ marginBottom: 32 }}>
                <Title level={4}>
                    <PlayCircleOutlined style={{ marginRight: 8, color: '#ea4544' }} />
                    Tiếp tục học
                </Title>
                <Row gutter={[16, 16]}>
                    {[1, 2, 3, 4].map(i => (
                        <Col xs={24} sm={12} md={6} key={i}>
                            <Card>
                                <Skeleton active />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        );
    }

    if (error || !enrollments || enrollments.length === 0) {
        return null; // Không hiển thị section nếu không có data
    }

    return (
        <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                    <PlayCircleOutlined style={{ marginRight: 8, color: '#ea4544' }} />
                    Tiếp tục học
                </Title>
                <Link to="/my-courses">
                    <Button type="link">
                        Xem tất cả <RightOutlined />
                    </Button>
                </Link>
            </div>
            <Row gutter={[16, 16]}>
                {enrollments.map(enrollment => (
                    <Col xs={24} sm={12} md={6} key={enrollment.id}>
                        <ContinueLearningCard enrollment={enrollment} />
                    </Col>
                ))}
            </Row>
        </div>
    );
}

/**
 * Section Featured/Popular Courses
 */
function FeaturedCoursesSection() {
    const { data: featuredCourses, isLoading: loadingFeatured } = useFeaturedCourses(6);
    const { data: popularCourses, isLoading: loadingPopular } = usePopularCourses(6);

    // Ưu tiên featured, fallback sang popular
    const courses = featuredCourses?.length > 0 ? featuredCourses : popularCourses;
    const isLoading = loadingFeatured || loadingPopular;
    const sectionTitle = featuredCourses?.length > 0 ? 'Khóa học nổi bật' : 'Khóa học phổ biến';

    if (isLoading) {
        return (
            <div style={{ marginBottom: 32 }}>
                <Title level={4}>
                    <FireOutlined style={{ marginRight: 8, color: '#ea4544' }} />
                    Khóa học nổi bật
                </Title>
                <Row gutter={[16, 16]}>
                    {[1, 2, 3, 4].map(i => (
                        <Col xs={24} sm={12} md={6} key={i}>
                            <Card>
                                <Skeleton active />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        );
    }

    if (!courses || courses.length === 0) {
        return (
            <div style={{ marginBottom: 32 }}>
                <Title level={4}>
                    <FireOutlined style={{ marginRight: 8, color: '#ea4544' }} />
                    Khóa học nổi bật
                </Title>
                <Empty description="Chưa có khóa học nổi bật" />
            </div>
        );
    }

    return (
        <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                    <FireOutlined style={{ marginRight: 8, color: '#ea4544' }} />
                    {sectionTitle}
                </Title>
                <Link to="/courses">
                    <Button type="link">
                        Xem tất cả <RightOutlined />
                    </Button>
                </Link>
            </div>
            <Row gutter={[16, 16]}>
                {courses.slice(0, 4).map(course => (
                    <Col xs={24} sm={12} md={6} key={course.id}>
                        <CourseCard course={course} />
                    </Col>
                ))}
            </Row>
        </div>
    );
}

/**
 * Section Quick Actions (cho guest chưa đăng nhập)
 */
function GuestWelcomeSection() {
    return (
        <Card
            style={{
                background: 'linear-gradient(135deg, #ea4544 0%, #ff6b6a 100%)',
                border: 'none',
                marginBottom: 24,
                textAlign: 'center',
            }}
        >
            <Title level={2} style={{ color: '#fff', margin: 0 }}>
                Chào mừng đến với LMS
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8, marginBottom: 24 }}>
                Hệ thống quản lý học tập trực tuyến. Đăng nhập để bắt đầu hành trình học tập của bạn!
            </Paragraph>
            <Space size="large">
                <Link to="/login">
                    <Button type="primary" size="large">
                        Đăng nhập
                    </Button>
                </Link>
                <Link to="/courses">
                    <Button size="large" style={{ background: '#fff', borderColor: '#fff' }}>
                        Xem khóa học
                    </Button>
                </Link>
            </Space>
        </Card>
    );
}

/**
 * Section Weekly Activity Chart
 * Biểu đồ hoạt động học tập trong tuần
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div
                style={{
                    background: '#fff',
                    padding: '8px 12px',
                    border: '1px solid #f0f0f0',
                    borderRadius: 6,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
            >
                <Text strong>{label}</Text>
                <div>
                    <Text type="secondary">{payload[0].value} phút học</Text>
                </div>
            </div>
        );
    }
    return null;
};

function WeeklyActivitySection() {
    const { data: weeklyData = [] } = useLearnerWeeklyActivity();
    const { data: streak = {} } = useLearnerStreak();

    const totalMinutesThisWeek = weeklyData.reduce((sum, d) => sum + (d.minutes || 0), 0);
    const totalLessonsThisWeek = weeklyData.reduce((sum, d) => sum + (d.lessons || 0), 0);

    return (
        <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                    <ThunderboltOutlined style={{ marginRight: 8, color: '#faad14' }} />
                    Hoạt động tuần này
                </Title>
                <Space>
                    <Tag color="orange" icon={<FireOutlined />}>
                        Streak: {streak.currentStreak || 0} ngày
                    </Tag>
                </Space>
            </div>

            <Row gutter={[16, 16]}>
                {/* Chart */}
                <Col xs={24} md={16}>
                    <Card bodyStyle={{ padding: '16px 16px 8px 0' }}>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={weeklyData}>
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="minutes" radius={[4, 4, 0, 0]} barSize={32}>
                                    {weeklyData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.minutes > 0 ? '#ea4544' : '#f0f0f0'}
                                            fillOpacity={entry.minutes > 0 ? 0.8 : 0.5}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Stats */}
                <Col xs={24} md={8}>
                    <Card style={{ height: '100%' }}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Statistic
                                    title="Tổng phút học"
                                    value={totalMinutesThisWeek}
                                    suffix="phút"
                                    valueStyle={{ color: '#ea4544' }}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Bài học hoàn thành"
                                    value={totalLessonsThisWeek}
                                    suffix="bài"
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Col>
                            <Col span={24}>
                                <Text type="secondary">
                                    Trung bình: <Text strong>{streak.averageMinutesPerDay || 0} phút/ngày</Text>
                                </Text>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

// ============================================
// Main Component
// ============================================

function HomePage() {
    const { user, loading: authLoading } = useAuth();
    const { data: stats, isLoading: statsLoading } = useMyEnrollmentStats();

    const isLoggedIn = !!user;

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            {/* Hero Section */}
            {authLoading ? (
                <Card style={{ marginBottom: 24 }}>
                    <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
            ) : isLoggedIn ? (
                <HeroSection user={user} stats={stats} loading={statsLoading} />
            ) : (
                <GuestWelcomeSection />
            )}

            {/* Weekly Activity Chart (chỉ khi đã đăng nhập) */}
            {isLoggedIn && <WeeklyActivitySection />}

            {/* Continue Learning (chỉ khi đã đăng nhập) */}
            {isLoggedIn && <ContinueLearningSection />}

            {/* Featured Courses */}
            <FeaturedCoursesSection />

            {/* Quick Links */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                    <Card hoverable>
                        <Link to="/courses" style={{ display: 'block', textAlign: 'center' }}>
                            <Avatar
                                size={64}
                                style={{ background: '#fff1f0', marginBottom: 16 }}
                                icon={<BookOutlined style={{ color: '#ea4544' }} />}
                            />
                            <Title level={5} style={{ margin: 0 }}>
                                Catalog khóa học
                            </Title>
                            <Text type="secondary">Khám phá tất cả khóa học</Text>
                        </Link>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card hoverable>
                        <Link to="/my-certificates" style={{ display: 'block', textAlign: 'center' }}>
                            <Avatar
                                size={64}
                                style={{ background: '#f6ffed', marginBottom: 16 }}
                                icon={<TrophyOutlined style={{ color: '#52c41a' }} />}
                            />
                            <Title level={5} style={{ margin: 0 }}>
                                Chứng chỉ của tôi
                            </Title>
                            <Text type="secondary">Xem các chứng chỉ đã đạt</Text>
                        </Link>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card hoverable>
                        <Link to="/profile" style={{ display: 'block', textAlign: 'center' }}>
                            <Avatar
                                size={64}
                                style={{ background: '#e6f7ff', marginBottom: 16 }}
                                icon={<RocketOutlined style={{ color: '#1890ff' }} />}
                            />
                            <Title level={5} style={{ margin: 0 }}>
                                Hồ sơ cá nhân
                            </Title>
                            <Text type="secondary">Quản lý thông tin cá nhân</Text>
                        </Link>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default HomePage;
