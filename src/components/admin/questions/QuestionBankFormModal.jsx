import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select, InputNumber, Button, Space, Divider, Checkbox, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { QUESTION_TYPE_OPTIONS, QUESTION_DIFFICULTY_OPTIONS, QUESTION_CATEGORY_OPTIONS } from '../../../constants/lms';

const { TextArea } = Input;

/**
 * QuestionBankFormModal Component
 * Modal form để tạo/sửa câu hỏi trong Ngân hàng câu hỏi
 */
function QuestionBankFormModal({ open, onCancel, onSubmit, initialValues, loading }) {
    const [form] = Form.useForm();
    const isEditing = !!initialValues;

    // Derive questionType from form value instead of separate state
    const questionType = Form.useWatch('type', form) || 'single';

    // Reset form when modal opens/closes
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    tags: initialValues.tags?.join(', ') || '',
                });

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
                form.setFieldsValue({
                    type: 'single',
                    points: 1,
                    difficulty: 'medium',
                    category: 'programming',
                    status: 'active',
                    optionsList: [
                        { key: 'A', value: '', isCorrect: true },
                        { key: 'B', value: '', isCorrect: false },
                    ],
                });
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
                    const key = String.fromCharCode(65 + index); // A, B, C...
                    options[key] = opt.value;
                    if (opt.isCorrect) correct.push(key);
                });

                options.correct = correct;
                values.options = options;
                delete values.optionsList;
            } else {
                values.options = null;
                delete values.optionsList;
            }

            // Transform tags string to array
            if (values.tags) {
                values.tags = values.tags
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(Boolean);
            } else {
                values.tags = [];
            }

            onSubmit(values);
        } catch {
            // Validation failed
        }
    };

    const handleTypeChange = value => {
        // Reset options when changing to text type
        if (value === 'text') {
            form.setFieldValue('optionsList', []);
        } else if (!form.getFieldValue('optionsList')?.length) {
            form.setFieldValue('optionsList', [
                { key: 'A', value: '', isCorrect: true },
                { key: 'B', value: '', isCorrect: false },
            ]);
        }
    };

    return (
        <Modal
            title={isEditing ? 'Chỉnh sửa Câu hỏi' : 'Thêm Câu hỏi mới vào Ngân hàng'}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            okText={isEditing ? 'Cập nhật' : 'Tạo mới'}
            cancelText="Hủy"
            confirmLoading={loading}
            destroyOnClose
            width="90%"
            style={{ maxWidth: 800 }}
            centered
        >
            <Form form={form} layout="vertical">
                {/* Question Content */}
                <Form.Item
                    name="question"
                    label="Nội dung câu hỏi"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
                >
                    <TextArea rows={3} placeholder="Nhập câu hỏi..." />
                </Form.Item>

                {/* Type, Points, Difficulty, Category */}
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={6}>
                        <Form.Item name="type" label="Loại câu hỏi" initialValue="single">
                            <Select onChange={handleTypeChange} options={QUESTION_TYPE_OPTIONS} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Form.Item name="points" label="Điểm số" rules={[{ required: true }]}>
                            <InputNumber min={1} max={10} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Form.Item name="difficulty" label="Độ khó">
                            <Select options={QUESTION_DIFFICULTY_OPTIONS} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Form.Item name="category" label="Danh mục">
                            <Select options={QUESTION_CATEGORY_OPTIONS} />
                        </Form.Item>
                    </Col>
                </Row>

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
                                                style={{ width: 400, marginBottom: 0 }}
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
                                        <Button
                                            type="dashed"
                                            onClick={() => add({ value: '', isCorrect: false })}
                                            block
                                            icon={<PlusOutlined />}
                                            disabled={fields.length >= 6}
                                        >
                                            Thêm đáp án
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </>
                )}

                {/* Text Question - Keywords */}
                {questionType === 'text' && (
                    <Form.Item
                        name="keywords"
                        label="Từ khóa gợi ý (cho chấm điểm tự động)"
                        extra="Nhập các từ khóa cách nhau bằng dấu phẩy"
                    >
                        <Input placeholder="VD: react, hooks, component" />
                    </Form.Item>
                )}

                {/* Explanation */}
                <Form.Item name="explanation" label="Giải thích đáp án">
                    <TextArea rows={2} placeholder="Giải thích tại sao đáp án này đúng..." />
                </Form.Item>

                {/* Tags */}
                <Form.Item name="tags" label="Tags" extra="Nhập các tags cách nhau bằng dấu phẩy">
                    <Input placeholder="VD: react, javascript, frontend" />
                </Form.Item>

                {/* Status (hidden for create, visible for edit) */}
                {isEditing && (
                    <Form.Item name="status" label="Trạng thái">
                        <Select
                            options={[
                                { value: 'active', label: 'Hoạt động' },
                                { value: 'inactive', label: 'Không hoạt động' },
                            ]}
                        />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
}

QuestionBankFormModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    loading: PropTypes.bool,
};

QuestionBankFormModal.defaultProps = {
    initialValues: null,
    loading: false,
};

export default QuestionBankFormModal;
