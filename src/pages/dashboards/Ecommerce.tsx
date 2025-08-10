import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Statistic,
  Tag,
  Avatar,
  Typography,
  Spin,
  message,
  Space,
  Badge,
} from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  TransactionOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { authenticatedFetch, API_ENDPOINTS } from '../../utils/auth';

const { Title, Text } = Typography;

// Type definitions
interface User {
  _id: string;
  name: string;
  email: string;
  verified?: boolean;
  walletBalance?: number;
}

interface Order {
  _id: string;
  userId: User;
  orderType: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  description: string;
  createdAt: string;
}

interface Transaction {
  _id: string;
  userId: User;
  amount: number;
  paymentNote: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  txnId?: string;
}

interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalTransactions: number;
  totalRevenue: number;
  recentOrders: Order[];
  recentTransactions: Transaction[];
  recentUsers: User[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}

interface ApiBalanceData {
  mooggoldBalance: string;
  smileoneBalance: string;
}

interface ApiBalanceResponse {
  success: boolean;
  message: string;
  data: ApiBalanceData;
}

const WalletIcon = () => (
  <div
    style={{
      width: '2.75rem',
      height: '2.75rem',
      backgroundColor: '#48bb78',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '1rem',
      flexShrink: 0,
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: 'white' }}
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  </div>
);

export const EcommerceDashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [apiBalance, setApiBalance] = useState<ApiBalanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
    fetchApiBalance();
  }, []);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(API_ENDPOINTS.ADMIN_DASHBOARD);
      const result: ApiResponse = await response.json();

      if (result.success) {
        setDashboardData(result.data);
      } else {
        message.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchApiBalance = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(
        API_ENDPOINTS.ADMIN_API_BALANCE
      );
      const result: ApiBalanceResponse = await response.json();

      if (result.success) {
        setApiBalance(result.data);
      } else {
        message.error('Failed to fetch api balance');
      }
    } catch (error) {
      console.error('Error fetching api balance:', error);
      message.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'failed'): string => {
    switch (status) {
      case 'success':
        return 'green';
      case 'pending':
        return 'orange';
      case 'failed':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (
    status: 'pending' | 'success' | 'failed'
  ): React.ReactNode => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined />;
      case 'pending':
        return <ClockCircleOutlined />;
      case 'failed':
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  const ordersColumns: ColumnsType<Order> = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: '_id',
      render: (text: string) => <Text code>{text.slice(-8)}</Text>,
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record: Order) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div>{record.userId.name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.userId.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Order Type',
      dataIndex: 'orderType',
      key: 'orderType',
      render: (text: string) => (
        <Tag color="blue">{text.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `₹${amount}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'pending' | 'success' | 'failed') => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const transactionsColumns: ColumnsType<Transaction> = [
    {
      title: 'Transaction ID',
      dataIndex: '_id',
      key: '_id',
      render: (text: string) => <Text code>{text.slice(-8)}</Text>,
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record: Transaction) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div>{record.userId.name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.userId.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `₹${amount}`,
    },
    {
      title: 'Payment Note',
      dataIndex: 'paymentNote',
      key: 'paymentNote',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'pending' | 'success' | 'failed') => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const usersColumns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{record.name}</div>
            <Text type="secondary">{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Verification',
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
      title: 'Wallet Balance',
      dataIndex: 'walletBalance',
      key: 'walletBalance',
      render: (balance: number) => `₹${balance}`,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading dashboard data...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={4}>No data available</Title>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div style={{ padding: '4px', background: '#f5f5f5',  minHeight: '100vh', minWidth: '88vw' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        Dashboard
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={dashboardData.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={dashboardData.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={dashboardData.totalTransactions}
              prefix={<TransactionOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={dashboardData.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="INR"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Api Balance */}
      <Card style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <WalletIcon />
          <div>
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: '700',
                color: '#a0aec0',
                letterSpacing: '0.05em',
                margin: 0,
              }}
            >
              SMILEONE
            </p>
            <p
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#525b6bff',
                margin: 0,
              }}
            >
              {formatCurrency(Number(apiBalance?.smileoneBalance))}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <WalletIcon />
          <div>
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: '700',
                color: '#a0aec0',
                letterSpacing: '0.05em',
                margin: 0,
              }}
            >
              MOOGOLD
            </p>
            <p
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#525b6bff',
                margin: 0,
              }}
            >
              {formatCurrency(Number(apiBalance?.mooggoldBalance))}
            </p>
          </div>
        </div>
      </Card>

      {/* Recent Orders Table */}
      <Card
        title="Recent Orders"
        style={{ marginBottom: 24, width: '100%' }}
        extra={<Badge count={dashboardData.recentOrders.length} />}
      >
        <Table
          columns={ordersColumns}
          dataSource={dashboardData.recentOrders}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 800 }}  // set a min width for horizontal scroll
          size="small"          // optional: smaller table on mobile
        />
      </Card>

      {/* Recent Transactions Table */}
      <Card
        title="Recent Transactions"
        style={{ marginBottom: '24px' }}
        extra={<Badge count={dashboardData.recentTransactions.length} />}
      >
        <Table
          columns={transactionsColumns}
          dataSource={dashboardData.recentTransactions}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 800 }}  // set a min width for horizontal scroll
          size="small"          // optional: smaller table on mobile
        />
      </Card>

      {/* Recent Users Table */}
      <Card
        title="Recent Users"
        extra={<Badge count={dashboardData.recentUsers.length} />}
      >
        <Table
          columns={usersColumns}
          dataSource={dashboardData.recentUsers}
           rowKey="_id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 800 }}  // set a min width for horizontal scroll
          size="small"          // optional: smaller table on mobile
        />
      </Card>
    </div>
  );
};
