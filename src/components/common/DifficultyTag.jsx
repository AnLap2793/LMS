import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { COURSE_DIFFICULTY_MAP } from '../../constants/lms';

/**
 * DifficultyTag Component
 * Hiển thị độ khó của khóa học với màu sắc tương ứng
 */
function DifficultyTag({ difficulty }) {
    const config = COURSE_DIFFICULTY_MAP[difficulty] || { label: difficulty, color: 'default' };

    return <Tag color={config.color}>{config.label}</Tag>;
}

DifficultyTag.propTypes = {
    difficulty: PropTypes.oneOf(['beginner', 'intermediate', 'advanced']),
};

DifficultyTag.defaultProps = {
    difficulty: null,
};

export default DifficultyTag;
