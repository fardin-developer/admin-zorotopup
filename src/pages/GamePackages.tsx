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
  Divider,
  Table,
  Dropdown,
  Popconfirm
} from 'antd';
import { 
  ArrowLeftOutlined, 
  DollarOutlined, 
  GiftOutlined, 
  PercentageOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { PageHeader } from '../components';
import { useNavigate, useParams } from 'react-router-dom';

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
  status: string;
  apiMappings: ApiMapping[];
  createdAt: string;
  updatedAt: string;
  __v: number;
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

  useEffect(() => {
    if (gameId) {
      fetchGamePackages();
    }
  }, [gameId]);

  const fetchGamePackages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://game.oneapi.in/api/v1/games/${gameId}/diamond-packs`);
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setPackages(data.diamondPacks);
        setGameData(data.gameData);
        message.success(`Loaded ${data.count} packages successfully`);
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
    // Navigate to edit package page
    navigate(`/games/game/${gameId}/packages/${packageId}/edit`);
  };

  const handleDeletePackage = async (packageId: string) => {
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
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => (
        <div style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '16px' }}>
          {amount} Diamonds
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
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
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
      render: (mappings: ApiMapping[]) => (
        <div>
          {mappings.map((mapping) => (
            <Tag key={mapping._id} color="purple" style={{ marginBottom: 4 }}>
              {mapping.apiProvider.name} (ID: {mapping.productId})
            </Tag>
          ))}
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
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: DiamondPack, b: DiamondPack) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading game packages...</Text>
        </div>
      </div>
    );
  }

  return (
    <>
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
          size="large"
        >
          Back to Games
        </Button>
      </div>

      {gameData && (
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={16} align="middle">
            <Col>
              <Image
                width={80}
                height={80}
                src={gameData.image}
                alt={gameData.name}
                style={{ borderRadius: 8, objectFit: 'cover' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
            </Col>
            <Col flex={1}>
              <Title level={3} style={{ margin: 0 }}>
                {gameData.name}
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Publisher: {gameData.publisher}
              </Text>
              <div style={{ marginTop: 8 }}>
                <Text>Validation Fields: </Text>
                {gameData.validationFields.map((field) => (
                  <Tag key={field} color="blue" style={{ marginRight: 4 }}>
                    {field}
                  </Tag>
                ))}
              </div>
            </Col>
            <Col>
              <Statistic 
                title="Total Packages" 
                value={packages.length} 
                prefix={<GiftOutlined />} 
              />
            </Col>
          </Row>
        </Card>
      )}

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            Diamond Packages ({packages.length})
          </Title>
        </div>
        
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
      </Card>
    </>
  );
};

export default GamePackages; 