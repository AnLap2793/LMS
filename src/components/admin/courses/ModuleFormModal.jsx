import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select } from 'antd';
import { MODULE_STATUS_OPTIONS } from '../../../constants/lms';

const { TextArea } = Input;

/**
 * ModuleFormModal Component
 * Modal form để tạo/sửa module
 */
function ModuleFormModal({ open, onCancel, onSubmit, initialValues }) {
    const [form] = Form.useForm();
    const isEditing = !!initialValues;

    // Reset form when modal opens/closes
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
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

    return (
        <Modal
            title={isEditing ? 'Chỉnh sửa Module' : 'Thêm Module mới'}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            okText={isEditing ? 'Cập nhật' : 'Tạo mới'}
            cancelText="Hủy"
            destroyOnClose
            width="90%"
            style={{ maxWidth: 600 }}
            centered
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    status: 'published',
                }}
            >
                <Form.Item
                    name="title"
                    label="Tên module"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên module' },
                        { min: 3, message: 'Tên module phải có ít nhất 3 ký tự' },
                        { max: 200, message: 'Tên module tối đa 200 ký tự' },
                    ]}
                >
                    <Input placeholder="VD: Giới thiệu công ty, Quy trình làm việc..." />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả (tùy chọn)"
                    rules={[{ max: 500, message: 'Mô tả tối đa 500 ký tự' }]}
                >
                    <TextArea placeholder="Mô tả ngắn gọn về nội dung module..." rows={3} showCount maxLength={500} />
                </Form.Item>

                <Form.Item name="status" label="Trạng thái">
                    <Select options={MODULE_STATUS_OPTIONS} style={{ width: 200 }} />
                </Form.Item>
            </Form>
        </Modal>
    );
}

ModuleFormModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        status: PropTypes.string,
    }),
};

ModuleFormModal.defaultProps = {
    initialValues: null,
};

export default ModuleFormModal;
