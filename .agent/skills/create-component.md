# Skill: Create React Component

## Description

Tao React component moi theo chuan cua du an LMS (Ant Design, PropTypes, functional components).

## Usage

```
/create-component <ComponentName> [--path <path>] [--type common|admin|layout]
```

## Parameters

- `ComponentName`: Ten component (PascalCase) - **bat buoc**
- `--path`: Duong dan tuong doi tu `src/components/` (mac dinh: `common/`)
- `--type`: Loai component (`common`, `admin`, `layout`)

## Instructions

### 1. Kiem tra truoc khi tao

- [ ] Verify component chua ton tai
- [ ] Xac dinh dung thu muc dich theo type:
    - `common`: `src/components/common/`
    - `admin`: `src/components/admin/<feature>/`
    - `layout`: `src/components/layout/`

### 2. Tao component theo template

```jsx
import PropTypes from 'prop-types';
import {} from /* Ant Design components */ 'antd';

/**
 * ComponentName
 * Mo ta chuc nang cua component
 */
function ComponentName({ prop1, prop2, ...props }) {
    // Component logic here

    return <div>{/* JSX here */}</div>;
}

ComponentName.propTypes = {
    prop1: PropTypes.string.isRequired,
    prop2: PropTypes.func,
};

ComponentName.defaultProps = {
    prop2: () => {},
};

export default ComponentName;
```

### 3. Naming conventions

- **File name**: PascalCase - `StatusTag.jsx`, `UserCard.jsx`
- **Component name**: PascalCase - giong ten file
- **Props**: camelCase

### 4. Import order

1. React/external libraries
2. Internal services/hooks
3. Constants
4. Components
5. Styles

### 5. Checklist sau khi tao

- [ ] PropTypes day du
- [ ] JSDoc comment mo ta component
- [ ] Export default
- [ ] Khong hardcode values (su dung constants)
- [ ] Su dung Ant Design components voi theme do (#ea4544)

## Examples

### Basic Component

```jsx
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { COURSE_STATUS_MAP } from '../../constants/lms';

/**
 * StatusTag Component
 * Hien thi trang thai khoa hoc voi mau sac tuong ung
 */
function StatusTag({ status }) {
    const config = COURSE_STATUS_MAP[status] || { label: status, color: 'default' };

    return <Tag color={config.color}>{config.label}</Tag>;
}

StatusTag.propTypes = {
    status: PropTypes.oneOf(['draft', 'published', 'archived']).isRequired,
};

export default StatusTag;
```

### Component with callbacks

```jsx
import PropTypes from 'prop-types';
import { Card, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

/**
 * ActionCard Component
 * Card voi cac action buttons
 */
function ActionCard({ title, onEdit, onDelete, children }) {
    return (
        <Card
            title={title}
            extra={
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={onEdit} />
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={onDelete} />
                </Space>
            }
        >
            {children}
        </Card>
    );
}

ActionCard.propTypes = {
    title: PropTypes.string.isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    children: PropTypes.node,
};

ActionCard.defaultProps = {
    onEdit: () => {},
    onDelete: () => {},
    children: null,
};

export default ActionCard;
```

## Related Files

- `src/components/common/` - Common components
- `src/constants/` - Constants to use
- `src/components/admin/` - Admin-specific components
