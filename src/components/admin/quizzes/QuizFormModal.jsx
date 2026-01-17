import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, InputNumber, Switch, Select } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '../../../services/courseService';
import { queryKeys } from '../../../constants/queryKeys';

const { TextArea } = Input;

/**
 * QuizFormModal Component
 * Modal form để tạo/sửa bài kiểm tra
 */
function QuizFormModal({ open, onCancel, onSubmit, initialValues, loading }) {
    const [form] = Form.useForm();
    const isEditing = !!initialValues;

    // Fetch courses for selection
    const { data: courses = [] } = useQuery({
        queryKey: queryKeys.courses.adminList({ fields: ['id', 'title'] }),
        queryFn: () => courseService.getAll({ limit: -1, fields: ['id', 'title'] }),
        enabled: open,
    });

    // Reset form when modal opens/closes
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
                // Set defaults
                form.setFieldsValue({
                    pass_score: 70,
                    time_limit: 30,
                    max_attempts: 3,
                    randomize_questions: true,
                });
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
            title={isEditing ? 'Chỉnh sửa Bài kiểm tra' : 'Thêm Bài kiểm tra mới'}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            okText={isEditing ? 'Cập nhật' : 'Tạo mới'}
            cancelText="Hủy"
            confirmLoading={loading}
            destroyOnHidden
            width="90%"
            style={{ maxWidth: 600 }}
            centered
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="title"
                    label="Tên bài kiểm tra"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên bài kiểm tra' },
                        { min: 5, message: 'Tên phải có ít nhất 5 ký tự' },
                    ]}
                >
                    <Input placeholder="VD: Kiểm tra kiến thức Module 1" />
                </Form.Item>

                <Form.Item
                    name="course_id"
                    label="Thuộc khóa học"
                    rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}
                >
                    <Select
                        placeholder="Chọn khóa học"
                        options={courses.map(c => ({ value: c.id, label: c.title }))}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={3} placeholder="Mô tả nội dung bài kiểm tra..." />
                </Form.Item>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item name="pass_score" label="Điểm đạt (%)" style={{ flex: 1 }} rules={[{ required: true }]}>
                        <InputNumber min={0} max={100} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="time_limit"
                        label="Thời gian (phút)"
                        style={{ flex: 1 }}
                        extra="0 = không giới hạn"
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="max_attempts"
                        label="Số lần làm tối đa"
                        style={{ flex: 1 }}
                        extra="0 = không giới hạn"
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Form.Item name="randomize_questions" label="Trộn câu hỏi" valuePropName="checked">
                    <Switch checkedChildren="Có" unCheckedChildren="Không" />
                </Form.Item>
            </Form>
        </Modal>
    );
}

QuizFormModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    loading: PropTypes.bool,
};

export default QuizFormModal;
