import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Spin,
  Empty,
  Button,
  Statistic,
  message,
  Badge,
  Avatar,
  Input
} from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  PlayCircleOutlined,
  WalletOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TransactionOutlined,
  DollarOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authenticatedFetch, API_ENDPOINTS } from '../utils/auth';
import { PageHeader } from '../components';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

// Type definitions
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  walletBalance: number;
  role: string;
  createdAt: string;
  modelType: string;
  displayName: string;
}

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  orderType: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  description: string;
  createdAt: string;
  modelType: string;
  displayName: string;
}

interface Transaction {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  orderId: string;
  amount: number;
  paymentNote: string;
  customerName: string;
  customerEmail: string;
  customerNumber: string;
  status: string;
  gatewayType: string;
  createdAt: string;
  modelType: string;
  displayName: string;
}

interface WalletLedger {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  transactionType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string;
  description: string;
  status: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  modelType: string;
  displayName: string;
  metadata?: any;
}

interface SearchResults {
  users: { count: number; data: User[] };
  orders: { count: number; data: Order[] };
  transactions: { count: number; data: Transaction[] };
  games: { count: number; data: any[] };
  diamondPacks: { count: number; data: any[] };
  walletLedgers: { count: number; data: WalletLedger[] };
  allUserOrders: { count: number; data: Order[] };
  allUserTransactions: { count: number; data: Transaction[] };
  allUserLedgers: { count: number; data: WalletLedger[] };
}

