import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Button,
    Collapse,
    List,
    Divider,
    Result,
    Statistic,
    Avatar,
    Tabs,
    Rate,
    Skeleton,
    Spin,
} from 'antd';
import {
    BookOutlined,
    ClockCircleOutlined,
    PlayCircleOutlined,
    FileTextOutlined,
    FileOutlined,
    FormOutlined,
    CheckCircleOutlined,
    ArrowLeftOutlined,
    TeamOutlined,
    StarFilled,
    MessageOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import { useCourseDetail } from '../../../hooks/useCourses';
import { useEnrollmentByCourse, useEnrollCourse } from '../../../hooks/useEnrollments';
import { COURSE_DIFFICULTY_MAP, LESSON_TYPE_MAP } from '../../../constants/lms';
import { getAssetUrl, formatDuration } from '../../../utils/directusHelpers';

const { Title, Text, Paragraph } = Typography;

/**
 * Course Detail Page
 * Chi tiết khóa học trước khi đăng ký
 */
function CourseDetailPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    // Fetch course detail
    const { data: course, isLoading: courseLoading, error: courseError } = useCourseDetail(courseId);

    // Check enrollment status
    const { data: enrollment, isLoading: enrollmentLoading } = useEnrollmentByCourse(courseId);

    // Enroll mutation
    const enrollMutation = useEnrollCourse();

    const isEnrolled = !!enrollment;

    // Process modules from course data
    const modules = useMemo(() => {
        if (!course?.modules) return [];

        console.log(course.modules);

        // Filter published content for learners
        const publishedModules = course.modules
            .filter(m => m.status === 'published')
            .map(m => ({
                ...m,
                lessons: (m.lessons || []).filter(l => l.status === 'published'),
            }))
            // Optional: Show module even if empty? Usually yes, to show course structure.
            // .filter(m => m.lessons.length > 0)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

        return publishedModules;
    }, [course]);

    // Flatten tags từ M2M relation
    const courseTags = useMemo(() => {
        return course?.tags?.map(t => t.tags_id).filter(Boolean) || [];
    }, [course]);

    // Calculate totals
    const stats = useMemo(() => {
        let totalLessons = 0;
        let totalDuration = 0;
        let totalQuizzes = 0;

        modules.forEach(module => {
            const lessons = module.lessons || [];
            lessons.forEach(lesson => {
                totalLessons++;
                totalDuration += lesson.duration_minutes || 0;
                if (lesson.type === 'quiz') totalQuizzes++;
            });
        });

        return {
            modules: modules.length,
            lessons: totalLessons,
            duration: totalDuration,
            quizzes: totalQuizzes,
        };
    }, [modules]);

    // Get lesson icon
    const getLessonIcon = type => {
        const config = LESSON_TYPE_MAP[type];
        const iconMap = {
            video: <PlayCircleOutlined style={{ color: config?.color }} />,
            article: <FileTextOutlined style={{ color: config?.color }} />,
            file: <FileOutlined style={{ color: config?.color }} />,
            quiz: <FormOutlined style={{ color: config?.color }} />,
        };
        return iconMap[type] || <FileOutlined />;
    };

    // Handle enroll
    const handleEnroll = async () => {
        try {
            await enrollMutation.mutateAsync(courseId);
            navigate('/my-courses');
        } catch {
            // Error handled by global handler
        }
    };

    // Handle continue learning
    const handleContinue = () => {
        navigate(`/learn/${courseId}`);
    };

    // Loading state
    if (courseLoading) {
        return (
            <div style={{ padding: 24 }}>
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/courses')}
                    style={{ marginBottom: 16 }}
                >
                    Quay lại
                </Button>
                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <Card>
                            <Skeleton active paragraph={{ rows: 6 }} />
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card>
                            <Skeleton active paragraph={{ rows: 4 }} />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }

    // Error or not found
    if (courseError || !course) {
        return (
            <Result
                status="404"
                title="Không tìm thấy khóa học"
                subTitle="Khóa học này không tồn tại hoặc đã bị xóa"
                extra={
                    <Button type="primary" onClick={() => navigate('/courses')}>
                        Quay lại danh sách
                    </Button>
                }
            />
        );
    }

    const difficultyConfig = COURSE_DIFFICULTY_MAP[course.difficulty] || {};
    const thumbnailUrl = getAssetUrl(course.thumbnail);

    const items = [
        {
            key: 'content',
            label: 'Nội dung khóa học',
            children: (
                <div style={{ marginTop: 16 }}>
                    {modules.length > 0 ? (
                        <Collapse accordion defaultActiveKey={modules[0]?.id} expandIconPlacement="end">
                            {modules.map((module, index) => {
                                const lessons = module.lessons || [];
                                return (
                                    <Collapse.Panel
                                        key={module.id}
                                        header={
                                            <Space>
                                                <Avatar size="small" style={{ backgroundColor: '#ea4544' }}>
                                                    {index + 1}
                                                </Avatar>
                                                <Text strong>{module.title}</Text>
                                                <Tag>{lessons.length} bài</Tag>
                                            </Space>
                                        }
                                    >
                                        <List
                                            dataSource={lessons}
                                            renderItem={lesson => (
                                                <List.Item style={{ padding: '12px 0' }}>
                                                    <Space style={{ width: '100%' }}>
                                                        {getLessonIcon(lesson.type)}
                                                        <div style={{ flex: 1 }}>
                                                            <Text>{lesson.title}</Text>
                                                            <br />
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                {LESSON_TYPE_MAP[lesson.type]?.label}
                                                                {lesson.duration_minutes &&
                                                                    ` • ${lesson.duration_minutes} phút`}
                                                            </Text>
                                                        </div>
                                                        {lesson.is_preview && (
                                                            <Tag color="blue" style={{ fontSize: 11 }}>
                                                                Xem trước
                                                            </Tag>
                                                        )}
                                                    </Space>
                                                </List.Item>
                                            )}
                                        />
                                    </Collapse.Panel>
                                );
                            })}
                        </Collapse>
                    ) : (
                        <Text type="secondary">Chưa có nội dung</Text>
                    )}
                </div>
            ),
        },
        {
            key: 'reviews',
            label: 'Đánh giá',
            children: (
                <div style={{ marginTop: 16 }}>
                    <Result
                        icon={<MessageOutlined />}
                        title="Chưa có đánh giá nào"
                        subTitle="Hãy là người đầu tiên đánh giá khóa học này!"
                    />
                </div>
            ),
        },
    ];

    return (
        <div>
            {/* Back button */}
            <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/courses')}
                style={{ marginBottom: 16 }}
            >
                Quay lại
            </Button>

            <Row gutter={24}>
                {/* Main content */}
                <Col xs={24} lg={16}>
                    {/* Course header */}
                    <Card style={{ marginBottom: 24 }}>
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            {/* Tags */}
                            <Space wrap>
                                {courseTags.map(tag => (
                                    <Tag key={tag.id} color={tag.color}>
                                        {tag.name}
                                    </Tag>
                                ))}
                                {course.difficulty && (
                                    <Tag color={difficultyConfig.color}>{difficultyConfig.label}</Tag>
                                )}
                            </Space>

                            {/* Title */}
                            <Title level={2} style={{ margin: 0 }}>
                                {course.title}
                            </Title>

                            {/* Description */}
                            <Paragraph type="secondary" style={{ fontSize: 16, margin: 0 }}>
                                {course.description}
                            </Paragraph>

                            {/* Meta info */}
                            <Space split={<Divider type="vertical" />} wrap>
                                <Space>
                                    <ClockCircleOutlined />
                                    <Text>{formatDuration(stats.duration) || `${course.duration_hours || 0} giờ`}</Text>
                                </Space>
                                <Space>
                                    <BookOutlined />
                                    <Text>{stats.lessons} bài học</Text>
                                </Space>
                                <Space>
                                    <TeamOutlined />
                                    <Text>{course.enrollments_count || 0} học viên</Text>
                                </Space>
                            </Space>
                        </Space>
                    </Card>

                    {/* Learning objectives */}
                    {course.learning_objectives && (
                        <Card title="Mục tiêu học tập" style={{ marginBottom: 24 }}>
                            <div style={{ whiteSpace: 'pre-line' }}>
                                {course.learning_objectives.split('\n').map((line, index) => (
                                    <div key={index} style={{ marginBottom: 8 }}>
                                        {line.startsWith('-') ? (
                                            <Space>
                                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                                <Text>{line.substring(1).trim()}</Text>
                                            </Space>
                                        ) : (
                                            <Text>{line}</Text>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Course Content Tabs */}
                    <Card style={{ marginBottom: 24 }}>
                        <Tabs defaultActiveKey="content" items={items} />
                    </Card>
                </Col>

                {/* Sidebar */}
                <Col xs={24} lg={8}>
                    {/* Enroll card */}
                    <Card style={{ marginBottom: 24, position: 'sticky', top: 24 }}>
                        {/* Course thumbnail */}
                        <div
                            style={{
                                height: 180,
                                background: thumbnailUrl
                                    ? `url(${thumbnailUrl}) center/cover`
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 24,
                            }}
                        >
                            {!thumbnailUrl && <BookOutlined style={{ fontSize: 64, color: 'rgba(255,255,255,0.9)' }} />}
                        </div>

                        {/* Stats */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            <Col span={12}>
                                <Statistic title="Chương" value={stats.modules} prefix={<BookOutlined />} />
                            </Col>
                            <Col span={12}>
                                <Statistic title="Bài học" value={stats.lessons} prefix={<PlayCircleOutlined />} />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Thời lượng"
                                    value={formatDuration(stats.duration) || `${course.duration_hours || 0}h`}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic title="Bài kiểm tra" value={stats.quizzes} prefix={<FormOutlined />} />
                            </Col>
                        </Row>

                        <Divider />

                        {/* Action button */}
                        {enrollmentLoading ? (
                            <div style={{ textAlign: 'center', padding: 16 }}>
                                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                            </div>
                        ) : isEnrolled ? (
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Tag
                                    color="success"
                                    icon={<CheckCircleOutlined />}
                                    style={{ width: '100%', textAlign: 'center', padding: '8px' }}
                                >
                                    Đã đăng ký • Tiến độ {enrollment.progress_percentage || 0}%
                                </Tag>
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    icon={<PlayCircleOutlined />}
                                    onClick={handleContinue}
                                >
                                    Tiếp tục học
                                </Button>
                            </Space>
                        ) : (
                            <Button
                                type="primary"
                                size="large"
                                block
                                loading={enrollMutation.isPending}
                                onClick={handleEnroll}
                            >
                                Đăng ký khóa học
                            </Button>
                        )}

                        {/* Additional info */}
                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {course.enrollments_count || 0} người đã đăng ký khóa học này
                            </Text>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default CourseDetailPage;
