# Skill: Create Form Modal Component

## Description

Tao form modal component su dung Ant Design Form voi validation.

## Usage

```
/create-form <FormName> [--entity <entityName>] [--fields <field1,field2,...>]
```

## Parameters

- `FormName`: Ten form (PascalCase, ket thuc bang `FormModal`) - **bat buoc**
- `--entity`: Ten entity lien quan
- `--fields`: Danh sach fields (comma separated)

## Instructions

### 1. Tao form modal component

```jsx
// src/components/admin/<feature>/<Entity>FormModal.jsx
import { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Divider } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { emailRules, nameRules } from '../../../validation/formRules';

/**
 * Entity Form Modal
 * Form de tao moi hoac chinh sua entity
 */
function EntityFormModal({ open, onCancel, onSave, initialValues, loading }) {
    const [form] = Form.useForm();
    const isEdit = !!initialValues;

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    title: initialValues.title,
                    description: initialValues.description,
                    status: initialValues.status || 'draft',
                    // Map other fields
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    // Handle submit
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSave(values);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={isEdit ? 'Chinh sua Entity' : 'Them Entity moi'}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText={isEdit ? 'Cap nhat' : 'Them moi'}
            cancelText="Huy"
            confirmLoading={loading}
            width="90%"
            style={{ maxWidth: 600 }}
            centered
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    status: 'draft',
                }}
            >
                <Divider orientation="left" plain>
                    Thong tin co ban
                </Divider>

                <Form.Item
                    name="title"
                    label="Tieu de"
                    rules={[
                        { required: true, message: 'Vui long nhap tieu de' },
                        { min: 2, message: 'Tieu de phai co it nhat 2 ky tu' },
                    ]}
                >
                    <Input placeholder="Nhap tieu de" />
                </Form.Item>

                <Form.Item name="description" label="Mo ta" rules={[{ max: 500, message: 'Mo ta toi da 500 ky tu' }]}>
                    <Input.TextArea rows={4} placeholder="Nhap mo ta" showCount maxLength={500} />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="status" label="Trang thai">
                            <Select
                                options={[
                                    { value: 'draft', label: 'Nhap' },
                                    { value: 'published', label: 'Xuat ban' },
                                    { value: 'archived', label: 'Luu tru' },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="category"
                            label="Danh muc"
                            rules={[{ required: true, message: 'Vui long chon danh muc' }]}
                        >
                            <Select
                                placeholder="Chon danh muc"
                                options={[
                                    { value: 'cat1', label: 'Danh muc 1' },
                                    { value: 'cat2', label: 'Danh muc 2' },
                                ]}
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}

export default EntityFormModal;
```

### 2. Validation Rules Pattern

#### Su dung validation tu `formRules.js`

```jsx
import { emailRules, passwordRules, nameRules, phoneRules } from '../../../validation/formRules';

<Form.Item name="email" label="Email" rules={emailRules}>
    <Input />
</Form.Item>;
```

#### Custom inline rules

```jsx
<Form.Item
    name="field"
    label="Label"
    rules={[
        { required: true, message: 'Bat buoc' },
        { min: 2, message: 'Toi thieu 2 ky tu' },
        { max: 100, message: 'Toi da 100 ky tu' },
        { type: 'email', message: 'Email khong hop le' },
        { pattern: /^[0-9]+$/, message: 'Chi duoc nhap so' },
        {
            validator: async (_, value) => {
                if (value && value.includes('xxx')) {
                    throw new Error('Khong duoc chua xxx');
                }
            },
        },
    ]}
>
    <Input />
</Form.Item>
```

### 3. Form Field Components

#### Text Input

```jsx
<Form.Item name="title" label="Tieu de" rules={[{ required: true }]}>
    <Input placeholder="Nhap..." prefix={<UserOutlined />} />
</Form.Item>
```

#### TextArea

```jsx
<Form.Item name="description" label="Mo ta">
    <Input.TextArea rows={4} showCount maxLength={500} />
</Form.Item>
```

#### Select

```jsx
<Form.Item name="category" label="Danh muc">
    <Select
        placeholder="Chon..."
        options={options}
        showSearch
        optionFilterProp="label"
        mode="multiple" // Cho multi-select
    />
</Form.Item>
```

#### Number Input

```jsx
<Form.Item name="price" label="Gia">
    <InputNumber
        min={0}
        max={999999999}
        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        parser={value => value.replace(/\$\s?|(,*)/g, '')}
        style={{ width: '100%' }}
    />
</Form.Item>
```

#### Date Picker

```jsx
<Form.Item name="date" label="Ngay">
    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
</Form.Item>
```

#### Switch

```jsx
<Form.Item name="isActive" label="Kich hoat" valuePropName="checked">
    <Switch />
</Form.Item>
```

#### Upload

```jsx
<Form.Item name="avatar" label="Anh dai dien" valuePropName="fileList">
    <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
        <PlusOutlined />
    </Upload>
</Form.Item>
```

### 4. Form with Sections

```jsx
<Form form={form} layout="vertical">
    <Divider orientation="left" plain>
        Thong tin co ban
    </Divider>
    {/* Basic info fields */}

    <Divider orientation="left" plain>
        Thong tin lien he
    </Divider>
    {/* Contact fields */}

    <Divider orientation="left" plain>
        Cai dat
    </Divider>
    {/* Settings fields */}
</Form>
```

### 5. Checklist sau khi tao

- [ ] useEffect de reset/populate form khi modal open
- [ ] Validation rules day du
- [ ] Su dung formRules tu `validation/`
- [ ] Layout responsive voi Row/Col
- [ ] destroyOnClose trong Modal
- [ ] confirmLoading cho loading state
- [ ] centered Modal

## Props Interface

```typescript
interface FormModalProps {
    open: boolean; // Modal visibility
    onCancel: () => void; // Close handler
    onSave: (values: any) => void | Promise<void>; // Submit handler
    initialValues?: object; // For edit mode
    loading?: boolean; // Submit loading state
}
```

## Related Files

- `src/validation/formRules.js` - Validation rules
- `src/constants/app.js` - Validation constants
- `src/pages/` - Pages that use form modals
