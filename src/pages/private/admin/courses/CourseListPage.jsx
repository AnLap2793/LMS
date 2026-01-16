import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Space, Tag, Popconfirm, Input, Select, Row, Col, Avatar, message, Tooltip } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    EyeOutlined,
    BookOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import { PageHeader, StatusTag, DifficultyTag, EmptyState } from '../../../../components/common';
import { COURSE_STATUS_OPTIONS, COURSE_DIFFICULTY_OPTIONS } from '../../../../constants/lms';
import { useAllCourses, useDeleteCourse, useTags } from '../../../../hooks/useCourses';

/**
 * Course List Page
 * Danh sách và quản lý khóa học
 */
function CourseListPage() {
    const navigate = useNavigate();

    // Filter states
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [difficultyFilter, setDifficultyFilter] = useState(null);
    const [tagFilter, setTagFilter] = useState(null);

    // Debounce search text
    // If we don't have useDebounce, we can just pass searchText directly but it might cause many requests
    // For now passing directly.

    // Data Hooks
    const { data: courses = [], isLoading: coursesLoading } = useAllCourses({
        search: searchText,
        status: statusFilter,
        difficulty: difficultyFilter,
        tags: tagFilter ? [tagFilter] : undefined,
        limit: -1, // Fetch all matching
    });

    const { data: tags = [] } = useTags();
    const deleteCourse = useDeleteCourse();

    const loading = coursesLoading || deleteCourse.isPending;

    // Clear all filters
    const clearFilters = () => {
        setSearchText('');
        setStatusFilter(null);
        setDifficultyFilter(null);
        setTagFilter(null);
    };

    // Handle delete course
    const handleDelete = async id => {
        await deleteCourse.mutateAsync(id);
    };

    // Format duration
    const formatDuration = minutes => {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}p` : `${hours}h`;
        }
        return `${mins}p`;
    };

    // Table columns
    const columns = [
        {
            title: 'Khóa học',
            key: 'course',
            width: 350,
            render: (_, record) => (
                <Space>
                    <Avatar
                        shape="square"
                        size={48}
                        icon={<BookOutlined />}
                        src={record.thumbnail}
                        style={{ backgroundColor: '#ea4544' }}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.title}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>{record.modules_count || 0} modules</div>
                    </div>
                </Space>
            ),
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            width: 200,
            render: tags => {
                // tags here is from courseService, which might be array of junction or tag objects
                // In getAllCourses: tags: c.tags || []
                // If deep fetched: tags is array of junctions { tags_id: { id, name, color } }
                // Need to handle this structure
                return (
                    <Space size={[0, 4]} wrap>
                        {tags?.map(tagItem => {
                            const tag = tagItem.tags_id || tagItem; // Handle junction or direct tag
                            return (
                                <Tag key={tag.id} color={tag.color}>
                                    {tag.name}
                                </Tag>
                            );
                        })}
                    </Space>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: status => <StatusTag status={status} />,
        },
        {
            title: 'Độ khó',
            dataIndex: 'difficulty',
            key: 'difficulty',
            width: 120,
            render: difficulty => (difficulty ? <DifficultyTag difficulty={difficulty} /> : '-'),
        },
        {
            title: 'Thời lượng',
            dataIndex: 'duration_minutes', // Use minutes
            key: 'duration',
            width: 100,
            render: formatDuration,
            sorter: (a, b) => (a.duration_minutes || 0) - (b.duration_minutes || 0),
        },
        {
            title: 'Học viên',
            dataIndex: 'enrollments_count',
            key: 'enrollments_count',
            width: 100,
            render: count => count || 0,
            sorter: (a, b) => (a.enrollments_count || 0) - (b.enrollments_count || 0),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/admin/courses/${record.id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Quản lý nội dung">
                        <Button
                            type="text"
                            icon={<UnorderedListOutlined />}
                            onClick={() => navigate(`/admin/courses/${record.id}/content`)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/admin/courses/${record.id}/edit`)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa khóa học này?"
                        description="Tất cả nội dung và dữ liệu liên quan sẽ bị xóa."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Check if any filter is active
    const hasActiveFilters = searchText || statusFilter || difficultyFilter || tagFilter;

    return (
        <div>
            <PageHeader
                title="Quản lý Khóa học"
                subtitle={`${courses.length} khóa học`}
                breadcrumbs={[{ title: 'Khóa học' }]}
                actions={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/courses/create')}>
                        Thêm khóa học
                    </Button>
                }
            />

            {/* Filters */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={6}>
                    <Input
                        placeholder="Tìm kiếm khóa học..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        allowClear
                    />
                </Col>
                <Col xs={24} sm={12} md={5}>
                    <Select
                        placeholder="Trạng thái"
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={COURSE_STATUS_OPTIONS}
                        allowClear
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col xs={24} sm={12} md={5}>
                    <Select
                        placeholder="Độ khó"
                        value={difficultyFilter}
                        onChange={setDifficultyFilter}
                        options={COURSE_DIFFICULTY_OPTIONS}
                        allowClear
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col xs={24} sm={12} md={5}>
                    <Select
                        placeholder="Tag"
                        value={tagFilter}
                        onChange={setTagFilter}
                        options={tags.map(tag => ({ value: tag.id, label: tag.name }))}
                        allowClear
                        style={{ width: '100%' }}
                    />
                </Col>
                {hasActiveFilters && (
                    <Col xs={24} sm={12} md={3}>
                        <Button onClick={clearFilters} style={{ width: '100%' }}>
                            Xóa bộ lọc
                        </Button>
                    </Col>
                )}
            </Row>

            {/* Table */}
            {courses.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={courses}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: total => `Tổng ${total} khóa học`,
                    }}
                    scroll={{ x: 1200 }}
                />
            ) : (
                <EmptyState
                    title={hasActiveFilters ? 'Không tìm thấy khóa học' : 'Chưa có khóa học nào'}
                    description={
                        hasActiveFilters ? 'Thử thay đổi bộ lọc để tìm kiếm' : 'Tạo khóa học đầu tiên để bắt đầu'
                    }
                    actionText={hasActiveFilters ? undefined : 'Thêm khóa học'}
                    onAction={hasActiveFilters ? undefined : () => navigate('/admin/courses/create')}
                />
            )}
        </div>
    );
}

export default CourseListPage;
