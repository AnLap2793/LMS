import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Space, Tag, Button, Steps, Row, Col, Statistic, Result, Divider, message } from 'antd';
import {
    RocketOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined,
    LockOutlined,
    BookOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import { mockLearningPaths, mockCourses, mockEnrollments } from '../../../mocks';

const { Title, Text, Paragraph } = Typography;

/**
 * Learning Path Detail Page
 * Chi tiết lộ trình học tập
 */
function LearningPathDetailPage() {
    const { pathId } = useParams();
    const navigate = useNavigate();
    const [enrolling, setEnrolling] = useState(false);

    // Get path data
    const path = useMemo(() => {
        return mockLearningPaths.find(p => p.id === pathId);
    }, [pathId]);

    // Get courses in this path with full details
    const pathCourses = useMemo(() => {
        if (!path) return [];
        return path.courses.map(pc => {
            const courseDetail = mockCourses.find(c => c.id === pc.id);
            return {
                ...pc,
                ...courseDetail,
            };
        });
    }, [path]);

    // Check enrollment status (Mock for user u1)
    const currentUserId = 'u1';

    // Calculate progress
    const progressStats = useMemo(() => {
        if (!pathCourses.length) return { completed: 0, total: 0, percent: 0 };

        const completedCount = pathCourses.filter(c => {
            const enrollment = mockEnrollments.find(e => e.course_id === c.id && e.user_id === currentUserId);
            return enrollment?.status === 'completed';
        }).length;

        return {
            completed: completedCount,
            total: pathCourses.length,
            percent: Math.round((completedCount / pathCourses.length) * 100),
        };
    }, [pathCourses]);

    const handleEnrollPath = () => {
        setEnrolling(true);
        setTimeout(() => {
            message.success('Đã đăng ký lộ trình thành công!');
            setEnrolling(false);
            // In real app, this would create enrollments for all courses
        }, 1000);
    };

    if (!path) {
        return (
            <Result
                status="404"
                title="Không tìm thấy lộ trình"
                extra={
                    <Button type="primary" onClick={() => navigate('/my-courses')}>
                        Quay lại
                    </Button>
                }
            />
        );
    }

    return (
        <div>
            <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/my-courses')}
                style={{ marginBottom: 16 }}
            >
                Quay lại
            </Button>

            <Card style={{ marginBottom: 24 }}>
                <Row gutter={24} align="middle">
                    <Col xs={24} md={16}>
                        <Space direction="vertical" size={16}>
                            <Space>
                                <Tag color="#ea4544" style={{ fontSize: 14, padding: '4px 10px' }}>
                                    Lộ trình học tập
                                </Tag>
                                {path.is_mandatory && <Tag color="red">Bắt buộc</Tag>}
                            </Space>
                            <Title level={2} style={{ margin: 0 }}>
                                {path.title}
                            </Title>
                            <Paragraph style={{ fontSize: 16, maxWidth: 800 }}>{path.description}</Paragraph>
                            <Space split={<Divider type="vertical" />}>
                                <Space>
                                    <ClockCircleOutlined />
                                    <Text>
                                        {Math.floor(path.total_duration / 60)} giờ {path.total_duration % 60} phút
                                    </Text>
                                </Space>
                                <Space>
                                    <BookOutlined />
                                    <Text>{pathCourses.length} khóa học</Text>
                                </Space>
                            </Space>
                        </Space>
                    </Col>
                    <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                        <div
                            style={{
                                background: '#f5f5f5',
                                padding: 24,
                                borderRadius: 8,
                                display: 'inline-block',
                                minWidth: 250,
                                textAlign: 'center',
                            }}
                        >
                            <Statistic
                                title="Tiến độ hoàn thành"
                                value={progressStats.percent}
                                suffix="%"
                                valueStyle={{ color: '#52c41a' }}
                            />
                            <div style={{ marginTop: 16 }}>
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    onClick={handleEnrollPath}
                                    loading={enrolling}
                                >
                                    {progressStats.percent > 0 ? 'Tiếp tục học' : 'Bắt đầu ngay'}
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>

            <Card title="Danh sách khóa học">
                <div style={{ padding: '24px 0' }}>
                    <Steps
                        direction="vertical"
                        current={progressStats.completed}
                        items={pathCourses.map((course, index) => {
                            // Determine status
                            const enrollment = mockEnrollments.find(
                                e => e.course_id === course.id && e.user_id === currentUserId
                            );
                            const isCompleted = enrollment?.status === 'completed';
                            const isEnrolled = !!enrollment;
                            const isLocked = index > 0 && !pathCourses[index - 1].isCompleted && !isEnrolled; // Simple logic: locked if prev not done

                            // Override for demo: Unlock first 2
                            const demoLocked = index > 1;

                            return {
                                title: (
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            width: '100%',
                                        }}
                                    >
                                        <Text strong style={{ fontSize: 16 }}>
                                            {course.title}
                                        </Text>
                                        <Button
                                            type={isCompleted ? 'default' : 'primary'}
                                            ghost={!isCompleted}
                                            disabled={demoLocked && !isCompleted}
                                            icon={
                                                isCompleted ? (
                                                    <CheckCircleOutlined />
                                                ) : demoLocked ? (
                                                    <LockOutlined />
                                                ) : (
                                                    <PlayCircleOutlined />
                                                )
                                            }
                                            onClick={() => navigate(`/course/${course.id}`)}
                                        >
                                            {isCompleted ? 'Đã học xong' : demoLocked ? 'Đang khóa' : 'Vào học'}
                                        </Button>
                                    </div>
                                ),
                                description: (
                                    <div style={{ marginTop: 8, marginBottom: 24, maxWidth: 800 }}>
                                        <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                                            {course.description}
                                        </Paragraph>
                                        <Space>
                                            <Tag>{course.difficulty === 'beginner' ? 'Cơ bản' : 'Nâng cao'}</Tag>
                                            <Text type="secondary">
                                                <ClockCircleOutlined /> {course.duration} phút
                                            </Text>
                                        </Space>
                                    </div>
                                ),
                                status: isCompleted ? 'finish' : demoLocked ? 'wait' : 'process',
                                icon: isCompleted ? (
                                    <CheckCircleOutlined />
                                ) : demoLocked ? (
                                    <LockOutlined />
                                ) : (
                                    <RocketOutlined />
                                ),
                            };
                        })}
                    />
                </div>
            </Card>
        </div>
    );
}

export default LearningPathDetailPage;
