import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Space, Tag, Button, Empty, Input, Statistic, Modal, message } from 'antd';
import {
    TrophyOutlined,
    DownloadOutlined,
    EyeOutlined,
    SearchOutlined,
    FileProtectOutlined,
    CalendarOutlined,
    BookOutlined,
    ShareAltOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { certificateService } from '../../../services/certificateService';
import { queryKeys } from '../../../constants/queryKeys';

const { Title, Text } = Typography;

/**
 * My Certificates Page
 * Danh sách chứng chỉ đã đạt được
 */
function MyCertificatesPage() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [previewVisible, setPreviewVisible] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);

    // Fetch user's certificates
    const { data: userCertificates = [], isLoading } = useQuery({
        queryKey: queryKeys.certificates.mine(),
        queryFn: () => certificateService.getMyCertificates(),
    });

    // Filtered certificates
    const filteredCertificates = useMemo(() => {
        if (!searchText.trim()) return userCertificates;
        return userCertificates.filter(
            cert =>
                cert.course?.title?.toLowerCase().includes(searchText.toLowerCase()) ||
                cert.certificate_number?.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [userCertificates, searchText]);

    // Handle preview
    const handlePreview = certificate => {
        setSelectedCertificate(certificate);
        setPreviewVisible(true);
    };

    // Handle download
    const handleDownload = certificate => {
        message.success(`Đang tải xuống: ${certificate.certificate_number}.pdf`);
        // Logic to download file from Directus assets would go here
        // window.open(getAssetUrl(certificate.file), '_blank');
    };

    // Handle share
    const handleShare = certificate => {
        const shareUrl = `${window.location.origin}/verify/${certificate.certificate_number}`;
        navigator.clipboard.writeText(shareUrl);
        message.success('Đã sao chép link chia sẻ vào clipboard!');
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 8 }}>
                    <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    Chứng chỉ của tôi
                </Title>
                <Text type="secondary">Xem và tải xuống các chứng chỉ bạn đã đạt được</Text>
            </div>

            {/* Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={8}>
                    <Card size="small" loading={isLoading}>
                        <Statistic
                            title="Tổng chứng chỉ"
                            value={userCertificates.length}
                            prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8}>
                    <Card size="small" loading={isLoading}>
                        <Statistic
                            title="Năm nay"
                            value={
                                userCertificates.filter(
                                    c => new Date(c.issued_at).getFullYear() === new Date().getFullYear()
                                ).length
                            }
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8}>
                    <Card size="small" loading={isLoading}>
                        <Statistic
                            title="Khóa học hoàn thành"
                            value={userCertificates.length}
                            prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Search */}
            <Card style={{ marginBottom: 24 }}>
                <Input
                    placeholder="Tìm kiếm theo tên khóa học hoặc mã chứng chỉ..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                    style={{ maxWidth: 400 }}
                />
            </Card>

            {/* Certificates Grid */}
            {filteredCertificates.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {filteredCertificates.map(certificate => (
                        <Col xs={24} sm={12} lg={8} key={certificate.id}>
                            <Card
                                hoverable
                                cover={
                                    <div
                                        style={{
                                            height: 180,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 24,
                                            position: 'relative',
                                        }}
                                        onClick={() => handlePreview(certificate)}
                                    >
                                        <FileProtectOutlined
                                            style={{ fontSize: 48, color: 'rgba(255,255,255,0.9)', marginBottom: 8 }}
                                        />
                                        <Text
                                            style={{
                                                color: '#fff',
                                                fontSize: 12,
                                                textAlign: 'center',
                                                opacity: 0.9,
                                            }}
                                        >
                                            CHỨNG CHỈ HOÀN THÀNH
                                        </Text>

                                        {/* Certificate number badge */}
                                        <Tag
                                            color="gold"
                                            style={{
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                            }}
                                        >
                                            {certificate.certificate_number}
                                        </Tag>
                                    </div>
                                }
                                actions={[
                                    <Button
                                        type="text"
                                        icon={<EyeOutlined />}
                                        onClick={() => handlePreview(certificate)}
                                    >
                                        Xem
                                    </Button>,
                                    <Button
                                        type="text"
                                        icon={<DownloadOutlined />}
                                        onClick={() => handleDownload(certificate)}
                                    >
                                        Tải xuống
                                    </Button>,
                                    <Button
                                        type="text"
                                        icon={<ShareAltOutlined />}
                                        onClick={() => handleShare(certificate)}
                                    >
                                        Chia sẻ
                                    </Button>,
                                ]}
                            >
                                <Card.Meta
                                    title={
                                        <Text
                                            strong
                                            style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {certificate.course?.title}
                                        </Text>
                                    }
                                    description={
                                        <Space direction="vertical" size={4}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                <CalendarOutlined style={{ marginRight: 4 }} />
                                                Cấp ngày: {new Date(certificate.issued_at).toLocaleDateString('vi-VN')}
                                            </Text>
                                        </Space>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Card loading={isLoading}>
                    {!isLoading && (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                searchText
                                    ? 'Không tìm thấy chứng chỉ phù hợp'
                                    : 'Bạn chưa có chứng chỉ nào. Hãy hoàn thành các khóa học để nhận chứng chỉ!'
                            }
                        >
                            {!searchText && (
                                <Button type="primary" onClick={() => navigate('/my-courses')}>
                                    Xem khóa học của tôi
                                </Button>
                            )}
                        </Empty>
                    )}
                </Card>
            )}

            {/* Preview Modal */}
            <Modal
                title={
                    <Space>
                        <FileProtectOutlined style={{ color: '#faad14' }} />
                        <span>Xem chứng chỉ</span>
                    </Space>
                }
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setPreviewVisible(false)}>
                        Đóng
                    </Button>,
                    <Button
                        key="share"
                        icon={<ShareAltOutlined />}
                        onClick={() => selectedCertificate && handleShare(selectedCertificate)}
                    >
                        Chia sẻ
                    </Button>,
                    <Button
                        key="download"
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => selectedCertificate && handleDownload(selectedCertificate)}
                    >
                        Tải xuống PDF
                    </Button>,
                ]}
                width={700}
            >
                {selectedCertificate && (
                    <div>
                        {/* Certificate Preview */}
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
                                borderRadius: 12,
                                padding: 32,
                                textAlign: 'center',
                                border: '2px solid #d9d9d9',
                                marginBottom: 24,
                            }}
                        >
                            <div style={{ marginBottom: 16 }}>
                                <TrophyOutlined style={{ fontSize: 48, color: '#faad14' }} />
                            </div>
                            <Title level={3} style={{ margin: 0, color: '#1a1a1a' }}>
                                CHỨNG CHỈ HOÀN THÀNH
                            </Title>
                            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                                Certificate of Completion
                            </Text>

                            <Text style={{ fontSize: 16 }}>Chứng nhận</Text>
                            <Title level={2} style={{ margin: '8px 0', color: '#ea4544' }}>
                                {selectedCertificate.user?.first_name || 'User'}{' '}
                                {selectedCertificate.user?.last_name || ''}
                            </Title>

                            <Text style={{ fontSize: 16 }}>Đã hoàn thành khóa học</Text>
                            <Title level={4} style={{ margin: '8px 0' }}>
                                {selectedCertificate.course?.title}
                            </Title>

                            <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px dashed #d9d9d9' }}>
                                <Row gutter={48}>
                                    <Col span={12}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Mã chứng chỉ
                                        </Text>
                                        <br />
                                        <Text strong>{selectedCertificate.certificate_number}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Ngày cấp
                                        </Text>
                                        <br />
                                        <Text strong>
                                            {new Date(selectedCertificate.issued_at).toLocaleDateString('vi-VN')}
                                        </Text>
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        {/* Certificate info */}
                        <Card size="small">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Text type="secondary">Email học viên:</Text>
                                    <br />
                                    <Text>{selectedCertificate.user?.email || 'N/A'}</Text>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary">Link xác thực:</Text>
                                    <br />
                                    <Text copyable>
                                        {`${window.location.origin}/verify/${selectedCertificate.certificate_number}`}
                                    </Text>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default MyCertificatesPage;
