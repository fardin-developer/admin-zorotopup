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
  InputNumber,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  EditOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined as CheckCircleIcon,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../components';
import { authenticatedFetch, API_ENDPOINTS } from '../utils/auth';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Type definitions
interface OrderItem {
  itemName: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderId: string;
  orderType: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  items: OrderItem[];
  description: string;
  createdAt: string;
  apiResults?: any;
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
  totalOrders: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface Filters {
  search: string;
  orderId: string;
  orderType: string;
  status: string;
  paymentMethod: string;
  date: string;
  minAmount: string;
  maxAmount: string;
}

interface Stats {
  totalAmount: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  failedOrders: number;
  cancelledOrders: number;
}

interface OrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
    pagination: Pagination;
    filters: Filters;
    stats: Stats;
  };
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    orderId: '',
    orderType: '',
    status: '',
    paymentMethod: '',
    date: '',
    minAmount: '',
    maxAmount: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailModalVisible, setOrderDetailModalVisible] = useState(false);
  const [orderLogsModalVisible, setOrderLogsModalVisible] = useState(false);
  const [filtersDrawerVisible, setFiltersDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<
    'pending' | 'processing' | 'completed' | 'cancelled' | 'failed' | ''
  >('');

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch orders with filters and pagination
  const fetchOrders = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (filters.search) params.append('search', filters.search);
      if (filters.orderId) params.append('orderId', filters.orderId);
      if (filters.orderType) params.append('orderType', filters.orderType);
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentMethod)
        params.append('paymentMethod', filters.paymentMethod);
      if (filters.date) params.append('date', filters.date);
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);

      const response = await authenticatedFetch(
        API_ENDPOINTS.ADMIN_ORDERS(params.toString())
      );
      const data: OrdersResponse = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      } else {
        message.error(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Handle search
  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
    fetchOrders(1, pageSize);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    fetchOrders(1, pageSize);
  };

  // Handle date filter
  const handleDateFilter = (dates: any) => {
    if (dates && dates.length === 2) {
      const startDate = dates[0].format('YYYY-MM-DD');
      const endDate = dates[1].format('YYYY-MM-DD');
      setFilters((prev) => ({ ...prev, date: `${startDate},${endDate}` }));
    } else {
      setFilters((prev) => ({ ...prev, date: '' }));
    }
    setCurrentPage(1);
    fetchOrders(1, pageSize);
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) {
      message.error('No Order is Selected!!');
      return;
    }
    if (!orderStatus) {
      message.error('Status Input is Empty!!');
      return;
    }
    if (orderStatus === selectedOrder.status) {
      message.error(`Status is already ${orderStatus}`);
      return;
    }
    setLoading(true);
    try {
      const payload = { status: orderStatus };
      const response = await authenticatedFetch(
        API_ENDPOINTS.ORDER_UPDATE_STATUS(selectedOrder._id),
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }
      );

      const data: OrdersResponse = await response.json();
      if (data.success) {
        await fetchOrders();
        setOrderLogsModalVisible(false);
      } else {
        message.error(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Error updating order status');
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      orderId: '',
      orderType: '',
      status: '',
      paymentMethod: '',
      date: '',
      minAmount: '',
      maxAmount: '',
    });
    setCurrentPage(1);
    fetchOrders(1, pageSize);
  };

  // Refresh data
  const refreshData = () => {
    fetchOrders(currentPage, pageSize);
  };

  // Show order details
  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailModalVisible(true);
  };

  const showOrderLogs = (order: Order) => {
    setSelectedOrder(order);
    setOrderLogsModalVisible(true);
  };

  // Sync order status
  const syncOrderStatus = async (order: Order) => {
    try {
      setSyncingOrderId(order._id);

      const response = await authenticatedFetch(
        API_ENDPOINTS.ADMIN_ORDER_STATUS_SYNC(order.orderId, order.userId._id),
        {
          method: 'GET',
        }
      );

      const result = await response.json();

      if (result.success) {
        message.success('Order status synced successfully');
        // Refresh the orders list to get updated status
        fetchOrders(currentPage, pageSize);
      } else {
        message.error(result.message || 'Failed to sync order status');
      }
    } catch (error) {
      console.error('Error syncing order status:', error);
      message.error('Error syncing order status');
    } finally {
      setSyncingOrderId(null);
    }
  };

  // Get status color and icon
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'success',
          icon: <CheckCircleIcon />,
          text: 'Completed',
        };
      case 'processing':
        return {
          color: 'processing',
          icon: <ClockCircleOutlined />,
          text: 'Processing',
        };
      case 'pending':
        return {
          color: 'warning',
          icon: <ClockCircleOutlined />,
          text: 'Pending',
        };
      case 'failed':
        return {
          color: 'error',
          icon: <CloseCircleOutlined />,
          text: 'Failed',
        };
      case 'cancelled':
        return {
          color: 'default',
          icon: <ExclamationCircleOutlined />,
          text: 'Cancelled',
        };
      default:
        return {
          color: 'default',
          icon: <ClockCircleOutlined />,
          text: status,
        };
    }
  };

  // Mobile card view for orders
  const MobileOrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const statusConfig = getStatusConfig(order.status);

    return (
      <Card
        size="small"
        style={{ marginBottom: 8 }}
        actions={[
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showOrderDetails(order)}
          >
            View
          </Button>,
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => showOrderLogs(order)}
          >
            Edit
          </Button>,
          <Button
            type="text"
            size="small"
            icon={<SyncOutlined />}
            loading={syncingOrderId === order._id}
            onClick={() => syncOrderStatus(order)}
          >
            Sync Status
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Avatar icon={<ShoppingCartOutlined />} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              {order.orderId}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
              {order.orderType}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
              <UserOutlined style={{ marginRight: 4 }} />
              {order.userId.name}
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <Badge
                status={statusConfig.color as any}
                text={statusConfig.text}
              />
              <div
                style={{
                  color: '#52c41a',
                  fontWeight: 'bold',
                  fontSize: '12px',
                }}
              >
                <DollarOutlined style={{ marginRight: 4 }} />
                {order.currency} {order.amount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Desktop table columns
  const columns: ColumnsType<Order> = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record: Order) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: 500 }}>{record.userId.name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.userId.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Order',
      key: 'order',
      render: (_, record: Order) => (
        <Space>
          <Avatar icon={<ShoppingCartOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.orderId}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.orderType}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Order) => (
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
          <Badge status={statusConfig.color as any} text={statusConfig.text} />
        );
      },
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => <Tag color="blue">{method}</Tag>,
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
      render: (_, record: Order) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showOrderDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Order">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showOrderLogs(record)}
            />
          </Tooltip>
          <Tooltip title="Sync Order Status">
            <Button
              type="text"
              icon={<SyncOutlined />}
              loading={syncingOrderId === record._id}
              onClick={() => syncOrderStatus(record)}
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
            placeholder="Search orders..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            style={{ marginBottom: 8 }}
          />
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Select
            placeholder="Order Status"
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            allowClear
            style={{ width: '100%', marginBottom: 8 }}
          >
            <Option value="pending">Pending</Option>
            <Option value="processing">Processing</Option>
            <Option value="completed">Completed</Option>
            <Option value="failed">Failed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Select
            placeholder="Payment Method"
            value={filters.paymentMethod}
            onChange={(value) => handleFilterChange('paymentMethod', value)}
            allowClear
            style={{ width: '100%', marginBottom: 8 }}
          >
            <Option value="card">Card</Option>
            <Option value="upi">UPI</Option>
            <Option value="netbanking">Net Banking</Option>
            <Option value="wallet">Wallet</Option>
          </Select>
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
          <Input
            placeholder="Order Type"
            value={filters.orderType}
            onChange={(e) => handleFilterChange('orderType', e.target.value)}
            allowClear
            style={{ marginBottom: 8 }}
          />
        </Col>
        <Col xs={24} sm={12} md={12}>
          <InputNumber
            placeholder="Min Amount"
            value={
              filters.minAmount ? parseFloat(filters.minAmount) : undefined
            }
            onChange={(value) =>
              handleFilterChange('minAmount', value?.toString() || '')
            }
            style={{ width: '100%', marginBottom: 8 }}
            min={0}
          />
        </Col>
        <Col xs={24} sm={12} md={12}>
          <InputNumber
            placeholder="Max Amount"
            value={
              filters.maxAmount ? parseFloat(filters.maxAmount) : undefined
            }
            onChange={(value) =>
              handleFilterChange('maxAmount', value?.toString() || '')
            }
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
            disabled={!Object.values(filters).some((v) => v)}
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
        title="Order Management"
        breadcrumbs={[
          {
            title: 'Dashboard',
            path: '/dashboard',
          },
          {
            title: 'Orders',
            path: '/orders',
          },
        ]}
      />

      {/* Statistics Cards */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Total Orders"
                value={stats.totalOrders}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Total Amount"
                value={stats.totalAmount}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a' }}
                suffix="₹"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Pending Orders"
                value={stats.pendingOrders}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Completed Orders"
                value={stats.completedOrders}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
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
                placeholder="Search orders..."
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
                placeholder="Search orders..."
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
                <Option value="pending">Pending</Option>
                <Option value="processing">Processing</Option>
                <Option value="completed">Completed</Option>
                <Option value="failed">Failed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={3}>
              <Select
                placeholder="Payment"
                value={filters.paymentMethod}
                onChange={(value) => handleFilterChange('paymentMethod', value)}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="card">Card</Option>
                <Option value="upi">UPI</Option>
                <Option value="netbanking">Net Banking</Option>
                <Option value="wallet">Wallet</Option>
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
                  disabled={!Object.values(filters).some((v) => v)}
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

      {/* Orders Display */}
      <Card size="small">
        {isMobile ? (
          // Mobile Card View
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                Loading...
              </div>
            ) : (
              orders.map((order) => (
                <MobileOrderCard key={order._id} order={order} />
              ))
            )}
            {pagination && (
              <div
                style={{ textAlign: 'center', marginTop: 16, padding: '8px' }}
              >
                <Space direction="vertical" size="small">
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Page {pagination.currentPage} of {pagination.totalPages}(
                    {pagination.totalOrders} total orders)
                  </Text>
                  <Space>
                    <Button
                      size="small"
                      disabled={!pagination.hasPrevPage}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      size="small"
                      disabled={!pagination.hasNextPage}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
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
            dataSource={orders}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination?.currentPage || 1,
              total: pagination?.totalOrders || 0,
              pageSize: pagination?.limit || 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} orders`,
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

      <Modal
        title="Order Logs"
        open={orderLogsModalVisible}
        onCancel={() => setOrderLogsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setOrderLogsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={isMobile ? '95%' : 900}
        style={isMobile ? { top: 20 } : {}}
      >
        {selectedOrder && (
          <div>
            <Text style={{ marginTop: 12, fontWeight: 600, fontSize: 14 }}>
              API Results
            </Text>
            <Card
              style={{
                width: '100%',
                height: 300,
                backgroundColor: '#000',
                color: '#FFF',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {selectedOrder.apiResults ? (
                <pre style={{ margin: 0, color: '#FFF', background: 'none' }}>
                  {JSON.stringify(selectedOrder.apiResults, null, 2)}
                </pre>
              ) : (
                <>No Logs Availble</>
              )}
            </Card>

            <Text style={{ marginTop: 12, fontWeight: 600, fontSize: 14 }}>
              Order Status
            </Text>
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={12} md={12}>
                <Select
                  placeholder="Order Status"
                  value={
                    orderStatus === '' ? selectedOrder.status : orderStatus
                  }
                  onChange={(value) => setOrderStatus(value)}
                  allowClear
                  style={{ width: '100%', marginBottom: 8 }}
                >
                  <Option value="pending">Pending</Option>
                  <Option value="processing">Processing</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="failed">Failed</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Col>
            </Row>
            <Button
              type="primary"
              loading={loading}
              size="large"
              block={isMobile}
              onClick={handleUpdateOrderStatus}
            >
              {loading ? 'Hold on...' : 'Update Status'}
            </Button>
          </div>
        )}
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        title="Order Details"
        open={orderDetailModalVisible}
        onCancel={() => setOrderDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setOrderDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={isMobile ? '95%' : 600}
        style={isMobile ? { top: 20 } : {}}
      >
        {selectedOrder && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Avatar size={64} icon={<ShoppingCartOutlined />} />
                  <Title level={isMobile ? 4 : 3} style={{ marginTop: 16 }}>
                    {selectedOrder.orderId}
                  </Title>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Order Type:</Text>
                <br />
                <Text>{selectedOrder.orderType}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Amount:</Text>
                <br />
                <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  {selectedOrder.currency}{' '}
                  {selectedOrder.amount.toLocaleString()}
                </Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Status:</Text>
                <br />
                <Badge
                  status={getStatusConfig(selectedOrder.status).color as any}
                  text={getStatusConfig(selectedOrder.status).text}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Payment Method:</Text>
                <br />
                <Tag color="blue">{selectedOrder.paymentMethod}</Tag>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Customer Name:</Text>
                <br />
                <Text>{selectedOrder.userId.name}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Customer Email:</Text>
                <br />
                <Text copyable>{selectedOrder.userId.email}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Customer Phone:</Text>
                <br />
                <Text copyable>{selectedOrder.userId.phone}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Created:</Text>
                <br />
                <Text>
                  {dayjs(selectedOrder.createdAt).format('MMM DD, YYYY HH:mm')}
                </Text>
              </Col>
              {selectedOrder.description && (
                <Col span={24}>
                  <Text strong>Description:</Text>
                  <br />
                  <Text>{selectedOrder.description}</Text>
                </Col>
              )}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <Col span={24}>
                  <Text strong>Items:</Text>
                  <br />
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <Text>
                        {item.itemName} - Qty: {item.quantity} - Price:{' '}
                        {item.price}
                      </Text>
                    </div>
                  ))}
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </>
  );
};

export default OrdersPage;
