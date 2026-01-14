import { Row, Col, Card, Statistic, Progress, List, Avatar, Typography, Space } from 'antd';
import {
    BookOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    RiseOutlined,
    ClockCircleOutlined,
    TrophyOutlined,
    UserOutlined,
    WarningOutlined,
    BarChartOutlined,
    PieChartOutlined,
    LineChartOutlined,
} from '@ant-design/icons';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from 'recharts';
import { PageHeader } from '../../../components/common';
import {
    mockDashboardStats,
    mockPopularCourses,
    mockAtRiskLearners,
    mockRecentActivity,
    mockMonthlyProgress,
    mockDepartmentProgress,
    mockCoursesByStatus,
} from '../../../mocks';

const { Text } = Typography;

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
                            prefix={<RiseOutlined style={{ color: '#faad14' }} />}
                            valueStyle={{ color: stats.rateChange >= 0 ? '#52c41a' : '#ff4d4f' }}
                            suffix={
                                <Text type={stats.rateChange >= 0 ? 'success' : 'danger'} style={{ fontSize: 12 }}>
                                    {stats.completionRate}% ({stats.rateChange >= 0 ? '+' : ''}
                                    {stats.rateChange}% so với tháng trước)
                                </Text>
                            }
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts and Lists */}
            <Row gutter={[16, 16]}>
                {/* Area Chart - Learning Trends */}
                <Col xs={24} lg={16}>
                    <Card
                        title={
                            <Space>
                                <LineChartOutlined style={{ color: '#ea4544' }} />
                                <span>Xu hướng học tập theo tháng</span>
                            </Space>
                        }
                        style={{ height: '100%' }}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={mockMonthlyProgress}>
                                <defs>
                                    <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#52c41a" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: '1px solid #f0f0f0',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="enrollments"
                                    name="Đăng ký mới"
                                    stroke="#1890ff"
                                    fillOpacity={1}
                                    fill="url(#colorEnrollments)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completions"
                                    name="Hoàn thành"
                                    stroke="#52c41a"
                                    fillOpacity={1}
                                    fill="url(#colorCompletions)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Pie Chart - Course Status */}
                <Col xs={24} lg={8}>
                    <Card
                        title={
                            <Space>
                                <PieChartOutlined style={{ color: '#722ed1' }} />
                                <span>Trạng thái khóa học</span>
                            </Space>
                        }
                        style={{ height: '100%' }}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={mockCoursesByStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="label"
                                    label={({ label, percent }) => `${label}: ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {mockCoursesByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name) => [`${value} khóa học`, name]}
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: '1px solid #f0f0f0',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Bar Chart - Department Performance */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Card
                        title={
                            <Space>
                                <BarChartOutlined style={{ color: '#ea4544' }} />
                                <span>Hiệu suất theo phòng ban</span>
                            </Space>
                        }
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={mockDepartmentProgress} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                                <YAxis type="category" dataKey="department" tick={{ fontSize: 12 }} width={100} />
                                <Tooltip
                                    formatter={(value, name) => {
                                        if (name === 'completionRate') return [`${value}%`, 'Tỷ lệ hoàn thành'];
                                        if (name === 'completed') return [value, 'Hoàn thành'];
                                        if (name === 'enrolled') return [value, 'Đã đăng ký'];
                                        return [value, name];
                                    }}
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: '1px solid #f0f0f0',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Legend
                                    formatter={value => {
                                        if (value === 'completionRate') return 'Tỷ lệ hoàn thành (%)';
                                        return value;
                                    }}
                                />
                                <Bar
                                    dataKey="completionRate"
                                    name="completionRate"
                                    fill="#ea4544"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Popular Courses and At-Risk Learners */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
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
