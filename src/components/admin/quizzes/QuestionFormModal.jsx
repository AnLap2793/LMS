import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select, InputNumber, Button, Space, Divider, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;

/**
 * QuestionFormModal Component
 * Modal form để tạo/sửa câu hỏi
 */
function QuestionFormModal({ open, onCancel, onSubmit, initialValues }) {
    const [form] = Form.useForm();
    const [questionType, setQuestionType] = useState('single');
    const isEditing = !!initialValues;

    // Reset form when modal opens/closes
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
                setQuestionType(initialValues.type);

                // Transform options object to array for Form.List
                if (initialValues.options && ['single', 'multiple'].includes(initialValues.type)) {
                    const optionsArray = Object.entries(initialValues.options)
                        .filter(([key]) => key !== 'correct')
                        .map(([key, value]) => ({
                            key,
                            value,
                            isCorrect: initialValues.options.correct?.includes(key),
                        }));
                    form.setFieldValue('optionsList', optionsArray);
                }
            } else {
                form.resetFields();
                setQuestionType('single');
                form.setFieldValue('points', 1);
                form.setFieldValue('optionsList', [
                    { key: 'A', value: '', isCorrect: true },
                    { key: 'B', value: '', isCorrect: false },
                ]);
            }
        }
    }, [open, initialValues, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            // Transform optionsList back to options object
            if (['single', 'multiple'].includes(values.type)) {
                const options = {};
                const correct = [];

                values.optionsList.forEach((opt, index) => {
                    // Auto generate keys A, B, C... if not provided
                    const key = String.fromCharCode(65 + index); // 65 is 'A'
                    options[key] = opt.value;
                    if (opt.isCorrect) correct.push(key);
                });

                options.correct = correct;
                values.options = options;
                delete values.optionsList;
            }

            onSubmit(values);
        } catch {
            // Validation failed
        }
    };

    const handleTypeChange = value => {
        setQuestionType(value);
    };

    return (
        <Modal
            title={isEditing ? 'Chỉnh sửa Câu hỏi' : 'Thêm Câu hỏi mới'}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            okText={isEditing ? 'Cập nhật' : 'Tạo mới'}
            cancelText="Hủy"
            destroyOnClose
            width={700}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="question"
                    label="Nội dung câu hỏi"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
                >
                    <TextArea rows={3} placeholder="Nhập câu hỏi..." />
                </Form.Item>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item name="type" label="Loại câu hỏi" style={{ flex: 1 }} initialValue="single">
                        <Select
                            onChange={handleTypeChange}
                            options={[
                                { value: 'single', label: 'Một đáp án đúng' },
                                { value: 'multiple', label: 'Nhiều đáp án đúng' },
                                { value: 'text', label: 'Tự luận / Điền từ' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item name="points" label="Điểm số" style={{ width: 150 }} rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                {/* Options Editor for Single/Multiple Choice */}
                {['single', 'multiple'].includes(questionType) && (
                    <>
                        <Divider orientation="left">Các lựa chọn</Divider>
                        <Form.List name="optionsList">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }, index) => (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                            <div style={{ width: 30, fontWeight: 'bold' }}>
                                                {String.fromCharCode(65 + index)}.
                                            </div>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'value']}
                                                rules={[{ required: true, message: 'Nhập nội dung đáp án' }]}
                                                style={{ width: 450, marginBottom: 0 }}
                                            >
                                                <Input placeholder={`Đáp án ${String.fromCharCode(65 + index)}`} />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'isCorrect']}
                                                valuePropName="checked"
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Checkbox>Đúng</Checkbox>
                                            </Form.Item>

                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => remove(name)}
                                                disabled={fields.length <= 2}
                                            />
                                        </Space>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Thêm đáp án
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </>
                )}

                {/* Text Question Options */}
                {questionType === 'text' && (
                    <Form.Item
                        name="keywords"
                        label="Từ khóa gợi ý (cho chấm điểm tự động)"
                        extra="Nhập các từ khóa cách nhau bằng dấu phẩy"
                    >
                        <Input placeholder="VD: react, hooks, component" />
                    </Form.Item>
                )}

                <Form.Item name="explanation" label="Giải thích đáp án (hiển thị sau khi nộp bài)">
                    <TextArea rows={2} placeholder="Giải thích tại sao đáp án này đúng..." />
                </Form.Item>
            </Form>
        </Modal>
    );
}

QuestionFormModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
};

export default QuestionFormModal;
