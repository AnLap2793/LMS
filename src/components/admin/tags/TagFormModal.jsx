import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, ColorPicker } from 'antd';

/**
 * TagFormModal Component
 * Modal form để tạo/sửa tag
 */
function TagFormModal({ open, onCancel, onSubmit, initialValues, loading }) {
    const [form] = Form.useForm();
    const isEditing = !!initialValues;

    // Reset form when modal opens/closes or initialValues changes
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    name: initialValues.name,
                    color: initialValues.color,
                    icon: initialValues.icon,
                });
            } else {
                form.resetFields();
                // Set default color
                form.setFieldValue('color', '#1890ff');
            }
        }
    }, [open, initialValues, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            // Convert color object to hex string if needed
            const color = typeof values.color === 'object' ? values.color.toHexString() : values.color;
            onSubmit({ ...values, color });
        } catch {
            // Validation failed
        }
    };

    return (
        <Modal
            title={isEditing ? 'Chỉnh sửa Tag' : 'Thêm Tag mới'}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            okText={isEditing ? 'Cập nhật' : 'Tạo mới'}
            cancelText="Hủy"
            confirmLoading={loading}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    color: '#1890ff',
                }}
            >
                <Form.Item
                    name="name"
                    label="Tên tag"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên tag' },
                        { min: 2, message: 'Tên tag phải có ít nhất 2 ký tự' },
                        { max: 50, message: 'Tên tag tối đa 50 ký tự' },
                    ]}
                >
                    <Input placeholder="VD: Technical, Soft-skill, Onboarding..." />
                </Form.Item>

                <Form.Item name="color" label="Màu sắc" rules={[{ required: true, message: 'Vui lòng chọn màu' }]}>
                    <ColorPicker
                        showText
                        format="hex"
                        presets={[
                            {
                                label: 'Gợi ý',
                                colors: [
                                    '#52c41a', // Green
                                    '#1890ff', // Blue
                                    '#722ed1', // Purple
                                    '#faad14', // Gold
                                    '#eb2f96', // Magenta
                                    '#13c2c2', // Cyan
                                    '#fa541c', // Orange
                                    '#2f54eb', // Geekblue
                                ],
                            },
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    name="icon"
                    label="Icon (tùy chọn)"
                    extra="Nhập tên icon từ Ant Design Icons, VD: BookOutlined, CodeOutlined"
                >
                    <Input placeholder="VD: BookOutlined" />
                </Form.Item>
            </Form>
        </Modal>
    );
}

TagFormModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        color: PropTypes.string,
        icon: PropTypes.string,
    }),
    loading: PropTypes.bool,
};

TagFormModal.defaultProps = {
    initialValues: null,
    loading: false,
};

export default TagFormModal;
