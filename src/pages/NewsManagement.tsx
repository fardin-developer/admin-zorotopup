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
  message,
  Badge,
  Tooltip,
  Modal,
  Drawer,
  Divider,
  Form,
  Switch,
  Popconfirm,
  Empty,

  Dropdown,
  MenuProps
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ReadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  PushpinOutlined,

  CalendarOutlined,
  TagsOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  BellOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  MoreOutlined,

  TrophyOutlined
} from '@ant-design/icons';
import { PageHeader } from '../components';
import { authenticatedFetch, API_ENDPOINTS } from '../utils/auth';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import TextArea from 'antd/es/input/TextArea';

const { Title, Text } = Typography;
const { Option } = Select;


// Type definitions
interface News {
  _id: string;
  title: string;
  content: string;
  category: 'announcement' | 'maintenance' | 'update' | 'event' | 'patch' | 'tournament';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  isPinned: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    _id: string;
    name: string;
    email: string;
  };
  views?: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalNews: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface Filters {
  search: string;
  category: string;
  priority: string;
  status: string;
  dateRange: string;
  tags: string;
  isPinned: string;
}

interface NewsResponse {
  success: boolean;
  message: string;
  data: {
    news: News[];
    pagination: Pagination;
    filters: Filters;
    stats?: {
      totalNews: number;
      publishedNews: number;
      draftNews: number;
      pinnedNews: number;
    };
  };
}

interface NewsFormData {
  title: string;
  content: string;
  category: string;
  priority: string;
  status: string;
  tags: string[];
  isPinned: boolean;
}

