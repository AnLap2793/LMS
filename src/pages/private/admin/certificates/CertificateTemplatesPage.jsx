import { useState } from 'react';
import {
    Card,
    Row,
    Col,
    Button,
    Tag,
    Space,
    Typography,
    Popconfirm,
    message,
    Upload,
    Empty,
    Modal,
    Form,
    Input,
    Statistic,
} from 'antd';
import {
    PlusOutlined,
    FileProtectOutlined,
    CheckCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
    EyeOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../../../components/common';
import { certificateService } from '../../../../services/certificateService';
import { queryKeys } from '../../../../constants/queryKeys';
import { showSuccess, showError } from '../../../../utils/errorHandler';

const { Text, Title } = Typography;
const { TextArea } = Input;

/**
 * Certificate Templates Page
 * Quản lý mẫu chứng chỉ
 */
function CertificateTemplatesPage() {
    const [modalVisible, setModalVisible] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch templates
    const { data: templates = [], isLoading: loading } = useQuery({
        queryKey: ['certificate-templates'], // Add to queryKeys if not present
        queryFn: certificateService.getTemplates,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: certificateService.createTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries(['certificate-templates']);
            showSuccess('Đã thêm template mới');
            setModalVisible(false);
        },
        onError: showError,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => certificateService.updateTemplate(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['certificate-templates']);
            showSuccess('Đã cập nhật template');
            setModalVisible(false);
        },
        onError: showError,
    });

    const deleteMutation = useMutation({
        mutationFn: certificateService.deleteTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries(['certificate-templates']);
            showSuccess('Đã xóa template');
        },
        onError: showError,
    });

    const setActiveMutation = useMutation({
        mutationFn: certificateService.setActiveTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries(['certificate-templates']);
            showSuccess('Đã cập nhật template mặc định');
        },
        onError: showError,
    });

    // Handle set active template
    const handleSetActive = templateId => {
        setActiveMutation.mutate(templateId);
    };

    // Handle delete
    const handleDelete = templateId => {
        const template = templates.find(t => t.id === templateId);
        if (template?.is_active) {
            message.error('Không thể xóa template đang được sử dụng');
            return;
        }
        deleteMutation.mutate(templateId);
    };

    // Handle preview
    const handlePreview = template => {
        setPreviewTemplate(template);
        setPreviewVisible(true);
    };

    // Handle add new template
    const handleAdd = () => {
        setEditingTemplate(null);
        form.resetFields();
        setModalVisible(true);
    };

    // Handle edit template
    const handleEdit = template => {
        setEditingTemplate(template);
        form.setFieldsValue({
            name: template.name,
            description: template.description,
        });
        setModalVisible(true);
    };

    // Handle modal save
    const handleModalSave = async () => {
        try {
            const values = await form.validateFields();

            if (editingTemplate) {
                updateMutation.mutate({
                    id: editingTemplate.id,
                    data: { name: values.name, description: values.description },
                });
            } else {
                // For simplified logic, assuming file upload is handled separately or we create placeholder
                createMutation.mutate({
                    name: values.name,
                    description: values.description,
                    is_active: false,
                    // In real implementation, handle file upload to directus_files first
                });
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    // Handle refresh
    const handleRefresh = () => {
        queryClient.invalidateQueries(['certificate-templates']);
        message.success('Đã làm mới danh sách');
    };

    // Upload props
    const uploadProps = {
        accept: '.pdf',
        showUploadList: false,
        beforeUpload: file => {
            const isPDF = file.type === 'application/pdf';
            if (!isPDF) {
                message.error('Chỉ chấp nhận file PDF!');
                return false;
            }
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                message.error('File phải nhỏ hơn 10MB!');
                return false;
            }
            message.success(`Đã chọn file: ${file.name}`);
            return false; // Prevent auto upload
        },
    };

    return (
        <div>
            <PageHeader
                title="Mẫu Chứng chỉ"
                subtitle="Quản lý các template PDF cho chứng chỉ hoàn thành khóa học"
                breadcrumbs={[{ title: 'Hệ thống' }, { title: 'Mẫu chứng chỉ' }]}
                actions={
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                            Làm mới
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Thêm Template
                        </Button>
                    </Space>
                }
            />

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={8}>
                    <Card size="small" loading={loading}>
                        <Statistic
                            title="Tổng template"
                            value={templates.length}
                            prefix={<FileProtectOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8}>
                    <Card size="small" loading={loading}>
                        <Statistic
                            title="Đang sử dụng"
                            value={templates.filter(t => t.is_active).length}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Template Cards */}
            {templates.length > 0 || loading ? (
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
                                            background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => handlePreview(template)}
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
                                        <div
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                background: 'rgba(0,0,0,0.5)',
                                                color: '#fff',
                                                padding: '8px 12px',
                                                textAlign: 'center',
                                            }}
                                        >
                                            <EyeOutlined /> Click để xem preview
                                        </div>
                                    </div>
                                }
                                actions={[
                                    <Button type="text" icon={<EyeOutlined />} onClick={() => handlePreview(template)}>
                                        Xem
                                    </Button>,
                                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(template)}>
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
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                loading={deleteMutation.isPending}
                                            >
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
                                                        loading={setActiveMutation.isPending}
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm Template đầu tiên
                    </Button>
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

            {/* Add/Edit Modal */}
            <Modal
                title={editingTemplate ? 'Chỉnh sửa Template' : 'Thêm Template mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleModalSave}
                okText={editingTemplate ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Hủy"
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên template"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên template' },
                            { min: 3, message: 'Tên phải có ít nhất 3 ký tự' },
                        ]}
                    >
                        <Input placeholder="VD: Template Chuẩn" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ max: 500, message: 'Mô tả tối đa 500 ký tự' }]}
                    >
                        <TextArea placeholder="Mô tả ngắn về template..." rows={3} showCount maxLength={500} />
                    </Form.Item>

                    <Form.Item label="File PDF" extra="Chọn file PDF template (tối đa 10MB)">
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Chọn file PDF</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Preview Modal */}
            <Modal
                title={`Preview: ${previewTemplate?.name || ''}`}
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setPreviewVisible(false)}>
                        Đóng
                    </Button>,
                    <Button key="download" type="primary" onClick={() => message.info('Tải xuống template PDF')}>
                        Tải xuống
                    </Button>,
                ]}
                width={800}
            >
                <div
                    style={{
                        height: 500,
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                    }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <FileProtectOutlined style={{ fontSize: 80, color: '#999', marginBottom: 16 }} />
                        <div>
                            <Text type="secondary">
                                Preview chứng chỉ sẽ hiển thị ở đây
                                <br />
                                (Tích hợp PDF viewer khi kết nối Directus)
                            </Text>
                        </div>
                        {previewTemplate && (
                            <div style={{ marginTop: 16 }}>
                                <Tag color="blue">{previewTemplate.file?.filename_download || 'sample.pdf'}</Tag>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default CertificateTemplatesPage;
