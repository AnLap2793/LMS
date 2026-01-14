import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Modal, Table, Tag, Space, Button, Typography, Empty, Tooltip, message } from 'antd';
import { CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useQuestionBank } from '../../../hooks/useQuestionBank';
import { QUESTION_TYPE_MAP, QUESTION_DIFFICULTY_MAP, QUESTION_CATEGORY_MAP } from '../../../constants/lms';
import QuestionFilters from './QuestionFilters';

const { Text, Paragraph } = Typography;

const DEFAULT_FILTERS = {
    search: '',
    category: undefined,
    difficulty: undefined,
    type: undefined,
    status: 'active',
    page: 1,
    limit: 10,
};

/**
 * QuestionSelectionModal Component
 * Modal để chọn câu hỏi từ Ngân hàng câu hỏi thêm vào Quiz
 */
function QuestionSelectionModal({ open, onCancel, onSelect, excludeIds }) {
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Query data
    const { data: questionsData, isLoading } = useQuestionBank(filters);

    // Filter out already added questions
    const questionsDataList = questionsData?.data;
    const filteredQuestions = useMemo(() => {
        if (!questionsDataList) return [];
        return questionsDataList.filter(q => !excludeIds.includes(q.id));
    }, [questionsDataList, excludeIds]);

    // Reset selection when modal opens
    const handleAfterOpenChange = visible => {
        if (visible) {
            setSelectedRowKeys([]);
            setFilters(DEFAULT_FILTERS);
        }
    };

    const handleFilterChange = newFilters => {
        setFilters(newFilters);
    };

    const handleResetFilters = () => {
        setFilters(DEFAULT_FILTERS);
    };

    const handleTableChange = pagination => {
        setFilters(prev => ({
            ...prev,
            page: pagination.current,
            limit: pagination.pageSize,
        }));
    };

    const handleSelect = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một câu hỏi');
            return;
        }

        const selectedQuestions = filteredQuestions.filter(q => selectedRowKeys.includes(q.id));
        onSelect(selectedQuestions);
        setSelectedRowKeys([]);
    };

    const columns = [
        {
            title: 'Câu hỏi',
            dataIndex: 'question',
            key: 'question',
            width: '40%',
            render: (text, record) => (
                <div>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 4 }}>
                        {text}
                    </Paragraph>
                    <Space size={4}>
                        {record.tags?.slice(0, 3).map(tag => (
                            <Tag key={tag} style={{ fontSize: 10 }}>
                                {tag}
                            </Tag>
                        ))}
                        {record.tags?.length > 3 && (
                            <Tooltip title={record.tags.slice(3).join(', ')}>
                                <Tag style={{ fontSize: 10 }}>+{record.tags.length - 3}</Tag>
                            </Tooltip>
                        )}
                    </Space>
                </div>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: type => {
                const config = QUESTION_TYPE_MAP[type];
                return <Tag color={config?.color}>{config?.label || type}</Tag>;
            },
        },
        {
            title: 'Độ khó',
            dataIndex: 'difficulty',
            key: 'difficulty',
            width: 100,
            render: difficulty => {
                const config = QUESTION_DIFFICULTY_MAP[difficulty];
                return <Tag color={config?.color}>{config?.label || difficulty}</Tag>;
            },
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            width: 130,
            render: category => {
                const config = QUESTION_CATEGORY_MAP[category];
                return <Tag color={config?.color}>{config?.label || category}</Tag>;
            },
        },
        {
            title: 'Điểm',
            dataIndex: 'points',
            key: 'points',
            width: 70,
            align: 'center',
            render: points => <Text strong>{points}</Text>,
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: keys => setSelectedRowKeys(keys),
        getCheckboxProps: record => ({
            disabled: excludeIds.includes(record.id),
        }),
    };

    return (
        <Modal
            title={
                <Space>
                    <span>Chọn câu hỏi từ Ngân hàng</span>
                    <Tooltip title="Câu hỏi được chọn sẽ được copy vào bài kiểm tra (không liên kết với câu gốc)">
                        <InfoCircleOutlined style={{ color: '#999' }} />
                    </Tooltip>
                </Space>
            }
            open={open}
            onCancel={onCancel}
            afterOpenChange={handleAfterOpenChange}
            width="90%"
            style={{ maxWidth: 1100, top: 20 }}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="select"
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={handleSelect}
                    disabled={selectedRowKeys.length === 0}
                >
                    Thêm {selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ''} câu hỏi
                </Button>,
            ]}
        >
            {/* Filters */}
            <QuestionFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                showStatusFilter={false}
            />

            {/* Selected count */}
            {selectedRowKeys.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Text type="success">
                        <CheckCircleOutlined /> Đã chọn {selectedRowKeys.length} câu hỏi
                    </Text>
                    <Button type="link" size="small" onClick={() => setSelectedRowKeys([])}>
                        Bỏ chọn tất cả
                    </Button>
                </div>
            )}

            {/* Questions Table */}
            <Table
                rowKey="id"
                columns={columns}
                dataSource={filteredQuestions}
                loading={isLoading}
                rowSelection={rowSelection}
                pagination={{
                    current: filters.page,
                    pageSize: filters.limit,
                    total: questionsData?.total || 0,
                    showSizeChanger: true,
                    showTotal: total => `Tổng ${total} câu hỏi`,
                    pageSizeOptions: ['5', '10', '20'],
                }}
                onChange={handleTableChange}
                scroll={{ y: 400 }}
                size="small"
                locale={{
                    emptyText: <Empty description="Không tìm thấy câu hỏi phù hợp" />,
                }}
            />
        </Modal>
    );
}

QuestionSelectionModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    excludeIds: PropTypes.arrayOf(PropTypes.string),
};

QuestionSelectionModal.defaultProps = {
    excludeIds: [],
};

export default QuestionSelectionModal;
