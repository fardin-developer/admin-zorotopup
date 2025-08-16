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
  Divider,
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

interface StatItem {
  count: number;
  amount: number;
}

interface StatsData {
  transactions: {
    success: StatItem;
    failed: StatItem;
    pending: StatItem;
  };
  orders: {
    success: StatItem;
    pendingProcessing: StatItem;
    failed: StatItem;
  };
  users: {
    newUsers: number;
  };
  // Legacy fields for backward compatibility
  todaySuccessTransactions: number;
  todayFailedTransactions: number;
  todayPendingTransactions: number;
  todaySuccessOrders: number;
  todayPendingProcessingOrders: number;
  todayFailedOrders: number;
  todayNewUsers: number;
  todaySuccessTransactionAmount: number;
  todayFailedTransactionAmount: number;
  todayPendingTransactionAmount: number;
  todaySuccessOrderAmount: number;
  todayPendingProcessingOrderAmount: number;
  todayFailedOrderAmount: number;
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
      width: 100,
      render: (text: string) => <Text code>{text.slice(-8)}</Text>,
    },
    {
      title: 'User',
      key: 'user',
      width: 200,
      render: (_, record: Order) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
              {record.userId.name}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.userId.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'orderType',
      key: 'orderType',
      width: 120,
      render: (text: string) => (
        <Tag color="blue">{text.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (amount: number) => `₹${amount}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
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
      width: 100,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const transactionsColumns: ColumnsType<Transaction> = [
    {
      title: 'Transaction ID',
      dataIndex: '_id',
      key: '_id',
      width: 120,
      render: (text: string) => <Text code>{text.slice(-8)}</Text>,
    },
    {
      title: 'User',
      key: 'user',
      width: 200,
      render: (_, record: Transaction) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
              {record.userId.name}
            </div>
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
      width: 100,
      render: (amount: number) => `₹${amount}`,
    },
    {
      title: 'Payment Note',
      dataIndex: 'paymentNote',
      key: 'paymentNote',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
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
      width: 100,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const usersColumns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      width: 250,
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
      width: 120,
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
      width: 120,
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Use new structured data with fallback to legacy data
  const getTransactionData = (status: 'success' | 'failed' | 'pending') => {
    if (statsData.transactions && statsData.transactions[status]) {
      return statsData.transactions[status];
    }
    // Fallback to legacy data
    const legacyMap = {
      success: {
        count: statsData.todaySuccessTransactions,
        amount: statsData.todaySuccessTransactionAmount || 0
      },
      failed: {
        count: statsData.todayFailedTransactions,
        amount: statsData.todayFailedTransactionAmount || 0
      },
      pending: {
        count: statsData.todayPendingTransactions,
        amount: statsData.todayPendingTransactionAmount || 0
      }
    };
    return legacyMap[status];
  };

  const getOrderData = (status: 'success' | 'pendingProcessing' | 'failed') => {
    if (statsData.orders && statsData.orders[status]) {
      return statsData.orders[status];
    }
    // Fallback to legacy data
    const legacyMap = {
      success: {
        count: statsData.todaySuccessOrders,
        amount: statsData.todaySuccessOrderAmount || 0
      },
      pendingProcessing: {
        count: statsData.todayPendingProcessingOrders,
        amount: statsData.todayPendingProcessingOrderAmount || 0
      },
      failed: {
        count: statsData.todayFailedOrders,
        amount: statsData.todayFailedOrderAmount || 0
      }
    };
    return legacyMap[status];
  };

  return (
    <div
      style={{
        padding: '24px',
        background: '#f5f5f5',
        minHeight: '100vh',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <Title level={2} style={{ marginBottom: '24px' }}>
        Dashboard
      </Title>

      {/* API Balance Section */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ marginBottom: '16px', color: '#1890ff' }}>
          <DollarOutlined style={{ marginRight: '8px' }} />
          API Balance
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6} xl={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <WalletIcon />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#a0aec0',
                      letterSpacing: '0.05em',
                      display: 'block',
                    }}
                  >
                    SMILEONE
                  </Text>
                  <Text
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#525b6bff',
                    }}
                  >
                    {formatCurrency(Number(apiBalance?.smileoneBalance) || 0)}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6} xl={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <WalletIcon />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#a0aec0',
                      letterSpacing: '0.05em',
                      display: 'block',
                    }}
                  >
                    MOOGOLD
                  </Text>
                  <Text
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#525b6bff',
                    }}
                  >
                    {formatCurrency(Number(apiBalance?.mooggoldBalance) || 0)}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* User Statistics Section */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ marginBottom: '16px', color: '#52c41a' }}>
          <UserOutlined style={{ marginRight: '8px' }} />
          User Statistics
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6} xl={6}>
            <Card>
              <Statistic
                title="Today's New Users"
                value={statsData.users?.newUsers || statsData.todayNewUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* Orders Statistics Section */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ marginBottom: '16px', color: '#722ed1' }}>
          <ShoppingCartOutlined style={{ marginRight: '8px' }} />
          Orders Statistics
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8} xl={8}>
            <Card>
              <Statistic
                title="Success Orders"
                value={formatCurrency(getOrderData('success').amount)}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
                suffix={
                  <div style={{ fontSize: '14px', color: '#8c8c8c', marginTop: '4px' }}>
                    {getOrderData('success').count} orders
                  </div>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={8}>
            <Card>
              <Statistic
                title="Pending Orders"
                value={formatCurrency(getOrderData('pendingProcessing').amount)}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
                suffix={
                  <div style={{ fontSize: '14px', color: '#8c8c8c', marginTop: '4px' }}>
                    {getOrderData('pendingProcessing').count} orders
                  </div>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={8}>
            <Card>
              <Statistic
                title="Failed Orders"
                value={formatCurrency(getOrderData('failed').amount)}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
                suffix={
                  <div style={{ fontSize: '14px', color: '#8c8c8c', marginTop: '4px' }}>
                    {getOrderData('failed').count} orders
                  </div>
                }
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* Transactions Statistics Section */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ marginBottom: '16px', color: '#fa8c16' }}>
          <TransactionOutlined style={{ marginRight: '8px' }} />
          Transactions Statistics
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8} xl={8}>
            <Card>
              <Statistic
                title="Success Transactions"
                value={formatCurrency(getTransactionData('success').amount)}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
                suffix={
                  <div style={{ fontSize: '14px', color: '#8c8c8c', marginTop: '4px' }}>
                    {getTransactionData('success').count} transactions
                  </div>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={8}>
            <Card>
              <Statistic
                title="Pending Transactions"
                value={formatCurrency(getTransactionData('pending').amount)}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
                suffix={
                  <div style={{ fontSize: '14px', color: '#8c8c8c', marginTop: '4px' }}>
                    {getTransactionData('pending').count} transactions
                  </div>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={8}>
            <Card>
              <Statistic
                title="Failed Transactions"
                value={formatCurrency(getTransactionData('failed').amount)}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
                suffix={
                  <div style={{ fontSize: '14px', color: '#8c8c8c', marginTop: '4px' }}>
                    {getTransactionData('failed').count} transactions
                  </div>
                }
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Divider />

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
          scroll={{ x: 'max-content' }}
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
          scroll={{ x: 'max-content' }}
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
          scroll={{ x: 'max-content' }}
          size="small"
        />
      </Card>
    </div>
  );
};