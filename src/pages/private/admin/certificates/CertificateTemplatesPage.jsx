import { useState } from 'react';
import { Card, Row, Col, Button, Tag, Space, Typography, Switch, Popconfirm, message, Upload, Empty } from 'antd';
import {
    PlusOutlined,
    FileProtectOutlined,
    CheckCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../../../components/common';
import { mockCertificateTemplates } from '../../../../mocks';

const { Text, Title } = Typography;

/**
 * Certificate Templates Page
 * Quản lý mẫu chứng chỉ
 */
function CertificateTemplatesPage() {
    const [templates, setTemplates] = useState(mockCertificateTemplates);

    // Handle set active template
    const handleSetActive = templateId => {
        setTemplates(prev =>
            prev.map(t => ({
                ...t,
                is_active: t.id === templateId,
            }))
        );
        message.success('Đã cập nhật template mặc định');
    };

    // Handle delete
    const handleDelete = templateId => {
        const template = templates.find(t => t.id === templateId);
        if (template?.is_active) {
            message.error('Không thể xóa template đang được sử dụng');
            return;
        }
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        message.success('Đã xóa template');
    };

    return (
        <div>
            <PageHeader
                title="Mẫu Chứng chỉ"
                subtitle="Quản lý các template PDF cho chứng chỉ hoàn thành khóa học"
                breadcrumbs={[{ title: 'Hệ thống' }, { title: 'Mẫu chứng chỉ' }]}
                actions={
                    <Upload
                        accept=".pdf"
                        showUploadList={false}
                        beforeUpload={() => {
                            message.info('Chức năng upload đang phát triển');
                            return false;
                        }}
                    >
                        <Button type="primary" icon={<UploadOutlined />}>
                            Upload Template mới
                        </Button>
                    </Upload>
                }
            />

            {/* Template Cards */}
            {templates.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {templates.map(template => (
                        <Col xs={24} sm={12} lg={8} key={template.id}>
                            <Card
                                hoverable
                                style={{
                                    border: template.is_active ? '2px solid #52c41a' : undefined,
                                }}
                                cover={
                                    <div
                                        style={{
                                            height: 200,
                                            background: '#f5f5f5',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                        }}
                                    >
                                        <FileProtectOutlined style={{ fontSize: 64, color: '#999' }} />
                                        {template.is_active && (
                                            <Tag
                                                color="success"
                                                icon={<CheckCircleOutlined />}
                                                style={{ position: 'absolute', top: 8, right: 8 }}
                                            >
                                                Đang sử dụng
                                            </Tag>
                                        )}
                                    </div>
                                }
                                actions={[
                                    <Button
                                        type="text"
                                        icon={<EyeOutlined />}
                                        onClick={() => message.info('Xem preview template')}
                                    >
                                        Xem
                                    </Button>,
                                    <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={() => message.info('Chỉnh sửa template')}
                                    >
                                        Sửa
                                    </Button>,
                                    template.is_active ? (
                                        <Button type="text" disabled>
                                            Mặc định
                                        </Button>
                                    ) : (
                                        <Popconfirm
                                            title="Xóa template này?"
                                            onConfirm={() => handleDelete(template.id)}
                                            okText="Xóa"
                                            cancelText="Hủy"
                                            okButtonProps={{ danger: true }}
                                        >
                                            <Button type="text" danger icon={<DeleteOutlined />}>
                                                Xóa
                                            </Button>
                                        </Popconfirm>
                                    ),
                                ]}
                            >
                                <Card.Meta
                                    title={
                                        <Space>
                                            <span>{template.name}</span>
                                        </Space>
                                    }
                                    description={
                                        <div>
                                            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                                                {template.description}
                                            </Text>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {new Date(template.date_created).toLocaleDateString('vi-VN')}
                                                </Text>
                                                {!template.is_active && (
                                                    <Button
                                                        type="link"
                                                        size="small"
                                                        onClick={() => handleSetActive(template.id)}
                                                    >
                                                        Đặt làm mặc định
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có template nào">
                    <Upload
                        accept=".pdf"
                        showUploadList={false}
                        beforeUpload={() => {
                            message.info('Chức năng upload đang phát triển');
                            return false;
                        }}
                    >
                        <Button type="primary" icon={<UploadOutlined />}>
                            Upload Template đầu tiên
                        </Button>
                    </Upload>
                </Empty>
            )}

            {/* Info section */}
            <Card style={{ marginTop: 24 }}>
                <Title level={5}>Hướng dẫn tạo Template</Title>
                <ul style={{ color: '#666' }}>
                    <li>Template phải là file PDF</li>
                    <li>Sử dụng các placeholder để chèn thông tin động:</li>
                    <ul>
                        <li>
                            <code>{'{user_name}'}</code> - Họ tên học viên
                        </li>
                        <li>
                            <code>{'{course_title}'}</code> - Tên khóa học
                        </li>
                        <li>
                            <code>{'{completion_date}'}</code> - Ngày hoàn thành
                        </li>
                        <li>
                            <code>{'{certificate_number}'}</code> - Số chứng chỉ
                        </li>
                    </ul>
                    <li>Kích thước khuyến nghị: A4 landscape (297 x 210 mm)</li>
                </ul>
            </Card>
        </div>
    );
}

export default CertificateTemplatesPage;
