import PropTypes from 'prop-types';
import { Typography, Space, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const { Title } = Typography;

/**
 * PageHeader Component
 * Header cho các trang admin với breadcrumb và actions
 */
function PageHeader({ title, subtitle, breadcrumbs, actions, style }) {
    return (
        <div style={{ marginBottom: 24, ...style }}>
            {/* Breadcrumb */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumb
                    style={{ marginBottom: 8 }}
                    items={[
                        {
                            title: (
                                <Link to="/admin">
                                    <HomeOutlined />
                                </Link>
                            ),
                        },
                        ...breadcrumbs.map((item, index) => ({
                            title: item.path ? <Link to={item.path}>{item.title}</Link> : item.title,
                            key: index,
                        })),
                    ]}
                />
            )}

            {/* Title and Actions */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 16,
                }}
            >
                <div>
                    <Title level={4} style={{ margin: 0 }}>
                        {title}
                    </Title>
                    {subtitle && (
                        <Typography.Text type="secondary" style={{ marginTop: 4 }}>
                            {subtitle}
                        </Typography.Text>
                    )}
                </div>

                {actions && <Space wrap>{actions}</Space>}
            </div>
        </div>
    );
}

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    breadcrumbs: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            path: PropTypes.string,
        })
    ),
    actions: PropTypes.node,
    style: PropTypes.object,
};

PageHeader.defaultProps = {
    subtitle: null,
    breadcrumbs: [],
    actions: null,
    style: {},
};

export default PageHeader;
