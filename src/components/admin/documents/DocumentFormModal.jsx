import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select, Upload, Space, Radio, message } from 'antd';
import { InboxOutlined, LinkOutlined, FileOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Dragger } = Upload;

/**
 * URL type options
 */
const URL_TYPE_OPTIONS = [
    { value: 'google_doc', label: 'Google Docs' },
    { value: 'google_sheet', label: 'Google Sheets' },
    { value: 'notion', label: 'Notion' },
    { value: 'external', label: 'Link khác' },
];

/**
 * DocumentFormModal - Modal form để tạo/sửa document
 */
function DocumentFormModal({ open, onCancel, onSubmit, initialValues, loading }) {
    const [form] = Form.useForm();
    const [documentType, setDocumentType] = useState('file');
    const [fileList, setFileList] = useState([]);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    type: initialValues.type || 'file',
                });
                setDocumentType(initialValues.type || 'file');
                if (initialValues.file) {
                    setFileList([
                        {
                            uid: initialValues.file.id,
                            name: initialValues.file.filename_download,
                            status: 'done',
                        },
                    ]);
                }
            } else {
                form.resetFields();
                setDocumentType('file');
                setFileList([]);
            }
        }
    }, [open, initialValues, form]);

    // Handle type change
    const handleTypeChange = e => {
        setDocumentType(e.target.value);
        form.setFieldValue('type', e.target.value);
    };

    // Handle file upload
    const uploadProps = {
        name: 'file',
        multiple: false,
        fileList,
        beforeUpload: file => {
            // Validate file size (max 50MB)
            const isLt50M = file.size / 1024 / 1024 < 50;
            if (!isLt50M) {
                message.error('File phải nhỏ hơn 50MB!');
                return Upload.LIST_IGNORE;
            }
            setFileList([file]);
            return false; // Prevent auto upload
        },
        onRemove: () => {
            setFileList([]);
        },
    };

    // Handle submit
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const submitData = {
                ...values,
                type: documentType,
            };

            // If file type and has new file
            if (documentType === 'file' && fileList.length > 0 && !fileList[0].uid?.startsWith('rc-upload')) {
                submitData.file = fileList[0];
            }

            onSubmit(submitData);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const isEditing = !!initialValues;

    return (
        <Modal
            title={isEditing ? 'Chỉnh sửa Tài liệu' : 'Thêm Tài liệu mới'}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText={isEditing ? 'Cập nhật' : 'Tạo mới'}
            cancelText="Hủy"
            confirmLoading={loading}
            width={600}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" initialValues={{ type: 'file' }}>
                {/* Document Type */}
                <Form.Item label="Loại tài liệu" name="type">
                    <Radio.Group onChange={handleTypeChange} value={documentType}>
                        <Radio.Button value="file">
                            <Space>
                                <FileOutlined />
                                Upload File
                            </Space>
                        </Radio.Button>
                        <Radio.Button value="url">
                            <Space>
                                <LinkOutlined />
                                Liên kết URL
                            </Space>
                        </Radio.Button>
                    </Radio.Group>
                </Form.Item>

                {/* Title */}
                <Form.Item
                    name="title"
                    label="Tiêu đề"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tiêu đề' },
                        { max: 255, message: 'Tiêu đề tối đa 255 ký tự' },
                    ]}
                >
                    <Input placeholder="Nhập tiêu đề tài liệu" />
                </Form.Item>

                {/* Description */}
                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={3} placeholder="Mô tả ngắn về tài liệu (không bắt buộc)" />
                </Form.Item>

                {/* File Upload - for file type */}
                {documentType === 'file' && (
                    <Form.Item
                        label="File đính kèm"
                        required
                        rules={[
                            {
                                validator: () => {
                                    if (fileList.length === 0 && !initialValues?.file) {
                                        return Promise.reject(new Error('Vui lòng upload file'));
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Dragger {...uploadProps}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click hoặc kéo thả file vào đây</p>
                            <p className="ant-upload-hint">
                                Hỗ trợ: PDF, DOCX, PPTX, XLSX, ZIP, RAR, TXT, CSV (tối đa 50MB)
                            </p>
                        </Dragger>
                    </Form.Item>
                )}

                {/* URL Input - for url type */}
                {documentType === 'url' && (
                    <>
                        <Form.Item
                            name="url"
                            label="URL"
                            rules={[
                                { required: true, message: 'Vui lòng nhập URL' },
                                { type: 'url', message: 'URL không hợp lệ' },
                            ]}
                        >
                            <Input placeholder="https://docs.google.com/..." />
                        </Form.Item>

                        <Form.Item name="url_type" label="Loại URL">
                            <Select placeholder="Chọn loại URL" options={URL_TYPE_OPTIONS} allowClear />
                        </Form.Item>
                    </>
                )}
            </Form>
        </Modal>
    );
}

DocumentFormModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    loading: PropTypes.bool,
};

DocumentFormModal.defaultProps = {
    initialValues: null,
    loading: false,
};

export default DocumentFormModal;
