import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { passwordRequest } from '@directus/sdk';
import { directus } from '../../services/directus';
import { forgotPasswordRules } from '../../validation/formRules';
import { showError } from '../../utils/errorHandler';
import logoVuong from '../../assets/logo-vuong.svg';

/**
 * ForgotPasswordPage - Trang yêu cầu đặt lại mật khẩu
 *
 * Flow:
 * 1. User nhập email
 * 2. Submit form -> Gọi Directus passwordRequest API
 * 3. Thành công -> Hiển thị thông báo đã gửi email
 * 4. Thất bại -> Hiển thị thông báo lỗi
 *
 * Note: Directus sẽ gửi email với link reset password
 * Link format: {RESET_URL}?token={TOKEN}
 */
export default function ForgotPasswordPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');

    const handleSubmit = async values => {
        setLoading(true);
        try {
            // Gọi Directus SDK để gửi email reset password
            // reset_url là URL mà user sẽ được redirect đến khi click link trong email
            await directus.request(passwordRequest(values.email, `${window.location.origin}/reset-password`));

            setSubmittedEmail(values.email);
            setEmailSent(true);
        } catch (error) {
            console.error('Password request error:', error);

            // Directus thường không trả về lỗi cụ thể vì lý do bảo mật
            // Nhưng vẫn xử lý trường hợp có lỗi khác
            if (error?.errors?.[0]?.message) {
                showError(error.errors[0].message);
            } else {
                // Vẫn hiển thị thành công để tránh user enumeration
                setSubmittedEmail(values.email);
                setEmailSent(true);
            }
        } finally {
            setLoading(false);
        }
    };

    // Hiển thị màn hình thành công sau khi gửi email
    if (emailSent) {
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
                        title="Email đã được gửi!"
                        subTitle={
                            <>
                                <p>
                                    Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong>{submittedEmail}</strong>
                                </p>
                                <p className="text-sm text-muted">
                                    Vui lòng kiểm tra hộp thư (bao gồm cả thư mục Spam) và làm theo hướng dẫn.
                                </p>
                            </>
                        }
                        extra={[
                            <Link to="/login" key="login">
                                <Button type="primary" size="large">
                                    Quay lại đăng nhập
                                </Button>
                            </Link>,
                            <Button
                                key="resend"
                                size="large"
                                onClick={() => {
                                    setEmailSent(false);
                                    form.setFieldValue('email', submittedEmail);
                                }}
                            >
                                Gửi lại email
                            </Button>,
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

            {/* Forgot Password Card */}
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
                {/* Back Link */}
                <Link
                    to="/login"
                    className="text-muted"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-1)',
                        marginBottom: 'var(--space-4)',
                        fontSize: 'var(--text-sm)',
                    }}
                >
                    <ArrowLeftOutlined /> Quay lại đăng nhập
                </Link>

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
                        Quên mật khẩu?
                    </h2>
                    <p className="text-sm text-muted" style={{ margin: 0 }}>
                        Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
                    </p>
                </div>

                {/* Forgot Password Form */}
                <Form
                    form={form}
                    name="forgotPassword"
                    onFinish={handleSubmit}
                    layout="vertical"
                    autoComplete="off"
                    requiredMark={false}
                >
                    <Form.Item name="email" label="Email" rules={forgotPasswordRules.email}>
                        <Input
                            prefix={<MailOutlined style={{ color: 'hsl(var(--color-text-subtle))' }} />}
                            placeholder="email@example.com"
                            size="large"
                            autoComplete="email"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
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
                            {loading ? 'Đang gửi...' : 'Gửi email đặt lại mật khẩu'}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}
