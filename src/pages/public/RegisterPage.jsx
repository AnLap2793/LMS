import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { createUser } from '@directus/sdk';
import { directus } from '../../services/directus';
import { registerRules } from '../../validation/formRules';
import { showSuccess, showError } from '../../utils/errorHandler';
import logoVuong from '../../assets/logo-vuong.svg';

/**
 * RegisterPage - Trang đăng ký tài khoản mới
 *
 * Flow:
 * 1. User nhập thông tin: Họ, Tên, Email, Mật khẩu, Xác nhận mật khẩu
 * 2. Submit form -> Gọi Directus API tạo user mới
 * 3. Thành công -> Redirect đến trang login
 * 4. Thất bại -> Hiển thị thông báo lỗi
 */
export default function RegisterPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async values => {
        setLoading(true);
        try {
            // Chuẩn bị dữ liệu đăng ký cho Directus
            const userData = {
                first_name: values.firstName,
                last_name: values.lastName,
                email: values.email,
                password: values.password,
                // Role mặc định sẽ được Directus xử lý theo cấu hình
            };

            // Gọi Directus SDK để tạo user mới
            await directus.request(createUser(userData));

            showSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (error) {
            console.error('Register error:', error);

            // Xử lý các lỗi phổ biến từ Directus
            if (error?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
                showError('Email này đã được sử dụng. Vui lòng chọn email khác.');
            } else if (error?.errors?.[0]?.message) {
                showError(error.errors[0].message);
            } else {
                showError('Đăng ký thất bại. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="flex items-center justify-center"
            style={{
                minHeight: '100vh',
                padding: 'var(--space-4)',
                background:
                    'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 50%, var(--color-primary-dark) 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Decorative circles */}
            <div
                className="animate-float"
                style={{
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    top: '-100px',
                    right: '-100px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.1)',
                }}
            />
            <div
                className="animate-float-reverse"
                style={{
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    bottom: '-80px',
                    left: '-80px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.1)',
                }}
            />

            {/* Register Card */}
            <div
                className="glass-panel animate-fade-in"
                style={{
                    width: '100%',
                    maxWidth: '480px',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-xl)',
                    padding: 'var(--space-8)',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Brand Section */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    <img
                        src={logoVuong}
                        alt="HVN Group Logo"
                        style={{
                            width: '120px',
                            height: 'auto',
                            margin: '0 auto var(--space-3)',
                            display: 'block',
                        }}
                    />
                    <h2 className="text-xl font-semibold" style={{ marginBottom: 'var(--space-1)' }}>
                        Tạo tài khoản mới
                    </h2>
                    <p className="text-sm text-muted" style={{ margin: 0 }}>
                        Đăng ký để bắt đầu học tập
                    </p>
                </div>

                {/* Register Form */}
                <Form
                    form={form}
                    name="register"
                    onFinish={handleSubmit}
                    layout="vertical"
                    autoComplete="off"
                    requiredMark={false}
                >
                    <Row gutter={12}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="firstName" label="Họ" rules={registerRules.firstName}>
                                <Input
                                    prefix={<UserOutlined style={{ color: 'hsl(var(--color-text-subtle))' }} />}
                                    placeholder="Nguyễn"
                                    size="large"
                                    autoComplete="given-name"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="lastName" label="Tên" rules={registerRules.lastName}>
                                <Input
                                    prefix={<UserOutlined style={{ color: 'hsl(var(--color-text-subtle))' }} />}
                                    placeholder="Văn A"
                                    size="large"
                                    autoComplete="family-name"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="email" label="Email" rules={registerRules.email}>
                        <Input
                            prefix={<MailOutlined style={{ color: 'hsl(var(--color-text-subtle))' }} />}
                            placeholder="email@example.com"
                            size="large"
                            autoComplete="email"
                        />
                    </Form.Item>

                    <Form.Item name="password" label="Mật khẩu" rules={registerRules.password}>
                        <Input.Password
                            prefix={<LockOutlined style={{ color: 'hsl(var(--color-text-subtle))' }} />}
                            placeholder="Tối thiểu 8 ký tự"
                            size="large"
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        dependencies={['password']}
                        rules={registerRules.confirmPassword}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: 'hsl(var(--color-text-subtle))' }} />}
                            placeholder="Nhập lại mật khẩu"
                            size="large"
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 'var(--space-4)' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                            style={{
                                height: '48px',
                                fontWeight: 'var(--font-weight-semibold)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-primary)',
                            }}
                        >
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </Button>
                    </Form.Item>
                </Form>

                {/* Footer Links */}
                <div
                    style={{
                        textAlign: 'center',
                        paddingTop: 'var(--space-4)',
                        borderTop: '1px solid hsl(var(--color-border))',
                    }}
                >
                    <p className="text-sm text-muted" style={{ margin: 0 }}>
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-primary" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