const NewsManagementPage: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    priority: '',
    status: '',
    dateRange: '',
    tags: '',
    isPinned: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [newsDetailModalVisible, setNewsDetailModalVisible] = useState(false);
  const [newsFormModalVisible, setNewsFormModalVisible] = useState(false);
  const [filtersDrawerVisible, setFiltersDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState<any>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Categories and priorities with gaming focus
  const categories = [
    { value: 'announcement', label: 'Announcement', icon: <BellOutlined />, color: '#1890ff' },
    { value: 'maintenance', label: 'Maintenance', icon: <WarningOutlined />, color: '#faad14' },
    { value: 'update', label: 'Game Update', icon: <ReloadOutlined />, color: '#52c41a' },
    { value: 'event', label: 'Event', icon: <CalendarOutlined />, color: '#722ed1' },
    { value: 'patch', label: 'Patch Notes', icon: <FireOutlined />, color: '#ff4d4f' },
    { value: 'tournament', label: 'Tournament', icon: <TrophyOutlined />, color: '#fa8c16' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#52c41a', icon: <InfoCircleOutlined /> },
    { value: 'medium', label: 'Medium', color: '#faad14', icon: <ExclamationCircleOutlined /> },
    { value: 'high', label: 'High', color: '#ff7a45', icon: <WarningOutlined /> },
    { value: 'critical', label: 'Critical', color: '#ff4d4f', icon: <FireOutlined /> }
  ];

  const statuses = [
    { value: 'draft', label: 'Draft', color: 'default', icon: <EditOutlined /> },
    { value: 'published', label: 'Published', color: 'success', icon: <CheckCircleOutlined /> },
    { value: 'archived', label: 'Archived', color: 'warning', icon: <ClockCircleOutlined /> }
  ];

  // Fetch news with filters and pagination
  const fetchNews = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.status) params.append('status', filters.status);
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.tags) params.append('tags', filters.tags);
      if (filters.isPinned) params.append('isPinned', filters.isPinned);

      const response = await authenticatedFetch(API_ENDPOINTS.ADMIN_NEWS(params.toString()));
      const data: NewsResponse = await response.json();

      if (data.success) {
        setNews(data.data.news);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      } else {
        message.error(data.message || 'Failed to fetch news');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      message.error('Error fetching news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Handle search
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
    fetchNews(1, pageSize);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    fetchNews(1, pageSize);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      priority: '',
      status: '',
      dateRange: '',
      tags: '',
      isPinned: ''
    });
    setCurrentPage(1);
    fetchNews(1, pageSize);
  };

  // Refresh data
  const refreshData = () => {
    fetchNews(currentPage, pageSize);
  };

  // Show news details
  const showNewsDetails = (newsItem: News) => {
    setSelectedNews(newsItem);
    setNewsDetailModalVisible(true);
  };

  // Open create news modal
  const openCreateModal = () => {
    setEditingNews(null);
    form.resetFields();
    setNewsFormModalVisible(true);
  };

  // Open edit news modal
  const openEditModal = (newsItem: News) => {
    setEditingNews(newsItem);
    form.setFieldsValue({
      title: newsItem.title,
      content: newsItem.content,
      category: newsItem.category,
      priority: newsItem.priority,
      status: newsItem.status,
      tags: newsItem.tags,
      isPinned: newsItem.isPinned
    });
    setNewsFormModalVisible(true);
  };

  // Handle form submission
  const handleFormSubmit = async (values: NewsFormData) => {
    try {
      setLoading(true);
      const url = editingNews 
        ? API_ENDPOINTS.ADMIN_NEWS_UPDATE(editingNews._id)
        : API_ENDPOINTS.ADMIN_NEWS_CREATE;
      
      const method = editingNews ? 'PUT' : 'POST';
      
      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(values)
      });

      const result = await response.json();

      if (result.success) {
        message.success(`News ${editingNews ? 'updated' : 'created'} successfully!`);
        setNewsFormModalVisible(false);
        form.resetFields();
        refreshData();
      } else {
        message.error(result.message || `Failed to ${editingNews ? 'update' : 'create'} news`);
      }
    } catch (error) {
      console.error('Error saving news:', error);
      message.error(`Error ${editingNews ? 'updating' : 'creating'} news`);
    } finally {
      setLoading(false);
    }
  };

  // Toggle pin status
  const togglePin = async (newsItem: News) => {
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.ADMIN_NEWS_TOGGLE_PIN(newsItem._id), {
        method: 'PATCH'
      });

      const result = await response.json();

      if (result.success) {
        message.success(`News ${newsItem.isPinned ? 'unpinned' : 'pinned'} successfully!`);
        refreshData();
      } else {
        message.error(result.message || 'Failed to toggle pin status');
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      message.error('Error updating pin status');
    }
  };

  // Delete news
  const deleteNews = async (newsId: string) => {
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.ADMIN_NEWS_DELETE(newsId), {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        message.success('News deleted successfully!');
        refreshData();
      } else {
        message.error(result.message || 'Failed to delete news');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      message.error('Error deleting news');
    }
  };

  // Get config for categories, priorities, etc.
  const getCategoryConfig = (category: string) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const getPriorityConfig = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[0];
  };

  const getStatusConfig = (status: string) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  // Mobile card view for news
  const MobileNewsCard: React.FC<{ newsItem: News }> = ({ newsItem }) => {
    const categoryConfig = getCategoryConfig(newsItem.category);
    const priorityConfig = getPriorityConfig(newsItem.priority);
    const statusConfig = getStatusConfig(newsItem.status);

    const menuItems: MenuProps['items'] = [
      {
        key: 'view',
        label: 'View Details',
        icon: <EyeOutlined />,
        onClick: () => showNewsDetails(newsItem)
      },
      {
        key: 'edit',
        label: 'Edit',
        icon: <EditOutlined />,
        onClick: () => openEditModal(newsItem)
      },
      {
        key: 'pin',
        label: newsItem.isPinned ? 'Unpin' : 'Pin',
        icon: <PushpinOutlined />,
        onClick: () => togglePin(newsItem)
      },
      {
        type: 'divider'
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: 'Delete News',
            content: 'Are you sure you want to delete this news article?',
            onOk: () => deleteNews(newsItem._id)
          });
        }
      }
    ];
    
    return (
      <Card 
        size="small" 
        style={{ marginBottom: 8 }}
        extra={
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        }
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Avatar 
            icon={categoryConfig.icon} 
            style={{ backgroundColor: categoryConfig.color }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text strong style={{ fontSize: '14px' }} ellipsis>
                {newsItem.title}
              </Text>
              {newsItem.isPinned && (
                <PushpinOutlined style={{ color: '#faad14', fontSize: '12px' }} />
              )}
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              <Tag 
                color={categoryConfig.color} 
                icon={categoryConfig.icon}
                style={{ fontSize: '10px', margin: 0 }}
              >
                {categoryConfig.label}
              </Tag>
              <Tag 
                color={priorityConfig.color}
                icon={priorityConfig.icon}
                style={{ fontSize: '10px', margin: 0 }}
              >
                {priorityConfig.label}
              </Tag>
              <Badge
                status={statusConfig.color as any}
                text={statusConfig.label}
                style={{ fontSize: '10px' }}
              />
            </div>

            <Text type="secondary" style={{ fontSize: '11px' }}>
              {dayjs(newsItem.createdAt).format('MMM DD, YYYY HH:mm')}
              {newsItem.views && (
                <span style={{ marginLeft: 8 }}>
                  <EyeOutlined style={{ marginRight: 2 }} />
                  {newsItem.views}
                </span>
              )}
            </Text>
          </div>
        </div>
      </Card>
    );
  };

  // Desktop table columns
  const columns: ColumnsType<News> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: News) => (
        <Space>
          <Avatar 
            icon={getCategoryConfig(record.category).icon}
            style={{ backgroundColor: getCategoryConfig(record.category).color }}
            size="small"
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Text strong style={{ maxWidth: 200 }} ellipsis={{ tooltip: title }}>
                {title}
              </Text>
              {record.isPinned && (
                <PushpinOutlined style={{ color: '#faad14' }} />
              )}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.tags.slice(0, 2).map(tag => (
                                    <Tag key={tag} style={{ margin: '0 2px', fontSize: '10px' }}>
                      {tag}
                    </Tag>
              ))}
              {record.tags.length > 2 && <Text type="secondary">+{record.tags.length - 2}</Text>}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const config = getCategoryConfig(category);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
      filters: categories.map(c => ({ text: c.label, value: c.value })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const config = getPriorityConfig(priority);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
      filters: priorities.map(p => ({ text: p.label, value: p.value })),
      onFilter: (value, record) => record.priority === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = getStatusConfig(status);
        return (
          <Badge
            status={config.color as any}
            text={config.label}
          />
        );
      },
      filters: statuses.map(s => ({ text: s.label, value: s.value })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      render: (views: number) => (
        <Space>
          <EyeOutlined />
          <Text>{views || 0}</Text>
        </Space>
      ),
      sorter: (a, b) => (a.views || 0) - (b.views || 0),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: News) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showNewsDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title={record.isPinned ? "Unpin" : "Pin"}>
            <Button
              type="text"
              icon={<PushpinOutlined />}
              style={{ color: record.isPinned ? '#faad14' : undefined }}
              onClick={() => togglePin(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete News"
            description="Are you sure you want to delete this news article?"
            onConfirm={() => deleteNews(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <PageHeader
          title="News Management"
          breadcrumbs={[
            {
              title: 'Dashboard',
              path: '/dashboard',
            },
            {
              title: 'News Management',
              path: '/news-management',
            },
          ]}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
          size={isMobile ? 'middle' : 'large'}
        >
          Create News
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Space>
                <Avatar icon={<ReadOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.totalNews}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Total News</div>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Space>
                <Avatar icon={<CheckCircleOutlined />} style={{ backgroundColor: '#52c41a' }} />
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.publishedNews}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Published</div>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Space>
                <Avatar icon={<EditOutlined />} style={{ backgroundColor: '#faad14' }} />
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.draftNews}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Drafts</div>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Space>
                <Avatar icon={<PushpinOutlined />} style={{ backgroundColor: '#722ed1' }} />
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.pinnedNews}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Pinned</div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* Mobile Filters */}
      {isMobile && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[8, 8]} align="middle">
            <Col span={12}>
              <Input
                placeholder="Search news..."
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
            <Col xs={24} sm={8} md={6}>
              <Input
                placeholder="Search news..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={12} sm={4} md={3}>
              <Select
                placeholder="Category"
                value={filters.category}
                onChange={(value) => handleFilterChange('category', value)}
                allowClear
                style={{ width: '100%' }}
              >
                {categories.map(cat => (
                  <Option key={cat.value} value={cat.value}>
                    <Space>
                      {cat.icon}
                      {cat.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={4} md={3}>
              <Select
                placeholder="Priority"
                value={filters.priority}
                onChange={(value) => handleFilterChange('priority', value)}
                allowClear
                style={{ width: '100%' }}
              >
                {priorities.map(priority => (
                  <Option key={priority.value} value={priority.value}>
                    <Space>
                      {priority.icon}
                      {priority.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={4} md={3}>
              <Select
                placeholder="Status"
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                allowClear
                style={{ width: '100%' }}
              >
                {statuses.map(status => (
                  <Option key={status.value} value={status.value}>
                    <Space>
                      {status.icon}
                      {status.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={4} md={3}>
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

      {/* News Display */}
      <Card size="small">
        {isMobile ? (
          // Mobile Card View
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
            ) : news.length === 0 ? (
              <Empty description="No news articles found" />
            ) : (
              news.map(newsItem => (
                <MobileNewsCard key={newsItem._id} newsItem={newsItem} />
              ))
            )}
            {pagination && (
              <div style={{ textAlign: 'center', marginTop: 16, padding: '8px' }}>
                <Space direction="vertical" size="small">
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Page {pagination.currentPage} of {pagination.totalPages} 
                    ({pagination.totalNews} total articles)
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
            dataSource={news}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination?.currentPage || 1,
              total: pagination?.totalNews || 0,
              pageSize: pagination?.limit || 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} articles`,
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
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Category</Text>
            <Select
              placeholder="Select category"
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              allowClear
              style={{ width: '100%', marginTop: 8 }}
            >
              {categories.map(cat => (
                <Option key={cat.value} value={cat.value}>
                  <Space>
                    {cat.icon}
                    {cat.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </div>
          
          <div>
            <Text strong>Priority</Text>
            <Select
              placeholder="Select priority"
              value={filters.priority}
              onChange={(value) => handleFilterChange('priority', value)}
              allowClear
              style={{ width: '100%', marginTop: 8 }}
            >
              {priorities.map(priority => (
                <Option key={priority.value} value={priority.value}>
                  <Space>
                    {priority.icon}
                    {priority.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Text strong>Status</Text>
            <Select
              placeholder="Select status"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
              style={{ width: '100%', marginTop: 8 }}
            >
              {statuses.map(status => (
                <Option key={status.value} value={status.value}>
                  <Space>
                    {status.icon}
                    {status.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </div>

          <Divider />
          
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Button
                block
                icon={<FilterOutlined />}
                onClick={clearFilters}
                disabled={!Object.values(filters).some(v => v)}
              >
                Clear Filters
              </Button>
            </Col>
            <Col span={12}>
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
        </Space>
      </Drawer>

      {/* News Detail Modal */}
      <Modal
        title="News Details"
        open={newsDetailModalVisible}
        onCancel={() => setNewsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setNewsDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={isMobile ? '95%' : 800}
        style={isMobile ? { top: 20 } : {}}
      >
        {selectedNews && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={64} 
                icon={getCategoryConfig(selectedNews.category).icon}
                style={{ backgroundColor: getCategoryConfig(selectedNews.category).color }}
              />
              <Title level={isMobile ? 4 : 3} style={{ marginTop: 16, marginBottom: 8 }}>
                {selectedNews.title}
                {selectedNews.isPinned && (
                  <PushpinOutlined style={{ color: '#faad14', marginLeft: 8 }} />
                )}
              </Title>
              
              <Space wrap>
                <Tag 
                  color={getCategoryConfig(selectedNews.category).color}
                  icon={getCategoryConfig(selectedNews.category).icon}
                >
                  {getCategoryConfig(selectedNews.category).label}
                </Tag>
                <Tag 
                  color={getPriorityConfig(selectedNews.priority).color}
                  icon={getPriorityConfig(selectedNews.priority).icon}
                >
                  {getPriorityConfig(selectedNews.priority).label}
                </Tag>
                <Badge
                  status={getStatusConfig(selectedNews.status).color as any}
                  text={getStatusConfig(selectedNews.status).label}
                />
              </Space>
            </div>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <Text strong>Content:</Text>
              <div style={{ 
                marginTop: 8, 
                padding: 16, 
                backgroundColor: '#fafafa', 
                borderRadius: 6,
                whiteSpace: 'pre-wrap'
              }}>
                {selectedNews.content}
              </div>
            </div>

            {selectedNews.tags.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Tags:</Text>
                <div style={{ marginTop: 8 }}>
                  {selectedNews.tags.map(tag => (
                    <Tag key={tag} icon={<TagsOutlined />}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Text type="secondary">Created:</Text>
                <br />
                <Text>{dayjs(selectedNews.createdAt).format('MMM DD, YYYY HH:mm')}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Updated:</Text>
                <br />
                <Text>{dayjs(selectedNews.updatedAt).format('MMM DD, YYYY HH:mm')}</Text>
              </Col>
              {selectedNews.publishedAt && (
                <Col span={12}>
                  <Text type="secondary">Published:</Text>
                  <br />
                  <Text>{dayjs(selectedNews.publishedAt).format('MMM DD, YYYY HH:mm')}</Text>
                </Col>
              )}
              {selectedNews.views !== undefined && (
                <Col span={12}>
                  <Text type="secondary">Views:</Text>
                  <br />
                  <Text>{selectedNews.views}</Text>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

      {/* News Form Modal */}
      <Modal
        title={editingNews ? 'Edit News' : 'Create News'}
        open={newsFormModalVisible}
        onCancel={() => setNewsFormModalVisible(false)}
        footer={null}
        width={isMobile ? '95%' : 700}
        style={isMobile ? { top: 20 } : {}}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          disabled={loading}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter news title' }]}
          >
            <Input placeholder="Enter news title" />
          </Form.Item>

          <Form.Item
            label="Content"
            name="content"
            rules={[{ required: true, message: 'Please enter news content' }]}
          >
            <TextArea 
              rows={6} 
              placeholder="Enter news content" 
              showCount
              maxLength={2000}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  {categories.map(cat => (
                    <Option key={cat.value} value={cat.value}>
                      <Space>
                        {cat.icon}
                        {cat.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Priority"
                name="priority"
                rules={[{ required: true, message: 'Please select priority' }]}
              >
                <Select placeholder="Select priority">
                  {priorities.map(priority => (
                    <Option key={priority.value} value={priority.value}>
                      <Space>
                        {priority.icon}
                        {priority.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  {statuses.map(status => (
                    <Option key={status.value} value={status.value}>
                      <Space>
                        {status.icon}
                        {status.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Pin Article"
                name="isPinned"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="Pinned" 
                  unCheckedChildren="Normal"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Tags"
            name="tags"
          >
            <Select
              mode="tags"
              placeholder="Add tags (press Enter to add)"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setNewsFormModalVisible(false)}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                icon={editingNews ? <EditOutlined /> : <PlusOutlined />}
              >
                {editingNews ? 'Update News' : 'Create News'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default NewsManagementPage;
