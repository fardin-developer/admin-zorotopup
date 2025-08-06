import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Button,
  Image,
  Tag,
  message,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Upload,
  UploadProps,
  UploadFile,
} from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../components';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch, API_ENDPOINTS } from '../utils/auth';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

interface Game {
  _id: string;
  name: string;
  image: string;
  publisher: string;
  productId: string;
  validationFields: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  game_id?: string;
}

interface Product {
  ID: string;
  post_title: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  games: Game[];
}

interface CreateGamePayload {
  name: string;
  publisher: string;
  productId: string;
  image: UploadFile[];
  validationFields: string[];
}

const validationFieldOptions = ['userId', 'serverId', 'region', 'other id'];

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingGame, setDeletingGame] = useState<Game | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchGames();
    fetchProducts();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(API_ENDPOINTS.GAMES_GET_ALL);
      const data: ApiResponse = await response.json();
      if (data.success) {
        setGames(data.games);
        message.success(`Loaded ${data.count} games successfully`);
      } else {
        message.error('Failed to fetch games');
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      message.error('Failed to fetch games');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await authenticatedFetch(API_ENDPOINTS.MOOGOLD_PRODUCTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: 'product/list_product',
          category_id: 50,
        }),
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        message.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to fetch products');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCreateModalVisible(true);
  };

  const handleCreateCancel = () => {
    setCreateModalVisible(false);
    form.resetFields();
  };

  const handleCreateSubmit = async (values: CreateGamePayload) => {
    setCreateLoading(true);
    try {
      const formData = new FormData();

      formData.append('name', values.name);
      formData.append('publisher', values.publisher);
      formData.append('productId', values.productId);
      formData.append(
        'validationFields',
        JSON.stringify(values.validationFields)
      );

      if (values.image && values.image.length > 0 && values.image[0].originFileObj) {
        formData.append('image', values.image[0].originFileObj);
      } else {
        message.error('Please upload a game image.');
        setCreateLoading(false);
        return;
      }

      const response = await authenticatedFetch(API_ENDPOINTS.GAMES_CREATE, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        message.success('Game created successfully!');
        form.resetFields();
        setCreateModalVisible(false);
        await fetchGames();
      } else {
        message.error(data.message || 'Failed to create game');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      message.error('Failed to create game. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditGame = (gameId: string) => {
    const selectedGame = games.find((game) => game._id === gameId);
    if (selectedGame) {
      setEditingGame(selectedGame);
      editForm.setFieldsValue({
        name: selectedGame.name,
        publisher: selectedGame.publisher,
        productId: selectedGame.productId,
        image: [], // Reset file upload field
        validationFields: selectedGame.validationFields,
      });
      setEditModalVisible(true);
    }
  };

  const handleDeleteGame = (gameId: string) => {
    const selectedGame = games.find((game) => game._id === gameId);
    if (selectedGame) {
      setDeletingGame(selectedGame);
      setDeleteModalVisible(true);
      setDeleteConfirmation('');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setDeletingGame(null);
    setDeleteConfirmation('');
  };

  const handleDeleteSubmit = async () => {
    if (!deletingGame || deleteConfirmation !== 'fardin-delete') {
      message.error('Please type "fardin-delete" to confirm deletion');
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await authenticatedFetch(
        API_ENDPOINTS.GAMES_DELETE(deletingGame._id),
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        message.success('Game deleted successfully!');
        setDeleteModalVisible(false);
        setDeletingGame(null);
        setDeleteConfirmation('');
        await fetchGames();
      } else {
        message.error(data.message || 'Failed to delete game');
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      message.error('Failed to delete game. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditSubmit = async (values: CreateGamePayload) => {
    if (!editingGame) return;

    try {
      setEditLoading(true);
      const formData = new FormData();

      formData.append('name', values.name);
      formData.append('publisher', values.publisher);
      formData.append('productId', values.productId);
      formData.append(
        'validationFields',
        JSON.stringify(values.validationFields)
      );

      // Handle image upload - if new file is uploaded, use it; otherwise keep current
      if (values.image && values.image.length > 0 && values.image[0].originFileObj) {
        formData.append('image', values.image[0].originFileObj);
      }
      // If no new image is uploaded, we'll let the backend keep the existing image

      const response = await authenticatedFetch(
        API_ENDPOINTS.GAMES_UPDATE(editingGame._id),
        {
          method: 'PUT',
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        message.success('Game updated successfully!');
        setEditModalVisible(false);
        setEditingGame(null);
        editForm.resetFields();
        await fetchGames();
      } else {
        message.error(data.message || 'Failed to update game');
      }
    } catch (error) {
      console.error('Error updating game:', error);
      message.error('Failed to update game. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleGameClick = (gameId: string) => {
    navigate(`/games/game/${gameId}/packages`);
  };

  const dummyRequest: UploadProps['customRequest'] = ({ onSuccess }) => {
    setTimeout(() => {
      if (onSuccess) {
        onSuccess('ok');
      }
    }, 0);
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };

  return (
    <>
      <PageHeader
        title="Game Management"
        breadcrumbs={[
          { title: 'Games', path: '/games/game' },
          { title: 'Game Management', path: '/games/game' },
        ]}
      />

      <div style={{ marginBottom: 24 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleCreateNew}
        >
          Create New Game
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {loading ? (
          <Col span={24}>
            <Card loading={true} />
          </Col>
        ) : games.length === 0 ? (
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Title level={4}>No games found</Title>
                <Paragraph>Start by creating your first game.</Paragraph>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateNew}
                >
                  Create Your First Game
                </Button>
              </div>
            </Card>
          </Col>
        ) : (
          games.map((game) => (
            <Col xs={24} sm={12} md={8} lg={6} key={game._id}>
              <Card
                hoverable
                style={{ cursor: 'pointer' }}
                onClick={() => handleGameClick(game._id)}
                cover={
                  <div style={{ height: 200, overflow: 'hidden' }}>
                    <Image
                      alt={game.name}
                      src={game.image}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                }
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditGame(game._id);
                    }}
                  >
                    Edit
                  </Button>,
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGame(game._id);
                    }}
                  >
                    Delete
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={
                    <>
                      <Title level={4} style={{ margin: 0 }}>
                        {game.name}
                      </Title>
                      <Text type="secondary">{game.publisher}</Text>
                    </>
                  }
                  description={
                    <div>
                      <Text strong>Validation Fields:</Text>
                      <div style={{ marginTop: 4 }}>
                        {game.validationFields.map((field) => (
                          <Tag key={field} color="blue">
                            {field}
                          </Tag>
                        ))}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <Text strong>Product ID: </Text>
                        <Text code>{game.productId}</Text>
                      </div>
                      {game.game_id && (
                        <div style={{ marginTop: 4 }}>
                          <Text strong>Game ID: </Text>
                          <Text code>{game.game_id}</Text>
                        </div>
                      )}
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Created:{' '}
                          {new Date(game.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Create Game Modal */}
      <Modal
        title="Create New Game"
        open={createModalVisible}
        onCancel={handleCreateCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSubmit}
          initialValues={{ validationFields: ['userId', 'serverId'] }}
        >
          <Form.Item
            label="Game Name"
            name="name"
            rules={[{ required: true }, { min: 2 }]}
          >
            <Input placeholder="e.g., Mobile Legends" size="large" />
          </Form.Item>
          <Form.Item
            label="Publisher"
            name="publisher"
            rules={[{ required: true }, { min: 2 }]}
          >
            <Input placeholder="e.g., Moonton" size="large" />
          </Form.Item>

          <Form.Item
            label="Product ID"
            name="productId"
            rules={[{ required: true, message: 'Please select a product' }]}
          >
            <Select
              placeholder="Select a product"
              size="large"
              loading={productsLoading}
              showSearch
              optionFilterProp="children"
            >
              {products.map((product) => (
                <Option key={product.ID} value={product.ID}>
                  {product.post_title} (ID: {product.ID})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* <Form.Item label="Game Image URL" name="image" rules={[{ required: true }, { type: 'url' }]}>
            <Input placeholder="https://example.com/image.jpg" size="large" />
          </Form.Item> */}

          <Form.Item
            label="Game Image"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: 'Please upload an image' }]}
          >
            <Upload.Dragger
              name="logo"
              customRequest={dummyRequest}
              listType="picture"
              maxCount={1}
              accept="image/*"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single image file. Strictly prohibit from
                uploading company data or other band files
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item label="Validation Fields (Max 3)">
            <Form.List name="validationFields">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...rest }) => (
                    <Space
                      key={key}
                      align="baseline"
                      style={{ display: 'flex', marginBottom: 8 }}
                    >
                      <Form.Item
                        {...rest}
                        name={[name]}
                        rules={[{ required: true }]}
                      >
                        <Select
                          placeholder="Select validation field"
                          size="large"
                          allowClear
                        >
                          {validationFieldOptions.map((option) => (
                            <Option key={option} value={option}>
                              {option}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      disabled={fields.length >= 3}
                      size="large"
                    >
                      Add Validation Field {fields.length >= 3 && '(Max 3)'}
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item style={{ marginTop: 24 }}>
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                loading={createLoading}
                size="large"
              >
                Create Game
              </Button>
              <Button
                onClick={handleCreateCancel}
                disabled={createLoading}
                size="large"
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Game Modal */}
      <Modal
        title="Edit Game"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingGame(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            label="Game Name"
            name="name"
            rules={[{ required: true }, { min: 2 }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            label="Publisher"
            name="publisher"
            rules={[{ required: true }, { min: 2 }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Product ID"
            name="productId"
            rules={[{ required: true, message: 'Please select a product' }]}
          >
            <Select
              placeholder="Select a product"
              size="large"
              loading={productsLoading}
              showSearch
              optionFilterProp="children"
            >
              {products.map((product) => (
                <Option key={product.ID} value={product.ID}>
                  {product.post_title} (ID: {product.ID})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Game Image"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: false, message: 'Upload new image or keep current' }]}
          >
            <Upload.Dragger
              name="logo"
              customRequest={dummyRequest}
              listType="picture"
              maxCount={1}
              accept="image/*"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to upload new image
              </p>
              <p className="ant-upload-hint">
                Leave empty to keep current image
              </p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item label="Validation Fields (Max 3)">
            <Form.List name="validationFields">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...rest }) => (
                    <Space
                      key={key}
                      align="baseline"
                      style={{ display: 'flex', marginBottom: 8 }}
                    >
                      <Form.Item
                        {...rest}
                        name={[name]}
                        rules={[{ required: true }]}
                      >
                        <Select
                          placeholder="Select validation field"
                          size="large"
                          allowClear
                        >
                          {validationFieldOptions.map((option) => (
                            <Option key={option} value={option}>
                              {option}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      disabled={fields.length >= 3}
                      size="large"
                    >
                      Add Validation Field {fields.length >= 3 && '(Max 3)'}
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item style={{ marginTop: 24 }}>
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                loading={editLoading}
                size="large"
              >
                Update Game
              </Button>
              <Button
                onClick={() => setEditModalVisible(false)}
                disabled={editLoading}
                size="large"
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Game Modal */}
      <Modal
        title="Delete Game"
        open={deleteModalVisible}
        onCancel={handleDeleteCancel}
        footer={[
          <Button
            key="cancel"
            onClick={handleDeleteCancel}
            disabled={deleteLoading}
          >
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={deleteLoading}
            disabled={deleteConfirmation !== 'fardin-delete'}
            onClick={handleDeleteSubmit}
          >
            Delete Game
          </Button>,
        ]}
        width={500}
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Are you sure you want to delete this game?</Text>
          <div
            style={{
              marginTop: 8,
              padding: 12,
              backgroundColor: '#f5f5f5',
              borderRadius: 6,
            }}
          >
            <Text strong>Game: </Text>
            <Text>{deletingGame?.name}</Text>
            <br />
            <Text strong>Publisher: </Text>
            <Text>{deletingGame?.publisher}</Text>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Text type="danger" strong>
            ⚠️ This action cannot be undone!
          </Text>
        </div>
        <div>
          <Text>To confirm deletion, please type: </Text>
          <Text code strong>
            fardin-delete
          </Text>
          <Input
            placeholder="Type fardin-delete to confirm"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            style={{ marginTop: 8 }}
            size="large"
          />
        </div>
      </Modal>
    </>
  );
};

export default GamePage;
