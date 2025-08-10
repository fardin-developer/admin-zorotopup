import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Table,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Avatar,
  Statistic,
  DatePicker,
  message,
  Badge,
  Tooltip,
  Modal,
  Drawer,
  Divider
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  UserOutlined,
  PhoneOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { PageHeader } from '../components';
import { authenticatedFetch, API_ENDPOINTS } from '../utils/auth';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Type definitions
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  walletBalance: number;
  role: 'user' | 'admin';
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface Filters {
  search: string;
  email: string;
  name: string;
  date: string;
  verified: string;
  role: string;
}

interface Stats {
  totalWalletBalance: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  adminUsers: number;
  regularUsers: number;
}

interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: Pagination;
    filters: Filters;
    stats: Stats;
  };
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    email: '',
    name: '',
    date: '',
    verified: '',
    role: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailModalVisible, setUserDetailModalVisible] = useState(false);
  const [filtersDrawerVisible, setFiltersDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch users with filters and pagination
  const fetchUsers = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (filters.search) params.append('search', filters.search);
      if (filters.email) params.append('email', filters.email);
      if (filters.name) params.append('name', filters.name);
      if (filters.date) params.append('date', filters.date);
      if (filters.verified) params.append('verified', filters.verified);
      if (filters.role) params.append('role', filters.role);

      const response = await authenticatedFetch(API_ENDPOINTS.ADMIN_USERS(params.toString()));
      const data: UsersResponse = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      } else {
        message.error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Handle search
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
    fetchUsers(1, pageSize);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    fetchUsers(1, pageSize);
  };

  // Handle date filter
  const handleDateFilter = (dates: any) => {
    if (dates && dates.length === 2) {
      const startDate = dates[0].format('YYYY-MM-DD');
      const endDate = dates[1].format('YYYY-MM-DD');
      setFilters(prev => ({ ...prev, date: `${startDate},${endDate}` }));
    } else {
      setFilters(prev => ({ ...prev, date: '' }));
    }
    setCurrentPage(1);
    fetchUsers(1, pageSize);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      email: '',
      name: '',
      date: '',
      verified: '',
      role: ''
    });
    setCurrentPage(1);
    fetchUsers(1, pageSize);
  };

  // Refresh data
  const refreshData = () => {
    fetchUsers(currentPage, pageSize);
  };

  // Show user details
  const showUserDetails = (user: User) => {
    setSelectedUser(user);
    setUserDetailModalVisible(true);
  };

  // Mobile card view for users
  const MobileUserCard: React.FC<{ user: User }> = ({ user }) => (
    <Card 
      size="small" 
      style={{ marginBottom: 8 }}
      actions={[
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => showUserDetails(user)}
        >
          View
        </Button>,
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          disabled={user.role === 'admin'}
        >
          Edit
        </Button>,
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          disabled={user.role === 'admin'}
        >
          Delete
        </Button>
      ]}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Avatar icon={<UserOutlined />} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{user.name}</div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
            {user.email}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
            <PhoneOutlined style={{ marginRight: 4 }} />
            {user.phone}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <Badge
              status={user.verified ? 'success' : 'warning'}
              text={user.verified ? 'Verified' : 'Not Verified'}
            />
            <Tag color={user.role === 'admin' ? 'red' : 'blue'}>
              {user.role.toUpperCase()}
            </Tag>
            <div style={{ color: '#52c41a', fontWeight: 'bold', fontSize: '12px' }}>
              <WalletOutlined style={{ marginRight: 4 }} />
              ₹{user.walletBalance.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  // Desktop table columns
  const columns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <Space>
          <PhoneOutlined />
          <Text>{phone}</Text>
        </Space>
      ),
    },
    {
      title: 'Wallet Balance',
      dataIndex: 'walletBalance',
      key: 'walletBalance',
      render: (balance: number) => (
        <Space>
          <WalletOutlined />
          <Text strong style={{ color: '#52c41a' }}>
            ₹{balance.toLocaleString()}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'verified',
      key: 'verified',
      render: (verified: boolean) => (
        <Badge
          status={verified ? 'success' : 'warning'}
          text={verified ? 'Verified' : 'Not Verified'}
        />
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: User) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showUserDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Edit User">
            <Button
              type="text"
              icon={<EditOutlined />}
              disabled={record.role === 'admin'}
            />
          </Tooltip>
          <Tooltip title="Delete User">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={record.role === 'admin'}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Filter components
  const FilterControls = () => (
    <>
      <Row gutter={[8, 8]}>
        <Col xs={24} sm={24} md={24}>
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            style={{ marginBottom: 8 }}
          />
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Select
            placeholder="Verification Status"
            value={filters.verified}
            onChange={(value) => handleFilterChange('verified', value)}
            allowClear
            style={{ width: '100%', marginBottom: 8 }}
          >
            <Option value="true">Verified</Option>
            <Option value="false">Not Verified</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Select
            placeholder="User Role"
            value={filters.role}
            onChange={(value) => handleFilterChange('role', value)}
            allowClear
            style={{ width: '100%', marginBottom: 8 }}
          >
            <Option value="user">User</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={24}>
          <RangePicker
            placeholder={['Start Date', 'End Date']}
            onChange={handleDateFilter}
            style={{ width: '100%', marginBottom: 8 }}
            size={isMobile ? 'middle' : 'middle'}
          />
        </Col>
      </Row>
      <Divider style={{ margin: '12px 0' }} />
      <Row gutter={[8, 8]}>
        <Col xs={12} sm={12}>
          <Button
            block
            icon={<FilterOutlined />}
            onClick={clearFilters}
            disabled={!Object.values(filters).some(v => v)}
          >
            Clear Filters
          </Button>
        </Col>
        <Col xs={12} sm={12}>
          <Button
            block
            icon={<ReloadOutlined />}
            onClick={refreshData}
            loading={loading}
          >
            Refresh
          </Button>
        </Col>
      </Row>
    </>
  );

  return (
    <>
      <PageHeader
        title="User Management"
        breadcrumbs={[
          {
            title: 'Dashboard',
            path: '/dashboard',
          },
          {
            title: 'Users',
            path: '/users',
          },
        ]}
      />

      {/* Statistics Cards */}
      {stats && (
        <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Total Users"
                value={pagination?.totalUsers || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff', fontSize: isMobile ? '16px' : '24px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Verified"
                value={stats.verifiedUsers}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a', fontSize: isMobile ? '16px' : '24px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Wallet Balance"
                value={"₹ "+stats.totalWalletBalance}
                prefix={<WalletOutlined />}
                valueStyle={{ color: '#fa8c16', fontSize: isMobile ? '14px' : '20px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Admins"
                value={stats.adminUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#f5222d', fontSize: isMobile ? '16px' : '24px' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Mobile Filters Button */}
      {isMobile && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Button
            block
            icon={<MenuOutlined />}
            onClick={() => setFiltersDrawerVisible(true)}
          >
            Filters & Search
          </Button>
        </Card>
      )}

      {/* Desktop Filters */}
      {!isMobile && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search users..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Status"
                value={filters.verified}
                onChange={(value) => handleFilterChange('verified', value)}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="true">Verified</Option>
                <Option value="false">Not Verified</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Role"
                value={filters.role}
                onChange={(value) => handleFilterChange('role', value)}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="user">User</Option>
                <Option value="admin">Admin</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <RangePicker
                placeholder={['Start', 'End']}
                onChange={handleDateFilter}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Space>
                <Button
                  icon={<FilterOutlined />}
                  onClick={clearFilters}
                  disabled={!Object.values(filters).some(v => v)}
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={refreshData}
                  loading={loading}
                />
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* Users Display */}
      <Card size="small">
        {isMobile ? (
          // Mobile Card View
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
            ) : (
              users.map(user => (
                <MobileUserCard key={user._id} user={user} />
              ))
            )}
            {pagination && (
              <div style={{ textAlign: 'center', marginTop: 16, padding: '8px' }}>
                <Space direction="vertical" size="small">
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Page {pagination.currentPage} of {pagination.totalPages} 
                    ({pagination.totalUsers} total users)
                  </Text>
                  <Space>
                    <Button
                      size="small"
                      disabled={!pagination.hasPrevPage}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      size="small"
                      disabled={!pagination.hasNextPage}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                    </Button>
                  </Space>
                </Space>
              </div>
            )}
          </div>
        ) : (
          // Desktop Table View
          <Table
            columns={columns}
            dataSource={users}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination?.currentPage || 1,
              total: pagination?.totalUsers || 0,
              pageSize: pagination?.limit || 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} users`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            scroll={{ x: true }}
          />
        )}
      </Card>

      {/* Mobile Filters Drawer */}
      <Drawer
        title="Filters & Search"
        placement="bottom"
        onClose={() => setFiltersDrawerVisible(false)}
        open={filtersDrawerVisible}
        height="auto"
      >
        <FilterControls />
      </Drawer>

      {/* User Detail Modal */}
      <Modal
        title="User Details"
        open={userDetailModalVisible}
        onCancel={() => setUserDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setUserDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={isMobile ? '95%' : 600}
        style={isMobile ? { top: 20 } : {}}
      >
        {selectedUser && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Avatar size={64} icon={<UserOutlined />} />
                  <Title level={isMobile ? 4 : 3} style={{ marginTop: 16 }}>
                    {selectedUser.name}
                  </Title>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Email:</Text>
                <br />
                <Text copyable style={{ fontSize: isMobile ? '12px' : '14px' }}>
                  {selectedUser.email}
                </Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Phone:</Text>
                <br />
                <Text copyable>{selectedUser.phone}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Wallet Balance:</Text>
                <br />
                <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  ₹{selectedUser.walletBalance.toLocaleString()}
                </Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Status:</Text>
                <br />
                <Badge
                  status={selectedUser.verified ? 'success' : 'warning'}
                  text={selectedUser.verified ? 'Verified' : 'Not Verified'}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Role:</Text>
                <br />
                <Tag color={selectedUser.role === 'admin' ? 'red' : 'blue'}>
                  {selectedUser.role.toUpperCase()}
                </Tag>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Joined:</Text>
                <br />
                <Text>{dayjs(selectedUser.createdAt).format('MMMM DD, YYYY')}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </>
  );
};

export default UsersPage;