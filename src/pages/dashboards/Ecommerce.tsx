import React, { useState, useEffect, useCallback } from 'react';
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
  DatePicker,
  Button,
} from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  TransactionOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { authenticatedFetch, API_ENDPOINTS } from '../../utils/auth';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

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

interface ApiBalanceData {
  mooggoldBalance: string;
  smileoneBalance: string;
}

interface ApiBalanceResponse {
  success: boolean;
  message: string;
  data: ApiBalanceData;
}

interface StatsData {
  todaySuccessTransactions: number;
  todayFailedTransactions: number;
  todayPendingTransactions: number;
  todaySuccessOrders: number;
  todayPendingProcessingOrders: number;
  todayFailedOrders: number;
  todayNewUsers: number;
}

interface TableState<T> {
  data: T[];
  pagination: TablePaginationConfig;
  loading: boolean;
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
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [apiBalance, setApiBalance] = useState<ApiBalanceData | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('day'),
    dayjs().endOf('day'),
  ]);

  const initialPagination: TablePaginationConfig = {
    current: 1,
    pageSize: 5,
    total: 0,
  };

  const [ordersState, setOrdersState] = useState<TableState<Order>>({
    data: [],
    pagination: initialPagination,
    loading: true,
  });
  const [transactionsState, setTransactionsState] = useState<
    TableState<Transaction>
  >({
    data: [],
    pagination: initialPagination,
    loading: true,
  });
  const [usersState, setUsersState] = useState<TableState<User>>({
    data: [],
    pagination: initialPagination,
    loading: true,
  });

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await authenticatedFetch(
        API_ENDPOINTS.ADMIN_DASHBOARD_STATS
      );
      const result = await response.json();
      if (result.success) {
        setStatsData(result.data);
      } else {
        message.error('Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      message.error('Error connecting to server');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchApiBalance = async () => {
    try {
      setLoadingStats(true);
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
      setLoadingStats(false);
    }
  };

  const fetchTableData = useCallback(
    async (
      tableType: 'orders' | 'transactions' | 'users',
      pagination: TablePaginationConfig,
      dates: [Dayjs, Dayjs]
    ) => {
      let setState: React.Dispatch<React.SetStateAction<TableState<any>>>;
      switch (tableType) {
        case 'orders':
          setState = setOrdersState as React.Dispatch<
            React.SetStateAction<TableState<Order>>
          >;
          break;
        case 'transactions':
          setState = setTransactionsState as React.Dispatch<
            React.SetStateAction<TableState<Transaction>>
          >;
          break;
        case 'users':
          setState = setUsersState as React.Dispatch<
            React.SetStateAction<TableState<User>>
          >;
          break;
        default:
          throw new Error('Invalid table type');
      }

      setState((prevState) => ({ ...prevState, loading: true }));

      const params = new URLSearchParams({
        tableType,
        page: pagination.current?.toString() || '1',
        limit: pagination.pageSize?.toString() || '5',
        startDate: dates[0].toISOString(),
        endDate: dates[1].toISOString(),
      });

      try {
        const response = await authenticatedFetch(
          `${API_ENDPOINTS.ADMIN_DASHBOARD_TABLE_DATA}?${params}`
        );
        const result = await response.json();
        if (result.success) {
          setState({
            loading: false,
            data: result.data.items,
            pagination: { ...pagination, total: result.data.total },
          });
        } else {
          message.error(`Failed to fetch ${tableType}`);
          setState((prevState) => ({ ...prevState, loading: false }));
        }
      } catch (error) {
        console.error(`Error fetching ${tableType}:`, error);
        message.error('Error connecting to server');
        setState((prevState) => ({ ...prevState, loading: false }));
      }
    },
    []
  );

  useEffect(() => {
    fetchStats();
    fetchApiBalance();
    fetchTableData('orders', initialPagination, dateRange);
    fetchTableData('transactions', initialPagination, dateRange);
    fetchTableData('users', initialPagination, dateRange);
  }, [fetchTableData]);

  const handleTableChange =
    (tableType: 'orders' | 'transactions' | 'users') =>
    (pagination: TablePaginationConfig) => {
      fetchTableData(tableType, pagination, dateRange);
    };

  const handleDateChange = (dates: RangePickerProps['value']) => {
    if (dates && dates[0] && dates[1]) {
      const newDateRange: [Dayjs, Dayjs] = [dates[0], dates[1]];
      setDateRange(newDateRange);
      fetchTableData(
        'orders',
        { ...ordersState.pagination, current: 1 },
        newDateRange
      );
      fetchTableData(
        'transactions',
        { ...transactionsState.pagination, current: 1 },
        newDateRange
      );
      fetchTableData(
        'users',
        { ...usersState.pagination, current: 1 },
        newDateRange
      );
    }
  };

  const handleClearFilter = () => {
    const today: [Dayjs, Dayjs] = [
      dayjs().startOf('day'),
      dayjs().endOf('day'),
    ];
    setDateRange(today);
    fetchTableData('orders', { ...ordersState.pagination, current: 1 }, today);
    fetchTableData(
      'transactions',
      { ...transactionsState.pagination, current: 1 },
      today
    );
    fetchTableData('users', { ...usersState.pagination, current: 1 }, today);
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

  if (loadingStats) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!statsData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={4}>Could not load dashboard stats.</Title>
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
    <div
      style={{
        padding: '0px',
        background: '#f5f5f5',
        minHeight: '100vh',
        minWidth: '88vw',
      }}
    >
      <Title level={2} style={{ marginBottom: '24px' }}>
        Dashboard
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Today's New Users"
              value={statsData.todayNewUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Today's Success Orders"
              value={statsData.todaySuccessOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Today's Pending Orders"
              value={statsData.todayPendingProcessingOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Today's Failed Orders"
              value={statsData.todayFailedOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Today's Success Transactions"
              value={statsData.todaySuccessTransactions}
              prefix={<TransactionOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Today's Pending Transactions"
              value={statsData.todayPendingTransactions}
              prefix={<TransactionOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Today's Failed Transactions"
              value={statsData.todayFailedTransactions}
              prefix={<TransactionOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
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

      {/* Date Filter Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Text strong>Filter by Date:</Text>
          <RangePicker value={dateRange} onChange={handleDateChange} />
          <Button icon={<ClearOutlined />} onClick={handleClearFilter}>
            Clear & Show Today
          </Button>
        </Space>
      </Card>

      {/* Recent Orders Table */}
      <Card title="Recent Orders" style={{ marginBottom: '24px' }}>
        <Table
          columns={ordersColumns}
          dataSource={ordersState.data}
          rowKey="_id"
          pagination={ordersState.pagination}
          loading={ordersState.loading}
          onChange={handleTableChange('orders')}
          scroll={{ x: 800 }}
          size="small"
        />
      </Card>

      {/* Recent Transactions Table */}
      <Card title="Recent Transactions" style={{ marginBottom: '24px' }}>
        <Table
          columns={transactionsColumns}
          dataSource={transactionsState.data}
          rowKey="_id"
          pagination={transactionsState.pagination}
          loading={transactionsState.loading}
          onChange={handleTableChange('transactions')}
          scroll={{ x: 800 }}
          size="small"
        />
      </Card>

      {/* Recent Users Table */}
      <Card title="Recent Users">
        <Table
          columns={usersColumns}
          dataSource={usersState.data}
          rowKey="_id"
          pagination={usersState.pagination}
          loading={usersState.loading}
          onChange={handleTableChange('users')}
          scroll={{ x: 800 }}
          size="small"
        />
      </Card>
    </div>
  );
};
