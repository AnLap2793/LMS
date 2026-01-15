import { Button, Typography, Space } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const { Title, Paragraph, Text } = Typography;

/**
 * NotFoundPage - Trang 404 Not Found (Custom Design)
 *
 * Hiển thị khi người dùng truy cập vào URL không tồn tại
 * Design phù hợp với theme đỏ #ea4544 của dự án LMS
 *
 * @component
 * @example
 * // Sử dụng trong routes
 * { path: '*', element: <NotFoundPage /> }
 */
function NotFoundPage({ title, subTitle, showBackButton }) {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        navigate(-1);
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
                    top: '-10%',
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
                    position: 'absolute',
                    bottom: '-15%',
                    left: '-10%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(234,69,68,0.05) 0%, transparent 70%)',
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
                {/* Custom 404 Illustration */}
                <div style={{ marginBottom: 32, position: 'relative' }}>
                    {/* Large 404 Text with gradient */}
                    <div
                        style={{
                            fontSize: 'clamp(100px, 20vw, 180px)',
                            fontWeight: 900,
                            lineHeight: 1,
                            background: 'linear-gradient(135deg, #ea4544 0%, #ff7875 50%, #ea4544 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textShadow: '0 4px 30px rgba(234, 69, 68, 0.2)',
                            letterSpacing: '-8px',
                            userSelect: 'none',
                            animation: 'pulse404 3s ease-in-out infinite',
                        }}
                    >
                        404
                    </div>

                    {/* Decorative elements */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                        }}
                    >
                        {/* Search icon floating */}
                        <SearchOutlined
                            style={{
                                position: 'absolute',
                                top: '10%',
                                right: '15%',
                                fontSize: 28,
                                color: '#ea4544',
                                opacity: 0.3,
                                animation: 'float 4s ease-in-out infinite',
                            }}
                        />
                        {/* Small decorative circles */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '20%',
                                left: '10%',
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: '#ea4544',
                                opacity: 0.2,
                                animation: 'float 3s ease-in-out infinite 0.5s',
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: '30%',
                                left: '5%',
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: '#ff7875',
                                opacity: 0.3,
                                animation: 'float 3.5s ease-in-out infinite 1s',
                            }}
                        />
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
                    {title}
                </Title>

                {/* Subtitle */}
                <Paragraph
                    style={{
                        fontSize: 16,
                        color: '#8c8c8c',
                        marginBottom: 32,
                        maxWidth: 400,
                        margin: '0 auto 32px',
                    }}
                >
                    {subTitle}
                </Paragraph>

                {/* Action buttons */}
                <Space size="middle" wrap style={{ justifyContent: 'center' }}>
                    {showBackButton && (
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
                    )}
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

                {/* Help text */}
                <div
                    style={{
                        marginTop: 48,
                        padding: '16px 24px',
                        background: 'rgba(234, 69, 68, 0.04)',
                        borderRadius: 12,
                        border: '1px solid rgba(234, 69, 68, 0.1)',
                    }}
                >
                    <Text type="secondary" style={{ fontSize: 14 }}>
                        Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 14 }}>
                        Cần hỗ trợ?{' '}
                        <a
                            href="mailto:support@company.com"
                            style={{
                                color: '#ea4544',
                                fontWeight: 500,
                                textDecoration: 'none',
                            }}
                        >
                            Liên hệ bộ phận hỗ trợ
                        </a>
                    </Text>
                </div>
            </div>

            {/* CSS Animations */}
            <style>
                {`
                    @keyframes pulse404 {
                        0%, 100% {
                            transform: scale(1);
                            opacity: 1;
                        }
                        50% {
                            transform: scale(1.02);
                            opacity: 0.9;
                        }
                    }
                    
                    @keyframes float {
                        0%, 100% {
                            transform: translateY(0px);
                        }
                        50% {
                            transform: translateY(-10px);
                        }
                    }
                `}
            </style>
        </div>
    );
}

NotFoundPage.propTypes = {
    title: PropTypes.string,
    subTitle: PropTypes.string,
    showBackButton: PropTypes.bool,
};

NotFoundPage.defaultProps = {
    title: 'Không tìm thấy trang',
    subTitle: 'Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.',
    showBackButton: true,
};

export default NotFoundPage;
