import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { COURSE_STATUS_MAP } from '../../constants/lms';

/**
 * StatusTag Component
 * Hiển thị trạng thái khóa học với màu sắc tương ứng
 */
function StatusTag({ status }) {
    const config = COURSE_STATUS_MAP[status] || { label: status, color: 'default' };

    return <Tag color={config.color}>{config.label}</Tag>;
}

StatusTag.propTypes = {
    status: PropTypes.oneOf(['draft', 'published', 'archived']).isRequired,
};

export default StatusTag;
