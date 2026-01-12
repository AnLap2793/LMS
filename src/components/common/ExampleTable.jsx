/**
 * VÍ DỤ: Table Component với Pagination
 * 
 * Đây là ví dụ table component sử dụng Ant Design Table với pagination.
 * Tạo table components của bạn theo pattern này.
 */
import { Table, Card, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useUsers, useDeleteUser } from '../../hooks/useUsers';
import { PAGINATION } from '../../constants/api';

function ExampleTable() {
  const { data: users, isLoading, error } = useUsers();
  const deleteUser = useDeleteUser();

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      try {
        await deleteUser.mutateAsync(id);
      } catch (error) {
        // Error đã được xử lý bởi global error handler
        console.error('Delete error:', error);
      }
    }
  };

  const handleEdit = (record) => {
    console.log('Edit user:', record);
    // Implement edit logic ở đây
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Tên',
      dataIndex: 'first_name',
      key: 'first_name',
      render: (text, record) => `${record.first_name || ''} ${record.last_name || ''}`.trim() || '-',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            loading={deleteUser.isPending}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <p>Đã có lỗi xảy ra khi tải dữ liệu.</p>
      </Card>
    );
  }

  return (
    <Card title="VÍ DỤ: Danh sách Users">
      <Table
        columns={columns}
        dataSource={users || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
          pageSizeOptions: PAGINATION.PAGE_SIZE_OPTIONS,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bản ghi`,
        }}
      />
    </Card>
  );
}

export default ExampleTable;

