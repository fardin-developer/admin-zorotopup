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
  Divider,
  InputNumber
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  CreditCardOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined as CheckCircleIcon,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  BankOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { PageHeader } from '../components';
import { authenticatedFetch, API_ENDPOINTS } from '../utils/auth';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Type definitions
interface Transaction {
  _id: string;
  txnId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'success' | 'pending' | 'failed' | 'cancelled';
  gatewayType: string;
  customerName: string;
  customerEmail: string;
  customerNumber: string;
  paymentNote: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface Filters {
  search: string;
  txnId: string;
  orderId: string;
  status: string;
  gatewayType: string;
  date: string;
  minAmount: string;
  maxAmount: string;
}

interface Stats {
  totalAmount: number;
  successTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  cancelledTransactions: number;
  onegatewayTransactions: number;
  ekqrTransactions: number;
}

interface TransactionsResponse {
  success: boolean;
  message: string;
  data: {
    transactions: Transaction[];
    pagination: Pagination;
    filters: Filters;
    stats: Stats;
  };
}

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    txnId: '',
    orderId: '',
    status: '',
    gatewayType: '',
    date: '',
    minAmount: '',
    maxAmount: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionDetailModalVisible, setTransactionDetailModalVisible] = useState(false);
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

  // Fetch transactions with filters and pagination
  const fetchTransactions = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (filters.search) params.append('search', filters.search);
      if (filters.txnId) params.append('txnId', filters.txnId);
      if (filters.orderId) params.append('orderId', filters.orderId);
      if (filters.status) params.append('status', filters.status);
      if (filters.gatewayType) params.append('gatewayType', filters.gatewayType);
      if (filters.date) params.append('date', filters.date);
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);

      const response = await authenticatedFetch(API_ENDPOINTS.ADMIN_TRANSACTIONS(params.toString()));
      const data: TransactionsResponse = await response.json();
      console.log(data);

      if (data.success) {
        setTransactions(data.data.transactions);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      } else {
        message.error(data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      message.error('Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Handle search
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
    fetchTransactions(1, pageSize);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    fetchTransactions(1, pageSize);
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
    fetchTransactions(1, pageSize);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      txnId: '',
      orderId: '',
      status: '',
      gatewayType: '',
      date: '',
      minAmount: '',
      maxAmount: ''
    });
    setCurrentPage(1);
    fetchTransactions(1, pageSize);
  };

  // Refresh data
  const refreshData = () => {
    fetchTransactions(currentPage, pageSize);
  };

  // Show transaction details
  const showTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionDetailModalVisible(true);
  };

  // Get status color and icon
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'success':
        return { color: 'success', icon: <CheckCircleIcon />, text: 'Success' };
      case 'pending':
        return { color: 'processing', icon: <ClockCircleOutlined />, text: 'Pending' };
      case 'failed':
        return { color: 'error', icon: <CloseCircleOutlined />, text: 'Failed' };
      case 'cancelled':
        return { color: 'default', icon: <ExclamationCircleOutlined />, text: 'Cancelled' };
      default:
        return { color: 'default', icon: <ClockCircleOutlined />, text: status };
    }
  };

  // Get gateway icon
  const getGatewayIcon = (gatewayType: string) => {
    switch (gatewayType.toLowerCase()) {
      case 'onegateway':
        return <BankOutlined />;
      case 'ekqr':
        return <SwapOutlined />;
      default:
        return <CreditCardOutlined />;
    }
  };

  // Mobile card view for transactions
  const MobileTransactionCard: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const statusConfig = getStatusConfig(transaction.status);
    
    return (
      <Card 
        size="small" 
        style={{ marginBottom: 8 }}
        actions={[
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showTransactionDetails(transaction)}
          >
            View Details
          </Button>
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Avatar icon={getGatewayIcon(transaction.gatewayType)} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>{transaction.txnId}</div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
              Order: {transaction.orderId}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
              <UserOutlined style={{ marginRight: 4 }} />
              {transaction.customerName || transaction.userId?.name}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <Badge
                status={statusConfig.color as any}
                text={statusConfig.text}
              />
              <Tag color="blue">{transaction.gatewayType}</Tag>
              <div style={{ color: '#52c41a', fontWeight: 'bold', fontSize: '12px' }}>
                <DollarOutlined style={{ marginRight: 4 }} />
                {transaction.currency} {transaction.amount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Desktop table columns
  const columns: ColumnsType<Transaction> = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record: Transaction) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.customerName || record.userId?.name}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.customerEmail || record.userId?.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Transaction',
      key: 'transaction',
      render: (_, record: Transaction) => (
        <Space>
          <Avatar icon={getGatewayIcon(record.gatewayType)} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.txnId}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Order: {record.orderId}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Transaction) => (
        <Space>
          <DollarOutlined />
          <Text strong style={{ color: '#52c41a' }}>
            {record.currency} {amount.toLocaleString()}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = getStatusConfig(status);
        return (
          <Badge
            status={statusConfig.color as any}
            text={statusConfig.text}
          />
        );
      },
    },
    {
      title: 'Gateway',
      dataIndex: 'gatewayType',
      key: 'gatewayType',
      render: (gateway: string) => (
        <Tag color="blue" icon={getGatewayIcon(gateway)}>
          {gateway}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Transaction) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showTransactionDetails(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Filter components
  const FilterControls = () =>
    <>
      <Row gutter={[8, 8]}>
        <Col xs={24} sm={24} md={24}>
          <Input
            placeholder="Search transactions..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            style={{ marginBottom: 8 }}
          />
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Select
            placeholder="Transaction Status"
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            allowClear
            style={{ width: '100%', marginBottom: 8 }}
          >
            <Option value="success">Success</Option>
            <Option value="pending">Pending</Option>
            <Option value="failed">Failed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Select
            placeholder="Gateway Type"
            value={filters.gatewayType}
            onChange={(value) => handleFilterChange('gatewayType', value)}
            allowClear
            style={{ width: '100%', marginBottom: 8 }}
          >
            <Option value="onegateway">OneGateway</Option>
            <Option value="ekqr">EKQR</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Input
            placeholder="Transaction ID"
            value={filters.txnId}
            onChange={(e) => handleFilterChange('txnId', e.target.value)}
            allowClear
            style={{ marginBottom: 8 }}
          />
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Input
            placeholder="Order ID"
            value={filters.orderId}
            onChange={(e) => handleFilterChange('orderId', e.target.value)}
            allowClear
            style={{ marginBottom: 8 }}
          />
        </Col>
        <Col xs={24} sm={12} md={12}>
          <InputNumber
            placeholder="Min Amount"
            value={filters.minAmount ? parseFloat(filters.minAmount) : undefined}
            onChange={(value) => handleFilterChange('minAmount', value?.toString() || '')}
            style={{ width: '100%', marginBottom: 8 }}
            min={0}
          />
        </Col>
        <Col xs={24} sm={12} md={12}>
          <InputNumber
            placeholder="Max Amount"
            value={filters.maxAmount ? parseFloat(filters.maxAmount) : undefined}
            onChange={(value) => handleFilterChange('maxAmount', value?.toString() || '')}
            style={{ width: '100%', marginBottom: 8 }}
            min={0}
          />
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
    </>;

  return (
    <>
      <PageHeader
        title="Transaction Management"
        breadcrumbs={[
          {
            title: 'Dashboard',
            path: '/dashboard',
          },
          {
            title: 'Transactions',
            path: '/transactions',
          },
        ]}
      />

      {/* Statistics Cards */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Total Amount"
                value={stats.totalAmount}
                prefix="₹"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Success Transactions"
                value={stats.successTransactions}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Pending Transactions"
                value={stats.pendingTransactions}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Failed Transactions"
                value={stats.failedTransactions}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Mobile Filter Button */}
      {isMobile && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[8, 8]} align="middle">
            <Col span={12}>
              <Input
                placeholder="Search transactions..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={12}>
              <Space>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setFiltersDrawerVisible(true)}
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

      {/* Desktop Filters */}
      {!isMobile && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Search transactions..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={3}>
              <Select
                placeholder="Status"
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="success">Success</Option>
                <Option value="pending">Pending</Option>
                <Option value="failed">Failed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={3}>
              <Select
                placeholder="Gateway"
                value={filters.gatewayType}
                onChange={(value) => handleFilterChange('gatewayType', value)}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="onegateway">OneGateway</Option>
                <Option value="ekqr">EKQR</Option>
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

      {/* Transactions Display */}
      <Card size="small">
        {isMobile ? (
          // Mobile Card View
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
            ) : (
              transactions.map(transaction => (
                <MobileTransactionCard key={transaction._id} transaction={transaction} />
              ))
            )}
            {pagination && (
              <div style={{ textAlign: 'center', marginTop: 16, padding: '8px' }}>
                <Space direction="vertical" size="small">
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Page {pagination.currentPage} of {pagination.totalPages} 
                    ({pagination.totalTransactions} total transactions)
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
            dataSource={transactions}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination?.currentPage || 1,
              total: pagination?.totalTransactions || 0,
              pageSize: pagination?.limit || 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} transactions`,
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

      {/* Transaction Detail Modal */}
      <Modal
        title="Transaction Details"
        open={transactionDetailModalVisible}
        onCancel={() => setTransactionDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTransactionDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={isMobile ? '95%' : 600}
        style={isMobile ? { top: 20 } : {}}
      >
        {selectedTransaction && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Avatar size={64} icon={getGatewayIcon(selectedTransaction.gatewayType)} />
                  <Title level={isMobile ? 4 : 3} style={{ marginTop: 16 }}>
                    {selectedTransaction.txnId}
                  </Title>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Transaction ID:</Text>
                <br />
                <Text copyable>{selectedTransaction.txnId}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Order ID:</Text>
                <br />
                <Text copyable>{selectedTransaction.orderId}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Amount:</Text>
                <br />
                <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  {selectedTransaction.currency} {selectedTransaction.amount.toLocaleString()}
                </Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Status:</Text>
                <br />
                <Badge
                  status={getStatusConfig(selectedTransaction.status).color as any}
                  text={getStatusConfig(selectedTransaction.status).text}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Gateway Type:</Text>
                <br />
                <Tag color="blue" icon={getGatewayIcon(selectedTransaction.gatewayType)}>
                  {selectedTransaction.gatewayType}
                </Tag>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Customer Name:</Text>
                <br />
                <Text>{selectedTransaction.customerName || selectedTransaction.userId?.name}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Customer Email:</Text>
                <br />
                <Text copyable>{selectedTransaction.customerEmail || selectedTransaction.userId?.email}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Customer Phone:</Text>
                <br />
                <Text copyable>{selectedTransaction.customerNumber || selectedTransaction.userId?.phone}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Created:</Text>
                <br />
                <Text>{dayjs(selectedTransaction.createdAt).format('MMM DD, YYYY HH:mm')}</Text>
              </Col>
              {selectedTransaction.paymentNote && (
                <Col span={24}>
                  <Text strong>Payment Note:</Text>
                  <br />
                  <Text>{selectedTransaction.paymentNote}</Text>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </>
  );
};

export default TransactionsPage;
