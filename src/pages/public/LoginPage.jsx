import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Form, Input, Button, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { loginRules } from '../../validation/formRules';
import { showSuccess, showError } from '../../utils/errorHandler';
import logoVuong from '../../assets/logo-vuong.svg';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL;

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48">
        <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
    </svg>
);

export default function LoginPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy trang redirect từ state (nếu được redirect từ ProtectedRoute)
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async values => {
        setLoading(true);
        try {
            const result = await login(values.email, values.password);

            if (result.success) {
                showSuccess('Đăng nhập thành công!');
                navigate(from, { replace: true });
            } else {
                showError(result.error || 'Email hoặc mật khẩu không đúng');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý đăng nhập với Google SSO
    const handleGoogleLogin = () => {
        // Redirect đến Directus Google OAuth endpoint
        // Sau khi đăng nhập thành công, Directus sẽ redirect về redirect URL đã cấu hình
        const redirectUrl = `${window.location.origin}${from}`;
        window.location.href = `${DIRECTUS_URL}/auth/login/google?redirect=${encodeURIComponent(redirectUrl)}`;
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

            {/* Login Card */}
            <div
                className="glass-panel animate-fade-in"
                style={{
                    width: '100%',
                    maxWidth: '420px',
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
                            width: '160px',
                            height: 'auto',
                            margin: '0 auto var(--space-4)',
                            display: 'block',
                        }}
                    />
                    <p className="text-sm text-muted" style={{ margin: 0 }}>
                        Hệ thống Quản lý Học tập
                    </p>
                </div>

                {/* Google SSO Button */}
                <Button
                    icon={<GoogleIcon />}
                    onClick={handleGoogleLogin}
                    block
                    size="large"
                    style={{
                        height: '48px',
                        fontWeight: 'var(--font-weight-medium)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-2)',
                    }}
                >
                    Đăng nhập với Google
                </Button>

                <Divider style={{ margin: 'var(--space-4) 0' }}>
                    <span className="text-sm text-muted">hoặc</span>
                </Divider>

                {/* Login Form */}
                <Form
                    form={form}
                    name="login"
                    onFinish={handleSubmit}
                    layout="vertical"
                    autoComplete="off"
                    requiredMark={false}
                >
                    <Form.Item name="email" label="Email" rules={loginRules.email}>
                        <Input
                            prefix={<UserOutlined style={{ color: 'hsl(var(--color-text-subtle))' }} />}
                            placeholder="Nhập email của bạn"
                            size="large"
                            autoComplete="email"
                        />
                    </Form.Item>

                    <Form.Item name="password" label="Mật khẩu" rules={loginRules.password}>
                        <Input.Password
                            prefix={<LockOutlined style={{ color: 'hsl(var(--color-text-subtle))' }} />}
                            placeholder="Nhập mật khẩu"
                            size="large"
                            autoComplete="current-password"
                        />
                    </Form.Item>

                    <div style={{ textAlign: 'right', marginBottom: 'var(--space-4)' }}>
                        <Link
                            to="/forgot-password"
                            className="text-primary text-sm"
                            style={{ fontWeight: 'var(--font-weight-medium)' }}
                        >
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <Form.Item>
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
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Button>
                    </Form.Item>
                </Form>

                {/* Footer Links */}
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: 'var(--space-6)',
                        paddingTop: 'var(--space-4)',
                        borderTop: '1px solid hsl(var(--color-border))',
                    }}
                >
                    <p className="text-sm text-muted" style={{ margin: 0 }}>
                        Chưa có tài khoản?{' '}
                        <Link
                            to="/register"
                            className="text-primary"
                            style={{ fontWeight: 'var(--font-weight-medium)' }}
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
