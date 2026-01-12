import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select, InputNumber, Switch, Space, Radio, Divider } from 'antd';
import { PlayCircleOutlined, FileTextOutlined, FileOutlined, LinkOutlined, FormOutlined } from '@ant-design/icons';
import { LESSON_TYPE_OPTIONS, VIDEO_PROVIDER_OPTIONS } from '../../../constants/lms';

const { TextArea } = Input;

/**
 * LessonFormModal Component
 * Modal form để tạo/sửa bài học
 */
function LessonFormModal({ open, onCancel, onSubmit, initialValues }) {
    const [form] = Form.useForm();
    const isEditing = !!initialValues;

    // Derive lessonType from form values instead of separate state
    const lessonType = Form.useWatch('type', form) || 'video';

    // Reset form when modal opens/closes
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
                form.setFieldValue('type', 'video');
            }
        }
    }, [open, initialValues, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
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
    };

    // Icon map for type buttons
    const typeIcons = {
        video: <PlayCircleOutlined />,
        article: <FileTextOutlined />,
        file: <FileOutlined />,
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
            width={700}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    type: 'video',
                    is_required: true,
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
                        name="content"
                        label="Nội dung bài viết"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                        extra="Hỗ trợ Markdown format"
                    >
                        <TextArea
                            placeholder="# Tiêu đề&#10;&#10;Nội dung bài viết..."
                            rows={10}
                        />
                    </Form.Item>
                )}

                {lessonType === 'file' && (
                    <Form.Item
                        name="file_attachment"
                        label="Tài liệu đính kèm"
                        extra="Chức năng upload sẽ được bổ sung khi kết nối Directus"
                    >
                        <Input placeholder="File sẽ được upload sau khi kết nối Directus" disabled />
                    </Form.Item>
                )}

                {lessonType === 'link' && (
                    <Form.Item
                        name="external_link"
                        label="Liên kết ngoài"
                        rules={[
                            { required: true, message: 'Vui lòng nhập URL' },
                            { type: 'url', message: 'URL không hợp lệ' },
                        ]}
                    >
                        <Input placeholder="https://example.com" />
                    </Form.Item>
                )}

                {lessonType === 'quiz' && (
                    <Form.Item label="Bài kiểm tra">
                        <Input placeholder="Quản lý câu hỏi quiz sẽ được bổ sung sau" disabled />
                    </Form.Item>
                )}

                <Divider />

                {/* Common fields */}
                <Space size="large">
                    <Form.Item name="duration" label="Thời lượng (phút)">
                        <InputNumber min={0} placeholder="VD: 15" />
                    </Form.Item>

                    <Form.Item name="is_required" label="Bắt buộc" valuePropName="checked">
                        <Switch checkedChildren="Có" unCheckedChildren="Không" />
                    </Form.Item>
                </Space>
            </Form>
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
        is_required: PropTypes.bool,
    }),
};

LessonFormModal.defaultProps = {
    initialValues: null,
};

export default LessonFormModal;
