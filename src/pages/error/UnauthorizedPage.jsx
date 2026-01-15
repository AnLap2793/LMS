import { Button, Typography, Space, Tag } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, LoginOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';

const { Title, Paragraph, Text } = Typography;

/**
 * UnauthorizedPage - Trang 403 Forbidden (Custom Design)
 *
 * Hiển thị khi người dùng không có quyền truy cập vào trang
 * Design phù hợp với theme đỏ #ea4544 của dự án LMS
 *
 * @component
 * @example
 * // Redirect từ ProtectedRoute
 * <Navigate to="/unauthorized" state={{ requiredRole: 'admin' }} />
 */
function UnauthorizedPage({ title, subTitle }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Lấy thông tin từ state (nếu được truyền từ ProtectedRoute)
    const requiredRole = location.state?.requiredRole;
    const fromPath = location.state?.from?.pathname;

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleLogin = () => {
        navigate('/login', { state: { from: location.state?.from } });
    };

    const isLoggedIn = !!user;

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 50%, #fff0f0 100%)',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background decorations */}
            <div
                style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-5%',
                    width: '350px',
                    height: '350px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(234,69,68,0.06) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '-10%',
                    right: '-5%',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(234,69,68,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />

            <div
                style={{
                    textAlign: 'center',
                    maxWidth: '550px',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Custom Lock Illustration */}
                <div style={{ marginBottom: 32, position: 'relative' }}>
                    {/* Shield with lock */}
                    <div
                        style={{
                            width: 140,
                            height: 160,
                            margin: '0 auto',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {/* Shield background */}
                        <div
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                background:
                                    'linear-gradient(180deg, rgba(234,69,68,0.1) 0%, rgba(234,69,68,0.05) 100%)',
                                clipPath: 'polygon(50% 0%, 100% 15%, 100% 60%, 50% 100%, 0% 60%, 0% 15%)',
                                animation: 'shieldPulse 3s ease-in-out infinite',
                            }}
                        />
                        {/* Shield border */}
                        <div
                            style={{
                                position: 'absolute',
                                width: '90%',
                                height: '90%',
                                border: '3px solid #ea4544',
                                opacity: 0.3,
                                clipPath: 'polygon(50% 0%, 100% 15%, 100% 60%, 50% 100%, 0% 60%, 0% 15%)',
                            }}
                        />
                        {/* Lock icon */}
                        <LockOutlined
                            style={{
                                fontSize: 48,
                                color: '#ea4544',
                                zIndex: 2,
                            }}
                        />
                    </div>

                    {/* 403 Badge */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: -10,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg, #ea4544 0%, #ff6b6a 100%)',
                            color: 'white',
                            padding: '6px 20px',
                            borderRadius: 20,
                            fontSize: 18,
                            fontWeight: 700,
                            boxShadow: '0 4px 15px rgba(234, 69, 68, 0.35)',
                        }}
                    >
                        403
                    </div>
                </div>

                {/* Title */}
                <Title
                    level={2}
                    style={{
                        margin: 0,
                        marginTop: 16,
                        marginBottom: 12,
                        color: '#262626',
                        fontWeight: 600,
                    }}
                >
                    {title}
                </Title>

                {/* Subtitle */}
                <Paragraph
                    style={{
                        fontSize: 16,
                        color: '#8c8c8c',
                        marginBottom: 24,
                        maxWidth: 400,
                        margin: '0 auto 24px',
                    }}
                >
                    {subTitle}
                </Paragraph>

                {/* User info card */}
                {(isLoggedIn || requiredRole || fromPath) && (
                    <div
                        style={{
                            background: 'white',
                            borderRadius: 12,
                            padding: '20px 24px',
                            marginBottom: 32,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                            border: '1px solid #f0f0f0',
                            textAlign: 'left',
                        }}
                    >
                        {isLoggedIn && (
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: requiredRole ? 12 : 0 }}>
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #ea4544 0%, #ff7875 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12,
                                    }}
                                >
                                    <UserOutlined style={{ color: 'white', fontSize: 18 }} />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Đang đăng nhập
                                    </Text>
                                    <div>
                                        <Text strong style={{ color: '#262626' }}>
                                            {user?.email || 'Người dùng'}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        )}

                        {requiredRole && (
                            <div
                                style={{
                                    paddingTop: isLoggedIn ? 12 : 0,
                                    borderTop: isLoggedIn ? '1px solid #f0f0f0' : 'none',
                                }}
                            >
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                    Trang này yêu cầu quyền:{' '}
                                </Text>
                                <Tag
                                    color="error"
                                    style={{
                                        borderRadius: 4,
                                        fontWeight: 500,
                                    }}
                                >
                                    {requiredRole}
                                </Tag>
                            </div>
                        )}

                        {fromPath && (
                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                    URL:{' '}
                                </Text>
                                <Text code style={{ fontSize: 12 }}>
                                    {fromPath}
                                </Text>
                            </div>
                        )}
                    </div>
                )}

                {/* Action buttons */}
                <Space size="middle" wrap style={{ justifyContent: 'center' }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleGoBack}
                        size="large"
                        style={{
                            borderRadius: 8,
                            height: 48,
                            paddingLeft: 24,
                            paddingRight: 24,
                            borderColor: '#d9d9d9',
                        }}
                    >
                        Quay lại
                    </Button>
                    <Button
                        type="primary"
                        icon={<HomeOutlined />}
                        onClick={handleGoHome}
                        size="large"
                        style={{
                            borderRadius: 8,
                            height: 48,
                            paddingLeft: 24,
                            paddingRight: 24,
                            background: 'linear-gradient(135deg, #ea4544 0%, #ff6b6a 100%)',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(234, 69, 68, 0.35)',
                        }}
                    >
                        Về trang chủ
                    </Button>
                    {!isLoggedIn && (
                        <Button
                            icon={<LoginOutlined />}
                            onClick={handleLogin}
                            size="large"
                            style={{
                                borderRadius: 8,
                                height: 48,
                                paddingLeft: 24,
                                paddingRight: 24,
                                borderColor: '#ea4544',
                                color: '#ea4544',
                            }}
                        >
                            Đăng nhập
                        </Button>
                    )}
                </Space>

                {/* Help text */}
                <Paragraph style={{ marginTop: 40 }}>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                        Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ{' '}
                        <a
                            href="mailto:admin@company.com"
                            style={{
                                color: '#ea4544',
                                fontWeight: 500,
                                textDecoration: 'none',
                            }}
                        >
                            quản trị viên
                        </a>{' '}
                        để được hỗ trợ.
                    </Text>
                </Paragraph>
            </div>

            {/* CSS Animations */}
            <style>
                {`
                    @keyframes shieldPulse {
                        0%, 100% {
                            transform: scale(1);
                            opacity: 1;
                        }
                        50% {
                            transform: scale(1.05);
                            opacity: 0.8;
                        }
                    }
                `}
            </style>
        </div>
    );
}

UnauthorizedPage.propTypes = {
    title: PropTypes.string,
    subTitle: PropTypes.string,
};

UnauthorizedPage.defaultProps = {
    title: 'Không có quyền truy cập',
    subTitle: 'Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu cần hỗ trợ.',
};

export default UnauthorizedPage;
