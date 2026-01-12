import { Row, Col, Card, Statistic, Progress, Table, Tag, Typography, Space } from 'antd';
import {
    BookOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../../../components/common';
import {
    mockDashboardStats,
    mockDepartmentProgress,
    mockCoursesByStatus,
    mockQuizStats,
    mockCertificateStats,
    mockMonthlyProgress,
} from '../../../../mocks';

const { Text, Title } = Typography;

/**
 * Reports Overview Page
 * Báo cáo tổng quan về hệ thống LMS
 */
function ReportsPage() {
    const stats = mockDashboardStats;
    const quizStats = mockQuizStats;
    const certStats = mockCertificateStats;

    // Department progress columns
    const departmentColumns = [
        {
            title: 'Phòng ban',
            dataIndex: 'department',
            key: 'department',
            render: text => (
                <Space>
                    <TeamOutlined />
                    <span>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Nhân viên',
            dataIndex: 'totalEmployees',
            key: 'totalEmployees',
            width: 100,
            align: 'center',
        },
        {
            title: 'Đã đăng ký',
            dataIndex: 'enrolled',
            key: 'enrolled',
            width: 100,
            align: 'center',
            render: (enrolled, record) => (
                <span>
                    {enrolled}/{record.totalEmployees}
                </span>
            ),
        },
        {
            title: 'Hoàn thành',
            dataIndex: 'completed',
            key: 'completed',
            width: 100,
            align: 'center',
        },
        {
            title: 'Tỷ lệ hoàn thành',
            dataIndex: 'completionRate',
            key: 'completionRate',
            width: 200,
            render: rate => (
                <Progress
                    percent={rate}
                    size="small"
                    strokeColor={rate >= 70 ? '#52c41a' : rate >= 50 ? '#faad14' : '#ff4d4f'}
                />
            ),
            sorter: (a, b) => a.completionRate - b.completionRate,
        },
    ];

    // Monthly progress columns
    const monthlyColumns = [
        {
            title: 'Tháng',
            dataIndex: 'month',
            key: 'month',
            width: 80,
        },
        {
            title: 'Đăng ký mới',
            dataIndex: 'enrollments',
            key: 'enrollments',
            width: 120,
            render: val => <Tag color="blue">{val}</Tag>,
        },
        {
            title: 'Hoàn thành',
            dataIndex: 'completions',
            key: 'completions',
            width: 120,
            render: val => <Tag color="green">{val}</Tag>,
        },
        {
            title: 'Tỷ lệ',
            key: 'rate',
            width: 150,
            render: (_, record) => {
                const rate = Math.round((record.completions / record.enrollments) * 100);
                return <Progress percent={rate} size="small" />;
            },
        },
    ];

    return (
        <div>
            <PageHeader
                title="Báo cáo Tổng quan"
                subtitle="Thống kê và phân tích hoạt động đào tạo"
                breadcrumbs={[{ title: 'Báo cáo' }]}
            />

            {/* Overview Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng khóa học"
                            value={stats.totalCourses}
                            prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                        />
                        <div style={{ marginTop: 8 }}>
                            {mockCoursesByStatus.map(item => (
                                <Tag key={item.status} color={item.color} style={{ marginRight: 4 }}>
                                    {item.label}: {item.count}
                                </Tag>
                            ))}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Học viên đang học"
                            value={stats.totalLearners}
                            prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            +{stats.learnersThisWeek} tuần này
                        </Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tỷ lệ hoàn thành"
                            value={stats.completionRate}
                            suffix="%"
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        />
                        <Text type={stats.rateChange >= 0 ? 'success' : 'danger'} style={{ fontSize: 12 }}>
                            {stats.rateChange >= 0 ? '+' : ''}
                            {stats.rateChange}% so với tháng trước
                        </Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chứng chỉ đã cấp"
                            value={certStats.totalIssued}
                            prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            +{certStats.issuedThisMonth} tháng này
                        </Text>
                    </Card>
                </Col>
            </Row>

            {/* Quiz Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Thống kê Bài kiểm tra">
                        <Row gutter={16}>
                            <Col span={6}>
                                <Statistic title="Tổng quiz" value={quizStats.totalQuizzes} />
                            </Col>
                            <Col span={6}>
                                <Statistic title="Lượt làm bài" value={quizStats.totalAttempts} />
                            </Col>
                            <Col span={6}>
                                <Statistic title="Điểm TB" value={quizStats.averageScore} suffix="/100" />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Tỷ lệ đạt"
                                    value={quizStats.passRate}
                                    suffix="%"
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Khóa học có chứng chỉ nhiều nhất">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Space>
                                    <TrophyOutlined style={{ color: '#faad14', fontSize: 24 }} />
                                    <div>
                                        <Text strong>{certStats.topCourse.title}</Text>
                                        <br />
                                        <Text type="secondary">{certStats.topCourse.count} chứng chỉ đã cấp</Text>
                                    </div>
                                </Space>
                                <Progress
                                    type="circle"
                                    percent={Math.round((certStats.topCourse.count / certStats.totalIssued) * 100)}
                                    size={60}
                                />
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* Department Progress */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={24}>
                    <Card
                        title={
                            <Space>
                                <TeamOutlined />
                                <span>Tiến độ theo Phòng ban</span>
                            </Space>
                        }
                    >
                        <Table
                            columns={departmentColumns}
                            dataSource={mockDepartmentProgress}
                            rowKey="code"
                            pagination={false}
                            size="middle"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Monthly Progress */}
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card
                        title={
                            <Space>
                                <ClockCircleOutlined />
                                <span>Tiến độ theo Tháng</span>
                            </Space>
                        }
                    >
                        <Table
                            columns={monthlyColumns}
                            dataSource={mockMonthlyProgress}
                            rowKey="month"
                            pagination={false}
                            size="middle"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default ReportsPage;
