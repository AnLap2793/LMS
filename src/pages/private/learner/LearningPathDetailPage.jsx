import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Space, Tag, Button, Steps, Row, Col, Statistic, Result, Divider, message, Spin } from 'antd';
import {
    RocketOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined,
    LockOutlined,
    BookOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { learningPathService } from '../../../services/learningPathService';
import { enrollmentService } from '../../../services/enrollmentService';
import { queryKeys } from '../../../constants/queryKeys';
import { showSuccess, showError } from '../../../utils/errorHandler';

const { Title, Text, Paragraph } = Typography;

/**
 * Learning Path Detail Page
 * Chi tiết lộ trình học tập
 */
function LearningPathDetailPage() {
    const { pathId } = useParams();
    const navigate = useNavigate();

    // Fetch path data with courses
    const { data: path, isLoading } = useQuery({
        queryKey: queryKeys.learningPaths.detail(pathId),
        queryFn: () => learningPathService.getWithCourses(pathId),
    });

    // Fetch my enrollments to check status
    const { data: myEnrollments = [] } = useQuery({
        queryKey: queryKeys.enrollments.mine(),
        queryFn: () => enrollmentService.getMyEnrollments({ limit: -1 }),
    });

    const enrollMutation = useMutation({
        mutationFn: async courses => {
            // Enroll in all courses in the path
            // In a real scenario, might have a specific API to enroll in a path
            // Here loop through courses
            const promises = courses.map(c => enrollmentService.enrollCourse(c.id));
            return Promise.all(promises);
        },
        onSuccess: () => {
            showSuccess('Đã đăng ký lộ trình thành công!');
            // Invalidate enrollments
        },
        onError: showError,
    });

    // Calculate progress
    const progressStats = useMemo(() => {
        if (!path?.courses?.length) return { completed: 0, total: 0, percent: 0 };

        const completedCount = path.courses.filter(c => {
            const enrollment = myEnrollments.find(e => e.course_id === c.id);
            return enrollment?.status === 'completed';
        }).length;

        return {
            completed: completedCount,
            total: path.courses.length,
            percent: Math.round((completedCount / path.courses.length) * 100),
        };
    }, [path, myEnrollments]);

    const handleEnrollPath = () => {
        if (!path?.courses) return;
        // Filter courses not yet enrolled
        const coursesToEnroll = path.courses.filter(c => !myEnrollments.find(e => e.course_id === c.id));

        if (coursesToEnroll.length === 0) {
            message.info('Bạn đã đăng ký tất cả khóa học trong lộ trình này');
            return;
        }

        enrollMutation.mutate(coursesToEnroll);
    };

    if (isLoading) {
        return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
    }

    if (!path) {
        return (
            <Result
                status="404"
                title="Không tìm thấy lộ trình"
                extra={
                    <Button type="primary" onClick={() => navigate('/learning-paths')}>
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
                onClick={() => navigate('/learning-paths')}
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
                                    <Text>{path.courses?.length || 0} khóa học</Text>
                                </Space>
                            </Space>
                        </Space>
                    </Col>
                    <Col xs={24} md={8} style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end' }}>
                        <div
                            style={{
                                background: '#f5f5f5',
                                padding: 24,
                                borderRadius: 8,
                                width: '100%',
                                maxWidth: 300,
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
                                    loading={enrollMutation.isPending}
                                    disabled={progressStats.percent === 100}
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
                        items={path.courses?.map((course, index) => {
                            // Determine status
                            const enrollment = myEnrollments.find(e => e.course_id === course.id);
                            const isCompleted = enrollment?.status === 'completed';
                            const isEnrolled = !!enrollment;

                            // Locked logic: locked if previous not completed AND not mandatory?
                            // Or generally enforce sequential?
                            // For flexibility, let's say locked if previous not completed IF we enforce sequence.
                            // Currently simple logic:
                            const isLocked = index > 0 && !path.courses[index - 1].isCompleted && !isEnrolled; // Simplified

                            return {
                                title: (
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            width: '100%',
                                            gap: 16,
                                        }}
                                    >
                                        <Text strong style={{ fontSize: 16 }}>
                                            {course.title}
                                        </Text>
                                        <Button
                                            type={isCompleted ? 'default' : 'primary'}
                                            ghost={!isCompleted}
                                            // disabled={isLocked && !isCompleted}
                                            icon={isCompleted ? <CheckCircleOutlined /> : <PlayCircleOutlined />}
                                            onClick={() => navigate(`/courses/${course.id}`)}
                                        >
                                            {isCompleted ? 'Đã học xong' : isEnrolled ? 'Tiếp tục' : 'Xem chi tiết'}
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
                                status: isCompleted ? 'finish' : isEnrolled ? 'process' : 'wait',
                                icon: isCompleted ? <CheckCircleOutlined /> : <RocketOutlined />,
                            };
                        })}
                    />
                </div>
            </Card>
        </div>
    );
}

export default LearningPathDetailPage;
