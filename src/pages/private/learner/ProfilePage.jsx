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
    Spin,
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
import { useMyEnrollments } from '../../../hooks/useEnrollments';
import { useMyLearningPathProgress } from '../../../hooks/useLearningPaths';
import { useUpdateMe } from '../../../hooks/useUsers';
import { useLearnerSkills } from '../../../hooks/useDashboard';
import { getAssetUrl } from '../../../utils/directusHelpers';
import { VALIDATION } from '../../../constants/app';

const { Title, Text } = Typography;

/**
 * Profile Page
 * Thông tin cá nhân và cài đặt tài khoản
 */
function ProfilePage() {
    const { user, login } = useAuth(); // login function might be used to refresh token/user info if supported
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [editing, setEditing] = useState(false);

    // Hooks
    const { data: enrollments = [] } = useMyEnrollments({ limit: -1 }); // Get all for count
    const { data: learningPaths = [] } = useMyLearningPathProgress();
    const { data: skills = [] } = useLearnerSkills(); // Dashboard hook for skills
    const updateMeMutation = useUpdateMe();

    // Stats
    const certificatesCount = 0; // Placeholder until Certificate Service is ready

    // Handle profile update
    const handleUpdateProfile = async values => {
        try {
            await updateMeMutation.mutateAsync(values);
            setEditing(false);
            // Ideally force refresh user context here
            // window.location.reload();
        } catch {
            // Error handled globally
        }
    };

    // Handle password change
    const handleChangePassword = async values => {
        // Directus password update usually via updateMe with 'password' field
        try {
            await updateMeMutation.mutateAsync({
                password: values.newPassword,
            });
            passwordForm.resetFields();
            message.success('Đổi mật khẩu thành công!');
        } catch {
            // Error handled globally
        }
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
                        initialValues={user}
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
                            {/* Phone and other fields might need custom fields in Directus User collection */}
                            {/* Assuming standard Directus fields or custom fields added */}
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="title" // Directus 'title' field often used for Job Title
                                    label="Chức danh"
                                >
                                    <Input disabled={!editing} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider />

                        <Space>
                            {editing ? (
                                <>
                                    <Button onClick={() => setEditing(false)}>Hủy</Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SaveOutlined />}
                                        loading={updateMeMutation.isPending}
                                    >
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
                        {/* Note: Directus API might not require current password for admin/self update depending on config, 
                            but good practice to ask. However, standard updateMe doesn't validate current password easily 
                            without custom endpoint. We'll just ask for new password for standard SDK usage 
                            unless we implement a custom verification flow. 
                            For safety in this demo, we'll assume we just set new password. 
                        */}

                        <Form.Item
                            name="newPassword"
                            label="Mật khẩu mới"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                {
                                    min: VALIDATION.MIN_PASSWORD_LENGTH,
                                    message: `Mật khẩu phải có ít nhất ${VALIDATION.MIN_PASSWORD_LENGTH} ký tự`,
                                },
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

                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={updateMeMutation.isPending}
                        >
                            Đổi mật khẩu
                        </Button>
                    </Form>
                </Card>
            ),
        },
    ];

    if (!user) return <Spin size="large" />;

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
                                src={getAssetUrl(user.avatar)}
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
                            {user.first_name} {user.last_name}
                        </Title>
                        <Text type="secondary">{user.title || 'Học viên'}</Text>
                        <br />
                        {/* <Text type="secondary">{user.department}</Text> */}

                        <Divider />

                        {/* Stats */}
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic
                                    title="Khóa học"
                                    value={enrollments.length}
                                    prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Chứng chỉ"
                                    value={certificatesCount}
                                    prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                                />
                            </Col>
                        </Row>

                        <Divider />

                        <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'left' }}>
                            <Text type="secondary">
                                <MailOutlined style={{ marginRight: 8 }} />
                                {user.email}
                            </Text>
                            {/* <Text type="secondary">
                                <PhoneOutlined style={{ marginRight: 8 }} />
                                {user.phone || 'Chưa cập nhật'}
                            </Text> */}
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
                            <RadarChart data={skills} cx="50%" cy="50%" outerRadius="70%">
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
                            dataSource={learningPaths}
                            locale={{ emptyText: 'Chưa tham gia lộ trình nào' }}
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
