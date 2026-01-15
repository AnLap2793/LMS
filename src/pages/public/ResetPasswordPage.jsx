import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Form, Input, Button, Result, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { passwordReset } from '@directus/sdk';
import { directus } from '../../services/directus';
import { resetPasswordRules } from '../../validation/formRules';
import { showError } from '../../utils/errorHandler';
import logoVuong from '../../assets/logo-vuong.svg';

/**
 * ResetPasswordPage - Trang đặt lại mật khẩu mới
 *
 * Flow:
 * 1. User click link trong email -> được redirect đến trang này với token trong URL
 * 2. User nhập mật khẩu mới và xác nhận
 * 3. Submit form -> Gọi Directus passwordReset API với token
 * 4. Thành công -> Hiển thị thông báo và redirect đến login
 * 5. Thất bại -> Hiển thị thông báo lỗi
 *
 * URL format: /reset-password?token={TOKEN}
 */
export default function ResetPasswordPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Lấy token từ URL query params
    const token = searchParams.get('token');

    // Kiểm tra token khi component mount
    useEffect(() => {
        if (!token) {
            showError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
        }
    }, [token]);

    const handleSubmit = async values => {
        if (!token) {
            showError('Không tìm thấy token. Vui lòng yêu cầu link mới.');
            return;
        }

        setLoading(true);
        try {
            // Gọi Directus SDK để đặt lại mật khẩu
            await directus.request(passwordReset(token, values.password));

            setResetSuccess(true);

            // Tự động redirect đến login sau 3 giây
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error('Password reset error:', error);

            // Xử lý các lỗi phổ biến
            if (error?.errors?.[0]?.extensions?.code === 'TOKEN_EXPIRED') {
                showError('Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu link mới.');
            } else if (error?.errors?.[0]?.extensions?.code === 'INVALID_TOKEN') {
                showError('Link đặt lại mật khẩu không hợp lệ.');
            } else if (error?.errors?.[0]?.message) {
                showError(error.errors[0].message);
            } else {
                showError('Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Hiển thị màn hình thành công
    if (resetSuccess) {
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
                    <Result
                        status="success"
                        title="Đặt lại mật khẩu thành công!"
                        subTitle="Bạn sẽ được chuyển đến trang đăng nhập trong giây lát..."
                        extra={[
                            <Link to="/login" key="login">
                                <Button type="primary" size="large">
                                    Đăng nhập ngay
                                </Button>
                            </Link>,
                        ]}
                    />
                </div>
            </div>
        );
    }

    // Hiển thị lỗi nếu không có token
    if (!token) {
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
                    <Result
                        status="error"
                        title="Link không hợp lệ"
                        subTitle="Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới."
                        extra={[
                            <Link to="/forgot-password" key="forgot">
                                <Button type="primary" size="large">
                                    Yêu cầu link mới
                                </Button>
                            </Link>,
                            <Link to="/login" key="login">
                                <Button size="large">Quay lại đăng nhập</Button>
                            </Link>,
                        ]}
                    />
                </div>
            </div>
        );
    }

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

            {/* Reset Password Card */}
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
                            width: '100px',
                            height: 'auto',
                            margin: '0 auto var(--space-3)',
                            display: 'block',
                        }}
                    />
                    <h2 className="text-xl font-semibold" style={{ marginBottom: 'var(--space-1)' }}>
                        Đặt lại mật khẩu
                    </h2>
                    <p className="text-sm text-muted" style={{ margin: 0 }}>
                        Nhập mật khẩu mới cho tài khoản của bạn
                    </p>
                </div>

                <Alert
                    message="Yêu cầu mật khẩu"
                    description="Mật khẩu phải có ít nhất 8 ký tự"
                    type="info"
                    showIcon
                    style={{ marginBottom: 'var(--space-4)' }}
                />

                {/* Reset Password Form */}
                <Form
                    form={form}
                    name="resetPassword"
                    onFinish={handleSubmit}
                    layout="vertical"
                    autoComplete="off"
                    requiredMark={false}
                >
                    <Form.Item name="password" label="Mật khẩu mới" rules={resetPasswordRules.password}>
                        <Input.Password
                            prefix={<LockOutlined style={{ color: 'hsl(var(--color-text-subtle))' }} />}
                            placeholder="Nhập mật khẩu mới"
                            size="large"
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        dependencies={['password']}
                        rules={resetPasswordRules.confirmPassword}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: 'hsl(var(--color-text-subtle))' }} />}
                            placeholder="Nhập lại mật khẩu mới"
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
                            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
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
                        <Link to="/login" className="text-primary" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                            Quay lại đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
