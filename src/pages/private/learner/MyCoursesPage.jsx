import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Progress, Tag, Space, Typography, Tabs, Input, Empty, Button, Statistic, Divider } from 'antd';
import {
    BookOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined,
    SearchOutlined,
    TrophyOutlined,
    ExclamationCircleOutlined,
    RocketOutlined,
    NodeIndexOutlined,
    ArrowRightOutlined,
    FlagOutlined,
} from '@ant-design/icons';
import { mockEnrollments, mockLearningPaths } from '../../../mocks';
import { ENROLLMENT_STATUS_OPTIONS } from '../../../constants/lms';

const { Text, Title } = Typography;

/**
 * My Courses Page
 * Danh sách khóa học và lộ trình đã đăng ký của học viên
 */
function MyCoursesPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [searchText, setSearchText] = useState('');

    // Simulate current user's enrollments (user u1)
    const currentUserId = 'u1';
    const userEnrollments = mockEnrollments.filter(e => e.user_id === currentUserId);

    // Mock: User enrolled learning paths (first 2 for demo)
    const userLearningPaths = mockLearningPaths.filter(p => p.status === 'published').slice(0, 2);

    // Statistics
    const stats = useMemo(() => {
        const total = userEnrollments.length;
        const completed = userEnrollments.filter(e => e.status === 'completed').length;
        const inProgress = userEnrollments.filter(e => e.status === 'in_progress').length;
        const assigned = userEnrollments.filter(e => e.status === 'assigned').length;
        return { total, completed, inProgress, assigned, paths: userLearningPaths.length };
    }, [userEnrollments, userLearningPaths]);

    // Filtered enrollments
    const filteredEnrollments = useMemo(() => {
        let filtered = userEnrollments;

        if (activeTab !== 'all') {
            filtered = filtered.filter(e => e.status === activeTab);
        }

        if (searchText.trim()) {
            filtered = filtered.filter(e => e.course?.title?.toLowerCase().includes(searchText.toLowerCase()));
        }

        return filtered;
    }, [userEnrollments, activeTab, searchText]);

    // Get days until deadline
    const getDaysUntilDeadline = dueDate => {
        if (!dueDate) return null;
        const now = new Date();
        const due = new Date(dueDate);
        const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        return diff;
    };

    // Format duration
    const formatDuration = minutes => {
        if (!minutes) return '';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}p` : `${hours}h`;
        }
        return `${mins}p`;
    };

    // Get status config
    const getStatusConfig = status => {
        return ENROLLMENT_STATUS_OPTIONS.find(s => s.value === status) || { label: status, color: 'default' };
    };

    // Handle continue learning
    const handleContinueLearning = enrollment => {
        navigate(`/learn/${enrollment.course_id}`);
    };

    // Handle path click
    const handlePathClick = pathId => {
        navigate(`/learning-paths/${pathId}`);
    };

    // Tab items
    const tabItems = [
        {
            key: 'all',
            label: (
                <span>
                    Tất cả <Tag>{stats.total}</Tag>
                </span>
            ),
        },
        {
            key: 'in_progress',
            label: (
                <span>
                    Đang học <Tag color="processing">{stats.inProgress}</Tag>
                </span>
            ),
        },
        {
            key: 'assigned',
            label: (
                <span>
                    Chưa bắt đầu <Tag>{stats.assigned}</Tag>
                </span>
            ),
        },
        {
            key: 'completed',
            label: (
                <span>
                    Hoàn thành <Tag color="success">{stats.completed}</Tag>
                </span>
            ),
        },
    ];

    // Render course card
    const renderCourseCard = enrollment => {
        const days = getDaysUntilDeadline(enrollment.due_date);
        const statusConfig = getStatusConfig(enrollment.status);
        const isCompleted = enrollment.status === 'completed';
        const isUrgent = days !== null && days <= 3 && days >= 0 && !isCompleted;
        const isOverdue = days !== null && days < 0 && !isCompleted;

        return (
            <Col xs={24} sm={12} lg={8} key={enrollment.id}>
                <Card
                    hoverable
                    onClick={() => handleContinueLearning(enrollment)}
                    style={{
                        height: '100%',
                        borderColor: isOverdue ? '#ff4d4f' : isUrgent ? '#faad14' : undefined,
                    }}
                    cover={
                        <div
                            style={{
                                height: 140,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                            }}
                        >
                            <BookOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />

                            <Tag color={statusConfig.color} style={{ position: 'absolute', top: 12, right: 12 }}>
                                {statusConfig.label}
                            </Tag>

                            {isCompleted && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: 'rgba(82, 196, 26, 0.9)',
                                        color: '#fff',
                                        padding: '4px 12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 4,
                                    }}
                                >
                                    <CheckCircleOutlined />
                                    <span>Đã hoàn thành</span>
                                </div>
                            )}
                        </div>
                    }
                    actions={[
                        <Button
                            type={isCompleted ? 'default' : 'primary'}
                            icon={isCompleted ? <CheckCircleOutlined /> : <PlayCircleOutlined />}
                            onClick={e => {
                                e.stopPropagation();
                                handleContinueLearning(enrollment);
                            }}
                        >
                            {isCompleted ? 'Xem lại' : enrollment.status === 'assigned' ? 'Bắt đầu học' : 'Tiếp tục'}
                        </Button>,
                    ]}
                >
                    <Card.Meta
                        title={
                            <Text
                                strong
                                style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {enrollment.course?.title}
                            </Text>
                        }
                        description={
                            <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                {!isCompleted && (
                                    <div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: 4,
                                            }}
                                        >
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                Tiến độ
                                            </Text>
                                            <Text style={{ fontSize: 12 }}>{enrollment.progress_percentage}%</Text>
                                        </div>
                                        <Progress
                                            percent={enrollment.progress_percentage}
                                            showInfo={false}
                                            strokeColor="#ea4544"
                                            size="small"
                                        />
                                    </div>
                                )}

                                {enrollment.due_date && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {isOverdue ? (
                                            <>
                                                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                                                <Text type="danger" style={{ fontSize: 12 }}>
                                                    Quá hạn {Math.abs(days)} ngày
                                                </Text>
                                            </>
                                        ) : isUrgent ? (
                                            <>
                                                <ClockCircleOutlined style={{ color: '#faad14' }} />
                                                <Text style={{ color: '#faad14', fontSize: 12 }}>Còn {days} ngày</Text>
                                            </>
                                        ) : isCompleted ? (
                                            <>
                                                <TrophyOutlined style={{ color: '#52c41a' }} />
                                                <Text type="success" style={{ fontSize: 12 }}>
                                                    Hoàn thành{' '}
                                                    {new Date(enrollment.completed_at).toLocaleDateString('vi-VN')}
                                                </Text>
                                            </>
                                        ) : (
                                            <>
                                                <ClockCircleOutlined style={{ color: '#999' }} />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Hạn: {new Date(enrollment.due_date).toLocaleDateString('vi-VN')}
                                                </Text>
                                            </>
                                        )}
                                    </div>
                                )}
                            </Space>
                        }
                    />
                </Card>
            </Col>
        );
    };

    // Render learning path card (compact version)
    const renderPathCard = path => {
        const courseCount = path.courses?.length || 0;
        // Mock progress: 1 out of total courses completed
        const completedCourses = 1;
        const progressPercent = Math.round((completedCourses / courseCount) * 100);

        return (
            <Col xs={24} sm={12} key={path.id}>
                <Card hoverable onClick={() => handlePathClick(path.id)} style={{ height: '100%' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 12,
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <NodeIndexOutlined style={{ fontSize: 28, color: '#fff' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <Space style={{ marginBottom: 4 }}>
                                {path.is_mandatory && (
                                    <Tag color="red" style={{ fontSize: 11 }}>
                                        <FlagOutlined /> Bắt buộc
                                    </Tag>
                                )}
                                <Tag color="purple" style={{ fontSize: 11 }}>
                                    {courseCount} khóa học
                                </Tag>
                            </Space>
                            <Title level={5} style={{ margin: '4px 0 8px' }} ellipsis>
                                {path.title}
                            </Title>
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Tiến độ
                                    </Text>
                                    <Text style={{ fontSize: 12 }}>
                                        {completedCourses}/{courseCount} khóa học
                                    </Text>
                                </div>
                                <Progress
                                    percent={progressPercent}
                                    showInfo={false}
                                    strokeColor="#eb2f96"
                                    size="small"
                                />
                            </div>
                            <Button type="link" style={{ padding: 0 }} onClick={() => handlePathClick(path.id)}>
                                Tiếp tục học <ArrowRightOutlined />
                            </Button>
                        </div>
                    </div>
                </Card>
            </Col>
        );
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 8 }}>
                    Khóa học của tôi
                </Title>
                <Text type="secondary">Quản lý và theo dõi tiến độ học tập của bạn</Text>
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Tổng khóa học"
                            value={stats.total}
                            prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Đang học"
                            value={stats.inProgress}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<PlayCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Hoàn thành"
                            value={stats.completed}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Lộ trình"
                            value={stats.paths}
                            valueStyle={{ color: '#eb2f96' }}
                            prefix={<RocketOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Learning Paths Section */}
            {userLearningPaths.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                        }}
                    >
                        <Title level={4} style={{ margin: 0 }}>
                            <RocketOutlined style={{ color: '#eb2f96', marginRight: 8 }} />
                            Lộ trình của tôi
                        </Title>
                        <Button type="link" onClick={() => navigate('/courses')}>
                            Xem tất cả lộ trình <ArrowRightOutlined />
                        </Button>
                    </div>
                    <Row gutter={[16, 16]}>{userLearningPaths.map(path => renderPathCard(path))}</Row>
                </div>
            )}

            <Divider />

            {/* Courses Section */}
            <Title level={4} style={{ marginBottom: 16 }}>
                <BookOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                Khóa học đã đăng ký
            </Title>

            {/* Tabs & Search */}
            <Card style={{ marginBottom: 24 }}>
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 16,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} style={{ marginBottom: 0 }} />
                    <Input
                        placeholder="Tìm kiếm khóa học..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                        allowClear
                    />
                </div>
            </Card>

            {/* Course Grid */}
            {filteredEnrollments.length > 0 ? (
                <Row gutter={[16, 16]}>{filteredEnrollments.map(enrollment => renderCourseCard(enrollment))}</Row>
            ) : (
                <Card>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            searchText
                                ? 'Không tìm thấy khóa học phù hợp'
                                : activeTab === 'all'
                                  ? 'Bạn chưa đăng ký khóa học nào'
                                  : `Không có khóa học nào ở trạng thái này`
                        }
                    >
                        {!searchText && activeTab === 'all' && (
                            <Button type="primary" onClick={() => navigate('/courses')}>
                                Khám phá khóa học
                            </Button>
                        )}
                    </Empty>
                </Card>
            )}
        </div>
    );
}

export default MyCoursesPage;
