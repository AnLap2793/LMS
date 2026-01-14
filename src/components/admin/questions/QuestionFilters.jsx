import PropTypes from 'prop-types';
import { Input, Select, Space, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { QUESTION_TYPE_OPTIONS, QUESTION_DIFFICULTY_OPTIONS, QUESTION_CATEGORY_OPTIONS } from '../../../constants/lms';

const { Search } = Input;

/**
 * QuestionFilters Component
 * Bộ lọc cho danh sách câu hỏi
 */
function QuestionFilters({ filters, onFilterChange, onReset, showStatusFilter }) {
    const handleSearchChange = value => {
        onFilterChange({ ...filters, search: value, page: 1 });
    };

    const handleSelectChange = (field, value) => {
        onFilterChange({ ...filters, [field]: value, page: 1 });
    };

    const handleReset = () => {
        onReset();
    };

    const hasFilters = filters.search || filters.category || filters.difficulty || filters.type || filters.status;

    return (
        <Space wrap style={{ marginBottom: 16, width: '100%' }}>
            {/* Search */}
            <Search
                placeholder="Tìm kiếm câu hỏi, tags..."
                allowClear
                value={filters.search}
                onChange={e => handleSearchChange(e.target.value)}
                onSearch={handleSearchChange}
                style={{ width: 250 }}
                prefix={<SearchOutlined />}
            />

            {/* Category Filter */}
            <Select
                placeholder="Danh mục"
                allowClear
                value={filters.category}
                onChange={value => handleSelectChange('category', value)}
                options={QUESTION_CATEGORY_OPTIONS}
                style={{ width: 150 }}
            />

            {/* Difficulty Filter */}
            <Select
                placeholder="Độ khó"
                allowClear
                value={filters.difficulty}
                onChange={value => handleSelectChange('difficulty', value)}
                options={QUESTION_DIFFICULTY_OPTIONS}
                style={{ width: 130 }}
            />

            {/* Type Filter */}
            <Select
                placeholder="Loại câu hỏi"
                allowClear
                value={filters.type}
                onChange={value => handleSelectChange('type', value)}
                options={QUESTION_TYPE_OPTIONS}
                style={{ width: 160 }}
            />

            {/* Status Filter (optional) */}
            {showStatusFilter && (
                <Select
                    placeholder="Trạng thái"
                    allowClear
                    value={filters.status}
                    onChange={value => handleSelectChange('status', value)}
                    options={[
                        { value: 'active', label: 'Hoạt động' },
                        { value: 'inactive', label: 'Không hoạt động' },
                    ]}
                    style={{ width: 150 }}
                />
            )}

            {/* Reset Button */}
            {hasFilters && (
                <Button icon={<ClearOutlined />} onClick={handleReset}>
                    Xóa bộ lọc
                </Button>
            )}
        </Space>
    );
}

QuestionFilters.propTypes = {
    filters: PropTypes.shape({
        search: PropTypes.string,
        category: PropTypes.string,
        difficulty: PropTypes.string,
        type: PropTypes.string,
        status: PropTypes.string,
        page: PropTypes.number,
        limit: PropTypes.number,
    }).isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    showStatusFilter: PropTypes.bool,
};

QuestionFilters.defaultProps = {
    showStatusFilter: true,
};

export default QuestionFilters;
