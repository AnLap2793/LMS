import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select, InputNumber, Space, Radio, Divider, Button, List, Tag, Empty } from 'antd';
import {
    PlayCircleOutlined,
    FileTextOutlined,
    FileOutlined,
    LinkOutlined,
    FormOutlined,
    PlusOutlined,
    DeleteOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    FilePptOutlined,
    GoogleOutlined,
} from '@ant-design/icons';
import { LESSON_TYPE_OPTIONS, VIDEO_PROVIDER_OPTIONS } from '../../../constants/lms';
import { LexicalEditor } from '../../common';
import DocumentSelectorModal from '../documents/DocumentSelectorModal';

/**
 * LessonFormModal Component
 * Modal form để tạo/sửa bài học
 */
function LessonFormModal({ open, onCancel, onSubmit, initialValues }) {
    const [form] = Form.useForm();
    const isEditing = !!initialValues;

    // Derive lessonType from form values instead of separate state
    const lessonType = Form.useWatch('type', form) || 'video';

    // State for Lexical editor content (since Lexical doesn't work directly with Form.Item)
    const [articleContent, setArticleContent] = useState('');

    // State for selected documents (for file type lessons)
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [isDocSelectorOpen, setIsDocSelectorOpen] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
                setArticleContent(initialValues.content || '');

                // Handle documents (with backward compatibility for file_attachment)
                let docs = initialValues.documents || [];
                if (docs.length === 0 && initialValues.file_attachment) {
                    docs = [
                        {
                            id: initialValues.file_attachment.id || 'mock-file-id',
                            title: initialValues.file_attachment.filename_download || 'Legacy File',
                            type: 'file',
                            file: initialValues.file_attachment,
                        },
                    ];
                }
                setSelectedDocuments(docs);
            } else {
                form.resetFields();
                form.setFieldValue('type', 'video');
                setArticleContent('');
                setSelectedDocuments([]);
            }
        }
    }, [open, initialValues, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            // Add article content from Lexical editor
            if (lessonType === 'article') {
                values.content = articleContent;
            }
            // Add selected documents
            values.documents = selectedDocuments;

            onSubmit(values);
        } catch {
            // Validation failed
        }
    };

    const handleTypeChange = () => {
        // Form will update automatically via Form.useWatch
        // Clear type-specific fields
        form.setFieldsValue({
            video_url: null,
            video_provider: null,
            content: null,
            external_link: null,
            file_attachment: null,
        });
        setArticleContent('');
        setSelectedDocuments([]);
    };

    // Handle document selection from library
    const handleDocumentsSelected = docs => {
        // Merge new docs with existing, avoiding duplicates
        const existingIds = selectedDocuments.map(d => d.id);
        const newDocs = docs.filter(d => !existingIds.includes(d.id));
        setSelectedDocuments([...selectedDocuments, ...newDocs]);
        setIsDocSelectorOpen(false);
    };

    // Remove document from selection
    const handleRemoveDocument = docId => {
        setSelectedDocuments(selectedDocuments.filter(d => d.id !== docId));
    };

    // Get file icon helper
    const getDocIcon = doc => {
        if (doc.type === 'url') {
            if (doc.url_type?.includes('google')) return <GoogleOutlined style={{ color: '#4285f4' }} />;
            return <LinkOutlined style={{ color: '#1890ff' }} />;
        }
        const fileType = doc.file?.type || '';
        if (fileType.includes('pdf')) return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
        if (fileType.includes('word')) return <FileWordOutlined style={{ color: '#1890ff' }} />;
        if (fileType.includes('excel') || fileType.includes('sheet'))
            return <FileExcelOutlined style={{ color: '#52c41a' }} />;
        if (fileType.includes('powerpoint') || fileType.includes('presentation'))
            return <FilePptOutlined style={{ color: '#fa8c16' }} />;
        return <FileOutlined />;
    };

    // Icon map for type buttons
    const typeIcons = {
        video: <PlayCircleOutlined />,
        article: <FileTextOutlined />,
        link: <LinkOutlined />,
        quiz: <FormOutlined />,
    };

    return (
        <Modal
            title={isEditing ? 'Chỉnh sửa Bài học' : 'Thêm Bài học mới'}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            okText={isEditing ? 'Cập nhật' : 'Tạo mới'}
            cancelText="Hủy"
            destroyOnClose
            width="90%"
            style={{ maxWidth: 800 }}
            centered
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    type: 'video',
                    status: 'published',
                }}
            >
                {/* Lesson Type */}
                <Form.Item name="type" label="Loại bài học" required>
                    <Radio.Group onChange={handleTypeChange} value={lessonType}>
                        <Space wrap>
                            {LESSON_TYPE_OPTIONS.map(opt => (
                                <Radio.Button
                                    key={opt.value}
                                    value={opt.value}
                                    style={{ minWidth: 100, textAlign: 'center' }}
                                >
                                    <Space direction="vertical" size={0}>
                                        {typeIcons[opt.value]}
                                        <span style={{ fontSize: 12 }}>{opt.label}</span>
                                    </Space>
                                </Radio.Button>
                            ))}
                        </Space>
                    </Radio.Group>
                </Form.Item>

                {/* Title */}
                <Form.Item
                    name="title"
                    label="Tên bài học"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên bài học' },
                        { min: 3, message: 'Tên phải có ít nhất 3 ký tự' },
                        { max: 200, message: 'Tên tối đa 200 ký tự' },
                    ]}
                >
                    <Input placeholder="VD: Giới thiệu về công ty" />
                </Form.Item>

                <Divider />

                {/* Type-specific fields */}
                {lessonType === 'video' && (
                    <>
                        <Form.Item
                            name="video_url"
                            label="URL Video"
                            rules={[
                                { required: true, message: 'Vui lòng nhập URL video' },
                                { type: 'url', message: 'URL không hợp lệ' },
                            ]}
                            extra="Hỗ trợ YouTube, Vimeo"
                        >
                            <Input placeholder="https://www.youtube.com/watch?v=..." />
                        </Form.Item>
                        <Form.Item name="video_provider" label="Nguồn video">
                            <Select placeholder="Tự động nhận diện" options={VIDEO_PROVIDER_OPTIONS} allowClear />
                        </Form.Item>
                    </>
                )}

                {lessonType === 'article' && (
                    <Form.Item
                        label="Nội dung bài viết"
                        required
                        help="Sử dụng toolbar để định dạng văn bản"
                        validateStatus={!articleContent ? 'error' : ''}
                    >
                        <LexicalEditor
                            value={articleContent}
                            onChange={setArticleContent}
                            placeholder="Nhập nội dung bài học..."
                            size="large"
                        />
                    </Form.Item>
                )}

                {lessonType === 'quiz' && (
                    <Form.Item label="Bài kiểm tra">
                        <Input placeholder="Quản lý câu hỏi quiz sẽ được bổ sung sau" disabled />
                    </Form.Item>
                )}

                <Divider />

                {/* Attachments - Available for ALL lesson types */}
                <Form.Item
                    label="Tài liệu / Tài nguyên đính kèm"
                    tooltip="Tài liệu bổ trợ cho bài học (Slide, Source code, Ebook...)"
                >
                    {/* Selected documents list */}
                    {selectedDocuments.length > 0 ? (
                        <List
                            size="small"
                            bordered
                            dataSource={selectedDocuments}
                            renderItem={doc => (
                                <List.Item
                                    actions={[
                                        <Button
                                            key="delete"
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemoveDocument(doc.id)}
                                        />,
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={getDocIcon(doc)}
                                        title={doc.title}
                                        description={
                                            <Tag color={doc.type === 'file' ? 'blue' : 'green'}>
                                                {doc.type === 'file' ? 'File' : 'URL'}
                                            </Tag>
                                        }
                                    />
                                </List.Item>
                            )}
                            style={{ marginBottom: 12 }}
                        />
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Chưa có tài liệu đính kèm"
                            style={{ margin: '12px 0' }}
                        />
                    )}

                    {/* Button to open document selector */}
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => setIsDocSelectorOpen(true)} block>
                        Chọn từ Thư viện Tài liệu
                    </Button>
                </Form.Item>

                <Divider />

                {/* Common fields */}
                <Form.Item name="duration" label="Thời lượng (phút)">
                    <InputNumber min={0} placeholder="VD: 15" />
                </Form.Item>
            </Form>

            {/* Document Selector Modal */}
            <DocumentSelectorModal
                open={isDocSelectorOpen}
                onCancel={() => setIsDocSelectorOpen(false)}
                onSelect={handleDocumentsSelected}
                selectedIds={selectedDocuments.map(d => d.id)}
            />
        </Modal>
    );
}

LessonFormModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        type: PropTypes.string,
        content: PropTypes.string,
        video_url: PropTypes.string,
        video_provider: PropTypes.string,
        external_link: PropTypes.string,
        duration: PropTypes.number,
        documents: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string,
                title: PropTypes.string,
                type: PropTypes.string,
            })
        ),
    }),
};

LessonFormModal.defaultProps = {
    initialValues: null,
};

export default LessonFormModal;
