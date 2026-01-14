import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Card,
    Row,
    Col,
    Typography,
    Space,
    Button,
    Form,
    Input,
    Avatar,
    Divider,
    Statistic,
    message,
    Tabs,
    Upload,
    List,
    Progress,
    Tag,
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    LockOutlined,
    EditOutlined,
    SaveOutlined,
    BookOutlined,
    TrophyOutlined,
    CameraOutlined,
    TeamOutlined,
    RadarChartOutlined,
    NodeIndexOutlined,
} from '@ant-design/icons';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { mockEnrollments, mockCertificates, mockLearnerSkills, mockUserLearningPaths } from '../../../mocks';

const { Title, Text } = Typography;

/**
 * Profile Page
 * Thông tin cá nhân và cài đặt tài khoản
 */
function ProfilePage() {
    const { user } = useAuth();
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Mock user data
    const mockUser = {
        id: 'u1',
        first_name: user?.first_name || 'Nguyễn',
        last_name: user?.last_name || 'Văn A',
        email: user?.email || 'nguyenvana@company.com',
        phone: '0901234567',
        department: 'Công nghệ thông tin',
        position: 'Frontend Developer',
        avatar: null,
        date_created: '2023-06-15T10:00:00Z',
    };

    // Stats
    const currentUserId = 'u1';
    const userEnrollments = mockEnrollments.filter(e => e.user_id === currentUserId);
    const userCertificates = mockCertificates.filter(c => c.user_id === currentUserId);

    // Handle profile update
    const handleUpdateProfile = async () => {
        setSaving(true);
        setTimeout(() => {
            message.success('Cập nhật thông tin thành công!');
            setSaving(false);
            setEditing(false);
        }, 1000);
    };

    // Handle password change
    const handleChangePassword = async () => {
        setChangingPassword(true);
        setTimeout(() => {
            message.success('Đổi mật khẩu thành công!');
            passwordForm.resetFields();
            setChangingPassword(false);
        }, 1000);
    };

    // Tab items
    const tabItems = [
        {
            key: 'profile',
            label: 'Thông tin cá nhân',
            children: (
                <Card>
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={mockUser}
                        onFinish={handleUpdateProfile}
                        disabled={!editing}
                    >
                        <Row gutter={24}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="first_name"
                                    label="Họ"
                                    rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
                                >
                                    <Input prefix={<UserOutlined />} placeholder="Nguyễn" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="last_name"
                                    label="Tên"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                                >
                                    <Input placeholder="Văn A" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col xs={24} sm={12}>
                                <Form.Item name="email" label="Email">
                                    <Input prefix={<MailOutlined />} disabled />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="phone"
                                    label="Số điện thoại"
                                    rules={[
                                        {
                                            pattern: /^[0-9]{10,11}$/,
                                            message: 'Số điện thoại không hợp lệ',
                                        },
                                    ]}
                                >
                                    <Input prefix={<PhoneOutlined />} placeholder="0901234567" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col xs={24} sm={12}>
                                <Form.Item name="department" label="Phòng ban">
                                    <Input prefix={<TeamOutlined />} disabled />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item name="position" label="Vị trí">
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider />

                        <Space>
                            {editing ? (
                                <>
                                    <Button onClick={() => setEditing(false)}>Hủy</Button>
                                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                                        Lưu thay đổi
                                    </Button>
                                </>
                            ) : (
                                <Button type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>
                                    Chỉnh sửa
                                </Button>
                            )}
                        </Space>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'security',
            label: 'Bảo mật',
            children: (
                <Card title="Đổi mật khẩu">
                    <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleChangePassword}
                        style={{ maxWidth: 400 }}
                    >
                        <Form.Item
                            name="currentPassword"
                            label="Mật khẩu hiện tại"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" />
                        </Form.Item>

                        <Form.Item
                            name="newPassword"
                            label="Mật khẩu mới"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Xác nhận mật khẩu mới"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
                        </Form.Item>

                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={changingPassword}>
                            Đổi mật khẩu
                        </Button>
                    </Form>
                </Card>
            ),
        },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 8 }}>
                    <UserOutlined style={{ color: '#ea4544', marginRight: 8 }} />
                    Thông tin cá nhân
                </Title>
                <Text type="secondary">Quản lý thông tin tài khoản của bạn</Text>
            </div>

            <Row gutter={24}>
                {/* Profile card */}
                <Col xs={24} lg={8}>
                    <Card style={{ textAlign: 'center', marginBottom: 24 }}>
                        {/* Avatar */}
                        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                            <Avatar
                                size={120}
                                icon={<UserOutlined />}
                                src={mockUser.avatar}
                                style={{ backgroundColor: '#ea4544' }}
                            />
                            <Upload
                                showUploadList={false}
                                beforeUpload={() => {
                                    message.info('Chức năng upload avatar sẽ được tích hợp sau');
                                    return false;
                                }}
                            >
                                <Button
                                    type="primary"
                                    shape="circle"
                                    size="small"
                                    icon={<CameraOutlined />}
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                    }}
                                />
                            </Upload>
                        </div>

                        <Title level={4} style={{ margin: 0 }}>
                            {mockUser.first_name} {mockUser.last_name}
                        </Title>
                        <Text type="secondary">{mockUser.position}</Text>
                        <br />
                        <Text type="secondary">{mockUser.department}</Text>

                        <Divider />

                        {/* Stats */}
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic
                                    title="Khóa học"
                                    value={userEnrollments.length}
                                    prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Chứng chỉ"
                                    value={userCertificates.length}
                                    prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                                />
                            </Col>
                        </Row>

                        <Divider />

                        <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'left' }}>
                            <Text type="secondary">
                                <MailOutlined style={{ marginRight: 8 }} />
                                {mockUser.email}
                            </Text>
                            <Text type="secondary">
                                <PhoneOutlined style={{ marginRight: 8 }} />
                                {mockUser.phone || 'Chưa cập nhật'}
                            </Text>
                        </Space>
                    </Card>

                    {/* Skills Radar Chart */}
                    <Card
                        size="small"
                        title={
                            <Space>
                                <RadarChartOutlined style={{ color: '#722ed1' }} />
                                <span>Biểu đồ năng lực</span>
                            </Space>
                        }
                        style={{ marginBottom: 16 }}
                    >
                        <ResponsiveContainer width="100%" height={250}>
                            <RadarChart data={mockLearnerSkills} cx="50%" cy="50%" outerRadius="70%">
                                <PolarGrid stroke="#f0f0f0" />
                                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                                <Tooltip
                                    formatter={value => [`${value}%`, 'Năng lực']}
                                    contentStyle={{
                                        borderRadius: 6,
                                        border: '1px solid #f0f0f0',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Radar
                                    name="Năng lực"
                                    dataKey="value"
                                    stroke="#ea4544"
                                    fill="#ea4544"
                                    fillOpacity={0.5}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                        <div style={{ textAlign: 'center', marginTop: 8 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Dựa trên các khóa học đã hoàn thành
                            </Text>
                        </div>
                    </Card>

                    {/* Additional info */}
                    <Card size="small">
                        <Text type="secondary">
                            Tham gia từ: {new Date(mockUser.date_created).toLocaleDateString('vi-VN')}
                        </Text>
                    </Card>
                </Col>

                {/* Tabs */}
                <Col xs={24} lg={16}>
                    <Tabs items={tabItems} />

                    {/* Learning Paths Progress */}
                    <Card
                        title={
                            <Space>
                                <NodeIndexOutlined style={{ color: '#1890ff' }} />
                                <span>Tiến độ lộ trình học tập</span>
                            </Space>
                        }
                        style={{ marginTop: 24 }}
                    >
                        <List
                            dataSource={mockUserLearningPaths}
                            renderItem={path => (
                                <List.Item>
                                    <div style={{ width: '100%' }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: 8,
                                            }}
                                        >
                                            <Link to={`/learning-paths/${path.pathId}`}>
                                                <Text strong style={{ fontSize: 16 }}>
                                                    {path.title}
                                                </Text>
                                            </Link>
                                            <Tag color={path.status === 'completed' ? 'success' : 'processing'}>
                                                {path.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
                                            </Tag>
                                        </div>
                                        <Progress
                                            percent={path.progress}
                                            strokeColor={path.status === 'completed' ? '#52c41a' : '#1890ff'}
                                        />
                                        <div style={{ marginTop: 8, textAlign: 'right' }}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                Truy cập lần cuối:{' '}
                                                {new Date(path.lastAccessed).toLocaleDateString('vi-VN')}
                                            </Text>
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default ProfilePage;
