import { useState, useMemo } from 'react';
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
    message,
    Statistic,
    Avatar,
    Tabs,
    Rate,
    Tooltip,
} from 'antd';
import {
    BookOutlined,
    ClockCircleOutlined,
    UserOutlined,
    PlayCircleOutlined,
    FileTextOutlined,
    FileOutlined,
    FormOutlined,
    CheckCircleOutlined,
    ArrowLeftOutlined,
    TeamOutlined,
    StarFilled,
    LikeOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import { mockCourses, mockEnrollments, mockInstructors, mockReviews, getModulesWithLessons } from '../../../mocks';
import { COURSE_DIFFICULTY_MAP, LESSON_TYPE_MAP } from '../../../constants/lms';

const { Title, Text, Paragraph } = Typography;

/**
 * Course Detail Page
 * Chi tiết khóa học trước khi đăng ký
 */
function CourseDetailPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [enrolling, setEnrolling] = useState(false);

    // Get course data
    const course = useMemo(() => {
        return mockCourses.find(c => c.id === courseId);
    }, [courseId]);

    // Get instructor
    const instructor = useMemo(() => {
        if (!course?.instructor_id) return null;
        return mockInstructors.find(i => i.id === course.instructor_id);
    }, [course]);

    // Get reviews
    const reviews = useMemo(() => {
        return mockReviews.filter(r => r.course_id === courseId);
    }, [courseId]);

    // Get modules for this course (with lessons nested)
    const modules = useMemo(() => {
        return getModulesWithLessons(courseId);
    }, [courseId]);

    // Get related courses
    const relatedCourses = useMemo(() => {
        if (!course) return [];
        // Simple logic: same tags or difficulty, exclude current
        return mockCourses
            .filter(c => c.id !== courseId && c.tags?.some(t => course.tags?.some(ct => ct.id === t.id)))
            .slice(0, 3);
    }, [course, courseId]);

    // Check if user is already enrolled (mock - user u1)
    const currentUserId = 'u1';
    const existingEnrollment = mockEnrollments.find(e => e.user_id === currentUserId && e.course_id === courseId);
    const isEnrolled = !!existingEnrollment;

    // Calculate totals
    const stats = useMemo(() => {
        let totalLessons = 0;
        let totalDuration = 0;
        let totalQuizzes = 0;

        modules.forEach(module => {
            module.lessons?.forEach(lesson => {
                totalLessons++;
                totalDuration += lesson.duration || 0;
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

    // Format duration
    const formatDuration = minutes => {
        if (!minutes) return '';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
        }
        return `${mins} phút`;
    };

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
    const handleEnroll = () => {
        setEnrolling(true);
        setTimeout(() => {
            message.success('Đăng ký khóa học thành công!');
            setEnrolling(false);
            navigate('/my-courses');
        }, 1000);
    };

    // Handle continue learning
    const handleContinue = () => {
        navigate(`/learn/${courseId}`);
    };

    if (!course) {
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

    const items = [
        {
            key: 'content',
            label: 'Nội dung khóa học',
            children: (
                <div style={{ marginTop: 16 }}>
                    {modules.length > 0 ? (
                        <Collapse accordion defaultActiveKey={modules[0]?.id} expandIconPlacement="end">
                            {modules.map((module, index) => (
                                <Collapse.Panel
                                    key={module.id}
                                    header={
                                        <Space>
                                            <Avatar size="small" style={{ backgroundColor: '#ea4544' }}>
                                                {index + 1}
                                            </Avatar>
                                            <Text strong>{module.title}</Text>
                                            <Tag>{module.lessons?.length || 0} bài</Tag>
                                        </Space>
                                    }
                                >
                                    <List
                                        dataSource={module.lessons || []}
                                        renderItem={lesson => (
                                            <List.Item style={{ padding: '12px 0' }}>
                                                <Space style={{ width: '100%' }}>
                                                    {getLessonIcon(lesson.type)}
                                                    <div style={{ flex: 1 }}>
                                                        <Text>{lesson.title}</Text>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {LESSON_TYPE_MAP[lesson.type]?.label}
                                                            {lesson.duration && ` • ${lesson.duration} phút`}
                                                        </Text>
                                                    </div>
                                                </Space>
                                            </List.Item>
                                        )}
                                    />
                                </Collapse.Panel>
                            ))}
                        </Collapse>
                    ) : (
                        <Text type="secondary">Chưa có nội dung</Text>
                    )}
                </div>
            ),
        },
        {
            key: 'reviews',
            label: `Đánh giá (${reviews.length})`,
            children: (
                <div style={{ marginTop: 16 }}>
                    {reviews.length > 0 ? (
                        <List
                            itemLayout="vertical"
                            dataSource={reviews}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar src={item.user_avatar}>{item.user_name[0]}</Avatar>}
                                        title={
                                            <Space>
                                                <Text strong>{item.user_name}</Text>
                                                <Rate disabled defaultValue={item.rating} style={{ fontSize: 14 }} />
                                            </Space>
                                        }
                                        description={new Date(item.date).toLocaleDateString('vi-VN')}
                                    />
                                    <Paragraph>{item.content}</Paragraph>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Result
                            icon={<MessageOutlined />}
                            title="Chưa có đánh giá nào"
                            subTitle="Hãy là người đầu tiên đánh giá khóa học này!"
                        />
                    )}
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
                                {course.tags?.map(tag => (
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
                                    <Text>{formatDuration(stats.duration || course.duration)}</Text>
                                </Space>
                                <Space>
                                    <BookOutlined />
                                    <Text>{stats.lessons} bài học</Text>
                                </Space>
                                <Space>
                                    <TeamOutlined />
                                    <Text>{course.enrollments_count || 0} học viên</Text>
                                </Space>
                                <Space>
                                    <StarFilled style={{ color: '#faad14' }} />
                                    <Text>4.8 (120 đánh giá)</Text>
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

                    {/* Related Courses */}
                    {relatedCourses.length > 0 && (
                        <div style={{ marginTop: 40 }}>
                            <Title level={4} style={{ marginBottom: 24 }}>
                                Khóa học liên quan
                            </Title>
                            <Row gutter={[24, 24]}>
                                {relatedCourses.map(rc => (
                                    <Col xs={24} sm={12} md={8} key={rc.id}>
                                        <Card
                                            hoverable
                                            cover={
                                                <div
                                                    style={{
                                                        height: 140,
                                                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <BookOutlined style={{ fontSize: 40, color: '#888' }} />
                                                </div>
                                            }
                                            onClick={() => navigate(`/course/${rc.id}`)}
                                        >
                                            <Card.Meta
                                                title={rc.title}
                                                description={
                                                    <Space>
                                                        <TeamOutlined /> {rc.enrollments_count}
                                                    </Space>
                                                }
                                            />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}
                </Col>

                {/* Sidebar */}
                <Col xs={24} lg={8}>
                    {/* Enroll card */}
                    <Card style={{ marginBottom: 24, position: 'sticky', top: 24 }}>
                        {/* Course thumbnail */}
                        <div
                            style={{
                                height: 180,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 24,
                            }}
                        >
                            <BookOutlined style={{ fontSize: 64, color: 'rgba(255,255,255,0.9)' }} />
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
                                    value={formatDuration(stats.duration || course.duration)}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic title="Bài kiểm tra" value={stats.quizzes} prefix={<FormOutlined />} />
                            </Col>
                        </Row>

                        <Divider />

                        {/* Action button */}
                        {isEnrolled ? (
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Tag
                                    color="success"
                                    icon={<CheckCircleOutlined />}
                                    style={{ width: '100%', textAlign: 'center', padding: '8px' }}
                                >
                                    Đã đăng ký • Tiến độ {existingEnrollment.progress_percentage}%
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
                            <Button type="primary" size="large" block loading={enrolling} onClick={handleEnroll}>
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

                    {/* Instructor Info */}
                    {instructor && courseId !== '1' && (
                        <Card title="Giảng viên" style={{ marginBottom: 24 }}>
                            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                <Avatar
                                    size={80}
                                    src={instructor.avatar}
                                    style={{ marginBottom: 12, border: '2px solid #f0f0f0' }}
                                >
                                    {instructor.name[0]}
                                </Avatar>
                                <Title level={4} style={{ margin: 0 }}>
                                    {instructor.name}
                                </Title>
                                <Text type="secondary">{instructor.job_title}</Text>
                            </div>

                            <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}>
                                {instructor.bio}
                            </Paragraph>

                            <Row gutter={16} style={{ textAlign: 'center', marginTop: 16 }}>
                                <Col span={8}>
                                    <Statistic
                                        title="Khóa học"
                                        value={instructor.course_count}
                                        valueStyle={{ fontSize: 16 }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Học viên"
                                        value={instructor.student_count}
                                        valueStyle={{ fontSize: 16 }}
                                        formatter={value => `${value > 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Đánh giá"
                                        value={instructor.rating}
                                        valueStyle={{ fontSize: 16 }}
                                        prefix={<StarFilled style={{ color: '#faad14', fontSize: 14 }} />}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    );
}

export default CourseDetailPage;
