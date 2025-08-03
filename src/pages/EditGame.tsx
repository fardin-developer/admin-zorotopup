import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Form, 
  Input, 
  Select, 
  Tag, 
  Upload, 
  Image, 
  message, 
  Modal, 
  Spin 
} from 'antd';
import { 
  SaveOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { PageHeader } from '../components';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../utils/auth';

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

interface Game {
  _id: string;
  name: string;
  image: string;
  publisher: string;
  validationFields: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  game_id?: string;
}

interface ApiResponse {
  success: boolean;
  game: Game;
}

interface GameFormData {
  name: string;
  publisher: string;
  validationFields: string[];
  image?: any; // Changed from File to any to handle upload component
}

const EditGamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [newValidationField, setNewValidationField] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null); // Add state to track uploaded file

  // Predefined validation field options
  const commonValidationFields = [
    'userId',
    'serverId',
    'playerId',
    'characterId',
    'guildId',
    'zoneId',
    'email',
    'username'
  ];

  useEffect(() => {
    if (id) {
      fetchGame();
    }
  }, [id]);

  const fetchGame = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.GAMES_GET_BY_ID(id!));
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setGame(data.game);
        console.log(data.game);
        
        setImagePreview(data.game.image);
        // Set form values
        form.setFieldsValue({
          name: data.game.name,
          publisher: data.game.publisher,
          validationFields: data.game.validationFields,
        });
      } else {
        message.error('Failed to fetch game details');
        navigate('/games/game');
      }
    } catch (error) {
      console.error('Error fetching game:', error);
      message.error('Failed to fetch game details');
      navigate('/games/game');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values: GameFormData) => {
    try {
      setUpdating(true);
      
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('publisher', values.publisher);
      formData.append('validationFields', JSON.stringify(values.validationFields));
      
      // Use the uploadedFile state instead of values.image
      if (uploadedFile) {
        formData.append('image', uploadedFile);
      }

      // Fixed: Use API_ENDPOINTS.GAMES_UPDATE instead of direct URL
      const response = await fetch(API_ENDPOINTS.GAMES_UPDATE(id!), {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        message.success('Game updated successfully');
        setUploadedFile(null); // Reset uploaded file
        fetchGame(); // Refresh the data
      } else {
        message.error('Failed to update game');
      }
    } catch (error) {
      console.error('Error updating game:', error);
      message.error('Failed to update game');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    confirm({
      title: 'Delete Game',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${game?.name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: performDelete,
    });
  };

  const performDelete = async () => {
    try {
      setDeleting(true);
      
      const response = await fetch(API_ENDPOINTS.GAMES_DELETE(id!), {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        message.success('Game deleted successfully');
        navigate('/games/game');
      } else {
        message.error('Failed to delete game');
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      message.error('Failed to delete game');
    } finally {
      setDeleting(false);
    }
  };

  // Fixed image change handler
  const handleImageChange = (info: any) => {
    console.log('Upload info:', info); // Debug log
    
    if (info.fileList.length > 0) {
      const file = info.fileList[0];
      const actualFile = file.originFileObj || file;
      
      if (actualFile instanceof File) {
        setUploadedFile(actualFile); // Store the actual file
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(actualFile);
      }
    } else {
      // File was removed
      setUploadedFile(null);
      setImagePreview(game?.image || '');
    }
  };

  const addValidationField = () => {
    if (newValidationField.trim()) {
      const currentFields = form.getFieldValue('validationFields') || [];
      if (!currentFields.includes(newValidationField.trim())) {
        form.setFieldsValue({
          validationFields: [...currentFields, newValidationField.trim()]
        });
        setNewValidationField('');
      } else {
        message.warning('This validation field already exists');
      }
    }
  };

  const removeValidationField = (fieldToRemove: string) => {
    const currentFields = form.getFieldValue('validationFields') || [];
    form.setFieldsValue({
      validationFields: currentFields.filter((field: string) => field !== fieldToRemove)
    });
  };

  // Custom upload props
  const uploadProps = {
    name: 'image',
    listType: 'picture' as const,
    maxCount: 1,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return false;
      }
      return false; // Prevent auto upload
    },
    onChange: handleImageChange,
    onRemove: () => {
      setUploadedFile(null);
      setImagePreview(game?.image || '');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!game) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Title level={4}>Game not found</Title>
        <Button onClick={() => navigate('/games/game')}>Back to Games</Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Edit Game"
        breadcrumbs={[
          {
            title: 'Games',
            path: '/games/game',
          },
          {
            title: 'Game Management',
            path: '/games/game',
          },
          {
            title: 'Edit Game',
            path: `/games/game/edit/${id}`,
          },
        ]}
      />

      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/games/game')}
        >
          Back to Games
        </Button>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          initialValues={{
            name: game.name,
            publisher: game.publisher,
            validationFields: game.validationFields,
          }}
        >
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Left Column - Form Fields */}
            <div style={{ flex: '1', minWidth: '300px' }}>
              <Form.Item
                label="Game Name"
                name="name"
                rules={[{ required: true, message: 'Please enter game name' }]}
              >
                <Input size="large" placeholder="Enter game name" />
              </Form.Item>

              <Form.Item
                label="Publisher"
                name="publisher"
                rules={[{ required: true, message: 'Please enter publisher name' }]}
              >
                <Input size="large" placeholder="Enter publisher name" />
              </Form.Item>

              <Form.Item
                label="Validation Fields"
                name="validationFields"
              >
                <Select
                  mode="multiple"
                  size="large"
                  placeholder="Select validation fields"
                  style={{ width: '100%' }}
                >
                  {commonValidationFields.map(field => (
                    <Option key={field} value={field}>
                      {field}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Add Custom Validation Field */}
              <div style={{ marginBottom: 16 }}>
                <Text strong>Add Custom Validation Field:</Text>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <Input
                    placeholder="Enter custom field name"
                    value={newValidationField}
                    onChange={(e) => setNewValidationField(e.target.value)}
                    onPressEnter={addValidationField}
                  />
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={addValidationField}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Display Current Validation Fields */}
              <div style={{ marginBottom: 16 }}>
                <Text strong>Current Validation Fields:</Text>
                <div style={{ marginTop: '8px' }}>
                  {form.getFieldValue('validationFields')?.map((field: string) => (
                    <Tag
                      key={field}
                      closable
                      color="blue"
                      onClose={() => removeValidationField(field)}
                      style={{ marginRight: 4, marginBottom: 4 }}
                    >
                      {field}
                    </Tag>
                  ))}
                </div>
              </div>

              <Form.Item
                label="Game Image"
                name="image"
              >
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>
                    {uploadedFile ? 'Change Image' : 'Upload New Image'}
                  </Button>
                </Upload>
                {uploadedFile && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="success">New image selected: {uploadedFile.name}</Text>
                  </div>
                )}
              </Form.Item>
            </div>

            {/* Right Column - Image Preview */}
            <div style={{ flex: '0 0 300px', minWidth: '300px' }}>
              <div>
                <Text strong>{uploadedFile ? 'New Image Preview:' : 'Current Image:'}</Text>
                <div style={{ marginTop: '8px', border: '1px solid #d9d9d9', borderRadius: '6px', overflow: 'hidden' }}>
                  <Image
                    src={imagePreview}
                    alt={game.name}
                    width="100%"
                    height={200}
                    style={{ objectFit: 'cover' }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                  />
                </div>
                
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                  <Text strong>Game Details:</Text>
                  <div style={{ marginTop: '8px' }}>
                    <div><Text type="secondary">ID:</Text> <Text code>{game._id}</Text></div>
                    {game.game_id && (
                      <div><Text type="secondary">Game ID:</Text> <Text code>{game.game_id}</Text></div>
                    )}
                    <div><Text type="secondary">Created:</Text> {new Date(game.createdAt).toLocaleDateString()}</div>
                    <div><Text type="secondary">Updated:</Text> {new Date(game.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              size="large"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete Game
            </Button>
            
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              htmlType="submit"
              loading={updating}
            >
              Update Game
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
};

export default EditGamePage;