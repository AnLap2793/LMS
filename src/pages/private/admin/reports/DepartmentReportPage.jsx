import { useState, useMemo } from 'react';
import {
    Row,
    Col,
    Card,
    Select,
    Table,
    Tag,
    Progress,
    Space,
    Avatar,
    Typography,
    Statistic,
    Empty,
    Divider,
} from 'antd';
import {
    TeamOutlined,
    UserOutlined,
    BookOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    WarningOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../../../components/common';
import { mockDepartments, mockUsers, mockEnrollments, mockDepartmentProgress } from '../../../../mocks';

const { Text, Title } = Typography;

/**
 * Department Report Page
 * Báo cáo chi tiết theo từng phòng ban
 */
function DepartmentReportPage() {
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    // Get department options for select
    const departmentOptions = useMemo(() => {
        return mockDepartments.map(dept => ({
            value: dept.code,
            label: (
                <Space>
                    <TeamOutlined />
                    <span>{dept.name}</span>
                </Space>
            ),
        }));
    }, []);

    // Get selected department data
    const departmentData = useMemo(() => {
        if (!selectedDepartment) return null;

        const dept = mockDepartments.find(d => d.code === selectedDepartment);
        const progress = mockDepartmentProgress.find(p => p.code === selectedDepartment);

        // Get employees in this department
        const employees = mockUsers.filter(u => u.department?.code === selectedDepartment);

        // Get enrollments for these employees
        const employeeIds = employees.map(e => e.id);
        const enrollments = mockEnrollments.filter(e => employeeIds.includes(e.user.id));

        // Calculate stats
        const completedEnrollments = enrollments.filter(e => e.status === 'completed');
        const inProgressEnrollments = enrollments.filter(e => e.status === 'in_progress');
        const expiredEnrollments = enrollments.filter(e => e.status === 'expired');
        const assignedEnrollments = enrollments.filter(e => e.status === 'assigned');

        // Course completion stats
        const courseStats = {};
        enrollments.forEach(e => {
            if (!courseStats[e.course.id]) {
                courseStats[e.course.id] = {
                    courseId: e.course.id,
                    courseTitle: e.course.title,
                    total: 0,
                    completed: 0,
                    inProgress: 0,
                };
            }
            courseStats[e.course.id].total++;
            if (e.status === 'completed') courseStats[e.course.id].completed++;
            if (e.status === 'in_progress') courseStats[e.course.id].inProgress++;
        });

        // Employee stats with their enrollments
        const employeeStats = employees.map(emp => {
            const empEnrollments = enrollments.filter(e => e.user.id === emp.id);
            const completed = empEnrollments.filter(e => e.status === 'completed').length;
            const total = empEnrollments.length;
            const avgProgress =
                empEnrollments.length > 0
                    ? Math.round(
                          empEnrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / empEnrollments.length
                      )
                    : 0;

            return {
                ...emp,
                enrollments: empEnrollments,
                totalEnrollments: total,
                completedEnrollments: completed,
                avgProgress,
                hasExpired: empEnrollments.some(e => e.status === 'expired'),
            };
        });

        return {
            department: dept,
            progress,
            employees,
            enrollments,
            stats: {
                total: enrollments.length,
                completed: completedEnrollments.length,
                inProgress: inProgressEnrollments.length,
                expired: expiredEnrollments.length,
                assigned: assignedEnrollments.length,
                completionRate:
                    enrollments.length > 0 ? Math.round((completedEnrollments.length / enrollments.length) * 100) : 0,
            },
            courseStats: Object.values(courseStats),
            employeeStats,
        };
    }, [selectedDepartment]);

    // Employee table columns
    const employeeColumns = [
        {
            title: 'Nhân viên',
            key: 'employee',
            width: 250,
            render: (_, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#ea4544' }} />
                    <div>
                        <div style={{ fontWeight: 500 }}>
                            {record.first_name} {record.last_name}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.position?.name || '-'}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Khóa học',
            dataIndex: 'totalEnrollments',
            key: 'totalEnrollments',
            width: 100,
            align: 'center',
            render: (total, record) => (
                <span>
                    {record.completedEnrollments}/{total}
                </span>
            ),
        },
        {
            title: 'Tiến độ TB',
            dataIndex: 'avgProgress',
            key: 'avgProgress',
            width: 150,
            render: progress => (
                <Progress
                    percent={progress}
                    size="small"
                    strokeColor={progress >= 80 ? '#52c41a' : progress >= 50 ? '#faad14' : '#ea4544'}
                />
            ),
            sorter: (a, b) => a.avgProgress - b.avgProgress,
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            render: (_, record) => {
                if (record.hasExpired) {
                    return (
                        <Tag color="error" icon={<WarningOutlined />}>
                            Có quá hạn
                        </Tag>
                    );
                }
                if (record.completedEnrollments === record.totalEnrollments && record.totalEnrollments > 0) {
                    return (
                        <Tag color="success" icon={<CheckCircleOutlined />}>
                            Hoàn thành
                        </Tag>
                    );
                }
                if (record.totalEnrollments > 0) {
                    return (
                        <Tag color="processing" icon={<ClockCircleOutlined />}>
                            Đang học
                        </Tag>
                    );
                }
                return <Tag>Chưa giao</Tag>;
            },
            filters: [
                { text: 'Hoàn thành', value: 'completed' },
                { text: 'Đang học', value: 'in_progress' },
                { text: 'Có quá hạn', value: 'expired' },
            ],
            onFilter: (value, record) => {
                if (value === 'expired') return record.hasExpired;
                if (value === 'completed')
                    return record.completedEnrollments === record.totalEnrollments && record.totalEnrollments > 0;
                if (value === 'in_progress') return record.totalEnrollments > 0 && !record.hasExpired;
                return true;
            },
        },
    ];

    // Course stats columns
    const courseColumns = [
        {
            title: 'Khóa học',
            dataIndex: 'courseTitle',
            key: 'courseTitle',
            ellipsis: true,
            render: title => (
                <Space>
                    <BookOutlined style={{ color: '#1890ff' }} />
                    <span>{title}</span>
                </Space>
            ),
        },
        {
            title: 'Tổng đăng ký',
            dataIndex: 'total',
            key: 'total',
            width: 120,
            align: 'center',
        },
        {
            title: 'Đang học',
            dataIndex: 'inProgress',
            key: 'inProgress',
            width: 100,
            align: 'center',
            render: val => <Tag color="processing">{val}</Tag>,
        },
        {
            title: 'Hoàn thành',
            dataIndex: 'completed',
            key: 'completed',
            width: 100,
            align: 'center',
            render: val => <Tag color="success">{val}</Tag>,
        },
        {
            title: 'Tỷ lệ',
            key: 'rate',
            width: 150,
            render: (_, record) => {
                const rate = record.total > 0 ? Math.round((record.completed / record.total) * 100) : 0;
                return <Progress percent={rate} size="small" />;
            },
        },
    ];

    return (
        <div>
            <PageHeader
                title="Báo cáo theo Phòng ban"
                subtitle="Xem chi tiết tiến độ học tập của từng phòng ban"
                breadcrumbs={[{ title: 'Báo cáo', path: '/admin/reports' }, { title: 'Theo phòng ban' }]}
            />

            {/* Department Selector */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={16} align="middle">
                    <Col>
                        <Text strong>Chọn phòng ban:</Text>
                    </Col>
                    <Col flex="auto">
                        <Select
                            placeholder="Chọn phòng ban để xem báo cáo..."
                            value={selectedDepartment}
                            onChange={setSelectedDepartment}
                            options={departmentOptions}
                            style={{ width: 300 }}
                            size="large"
                            allowClear
                        />
                    </Col>
                </Row>
            </Card>

            {!selectedDepartment ? (
                <Card>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Vui lòng chọn phòng ban để xem báo cáo chi tiết"
                    />

                    {/* Quick overview of all departments */}
                    <Divider>Tổng quan tất cả phòng ban</Divider>
                    <Table
                        columns={[
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
                                key: 'enrolled',
                                width: 120,
                                align: 'center',
                                render: (_, record) => `${record.enrolled}/${record.totalEmployees}`,
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
                            },
                        ]}
                        dataSource={mockDepartmentProgress}
                        rowKey="code"
                        pagination={false}
                        onRow={record => ({
                            onClick: () => setSelectedDepartment(record.code),
                            style: { cursor: 'pointer' },
                        })}
                    />
                </Card>
            ) : (
                departmentData && (
                    <>
                        {/* Department Header */}
                        <Card style={{ marginBottom: 24 }}>
                            <Row gutter={24} align="middle">
                                <Col>
                                    <Avatar size={64} icon={<TeamOutlined />} style={{ backgroundColor: '#ea4544' }} />
                                </Col>
                                <Col flex="auto">
                                    <Title level={4} style={{ margin: 0 }}>
                                        {departmentData.department?.name}
                                    </Title>
                                    <Text type="secondary">
                                        {departmentData.employees.length} nhân viên · {departmentData.stats.total} lượt
                                        đăng ký khóa học
                                    </Text>
                                </Col>
                                <Col>
                                    <Statistic
                                        title="Tỷ lệ hoàn thành"
                                        value={departmentData.stats.completionRate}
                                        suffix="%"
                                        valueStyle={{
                                            color: departmentData.stats.completionRate >= 70 ? '#52c41a' : '#faad14',
                                        }}
                                        prefix={<RiseOutlined />}
                                    />
                                </Col>
                            </Row>
                        </Card>

                        {/* Stats Overview */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            <Col xs={12} sm={6}>
                                <Card>
                                    <Statistic
                                        title="Tổng đăng ký"
                                        value={departmentData.stats.total}
                                        prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card>
                                    <Statistic
                                        title="Đang học"
                                        value={departmentData.stats.inProgress}
                                        prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card>
                                    <Statistic
                                        title="Hoàn thành"
                                        value={departmentData.stats.completed}
                                        valueStyle={{ color: '#52c41a' }}
                                        prefix={<CheckCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card>
                                    <Statistic
                                        title="Quá hạn"
                                        value={departmentData.stats.expired}
                                        valueStyle={{ color: departmentData.stats.expired > 0 ? '#ff4d4f' : undefined }}
                                        prefix={<WarningOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Course Stats */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            <Col span={24}>
                                <Card
                                    title={
                                        <Space>
                                            <BookOutlined />
                                            <span>Tiến độ theo Khóa học</span>
                                        </Space>
                                    }
                                >
                                    {departmentData.courseStats.length > 0 ? (
                                        <Table
                                            columns={courseColumns}
                                            dataSource={departmentData.courseStats}
                                            rowKey="courseId"
                                            pagination={false}
                                            size="middle"
                                        />
                                    ) : (
                                        <Empty description="Chưa có dữ liệu khóa học" />
                                    )}
                                </Card>
                            </Col>
                        </Row>

                        {/* Employee Progress */}
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Card
                                    title={
                                        <Space>
                                            <UserOutlined />
                                            <span>Tiến độ Nhân viên ({departmentData.employeeStats.length})</span>
                                        </Space>
                                    }
                                >
                                    <Table
                                        columns={employeeColumns}
                                        dataSource={departmentData.employeeStats}
                                        rowKey="id"
                                        pagination={{
                                            pageSize: 10,
                                            showSizeChanger: true,
                                            showTotal: total => `Tổng ${total} nhân viên`,
                                        }}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </>
                )
            )}
        </div>
    );
}

export default DepartmentReportPage;
