import { Button, Typography, Space } from 'antd';
import { HomeOutlined, ReloadOutlined, ArrowLeftOutlined, WarningOutlined, BugOutlined } from '@ant-design/icons';
import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import PropTypes from 'prop-types';

const { Title, Paragraph, Text } = Typography;

/**
 * ErrorPage - Trang lỗi chung (500, etc.) - Custom Design
 *
 * Có thể sử dụng làm errorElement trong React Router hoặc trang lỗi độc lập
 * Design phù hợp với theme đỏ #ea4544 của dự án LMS
 *
 * @component
 */
function ErrorPage({ error: propError, resetError, showDetails }) {
    const navigate = useNavigate();

    // Lấy error từ React Router (nếu sử dụng làm errorElement)
    const routeError = useRouteError();
    const error = propError || routeError;

    // Xác định loại lỗi và thông báo
    const getErrorInfo = () => {
        if (error && isRouteErrorResponse(error)) {
            switch (error.status) {
                case 404:
                    return {
                        status: '404',
                        title: 'Không tìm thấy',
                        message: 'Trang bạn đang tìm kiếm không tồn tại.',
                    };
                case 403:
                    return {
                        status: '403',
                        title: 'Không có quyền',
                        message: 'Bạn không có quyền truy cập trang này.',
                    };
                case 401:
                    return {
                        status: '401',
                        title: 'Chưa đăng nhập',
                        message: 'Vui lòng đăng nhập để tiếp tục.',
                    };
                case 500:
                default:
                    return {
                        status: error.status?.toString() || '500',
                        title: 'Lỗi server',
                        message: error.statusText || 'Đã có lỗi xảy ra trên server.',
                    };
            }
        }

        return {
            status: '500',
            title: 'Đã có lỗi xảy ra',
            message: error?.message || 'Xin lỗi, đã có lỗi không mong muốn xảy ra.',
        };
    };

    const errorInfo = getErrorInfo();
    const isDev = import.meta.env.DEV;

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleReload = () => {
        if (resetError) {
            resetError();
        } else {
            window.location.reload();
        }
    };

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
                    top: '10%',
                    right: '5%',
                    width: '250px',
                    height: '250px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(234,69,68,0.06) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '5%',
                    left: '10%',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(234,69,68,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />

            <div
                style={{
                    textAlign: 'center',
                    maxWidth: '600px',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Error Illustration */}
                <div style={{ marginBottom: 32, position: 'relative' }}>
                    {/* Warning circle */}
                    <div
                        style={{
                            width: 120,
                            height: 120,
                            margin: '0 auto',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(234,69,68,0.15) 0%, rgba(234,69,68,0.05) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            animation: 'errorPulse 2s ease-in-out infinite',
                        }}
                    >
                        {/* Inner ring */}
                        <div
                            style={{
                                position: 'absolute',
                                width: '85%',
                                height: '85%',
                                borderRadius: '50%',
                                border: '3px solid rgba(234,69,68,0.3)',
                            }}
                        />
                        <WarningOutlined
                            style={{
                                fontSize: 48,
                                color: '#ea4544',
                            }}
                        />
                    </div>

                    {/* Error code badge */}
                    <div
                        style={{
                            marginTop: 16,
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #ea4544 0%, #ff6b6a 100%)',
                            color: 'white',
                            padding: '8px 24px',
                            borderRadius: 24,
                            fontSize: 20,
                            fontWeight: 700,
                            boxShadow: '0 4px 15px rgba(234, 69, 68, 0.35)',
                        }}
                    >
                        Error {errorInfo.status}
                    </div>
                </div>

                {/* Title */}
                <Title
                    level={2}
                    style={{
                        margin: 0,
                        marginBottom: 12,
                        color: '#262626',
                        fontWeight: 600,
                    }}
                >
                    {errorInfo.title}
                </Title>

                {/* Message */}
                <Paragraph
                    style={{
                        fontSize: 16,
                        color: '#8c8c8c',
                        marginBottom: 32,
                        maxWidth: 400,
                        margin: '0 auto 32px',
                    }}
                >
                    {errorInfo.message}
                </Paragraph>

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
                        icon={<ReloadOutlined />}
                        onClick={handleReload}
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
                        Tải lại
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
                </Space>

                {/* Debug info (dev only) */}
                {(isDev || showDetails) && error && (
                    <div
                        style={{
                            marginTop: 40,
                            padding: 20,
                            background: '#1a1a1a',
                            borderRadius: 12,
                            textAlign: 'left',
                            border: '1px solid #333',
                        }}
                    >
                        <Space align="center" style={{ marginBottom: 12 }}>
                            <BugOutlined style={{ color: '#ea4544', fontSize: 16 }} />
                            <Text style={{ color: '#ea4544', fontWeight: 600, fontSize: 13 }}>
                                Debug Info (Development)
                            </Text>
                        </Space>

                        {error.message && (
                            <div style={{ marginBottom: 8 }}>
                                <Text style={{ color: '#888', fontSize: 12 }}>Message: </Text>
                                <Text code style={{ fontSize: 12, background: '#2a2a2a', color: '#fff' }}>
                                    {error.message}
                                </Text>
                            </div>
                        )}

                        {error.status && (
                            <div style={{ marginBottom: 8 }}>
                                <Text style={{ color: '#888', fontSize: 12 }}>Status: </Text>
                                <Text code style={{ fontSize: 12, background: '#2a2a2a', color: '#fff' }}>
                                    {error.status}
                                </Text>
                            </div>
                        )}

                        {error.stack && (
                            <div style={{ marginTop: 12 }}>
                                <Text style={{ color: '#888', fontSize: 12 }}>Stack trace:</Text>
                                <pre
                                    style={{
                                        fontSize: 10,
                                        background: '#0d0d0d',
                                        color: '#ccc',
                                        padding: 12,
                                        borderRadius: 6,
                                        overflow: 'auto',
                                        maxHeight: 150,
                                        marginTop: 8,
                                        border: '1px solid #333',
                                    }}
                                >
                                    {error.stack}
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                {/* Help text */}
                <Paragraph style={{ marginTop: 32 }}>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                        Nếu lỗi này tiếp tục xảy ra, vui lòng liên hệ{' '}
                        <a
                            href="mailto:support@company.com"
                            style={{
                                color: '#ea4544',
                                fontWeight: 500,
                                textDecoration: 'none',
                            }}
                        >
                            bộ phận hỗ trợ
                        </a>
                        .
                    </Text>
                </Paragraph>
            </div>

            {/* CSS Animations */}
            <style>
                {`
                    @keyframes errorPulse {
                        0%, 100% {
                            transform: scale(1);
                            box-shadow: 0 0 0 0 rgba(234, 69, 68, 0.3);
                        }
                        50% {
                            transform: scale(1.02);
                            box-shadow: 0 0 0 15px rgba(234, 69, 68, 0);
                        }
                    }
                `}
            </style>
        </div>
    );
}

ErrorPage.propTypes = {
    error: PropTypes.shape({
        message: PropTypes.string,
        status: PropTypes.number,
        statusText: PropTypes.string,
        stack: PropTypes.string,
    }),
    resetError: PropTypes.func,
    showDetails: PropTypes.bool,
};

ErrorPage.defaultProps = {
    error: null,
    resetError: null,
    showDetails: false,
};

export default ErrorPage;
