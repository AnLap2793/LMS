import { Row, Col, Card, Statistic, Progress, List, Avatar, Typography, Space, Spin, Empty } from 'antd';
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
import { useAdminDashboardStats, useDashboardCharts } from '../../../hooks/useDashboard';

const { Text } = Typography;

/**
 * Admin Dashboard Page
 * Trang tổng quan cho Admin LMS
 */
function DashboardPage() {
    const { data: stats, isLoading: statsLoading } = useAdminDashboardStats();
    const { data: charts, isLoading: chartsLoading } = useDashboardCharts();

    const loading = statsLoading || chartsLoading;

    if (loading) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Spin fullscreen tip="Đang tải dữ liệu tổng quan..." />
            </div>
        );
    }

    // Fallback if data is missing
    const safeStats = stats || {};
    const safeCharts = charts || { monthly: [], status: [], popular: [], activity: [] };

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
                            value={safeStats.totalCourses || 0}
                            prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Học viên"
                            value={safeStats.totalLearners || 0}
                            prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã hoàn thành"
                            value={safeStats.completedEnrollments || 0}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tỷ lệ hoàn thành"
                            value={safeStats.completionRate || 0}
                            prefix={<RiseOutlined style={{ color: '#faad14' }} />}
                            suffix="%"
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
                                <span>Xu hướng học tập</span>
                            </Space>
                        }
                        style={{ height: '100%' }}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={safeCharts.monthly}>
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
                                <Tooltip />
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
                                    data={safeCharts.status}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="label"
                                    label={({ label, percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {safeCharts.status.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Popular Courses and Recent Activity */}
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
                        <div className="custom-list">
                            {safeCharts.popular.map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '12px 0',
                                        borderBottom: index < safeCharts.popular.length - 1 ? '1px solid #f0f0f0' : 'none',
                                    }}
                                >
                                    <Space>
                                        <Text strong style={{ color: index < 3 ? '#ea4544' : '#999', width: 20 }}>
                                            #{index + 1}
                                        </Text>
                                        <Text ellipsis style={{ maxWidth: 300 }}>
                                            {item.title}
                                        </Text>
                                    </Space>
                                    <div style={{ marginLeft: 'auto' }}>
                                        <Space>
                                            <TeamOutlined style={{ color: '#8c8c8c' }} />
                                            <Text type="secondary">{item.enrollments} học viên</Text>
                                        </Space>
                                    </div>
                                </div>
                            ))}
                            {safeCharts.popular.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                        </div>
                    </Card>
                </Col>

                {/* Recent Activity */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                <span>Hoạt động gần đây</span>
                            </Space>
                        }
                        style={{ height: '100%' }}
                    >
                        <div className="custom-list">
                            {safeCharts.activity.map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        padding: '12px 0',
                                        borderBottom: index < safeCharts.activity.length - 1 ? '1px solid #f0f0f0' : 'none',
                                    }}
                                >
                                    <div style={{ marginRight: 16, marginTop: 4 }}>{getActivityIcon(item.type)}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ marginBottom: 4 }}>
                                            <Text strong>{item.user}</Text> <Text type="secondary">{item.action}</Text>{' '}
                                            <Text strong style={{ color: '#ea4544' }}>
                                                {item.target}
                                            </Text>
                                        </div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {new Date(item.timestamp).toLocaleString('vi-VN')}
                                        </Text>
                                    </div>
                                </div>
                            ))}
                            {safeCharts.activity.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default DashboardPage;
