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
  InputNumber,
  Switch,
} from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../components';
import { authenticatedFetch, API_ENDPOINTS } from '../utils/auth';
import type {
  GamingAccountWithSeller,
  CreateGamingAccountPayload,
  GamingAccountApiResponse,
} from '../types';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const currencyOptions = ['INR', 'USD', 'EUR', 'GBP'];

const GamingAccountsPage: React.FC = () => {
  const [gamingAccounts, setGamingAccounts] = useState<GamingAccountWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('user'); // Track user role
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<GamingAccountWithSeller | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<GamingAccountWithSeller | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchGamingAccounts();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      // You can get user role from localStorage or make an API call
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setUserRole(userData.role || 'user');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user');
    }
  };

  const fetchGamingAccounts = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(API_ENDPOINTS.GAMING_ACCOUNTS_GET_ALL);
      const data: GamingAccountApiResponse = await response.json();
      if (data.success && data.gamingIds) {
        setGamingAccounts(data.gamingIds);
      } else {
        message.error('Failed to fetch gaming accounts');
      }
    } catch (error) {
      console.error('Error fetching gaming accounts:', error);
      message.error('Failed to fetch gaming accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    form.resetFields();
    setCreateModalVisible(true);
  };

  const handleCreate = async (values: any) => {
    try {
      setCreateLoading(true);
      
      // Transform form values to match backend structure
      const payload: CreateGamingAccountPayload = {
        game: values.game,
        title: values.title,
        description: values.description,
        price: values.price,
        currency: values.currency || 'INR',
        highlights: {
          collectorRank: values.collectorRank,
          winrate: values.winrate,
          skinsOwned: values.skinsOwned,
          highestRank: values.highestRank,
          loginInfo: values.loginInfo,
          server: values.server,
        },
        skins: values.skins || [],
        images: values.images?.map((file: any) => file.url || file.thumbUrl) || [],
        tags: values.tags || [],
      };
      
      const response = await authenticatedFetch(API_ENDPOINTS.GAMING_ACCOUNTS_CREATE, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data: GamingAccountApiResponse = await response.json();
      if (data.success) {
        message.success('Gaming account created successfully');
        setCreateModalVisible(false);
        fetchGamingAccounts();
      } else {
        message.error(data.error || 'Failed to create gaming account');
      }
    } catch (error) {
      console.error('Error creating gaming account:', error);
      message.error('Failed to create gaming account');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (account: GamingAccountWithSeller) => {
    setEditingAccount(account);
    editForm.setFieldsValue({
      game: account.game,
      title: account.title,
      description: account.description,
      price: account.price,
      currency: account.currency,
      collectorRank: account.highlights?.collectorRank || '',
      winrate: account.highlights?.winrate || 0,
      skinsOwned: account.highlights?.skinsOwned || 0,
      highestRank: account.highlights?.highestRank || '',
      loginInfo: account.highlights?.loginInfo || '',
      server: account.highlights?.server || '',
      skins: account.skins || [],
      tags: account.tags || [],
      isSold: account.isSold || false,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async (values: any) => {
    if (!editingAccount) return;
    try {
      setEditLoading(true);
      
      // Transform form values to match backend structure
      const payload: any = {
        game: values.game,
        title: values.title,
        description: values.description,
        price: values.price,
        currency: values.currency || 'INR',
        highlights: {
          collectorRank: values.collectorRank,
          winrate: values.winrate,
          skinsOwned: values.skinsOwned,
          highestRank: values.highestRank,
          loginInfo: values.loginInfo,
          server: values.server,
        },
        skins: values.skins || [],
        tags: values.tags || [],
      };

      // Only include isSold if user is admin
      if (userRole === 'admin' && values.isSold !== undefined) {
        payload.isSold = values.isSold;
      }
      
      const response = await authenticatedFetch(
        API_ENDPOINTS.GAMING_ACCOUNTS_UPDATE(editingAccount._id),
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      );
      const data: GamingAccountApiResponse = await response.json();
      if (data.success) {
        message.success('Gaming account updated successfully');
        setEditModalVisible(false);
        fetchGamingAccounts();
      } else {
        message.error(data.error || 'Failed to update gaming account');
      }
    } catch (error) {
      console.error('Error updating gaming account:', error);
      message.error('Failed to update gaming account');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (account: GamingAccountWithSeller) => {
    setDeletingAccount(account);
    setDeleteConfirmation('');
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!deletingAccount || deleteConfirmation !== deletingAccount.title) {
      message.error('Please enter the correct title to confirm deletion');
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await authenticatedFetch(
        API_ENDPOINTS.GAMING_ACCOUNTS_DELETE(deletingAccount._id),
        {
          method: 'DELETE',
        }
      );
      const data: GamingAccountApiResponse = await response.json();
      if (data.success) {
        message.success('Gaming account deleted successfully');
        setDeleteModalVisible(false);
        fetchGamingAccounts();
      } else {
        message.error(data.error || 'Failed to delete gaming account');
      }
    } catch (error) {
      console.error('Error deleting gaming account:', error);
      message.error('Failed to delete gaming account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'sold':
        return 'blue';
      case 'inactive':
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <>
      <PageHeader
        title="Gaming Accounts Management"
        breadcrumbs={[
          { title: 'Gaming Accounts', path: '/gaming-accounts' },
          { title: 'Gaming Accounts Management', path: '/gaming-accounts' },
        ]}
      />

      <div style={{ marginBottom: 24 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleCreateNew}
        >
          Create New Gaming Account
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {loading ? (
          <Col span={24}>
            <Card loading={true} />
          </Col>
        ) : gamingAccounts.length === 0 ? (
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Title level={4}>No gaming accounts found</Title>
                <Paragraph>Start by creating your first gaming account listing.</Paragraph>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateNew}
                >
                  Create Your First Gaming Account
                </Button>
              </div>
            </Card>
          </Col>
        ) : (
          gamingAccounts.map((account) => (
            <Col xs={24} sm={12} md={8} lg={6} key={account._id}>
              <Card
                hoverable
                cover={
                  account.images && account.images.length > 0 ? (
                    <Image
                      alt={account.title}
                      src={account.images[0]}
                      style={{ height: 200, objectFit: 'cover' }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                    />
                  ) : (
                    <div
                      style={{
                        height: 200,
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                      }}
                    >
                      No Image
                    </div>
                  )
                }
                actions={[
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      // Navigate to view details
                      message.info('View details functionality coming soon');
                    }}
                  />,
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(account)}
                    disabled={account.isSold && userRole !== 'admin'}
                    title={account.isSold && userRole !== 'admin' ? 'Cannot edit sold account' : 'Edit account'}
                  />,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(account)}
                    disabled={account.isSold}
                    title={account.isSold ? 'Cannot delete sold account' : 'Delete account'}
                  />,
                ]}
              >
                <Card.Meta
                  title={
                    <div>
                      <Text strong>{account.title}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {account.game}
                      </Text>
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                          {formatPrice(account.price, account.currency)}
                        </Text>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Tag color={getStatusColor(account.status)}>
                          {account.status.toUpperCase()}
                        </Tag>
                        {account.isSold && <Tag color="blue">SOLD</Tag>}
                      </div>
                      {account.tags && account.tags.length > 0 && (
                        <div>
                          {account.tags.slice(0, 2).map((tag, index) => (
                            <Tag key={index}>
                              {tag}
                            </Tag>
                          ))}
                          {account.tags.length > 2 && (
                            <Tag>+{account.tags.length - 2}</Tag>
                          )}
                        </div>
                      )}
                      <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                        <Text>Seller: {account.sellerId.name}</Text>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Create Modal */}
      <Modal
        title="Create New Gaming Account"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ currency: 'INR' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="game"
                label="Game"
                rules={[{ required: true, message: 'Please enter the game name' }]}
              >
                <Input placeholder="e.g., PUBG Mobile, Free Fire" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: 'Please enter the title' }]}
              >
                <Input placeholder="e.g., Level 50 Account with Rare Skins" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Describe the gaming account..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price"
                rules={[
                  { required: true, message: 'Please enter the price' },
                  { type: 'number', min: 0.01, message: 'Price must be greater than 0' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  min={0.01}
                  step={0.01}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="currency"
                label="Currency"
                rules={[{ required: true, message: 'Please select currency' }]}
              >
                <Select>
                  {currencyOptions.map((currency) => (
                    <Option key={currency} value={currency}>
                      {currency}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="collectorRank"
                label="Collector Rank"
              >
                <Input placeholder="e.g., Master" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="winrate"
                label="Win Rate (%)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="75"
                  min={0}
                  max={100}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="skinsOwned"
                label="Skins Owned"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="25"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="highestRank"
                label="Highest Rank"
              >
                <Input placeholder="e.g., Mythic Glory" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="loginInfo"
                label="Login Method"
              >
                <Input placeholder="e.g., Facebook, Google" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="server"
                label="Server"
              >
                <Input placeholder="e.g., SEA, NA" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Skins/Items">
            <Form.List name="skins">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'hero']}
                        rules={[{ required: true, message: 'Missing hero name' }]}
                      >
                        <Input placeholder="Hero name" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'skinName']}
                        rules={[{ required: true, message: 'Missing skin name' }]}
                      >
                        <Input placeholder="Skin name" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'rarity']}
                      >
                        <Input placeholder="Rarity" />
                      </Form.Item>
                      <Button onClick={() => remove(name)} danger>
                        Remove
                      </Button>
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block>
                      + Add Skin
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select
              mode="tags"
              placeholder="Add tags for better searchability"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="images"
            label="Images"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              listType="picture-card"
              beforeUpload={() => false}
              maxCount={5}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={createLoading}>
                Create Gaming Account
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Gaming Account"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="game"
                label="Game"
                rules={[{ required: true, message: 'Please enter the game name' }]}
              >
                <Input placeholder="e.g., PUBG Mobile, Free Fire" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: 'Please enter the title' }]}
              >
                <Input placeholder="e.g., Level 50 Account with Rare Skins" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Describe the gaming account..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price"
                rules={[
                  { required: true, message: 'Please enter the price' },
                  { type: 'number', min: 0.01, message: 'Price must be greater than 0' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  min={0.01}
                  step={0.01}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="currency"
                label="Currency"
                rules={[{ required: true, message: 'Please select currency' }]}
              >
                <Select>
                  {currencyOptions.map((currency) => (
                    <Option key={currency} value={currency}>
                      {currency}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="collectorRank"
                label="Collector Rank"
              >
                <Input placeholder="e.g., Master" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="winrate"
                label="Win Rate (%)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="75"
                  min={0}
                  max={100}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="skinsOwned"
                label="Skins Owned"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="25"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="highestRank"
                label="Highest Rank"
              >
                <Input placeholder="e.g., Mythic Glory" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="loginInfo"
                label="Login Method"
              >
                <Input placeholder="e.g., Facebook, Google" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="server"
                label="Server"
              >
                <Input placeholder="e.g., SEA, NA" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Skins/Items">
            <Form.List name="skins">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'hero']}
                        rules={[{ required: true, message: 'Missing hero name' }]}
                      >
                        <Input placeholder="Hero name" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'skinName']}
                        rules={[{ required: true, message: 'Missing skin name' }]}
                      >
                        <Input placeholder="Skin name" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'rarity']}
                      >
                        <Input placeholder="Rarity" />
                      </Form.Item>
                      <Button onClick={() => remove(name)} danger>
                        Remove
                      </Button>
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block>
                      + Add Skin
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select
              mode="tags"
              placeholder="Add tags for better searchability"
              style={{ width: '100%' }}
            />
          </Form.Item>

          {userRole === 'admin' && (
            <Form.Item
              name="isSold"
              label="Sold Status"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Sold"
                unCheckedChildren="Available"
              />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={editLoading}>
                Update Gaming Account
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Gaming Account"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={null}
      >
        <div>
          <Paragraph>
            Are you sure you want to delete this gaming account? This action cannot be undone.
          </Paragraph>
          <Paragraph strong>
            Gaming Account: {deletingAccount?.title}
          </Paragraph>
          <Paragraph>
            To confirm deletion, please type the title exactly as shown above:
          </Paragraph>
          <Input
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Enter the title to confirm"
            style={{ marginBottom: 16 }}
          />
          <Space>
            <Button
              type="primary"
              danger
              onClick={confirmDelete}
              loading={deleteLoading}
              disabled={deleteConfirmation !== deletingAccount?.title}
            >
              Delete Gaming Account
            </Button>
            <Button onClick={() => setDeleteModalVisible(false)}>
              Cancel
            </Button>
          </Space>
        </div>
      </Modal>
    </>
  );
};

export default GamingAccountsPage;
