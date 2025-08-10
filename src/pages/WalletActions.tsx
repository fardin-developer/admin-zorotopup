import React, { useState } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Form,
  Input,
  InputNumber,

  Button,
  message,
  Alert,
  Divider,
  Space,
  Avatar,
  Tag,
  Steps,
  Tooltip,
  Modal,
  List,
} from 'antd';
import {
  WalletOutlined,
  GiftOutlined,
  PlusCircleOutlined,
  PhoneOutlined,
  DollarOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../components';
import { authenticatedFetch, API_ENDPOINTS } from '../utils/auth';

const { Title, Text } = Typography;
const { Step } = Steps;

// Type definitions
interface WalletCreditRequest {
  phone: string;
  amount: number;
  creditType: 'reward' | 'add_balance';
  utr: string;
}

interface WalletCreditResponse {
  success: boolean;
  message: string;
  data?: {
    transactionId: string;
    newBalance: number;
    creditedAmount: number;
  };
}

interface RecentTransaction {
  id: string;
  phone: string;
  amount: number;
  type: 'reward' | 'add_balance';
  utr: string;
  timestamp: string;
  status: 'success' | 'failed';
}

const WalletActionsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedCreditType, setSelectedCreditType] = useState<string | null>(null);
  const [recentTransactions] = useState<RecentTransaction[]>([
    {
      id: '1',
      phone: '9876543210',
      amount: 100,
      type: 'reward',
      utr: 'UTR123456789',
      timestamp: '2024-01-15 10:30:00',
      status: 'success'
    },
    {
      id: '2',
      phone: '9123456789',
      amount: 500,
      type: 'add_balance',
      utr: 'UTR987654321',
      timestamp: '2024-01-15 09:15:00',
      status: 'success'
    }
  ]);

  // Check if mobile on resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync form value with local state
  React.useEffect(() => {
    const currentValue = form.getFieldValue('creditType');
    if (currentValue && currentValue !== selectedCreditType) {
      setSelectedCreditType(currentValue);
    }
  }, [form, selectedCreditType]);

  const creditTypes = [
    {
      value: 'reward',
      label: 'Credit Reward',
      icon: <GiftOutlined />,
      description: 'Reward credits for user achievements, referrals, or promotions',
      color: '#52c41a',
      bgColor: '#f6ffed'
    },
    {
      value: 'add_balance',
      label: 'Add Balance',
      icon: <PlusCircleOutlined />,
      description: 'Add balance to user wallet for purchases or top-ups',
      color: '#1890ff',
      bgColor: '#f0f8ff'
    }
  ];

  const handleSubmit = async (values: WalletCreditRequest) => {
    try {
      setLoading(true);
      setCurrentStep(1);

      const response = await authenticatedFetch(API_ENDPOINTS.ADMIN_CREDIT_WALLET, {
        method: 'POST',
        body: JSON.stringify(values)
      });

      const result: WalletCreditResponse = await response.json();

      if (result.success) {
        setCurrentStep(2);
        setSuccessData(result.data);
        message.success('Wallet credited successfully!');
        form.resetFields();
        setSelectedCreditType(null);
        
        // Show success modal
        setTimeout(() => {
          setIsModalVisible(true);
          setCurrentStep(0);
        }, 1000);
      } else {
        setCurrentStep(0);
        message.error(result.message || 'Failed to credit wallet');
      }
    } catch (error) {
      setCurrentStep(0);
      console.error('Error crediting wallet:', error);
      message.error('Error crediting wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validatePhoneNumber = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Phone number is required'));
    }
    if (!/^[6-9]\d{9}$/.test(value)) {
      return Promise.reject(new Error('Please enter a valid 10-digit Indian mobile number'));
    }
    return Promise.resolve();
  };

  const validateUTR = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('UTR number is required'));
    }
    if (value.length < 6) {
      return Promise.reject(new Error('UTR should be at least 6 characters long'));
    }
    return Promise.resolve();
  };

  const getTypeConfig = (type: string) => {
    return creditTypes.find(t => t.value === type);
  };

  const handleCreditTypeSelect = (typeValue: string) => {
    setSelectedCreditType(typeValue);
    form.setFieldsValue({ creditType: typeValue });
    // Force form re-render to update validation
    form.validateFields(['creditType']);
  };

  const CreditTypeCard: React.FC<{ type: any; selected: boolean; onClick: () => void }> = ({ type, selected, onClick }) => (
    <Card
      hoverable
      size="small"
      style={{
        border: selected ? `3px solid ${type.color}` : '1px solid #d9d9d9',
        backgroundColor: selected ? type.bgColor : 'white',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: selected ? `0 8px 24px ${type.color}20` : '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'visible'
      }}
      onClick={onClick}
    >
      {/* Selected Indicator */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: type.color,
            borderRadius: '50%',
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <CheckCircleOutlined style={{ color: 'white', fontSize: '14px' }} />
        </div>
      )}
      
      <div style={{ textAlign: 'center', padding: isMobile ? '8px' : '16px' }}>
        <Avatar
          size={isMobile ? 40 : 56}
          style={{ 
            backgroundColor: selected ? type.color : `${type.color}20`,
            border: selected ? `3px solid ${type.color}` : `2px solid ${type.color}40`,
            marginBottom: 12,
            transition: 'all 0.3s ease'
          }}
          icon={React.cloneElement(type.icon, { 
            style: { 
              color: selected ? 'white' : type.color,
              fontSize: selected ? (isMobile ? '18px' : '24px') : (isMobile ? '16px' : '20px')
            } 
          })}
        />
        <Title 
          level={isMobile ? 5 : 4} 
          style={{ 
            margin: '8px 0 4px 0', 
            color: selected ? type.color : '#666',
            fontWeight: selected ? 'bold' : 'normal',
            transition: 'all 0.3s ease'
          }}
        >
          {type.label}
          {selected && (
            <span style={{ 
              marginLeft: 8, 
              fontSize: '12px', 
              color: type.color,
              fontWeight: 'bold'
            }}>
              ✓ SELECTED
            </span>
          )}
        </Title>
        <Text 
          type="secondary" 
          style={{ 
            fontSize: isMobile ? '11px' : '12px',
            color: selected ? type.color : '#999',
            fontWeight: selected ? '500' : 'normal'
          }}
        >
          {type.description}
        </Text>
      </div>
    </Card>
  );

  const ProcessSteps = () => (
    <Steps
      current={currentStep}
      size={isMobile ? 'small' : 'default'}
      style={{ marginBottom: 24 }}
    >
      <Step title="Fill Details" icon={<InfoCircleOutlined />} />
      <Step title="Processing" icon={<SafetyOutlined />} />
      <Step title="Completed" icon={<CheckCircleOutlined />} />
    </Steps>
  );

  return (
    <>
      <PageHeader
        title="Wallet Actions"
        breadcrumbs={[
          {
            title: 'Dashboard',
            path: '/dashboard',
          },
          {
            title: 'Wallet Actions',
            path: '/wallet-actions',
          },
        ]}
      />

      <Row gutter={[16, 16]}>
        {/* Main Form Card */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <WalletOutlined style={{ color: '#1890ff' }} />
                <span>Credit User Wallet</span>
              </Space>
            }
            extra={
              <Tag color="blue" icon={<CreditCardOutlined />}>
                Admin Action
              </Tag>
            }
          >
            <ProcessSteps />

            <Alert
              message="Important Information"
              description="Please ensure all details are correct before submitting. This action will immediately credit the user's wallet and cannot be undone."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              disabled={loading}
              size={isMobile ? 'middle' : 'large'}
            >
              {/* Credit Type Selection */}
              <Form.Item
                label={
                  <Space>
                    <Text strong>Select Credit Type</Text>
                    <Tooltip title="Choose the type of credit to add to user's wallet">
                      <InfoCircleOutlined style={{ color: '#1890ff' }} />
                    </Tooltip>
                  </Space>
                }
                name="creditType"
                rules={[{ required: true, message: 'Please select a credit type' }]}
              >
                <Input style={{ display: 'none' }} />
              </Form.Item>

              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {creditTypes.map((type) => (
                  <Col xs={24} sm={12} key={type.value}>
                    <CreditTypeCard
                      type={type}
                      selected={selectedCreditType === type.value}
                      onClick={() => handleCreditTypeSelect(type.value)}
                    />
                  </Col>
                ))}
              </Row>

              <Row gutter={[16, 16]}>
                {/* Phone Number */}
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <Space>
                        <PhoneOutlined />
                        <Text strong>Phone Number</Text>
                      </Space>
                    }
                    name="phone"
                    rules={[{ validator: validatePhoneNumber }]}
                  >
                    <Input
                      placeholder="Enter 10-digit mobile number"
                      prefix={<Text type="secondary">+91</Text>}
                      maxLength={10}
                    />
                  </Form.Item>
                </Col>

                {/* Amount */}
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <Space>
                        <DollarOutlined />
                        <Text strong>Amount (₹)</Text>
                      </Space>
                    }
                    name="amount"
                    rules={[
                      { required: true, message: 'Please enter amount' },
                      { type: 'number', min: 1, message: 'Amount must be greater than 0' },
                      { type: 'number', max: 50000, message: 'Amount cannot exceed ₹50,000' }
                    ]}
                  >
                    <InputNumber
                      placeholder="Enter amount"
                      style={{ width: '100%' }}
                      prefix="₹"
                      min={1}
                      max={50000}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                    />
                  </Form.Item>
                </Col>

                {/* UTR Number */}
                <Col xs={24}>
                  <Form.Item
                    label={
                      <Space>
                        <SafetyOutlined />
                        <Text strong>UTR/Transaction Reference</Text>
                        <Tooltip title="Unique Transaction Reference number for tracking">
                          <InfoCircleOutlined style={{ color: '#1890ff' }} />
                        </Tooltip>
                      </Space>
                    }
                    name="utr"
                    rules={[{ validator: validateUTR }]}
                  >
                    <Input
                      placeholder="Enter UTR or transaction reference number"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              {/* Submit Button */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block={isMobile}
                  icon={<WalletOutlined />}
                  style={{
                    height: isMobile ? '48px' : '56px',
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: '600'
                  }}
                >
                  {loading ? 'Processing Credit...' : 'Credit Wallet'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Recent Transactions Sidebar */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <HistoryOutlined style={{ color: '#52c41a' }} />
                <span>Recent Transactions</span>
              </Space>
            }
            size="small"
          >
            <List
              dataSource={recentTransactions}
              renderItem={(item) => (
                <List.Item style={{ padding: isMobile ? '8px 0' : '12px 0' }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={getTypeConfig(item.type)?.icon}
                        style={{ backgroundColor: getTypeConfig(item.type)?.color }}
                      />
                    }
                    title={
                      <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: isMobile ? '12px' : '14px' }}>
                          +91 {item.phone}
                        </Text>
                        <Space>
                          <Tag
                            color={getTypeConfig(item.type)?.color}
                            style={{ fontSize: '10px', margin: 0 }}
                          >
                            {getTypeConfig(item.type)?.label}
                          </Tag>
                          <Tag color="green" style={{ fontSize: '10px', margin: 0 }}>
                            ₹{item.amount.toLocaleString()}
                          </Tag>
                        </Space>
                      </Space>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        UTR: {item.utr}
                        <br />
                        {item.timestamp}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />

            <Divider style={{ margin: '16px 0' }} />

            <Alert
              message="Quick Tips"
              description={
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px' }}>
                  <li style={{ fontSize: '12px', marginBottom: '4px' }}>
                    Rewards are typically for promotional activities
                  </li>
                  <li style={{ fontSize: '12px', marginBottom: '4px' }}>
                    Balance additions are for direct wallet top-ups
                  </li>
                  <li style={{ fontSize: '12px' }}>
                    Always verify phone number before crediting
                  </li>
                </ul>
              }
              type="success"
              showIcon
              style={{ fontSize: '11px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Success Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />
            <span>Wallet Credit Successful</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={isMobile ? '95%' : 500}
        style={isMobile ? { top: 20 } : {}}
      >
        {successData && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Avatar
              size={64}
              icon={<CheckCircleOutlined />}
              style={{ backgroundColor: '#52c41a', marginBottom: 16 }}
            />
            <Title level={4} style={{ color: '#52c41a', marginBottom: 24 }}>
              Credit Processed Successfully!
            </Title>
            
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Text type="secondary">Transaction ID:</Text>
              </Col>
              <Col span={12}>
                <Text strong>{successData.transactionId}</Text>
              </Col>
              
              <Col span={12}>
                <Text type="secondary">Credited Amount:</Text>
              </Col>
              <Col span={12}>
                <Text strong style={{ color: '#52c41a' }}>
                  ₹{successData.creditedAmount?.toLocaleString()}
                </Text>
              </Col>
              
              <Col span={12}>
                <Text type="secondary">New Balance:</Text>
              </Col>
              <Col span={12}>
                <Text strong style={{ color: '#1890ff' }}>
                  ₹{successData.newBalance?.toLocaleString()}
                </Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </>
  );
};

export default WalletActionsPage;
