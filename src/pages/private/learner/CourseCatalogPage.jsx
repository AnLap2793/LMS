import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Button,
    Input,
    Select,
    Empty,
    Pagination,
    Statistic,
    Skeleton,
} from 'antd';
import {
    BookOutlined,
    SearchOutlined,
    ClockCircleOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import { usePublishedCourses, useCoursesCount, useTags } from '../../../hooks/useCourses';
import { COURSE_DIFFICULTY_MAP, COURSE_DIFFICULTY_OPTIONS } from '../../../constants/lms';
import { getAssetUrl } from '../../../utils/directusHelpers';

const { Title, Text, Paragraph } = Typography;

/**
 * Course Catalog Page
 * Duyệt tất cả khóa học có sẵn
 */
function CourseCatalogPage() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    // Fetch courses từ API
    const {
        data: courses = [],
        isLoading: coursesLoading,
        error: coursesError,
    } = usePublishedCourses({
        search: searchText || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        difficulty: selectedDifficulty || undefined,
        page: currentPage,
        limit: pageSize,
    });

    // Fetch total count cho pagination
    const { data: totalCount = 0 } = useCoursesCount({
        search: searchText || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        difficulty: selectedDifficulty || undefined,
    });

    // Fetch tags cho filter
    const { data: tags = [] } = useTags();

    // Format duration
    const formatDuration = hours => {
        if (!hours) return '';
        if (hours < 1) {
            return `${Math.round(hours * 60)} phút`;
        }
        return `${hours} giờ`;
    };

    // Handle course click
    const handleCourseClick = courseId => {
        navigate(`/courses/${courseId}`);
    };

    // Clear filters
    const handleClearFilters = () => {
        setSearchText('');
        setSelectedTags([]);
        setSelectedDifficulty(null);
        setCurrentPage(1);
    };

    // Handle search with debounce effect (reset page on search)
    const handleSearch = value => {
        setSearchText(value);
        setCurrentPage(1);
    };

    // Handle filter changes
    const handleTagChange = value => {
        setSelectedTags(value || []);
        setCurrentPage(1);
    };

    const handleDifficultyChange = value => {
        setSelectedDifficulty(value);
        setCurrentPage(1);
    };

    // Render course card
    const renderCourseCard = course => {
        const difficultyConfig = COURSE_DIFFICULTY_MAP[course.difficulty] || {};
        const thumbnailUrl = getAssetUrl(course.thumbnail);

        // Flatten tags từ M2M relation
        const courseTags = course.tags?.map(t => t.tags_id).filter(Boolean) || [];

        return (
            <Col xs={24} sm={12} lg={viewMode === 'grid' ? 8 : 24} key={course.id}>
                <Card
                    hoverable
                    onClick={() => handleCourseClick(course.id)}
                    style={{ height: '100%' }}
                    cover={
                        viewMode === 'grid' && (
                            <div
                                style={{
                                    height: 160,
                                    background: thumbnailUrl
                                        ? `url(${thumbnailUrl}) center/cover`
                                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                }}
                            >
                                {!thumbnailUrl && (
                                    <BookOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
                                )}

                                {course.difficulty && (
                                    <Tag
                                        color={difficultyConfig.color}
                                        style={{ position: 'absolute', top: 12, right: 12 }}
                                    >
                                        {difficultyConfig.label}
                                    </Tag>
                                )}
                            </div>
                        )
                    }
                >
                    <Card.Meta
                        avatar={
                            viewMode === 'list' && (
                                <div
                                    style={{
                                        width: 80,
                                        height: 80,
                                        background: thumbnailUrl
                                            ? `url(${thumbnailUrl}) center/cover`
                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: 8,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {!thumbnailUrl && <BookOutlined style={{ fontSize: 32, color: '#fff' }} />}
                                </div>
                            )
                        }
                        title={
                            <Text
                                strong
                                style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {course.title}
                            </Text>
                        }
                        description={
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                {viewMode === 'list' && (
                                    <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                                        {course.description}
                                    </Paragraph>
                                )}

                                <Space wrap size={[4, 4]}>
                                    {courseTags.slice(0, 3).map(tag => (
                                        <Tag key={tag.id} color={tag.color} style={{ fontSize: 11 }}>
                                            {tag.name}
                                        </Tag>
                                    ))}
                                </Space>

                                <Space split={<span style={{ color: '#d9d9d9' }}>•</span>}>
                                    {course.duration_hours && (
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            <ClockCircleOutlined /> {formatDuration(course.duration_hours)}
                                        </Text>
                                    )}
                                    {viewMode === 'list' && course.difficulty && (
                                        <Tag color={difficultyConfig.color} style={{ fontSize: 11 }}>
                                            {difficultyConfig.label}
                                        </Tag>
                                    )}
                                </Space>
                            </Space>
                        }
                    />
                </Card>
            </Col>
        );
    };

    // Loading skeleton
    const renderSkeleton = () => (
        <Row gutter={[16, 16]}>
            {[1, 2, 3, 4, 5, 6].map(i => (
                <Col xs={24} sm={12} lg={8} key={i}>
                    <Card>
                        <Skeleton active />
                    </Card>
                </Col>
            ))}
        </Row>
    );

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 8 }}>
                    <AppstoreOutlined style={{ color: '#ea4544', marginRight: 8 }} />
                    Danh mục khóa học
                </Title>
                <Text type="secondary">Tìm kiếm và đăng ký các khóa học phù hợp với bạn</Text>
            </div>

            {/* Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={8}>
                    <Card size="small">
                        <Statistic
                            title="Khóa học"
                            value={totalCount}
                            prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8}>
                    <Card size="small">
                        <Statistic
                            title="Chủ đề"
                            value={tags.length}
                            prefix={<AppstoreOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8}>
                    <Card size="small">
                        <Statistic title="Kết quả tìm kiếm" value={courses.length} valueStyle={{ color: '#faad14' }} />
                    </Card>
                </Col>
            </Row>

            {/* Filters for Courses */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <Input
                            placeholder="Tìm kiếm khóa học..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={e => handleSearch(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <Select
                            placeholder="Chủ đề"
                            mode="multiple"
                            value={selectedTags}
                            onChange={handleTagChange}
                            options={tags.map(t => ({ value: t.id, label: t.name }))}
                            style={{ width: '100%' }}
                            allowClear
                            maxTagCount={1}
                        />
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <Select
                            placeholder="Độ khó"
                            value={selectedDifficulty}
                            onChange={handleDifficultyChange}
                            options={[
                                { value: null, label: 'Tất cả độ khó' },
                                ...COURSE_DIFFICULTY_OPTIONS.map(d => ({
                                    value: d.value,
                                    label: d.label,
                                })),
                            ]}
                            style={{ width: '100%' }}
                            allowClear
                        />
                    </Col>
                    <Col flex="auto">
                        <Space style={{ float: 'right' }}>
                            {(searchText || selectedTags.length > 0 || selectedDifficulty) && (
                                <Button onClick={handleClearFilters}>Xóa bộ lọc</Button>
                            )}
                            <Button.Group>
                                <Button
                                    type={viewMode === 'grid' ? 'primary' : 'default'}
                                    icon={<AppstoreOutlined />}
                                    onClick={() => setViewMode('grid')}
                                />
                                <Button
                                    type={viewMode === 'list' ? 'primary' : 'default'}
                                    icon={<UnorderedListOutlined />}
                                    onClick={() => setViewMode('list')}
                                />
                            </Button.Group>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Course Grid */}
            {coursesLoading ? (
                renderSkeleton()
            ) : coursesError ? (
                <Card>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không thể tải danh sách khóa học">
                        <Button type="primary" onClick={() => window.location.reload()}>
                            Tải lại
                        </Button>
                    </Empty>
                </Card>
            ) : courses.length > 0 ? (
                <>
                    <Row gutter={[16, 16]}>{courses.map(course => renderCourseCard(course))}</Row>

                    {totalCount > pageSize && (
                        <div style={{ textAlign: 'center', marginTop: 24 }}>
                            <Pagination
                                current={currentPage}
                                total={totalCount}
                                pageSize={pageSize}
                                onChange={setCurrentPage}
                                showTotal={total => `Tổng ${total} khóa học`}
                            />
                        </div>
                    )}
                </>
            ) : (
                <Card>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy khóa học phù hợp">
                        <Button type="primary" onClick={handleClearFilters}>
                            Xóa bộ lọc
                        </Button>
                    </Empty>
                </Card>
            )}
        </div>
    );
}

export default CourseCatalogPage;
