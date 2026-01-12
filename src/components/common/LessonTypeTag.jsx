import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { PlayCircleOutlined, FileTextOutlined, FileOutlined, LinkOutlined, FormOutlined } from '@ant-design/icons';
import { LESSON_TYPE_MAP } from '../../constants/lms';

// Icon mapping
const iconMap = {
    PlayCircleOutlined: <PlayCircleOutlined />,
    FileTextOutlined: <FileTextOutlined />,
    FileOutlined: <FileOutlined />,
    LinkOutlined: <LinkOutlined />,
    FormOutlined: <FormOutlined />,
};

/**
 * LessonTypeTag Component
 * Hiển thị loại bài học với icon tương ứng
 */
function LessonTypeTag({ type, showLabel }) {
    const config = LESSON_TYPE_MAP[type] || { label: type, icon: 'FileOutlined', color: '#999' };
    const icon = iconMap[config.icon] || <FileOutlined />;

    if (!showLabel) {
        return <span style={{ color: config.color }}>{icon}</span>;
    }

    return (
        <Tag
            icon={icon}
            style={{
                borderColor: config.color,
                color: config.color,
                background: `${config.color}10`,
            }}
        >
            {config.label}
        </Tag>
    );
}

LessonTypeTag.propTypes = {
    type: PropTypes.oneOf(['video', 'article', 'file', 'link', 'quiz']).isRequired,
    showLabel: PropTypes.bool,
};

LessonTypeTag.defaultProps = {
    showLabel: true,
};

export default LessonTypeTag;
