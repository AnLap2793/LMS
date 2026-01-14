import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Row,
    Col,
    Progress,
    Tag,
    Space,
    Typography,
    Tabs,
    Input,
    Empty,
    Button,
    Statistic,
    Divider,
    Skeleton,
} from 'antd';
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
import { useMyEnrollments, useMyEnrollmentStats } from '../../../hooks/useEnrollments';
import { ENROLLMENT_STATUS_OPTIONS, COURSE_DIFFICULTY_MAP } from '../../../constants/lms';
import { getAssetUrl, formatDate, formatDuration } from '../../../utils/directusHelpers';

const { Text, Title, Paragraph } = Typography;

/**
 * My Courses Page
 * Danh sách khóa học và lộ trình đã đăng ký của học viên
 */
function MyCoursesPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [searchText, setSearchText] = useState('');

    // Fetch enrollments từ API
    const {
        data: enrollments = [],
        isLoading: enrollmentsLoading,
        error: enrollmentsError,
    } = useMyEnrollments({
        status: activeTab !== 'all' ? activeTab : undefined,
        search: searchText || undefined,
    });

    // Fetch stats
    const { data: stats = {}, isLoading: statsLoading } = useMyEnrollmentStats();

    // TODO: Fetch learning paths khi có service
    const userLearningPaths = [];

    // Get days until deadline
    const getDaysUntilDeadline = dueDate => {
        if (!dueDate) return null;
        const now = new Date();
        const due = new Date(dueDate);
        const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        return diff;
    };

    // Get status config
    const getStatusConfig = status => {
        return ENROLLMENT_STATUS_OPTIONS.find(s => s.value === status) || { label: status, color: 'default' };
    };

    // Handle continue learning
    const handleContinueLearning = enrollment => {
        const courseId = enrollment.course?.id || enrollment.course_id;
        navigate(`/learn/${courseId}`);
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
                    Tất cả <Tag>{stats.total || 0}</Tag>
                </span>
            ),
        },
        {
            key: 'in_progress',
            label: (
                <span>
                    Đang học <Tag color="processing">{stats.inProgress || 0}</Tag>
                </span>
            ),
        },
        {
            key: 'assigned',
            label: (
                <span>
                    Chưa bắt đầu <Tag>{stats.assigned || 0}</Tag>
                </span>
            ),
        },
        {
            key: 'completed',
            label: (
                <span>
                    Hoàn thành <Tag color="success">{stats.completed || 0}</Tag>
                </span>
            ),
        },
    ];

    // Render course card
    const renderCourseCard = enrollment => {
        const course = enrollment.course;
        const days = getDaysUntilDeadline(enrollment.due_date);
        const statusConfig = getStatusConfig(enrollment.status);
        const isCompleted = enrollment.status === 'completed';
        const isUrgent = days !== null && days <= 3 && days >= 0 && !isCompleted;
        const isOverdue = days !== null && days < 0 && !isCompleted;
        const thumbnailUrl = getAssetUrl(course?.thumbnail);
        const difficultyConfig = COURSE_DIFFICULTY_MAP[course?.difficulty] || {};

        // Flatten tags từ M2M relation
        const courseTags = course?.tags?.map(t => t.tags_id).filter(Boolean) || [];

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
                                height: 160,
                                background: thumbnailUrl
                                    ? `url(${thumbnailUrl}) center/cover`
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                            }}
                        >
                            {!thumbnailUrl && <BookOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />}

                            {/* Status tag ở góc trên bên phải */}
                            <Tag color={statusConfig.color} style={{ position: 'absolute', top: 12, right: 12 }}>
                                {statusConfig.label}
                            </Tag>

                            {/* Difficulty tag ở góc trên bên trái (nếu có) */}
                            {course?.difficulty && (
                                <Tag color={difficultyConfig.color} style={{ position: 'absolute', top: 12, left: 12 }}>
                                    {difficultyConfig.label}
                                </Tag>
                            )}

                            {/* Completed banner */}
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
                                {course?.title}
                            </Text>
                        }
                        description={
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                {/* Progress bar - luôn render để đảm bảo layout nhất quán */}
                                <div style={{ minHeight: 32 }}>
                                    {!isCompleted ? (
                                        <>
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
                                                <Text style={{ fontSize: 12 }}>
                                                    {enrollment.progress_percentage || 0}%
                                                </Text>
                                            </div>
                                            <Progress
                                                percent={enrollment.progress_percentage || 0}
                                                showInfo={false}
                                                strokeColor="#ea4544"
                                                size="small"
                                            />
                                        </>
                                    ) : (
                                        <div style={{ height: 32 }} />
                                    )}
                                </div>

                                {/* Tags và Duration cùng hàng */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {/* Tags bên trái */}
                                    {courseTags.length > 0 ? (
                                        <Space wrap size={[4, 4]}>
                                            {courseTags.slice(0, 3).map(tag => (
                                                <Tag key={tag.id} color={tag.color} style={{ fontSize: 11 }}>
                                                    {tag.name}
                                                </Tag>
                                            ))}
                                        </Space>
                                    ) : (
                                        <div />
                                    )}

                                    {/* Duration bên phải */}
                                    {course?.duration_hours && (
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            <ClockCircleOutlined /> {formatDuration(course.duration_hours * 60)}
                                        </Text>
                                    )}
                                </div>

                                {/* Meta info: Due date/Status */}
                                {enrollment.due_date && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {isOverdue ? (
                                            <>
                                                <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
                                                <Text type="danger" style={{ fontSize: 12 }}>
                                                    Quá hạn {Math.abs(days)} ngày
                                                </Text>
                                            </>
                                        ) : isUrgent ? (
                                            <>
                                                <ClockCircleOutlined style={{ color: '#faad14', fontSize: 12 }} />
                                                <Text style={{ color: '#faad14', fontSize: 12 }}>Còn {days} ngày</Text>
                                            </>
                                        ) : isCompleted ? (
                                            <>
                                                <TrophyOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                                                <Text type="success" style={{ fontSize: 12 }}>
                                                    Hoàn thành
                                                </Text>
                                            </>
                                        ) : (
                                            <>
                                                <ClockCircleOutlined style={{ color: '#999', fontSize: 12 }} />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Hạn: {formatDate(enrollment.due_date)}
                                                </Text>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Action button */}
                                <div style={{ marginTop: 4, textAlign: 'center' }}>
                                    <Button
                                        type={isCompleted ? 'default' : 'primary'}
                                        size="middle"
                                        icon={isCompleted ? <CheckCircleOutlined /> : <PlayCircleOutlined />}
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleContinueLearning(enrollment);
                                        }}
                                    >
                                        {isCompleted
                                            ? 'Xem lại'
                                            : enrollment.status === 'assigned'
                                              ? 'Bắt đầu học'
                                              : 'Tiếp tục'}
                                    </Button>
                                </div>
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

    // Loading skeleton
    const renderSkeleton = () => (
        <Row gutter={[16, 16]}>
            {[1, 2, 3, 4, 5, 6].map(i => (
                <Col xs={24} sm={12} lg={8} key={i}>
                    <Card>
                        <Skeleton active />
                    </Card>
                </Col>
            ))}
        </Row>
    );

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
                            value={statsLoading ? '-' : stats.total || 0}
                            prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Đang học"
                            value={statsLoading ? '-' : stats.inProgress || 0}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<PlayCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Hoàn thành"
                            value={statsLoading ? '-' : stats.completed || 0}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Lộ trình"
                            value={userLearningPaths.length}
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
                        <Button type="link" onClick={() => navigate('/learning-paths')}>
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
                        style={{ width: '100%', maxWidth: 250 }}
                        allowClear
                    />
                </div>
            </Card>

            {/* Course Grid */}
            {enrollmentsLoading ? (
                renderSkeleton()
            ) : enrollmentsError ? (
                <Card>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không thể tải danh sách khóa học. Vui lòng thử lại sau."
                    >
                        <Button type="primary" onClick={() => window.location.reload()}>
                            Tải lại
                        </Button>
                    </Empty>
                </Card>
            ) : enrollments.length > 0 ? (
                <Row gutter={[16, 16]}>{enrollments.map(enrollment => renderCourseCard(enrollment))}</Row>
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