interface GlobalSearchResponse {
  success: boolean;
  message: string;
  data: {
    query: string;
    totalResults: number;
    includeHistory: boolean;
    results: SearchResults;
    summary: {
      users: number;
      orders: number;
      transactions: number;
      games: number;
      diamondPacks: number;
      walletLedgers: number;
      allUserOrders: number;
      allUserTransactions: number;
      allUserLedgers: number;
    };
  };
}

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<GlobalSearchResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('query', searchQuery);
      params.append('limit', '20');
      params.append('includeHistory', 'true');

      const response = await authenticatedFetch(API_ENDPOINTS.ADMIN_GLOBAL_SEARCH(params.toString()));
      const data: GlobalSearchResponse = await response.json();

      if (data.success) {
        setSearchResults(data.data);
      } else {
        message.error(data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Global search error:', error);
      message.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'failed':
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string): React.ReactNode => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return <CheckCircleOutlined />;
      case 'pending':
        return <ClockCircleOutlined />;
      case 'failed':
      case 'cancelled':
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  // User columns
  const usersColumns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{record.name}</div>
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
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: 'Date Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
  ];

  // Order columns
  const ordersColumns: ColumnsType<Order> = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text: string) => <Text copyable code>{text.slice(-12)}</Text>,
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
      render: (amount: number, record: Order) => `${record.currency} ${amount}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => <Tag>{method}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
  ];

  // Transaction columns
  const transactionsColumns: ColumnsType<Transaction> = [
    {
      title: 'Transaction ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text: string) => <Text copyable code>{text.slice(-12)}</Text>,
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record: Transaction) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div>{record.customerName || record.userId?.name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.customerEmail || record.userId?.email}
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
      title: 'Gateway',
      dataIndex: 'gatewayType',
      key: 'gatewayType',
      render: (gateway: string) => <Tag color="purple">{gateway}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Payment Note',
      dataIndex: 'paymentNote',
      key: 'paymentNote',
      render: (note: string) => (
        <Text ellipsis style={{ maxWidth: 200 }}>{note}</Text>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
  ];

  // Wallet Ledger columns
  const walletLedgerColumns: ColumnsType<WalletLedger> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record: WalletLedger) => (
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
      title: 'Type',
      dataIndex: 'transactionType',
      key: 'transactionType',
      render: (type: string) => (
        <Tag color={type === 'credit' ? 'green' : 'red'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `₹${amount}`,
    },
    {
      title: 'Balance Before',
      dataIndex: 'balanceBefore',
      key: 'balanceBefore',
      render: (balance: number) => `₹${balance}`,
    },
    {
      title: 'Balance After',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      render: (balance: number) => `₹${balance}`,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => (
        <Text ellipsis style={{ maxWidth: 200 }}>{desc}</Text>
      ),
    },
    {
      title: 'Reference',
      dataIndex: 'referenceType',
      key: 'referenceType',
      render: (ref: string) => <Tag>{ref}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
  ];

  if (!query) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Empty
          description="No search query provided"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/')}>
            Go to Dashboard
          </Button>
        </Empty>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Searching...</div>
      </div>
    );
  }

  if (!searchResults) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={4}>No search results</Title>
      </div>
    );
  }

  return (
    <div style={{ padding: '4px', background: '#f5f5f5', minHeight: '100vh', minWidth: '88vw' }}>
      <PageHeader
        title={`Search Results for "${searchResults.query}"`}
        breadcrumbs={[
          {
            title: 'Dashboard',
            path: '/',
          },
          {
            title: 'Search Results',
            path: '/search',
          },
        ]}
      />

      {/* Search Input */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={18}>
            <Input.Search
              placeholder="Enter new search query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleNewSearch}
              enterButton="Search"
              size="large"
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => performSearch(query)}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Total Results"
              value={searchResults.totalResults}
              prefix={<SearchOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Users"
              value={searchResults.summary.users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Orders"
              value={searchResults.summary.orders + searchResults.summary.allUserOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Transactions"
              value={searchResults.summary.transactions + searchResults.summary.allUserTransactions}
              prefix={<TransactionOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Wallet Ledgers"
              value={searchResults.summary.walletLedgers + searchResults.summary.allUserLedgers}
              prefix={<WalletOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Games & Packs"
              value={searchResults.summary.games + searchResults.summary.diamondPacks}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {searchResults.totalResults === 0 ? (
        <Card>
          <Empty
            description="No results found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <>
          {/* All User History */}
          {searchResults.results.users && searchResults.results.users.count > 0 && (
            <Card
              title="All user history"
              style={{ marginBottom: 24 }}
              extra={<Badge count={searchResults.results.users.count} />}
            >
              <Table
                columns={usersColumns}
                dataSource={searchResults.results.users.data}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
                size="small"
              />
            </Card>
          )}

          {/* User Orders History */}
          {searchResults.results.allUserOrders && searchResults.results.allUserOrders.count > 0 && (
            <Card
              title="User Orders History"
              style={{ marginBottom: 24 }}
              extra={<Badge count={searchResults.results.allUserOrders.count} />}
            >
              <Table
                columns={ordersColumns}
                dataSource={searchResults.results.allUserOrders.data}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
                size="small"
              />
            </Card>
          )}

          {/* Orders */}
          {searchResults.results.orders && searchResults.results.orders.count > 0 && (
            <Card
              title="Orders"
              style={{ marginBottom: 24 }}
              extra={<Badge count={searchResults.results.orders.count} />}
            >
              <Table
                columns={ordersColumns}
                dataSource={searchResults.results.orders.data}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
                size="small"
              />
            </Card>
          )}

          {/* All Payment History */}
          {searchResults.results.transactions && searchResults.results.transactions.count > 0 && (
            <Card
              title="All payment history"
              style={{ marginBottom: 24 }}
              extra={<Badge count={searchResults.results.transactions.count} />}
            >
              <Table
                columns={transactionsColumns}
                dataSource={searchResults.results.transactions.data}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
                size="small"
              />
            </Card>
          )}

          {/* User Payment History */}
          {searchResults.results.allUserTransactions && searchResults.results.allUserTransactions.count > 0 && (
            <Card
              title="User Payment History"
              style={{ marginBottom: 24 }}
              extra={<Badge count={searchResults.results.allUserTransactions.count} />}
            >
              <Table
                columns={transactionsColumns}
                dataSource={searchResults.results.allUserTransactions.data}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
                size="small"
              />
            </Card>
          )}

          {/* Wallet Ledgers */}
          {searchResults.results.walletLedgers && searchResults.results.walletLedgers.count > 0 && (
            <Card
              title="Wallet Ledgers"
              style={{ marginBottom: 24 }}
              extra={<Badge count={searchResults.results.walletLedgers.count} />}
            >
              <Table
                columns={walletLedgerColumns}
                dataSource={searchResults.results.walletLedgers.data}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
                size="small"
              />
            </Card>
          )}

          {/* User Wallet History */}
          {searchResults.results.allUserLedgers && searchResults.results.allUserLedgers.count > 0 && (
            <Card
              title="User Wallet History"
              style={{ marginBottom: 24 }}
              extra={<Badge count={searchResults.results.allUserLedgers.count} />}
            >
              <Table
                columns={walletLedgerColumns}
                dataSource={searchResults.results.allUserLedgers.data}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
                size="small"
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;