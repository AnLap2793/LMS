import { Row, Col, Card, Statistic, Progress, List, Avatar, Typography, Space, Tag } from 'antd';
import {
    BookOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    RiseOutlined,
    ClockCircleOutlined,
    TrophyOutlined,
    UserOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../../components/common';
import { mockDashboardStats, mockPopularCourses, mockAtRiskLearners, mockRecentActivity } from '../../../mocks';

const { Text, Title } = Typography;

/**
 * Admin Dashboard Page
 * Trang tổng quan cho Admin LMS
 */
function DashboardPage() {
    const stats = mockDashboardStats;
    const popularCourses = mockPopularCourses;
    const atRiskLearners = mockAtRiskLearners;
    const recentActivity = mockRecentActivity;

    // Helper để format deadline
    const formatDeadline = days => {
        if (days < 0) {
            return <Text type="danger">Quá hạn {Math.abs(days)} ngày</Text>;
        } else if (days <= 2) {
            return <Text type="warning">Còn {days} ngày</Text>;
        }
        return <Text>Còn {days} ngày</Text>;
    };

    // Helper để lấy icon cho activity
    const getActivityIcon = type => {
        const iconMap = {
            completion: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            enrollment: <UserOutlined style={{ color: '#1890ff' }} />,
            quiz_pass: <TrophyOutlined style={{ color: '#faad14' }} />,
            course_created: <BookOutlined style={{ color: '#722ed1' }} />,
            certificate: <TrophyOutlined style={{ color: '#eb2f96' }} />,
        };
        return iconMap[type] || <ClockCircleOutlined />;
    };

    return (
        <div>
            <PageHeader title="Dashboard" subtitle="Tổng quan hệ thống đào tạo" />

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng khóa học"
                            value={stats.totalCourses}
                            prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                            suffix={
                                <Text type="success" style={{ fontSize: 14 }}>
                                    +{stats.coursesThisWeek} tuần này
                                </Text>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Học viên đang học"
                            value={stats.totalLearners}
                            prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                            suffix={
                                <Text type="success" style={{ fontSize: 14 }}>
                                    +{stats.learnersThisWeek} tuần này
                                </Text>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã hoàn thành"
                            value={stats.completedEnrollments}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            suffix={
                                <Text type="success" style={{ fontSize: 14 }}>
                                    +{stats.completedThisWeek} tuần này
                                </Text>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tỷ lệ hoàn thành"
                            value={stats.completionRate}
                            suffix="%"
                            prefix={<RiseOutlined style={{ color: '#faad14' }} />}
                            valueStyle={{ color: stats.rateChange >= 0 ? '#52c41a' : '#ff4d4f' }}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {stats.rateChange >= 0 ? '+' : ''}
                            {stats.rateChange}% so với tháng trước
                        </Text>
                    </Card>
                </Col>
            </Row>

            {/* Charts and Lists */}
            <Row gutter={[16, 16]}>
                {/* Popular Courses */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <TrophyOutlined style={{ color: '#faad14' }} />
                                <span>Khóa học phổ biến</span>
                            </Space>
                        }
                        style={{ height: '100%' }}
                    >
                        <List
                            dataSource={popularCourses}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <div style={{ flex: 1 }}>
                                        <Space>
                                            <Text strong style={{ color: index < 3 ? '#ea4544' : '#999' }}>
                                                #{index + 1}
                                            </Text>
                                            <Text>{item.title}</Text>
                                        </Space>
                                        <div style={{ marginTop: 8 }}>
                                            <Progress
                                                percent={item.completionRate}
                                                size="small"
                                                strokeColor="#ea4544"
                                                format={percent => `${percent}% hoàn thành`}
                                            />
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                {/* At-Risk Learners */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <WarningOutlined style={{ color: '#faad14' }} />
                                <span>Học viên cần chú ý</span>
                            </Space>
                        }
                        style={{ height: '100%' }}
                    >
                        <List
                            dataSource={atRiskLearners}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#ea4544' }} />
                                        }
                                        title={item.name}
                                        description={
                                            <div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {item.course}
                                                </Text>
                                                <br />
                                                {formatDeadline(item.daysUntilDeadline)}
                                            </div>
                                        }
                                    />
                                    <div style={{ textAlign: 'right' }}>
                                        <Progress
                                            type="circle"
                                            percent={item.progress}
                                            size={40}
                                            strokeColor={item.daysUntilDeadline < 0 ? '#ff4d4f' : '#ea4544'}
                                        />
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Recent Activity */}
            <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Card
                        title={
                            <Space>
                                <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                <span>Hoạt động gần đây</span>
                            </Space>
                        }
                    >
                        <List
                            dataSource={recentActivity}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={getActivityIcon(item.type)}
                                        title={
                                            <span>
                                                <Text strong>{item.user}</Text>{' '}
                                                <Text type="secondary">{item.action}</Text>{' '}
                                                <Text strong style={{ color: '#ea4544' }}>
                                                    {item.target}
                                                </Text>
                                            </span>
                                        }
                                        description={
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {new Date(item.timestamp).toLocaleString('vi-VN')}
                                            </Text>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default DashboardPage;
