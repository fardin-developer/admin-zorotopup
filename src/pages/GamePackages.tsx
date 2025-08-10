import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Row, 
  Col, 
  Image, 
  Tag, 
  message,
  Spin,
  Statistic,
  Space,
  Button,
  Table,
  Popconfirm,
  Drawer,
  List,
  Avatar,
  Divider
} from 'antd';
import { 
  ArrowLeftOutlined, 
  GiftOutlined, 
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../components';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../utils/auth';

const { Title, Paragraph, Text } = Typography;

interface ApiProvider {
  _id: string;
  name: string;
  apiUrl: string;
  description: string;
}

interface ApiMapping {
  apiProvider: ApiProvider;
  productId: string;
  _id: string;
}

interface DiamondPack {
  _id: string;
  game: string;
  amount: number;
  commission: number;
  cashback: number;
  logo: string;
  description: string;
  status?: string;
  apiMappings?: ApiMapping[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface GameData {
  _id: string;
  name: string;
  image: string;
  publisher: string;
  validationFields: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  count: number;
  diamondPacks: DiamondPack[];
  gameData: GameData;
}

const GamePackages: React.FC = () => {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const [packages, setPackages] = useState<DiamondPack[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<DiamondPack | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (gameId) {
      fetchGamePackages();
    }
  }, [gameId]);

  const fetchGamePackages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/games/${gameId}/diamond-packs`);
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setPackages(data.diamondPacks);
        setGameData(data.gameData);
      } else {
        message.error('Failed to fetch game packages');
      }
    } catch (error) {
      console.error('Error fetching game packages:', error);
      message.error('Failed to fetch game packages');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToGames = () => {
    navigate('/games/game');
  };

  const handleEditPackage = (packageId: string) => {
    navigate(`/games/game/${gameId}/packages/${packageId}/edit`);
  };

  const handleDeletePackage = async (packageId: string) => {
    console.log('Deleting package:', packageId);
    try {
      // TODO: Implement delete API call
      message.success('Package deleted successfully');
      // Refresh the packages list
      await fetchGamePackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      message.error('Failed to delete package');
    }
  };

  const handleViewDetails = (record: DiamondPack) => {
    setSelectedPackage(record);
    setDrawerVisible(true);
  };

  // Mobile Card Component for better mobile experience
  const PackageCard: React.FC<{ package: DiamondPack }> = ({ package: pkg }) => (
    <Card
      style={{ marginBottom: 16 }}
      actions={[
        <Button
          key="view"
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(pkg)}
        >
          Details
        </Button>,
        <Button
          key="edit"
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEditPackage(pkg._id)}
        >
          Edit
        </Button>,
        <Popconfirm
          key="delete"
          title="Delete Package"
          description="Are you sure you want to delete this package?"
          onConfirm={() => handleDeletePackage(pkg._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
          >
            Delete
          </Button>
        </Popconfirm>
      ]}
    >
      <Row gutter={[12, 12]} align="middle">
        <Col xs={6} sm={4}>
          <Image
            width={50}
            height={50}
            src={pkg.logo}
            alt={`${pkg.amount} Diamonds`}
            style={{ borderRadius: 8, objectFit: 'cover' }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        </Col>
        <Col xs={18} sm={20}>
          <div>
            <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
              {pkg.description}
            </Title>
            <Space wrap size="small">
              <Tag color="green">Commission: {pkg.commission}%</Tag>
              <Tag color="blue">Cashback: {pkg.cashback}%</Tag>
              <Tag color={pkg.status === 'active' ? 'green' : 'red'}>
                {pkg.status ? pkg.status.toUpperCase() : 'UNKNOWN'}
              </Tag>
            </Space>
          </div>
        </Col>
      </Row>
      {pkg.apiMappings && pkg.apiMappings.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Text strong style={{ fontSize: '12px' }}>API Providers:</Text>
          <div style={{ marginTop: 4 }}>
            {pkg.apiMappings.map((mapping) => (
              <Tag key={mapping._id} color="purple" style={{ marginBottom: 4 }}>
                {mapping.apiProvider.name}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </Card>
  );

  // Desktop Table Columns
  const columns = [
    {
      title: 'Package',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      render: (logo: string, record: DiamondPack) => (
        <Image
          width={50}
          height={50}
          src={logo}
          alt={`${record.amount} Diamonds`}
          style={{ borderRadius: 8, objectFit: 'cover' }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
        />
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'description',
      key: 'description',
      width: 120,
      render: (description: string) => (
        <div style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '16px' }}>
          {description}
        </div>
      ),
      sorter: (a: DiamondPack, b: DiamondPack) => a.amount - b.amount,
    },
    {
      title: 'Commission',
      dataIndex: 'commission',
      key: 'commission',
      width: 100,
      render: (commission: number) => (
        <Tag color="green">{commission}%</Tag>
      ),
      sorter: (a: DiamondPack, b: DiamondPack) => a.commission - b.commission,
    },
    {
      title: 'Cashback',
      dataIndex: 'cashback',
      key: 'cashback',
      width: 100,
      render: (cashback: number) => (
        <Tag color="blue">{cashback}%</Tag>
      ),
      sorter: (a: DiamondPack, b: DiamondPack) => a.cashback - b.cashback,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string | undefined) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status ? status.toUpperCase() : 'UNKNOWN'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value: any, record: DiamondPack) => record.status === value,
    },
    {
      title: 'API Providers',
      dataIndex: 'apiMappings',
      key: 'apiMappings',
      width: 200,
      render: (mappings: ApiMapping[] | undefined) => (
        <div>
          {mappings && mappings.length > 0 ? (
            mappings.map((mapping) => (
              <Tag key={mapping._id} color="purple" style={{ marginBottom: 4 }}>
                {mapping.apiProvider.name} (ID: {mapping.productId})
              </Tag>
            ))
          ) : (
            <Text type="secondary">No API mappings</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => (
        <span>{description || 'No description'}</span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string | undefined) => date ? new Date(date).toLocaleDateString() : 'N/A',
      sorter: (a: DiamondPack, b: DiamondPack) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: DiamondPack) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditPackage(record._id)}
            title="Edit Package"
          />
          <Popconfirm
            title="Delete Package"
            description="Are you sure you want to delete this package?"
            onConfirm={() => handleDeletePackage(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              title="Delete Package"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: isMobile ? '50px 16px' : '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading game packages...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '0 8px' : '0' }}>
      <PageHeader
        title={gameData ? `${gameData.name} - Diamond Packages` : 'Game Packages'}
        breadcrumbs={[
          {
            title: 'Games',
            path: '/games/game',
          },
          {
            title: gameData?.name || 'Game',
            path: `/games/game/${gameId}/packages`,
          },
        ]}
      />
      
      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBackToGames}
          size={isMobile ? "middle" : "large"}
          block={isMobile}
        >
          Back to Games
        </Button>
      </div>

      {gameData && (
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[12, 16]} align="middle">
            <Col xs={24} sm={4} md={3}>
              <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                <Image
                  width={isMobile ? 60 : 80}
                  height={isMobile ? 60 : 80}
                  src={gameData.image}
                  alt={gameData.name}
                  style={{ borderRadius: 8, objectFit: 'cover' }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                />
              </div>
            </Col>
            <Col xs={24} sm={14} md={16}>
              <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                <Title level={3} style={{ margin: '0 0 8px 0', fontSize: isMobile ? '18px' : '24px' }}>
                  {gameData.name}
                </Title>
                <Text type="secondary" style={{ fontSize: isMobile ? 14 : 16 }}>
                  Publisher: {gameData.publisher}
                </Text>
                <div style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: isMobile ? 12 : 14 }}>Validation Fields: </Text>
                  {gameData.validationFields.map((field) => (
                    <Tag key={field} color="blue" style={{ marginRight: 4, marginBottom: 4 }}>
                      {field}
                    </Tag>
                  ))}
                </div>
              </div>
            </Col>
            <Col xs={24} sm={6} md={5}>
              <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
                <Statistic 
                  title="Total Packages" 
                  value={packages.length} 
                  prefix={<GiftOutlined />}
                  valueStyle={{ fontSize: isMobile ? '20px' : '24px' }}
                />
              </div>
            </Col>
          </Row>
        </Card>
      )}

      <Card>
        <div style={{ 
          marginBottom: 16, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 12 : 0
        }}>
          <Title level={4} style={{ margin: 0, fontSize: isMobile ? '16px' : '18px' }}>
            Diamond Packages ({packages.length})
          </Title>
        </div>
        
        {isMobile ? (
          // Mobile Card Layout
          <div>
            {packages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <Title level={4} style={{ fontSize: '16px' }}>No packages found</Title>
                <Paragraph style={{ fontSize: '14px' }}>This game doesn't have any diamond packages yet.</Paragraph>
              </div>
            ) : (
              packages.map((pkg) => (
                <PackageCard key={pkg._id} package={pkg} />
              ))
            )}
          </div>
        ) : (
          // Desktop Table Layout
          <Table
            columns={columns}
            dataSource={packages}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} packages`,
            }}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Title level={4}>No packages found</Title>
                  <Paragraph>This game doesn't have any diamond packages yet.</Paragraph>
                </div>
              ),
            }}
          />
        )}
      </Card>

      {/* Package Details Drawer for Mobile */}
      <Drawer
        title="Package Details"
        placement="bottom"
        height="80%"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        style={{
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        {selectedPackage && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Image
                width={80}
                height={80}
                src={selectedPackage.logo}
                alt={selectedPackage.description}
                style={{ borderRadius: 8, objectFit: 'cover' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
              <Title level={4} style={{ marginTop: 16, fontSize: '18px' }}>
                {selectedPackage.description}
              </Title>
            </div>

            <List
              size="small"
              dataSource={[
                { label: 'Amount', value: selectedPackage.amount },
                { label: 'Commission', value: `${selectedPackage.commission}%` },
                { label: 'Cashback', value: `${selectedPackage.cashback}%` },
                { label: 'Status', value: selectedPackage.status?.toUpperCase() || 'UNKNOWN' },
                { label: 'Created', value: selectedPackage.createdAt ? new Date(selectedPackage.createdAt).toLocaleDateString() : 'N/A' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text strong>{item.label}</Text>}
                    description={item.value}
                  />
                </List.Item>
              )}
            />

            {selectedPackage.apiMappings && selectedPackage.apiMappings.length > 0 && (
              <>
                <Divider />
                <Title level={5} style={{ fontSize: '16px' }}>API Providers</Title>
                <List
                  size="small"
                  dataSource={selectedPackage.apiMappings}
                  renderItem={(mapping) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar style={{ backgroundColor: '#722ed1' }}>{mapping.apiProvider.name.charAt(0)}</Avatar>}
                        title={mapping.apiProvider.name}
                        description={`Product ID: ${mapping.productId}`}
                      />
                    </List.Item>
                  )}
                />
              </>
            )}

            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setDrawerVisible(false);
                  handleEditPackage(selectedPackage._id);
                }}
                block
              >
                Edit Package
              </Button>
              <Popconfirm
                title="Delete Package"
                description="Are you sure you want to delete this package?"
                onConfirm={() => {
                  setDrawerVisible(false);
                  handleDeletePackage(selectedPackage._id);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  block
                >
                  Delete
                </Button>
              </Popconfirm>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default GamePackages;