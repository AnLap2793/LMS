import PropTypes from 'prop-types';
import { Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

/**
 * EmptyState Component
 * Hiển thị trạng thái trống với tùy chọn action
 */
function EmptyState({ title, description, actionText, onAction, image }) {
    return (
        <Empty
            image={image || Empty.PRESENTED_IMAGE_SIMPLE}
            description={
                <div>
                    <p style={{ marginBottom: 8, fontWeight: 500 }}>{title}</p>
                    {description && <p style={{ color: '#999', marginBottom: 0 }}>{description}</p>}
                </div>
            }
        >
            {actionText && onAction && (
                <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>
                    {actionText}
                </Button>
            )}
        </Empty>
    );
}

EmptyState.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    actionText: PropTypes.string,
    onAction: PropTypes.func,
    image: PropTypes.node,
};

EmptyState.defaultProps = {
    title: 'Không có dữ liệu',
    description: null,
    actionText: null,
    onAction: null,
    image: null,
};

export default EmptyState;
