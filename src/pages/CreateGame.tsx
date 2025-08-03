import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  message, 
  Select, 
  Space,
  Typography,
  Divider
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { PageHeader } from '../components';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../utils/auth';

const { Title } = Typography;
const { Option } = Select;

interface CreateGamePayload {
  name: string;
  publisher: string;
  image: string;
  validationFields: string[];
}

const CreateGame: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: CreateGamePayload) => {
    try {
      setLoading(true);
      
      const response = await fetch(API_ENDPOINTS.GAMES_CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          publisher: values.publisher,
          image: values.image,
          validationFields: values.validationFields || []
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        message.success('Game created successfully!');
        form.resetFields();
        // Navigate back to games list
        navigate('/games/game');
      } else {
        message.error(data.message || 'Failed to create game');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      message.error('Failed to create game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/games/game');
  };

  // Predefined validation field options
  const validationFieldOptions = [
    'userId',
    'serverId',
    'region',
    'other id'
  ];

  return (
    <>
      <PageHeader
        title="Create New Game"
        breadcrumbs={[
          {
            title: 'Games',
            path: '/games/game',
          },
          {
            title: 'Create Game',
            path: '/games/game/create',
          },
        ]}
      />

      <Card>
        <Title level={3}>Game Information</Title>
        <Divider />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            validationFields: ['userId', 'serverId'] // Default values (max 3)
          }}
        >
          <Form.Item
            label="Game Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter the game name' },
              { min: 2, message: 'Game name must be at least 2 characters' }
            ]}
          >
            <Input 
              placeholder="e.g., Mobile Legends" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Publisher"
            name="publisher"
            rules={[
              { required: true, message: 'Please enter the publisher name' },
              { min: 2, message: 'Publisher name must be at least 2 characters' }
            ]}
          >
            <Input 
              placeholder="e.g., Moonton" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Game Image URL"
            name="image"
            rules={[
              { required: true, message: 'Please enter the image URL' },
              { type: 'url', message: 'Please enter a valid URL' }
            ]}
          >
            <Input 
              placeholder="https://example.com/game-image.jpg" 
              size="large"
            />
          </Form.Item>

          <Form.Item label="Validation Fields (Max 3)">
            <Form.List name="validationFields">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name]}
                        rules={[{ required: true, message: 'Please select a validation field' }]}
                        style={{ flex: 1 }}
                      >
                        <Select 
                          placeholder="Select validation field"
                          size="large"
                          showSearch
                          allowClear
                        >
                          {validationFieldOptions.map(option => (
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
                      size="large"
                      disabled={fields.length >= 4}
                    >
                      Add Validation Field {fields.length >= 4 && '(Max 4)'}
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space size="middle">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
              >
                Create Game
              </Button>
              <Button 
                size="large" 
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Preview Card */}
      <Card title="Preview" style={{ marginTop: 24 }}>
        <Form.Item dependencies={['name', 'publisher', 'image', 'validationFields']}>
          {() => {
            const values = form.getFieldsValue();
            return (
              <div>
                <Title level={4}>API Payload Preview:</Title>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify({
                    name: values.name || 'Mobile Legends',
                    publisher: values.publisher || 'Moonton',
                    image: values.image || 'https://example.com/mlbb.jpg',
                    validationFields: values.validationFields || ['userId', 'serverId']
                  }, null, 2)}
                </pre>
              </div>
            );
          }}
        </Form.Item>
      </Card>
    </>
  );
};

export default CreateGame;