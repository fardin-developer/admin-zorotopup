import {
  Button,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  message,
  Row,
  theme,
  Typography,
  Steps,
} from 'antd';
import {
  PhoneOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { Logo } from '../../components';
import { useMediaQuery } from 'react-responsive';
import { PATH_AUTH, PATH_DASHBOARD } from '../../constants';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { API_ENDPOINTS } from '../../utils/auth';

const { Title, Text, Link } = Typography;

type SendOtpFieldType = {
  phone?: string;
};

type VerifyOtpFieldType = {
  otp?: string;
};

interface User {
  name: string;
  email: string;
}

interface LoginResponse {
  message: string;
  user: User;
  token: string;
  isNewUser: boolean;
}

export const SignInPage = () => {
  const {
    token: { colorPrimary },
  } = theme.useToken();
  const isMobile = useMediaQuery({ maxWidth: 769 });
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sendOtpForm] = Form.useForm();
  const [verifyOtpForm] = Form.useForm();

  const onSendOtp = async (values: SendOtpFieldType) => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.SEND_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: values.phone }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('OTP sent successfully to your phone number');
        setPhoneNumber(values.phone || '');
        setCurrentStep(1);
      } else {
        message.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      message.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (values: VerifyOtpFieldType) => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          otp: values.otp,
        }),
      });

      const data: LoginResponse = await response.json();

      if (response.ok) {
        // Store authentication data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');

        message.success(data.message || 'Login successful');
        
        // Navigate to original location or dashboard
        const from = (location.state as any)?.from?.pathname || PATH_DASHBOARD.default;
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      } else {
        message.error(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      message.error('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSendOtpFailed = (errorInfo: any) => {
    console.log('Send OTP Failed:', errorInfo);
  };

  const onVerifyOtpFailed = (errorInfo: any) => {
    console.log('Verify OTP Failed:', errorInfo);
  };

  const handleBackToPhone = () => {
    setCurrentStep(0);
    setPhoneNumber('');
    verifyOtpForm.resetFields();
  };

  const steps = [
    {
      title: 'Phone Number',
      icon: <PhoneOutlined />,
    },
    {
      title: 'Verify OTP',
      icon: <SafetyOutlined />,
    },
  ];

  return (
    <Row style={{ minHeight: isMobile ? 'auto' : '100vh', overflow: 'hidden' }}>
      <Col xs={24} lg={12}>
        <Flex
          vertical
          align="center"
          justify="center"
          className="text-center"
          style={{ background: colorPrimary, height: '100%', padding: '1rem' }}
        >
          <Logo color="white" />
          <Title level={2} className="text-white">
            Welcome back to Zennova
          </Title>
          <Text className="text-white" style={{ fontSize: 18 }}>
            A dynamic and versatile multipurpose dashboard utilizing Ant Design,
            React, TypeScript, and Vite.
          </Text>
        </Flex>
      </Col>
      <Col xs={24} lg={12}>
        <Flex
          vertical
          align={isMobile ? 'center' : 'flex-start'}
          justify="center"
          gap="middle"
          style={{ height: '100%', padding: '2rem' }}
        >
          <Title className="m-0">Login</Title>
          <Flex gap={4}>
            <Text>Don't have an account?</Text>
            <Link href={PATH_AUTH.signup}>Create an account here</Link>
          </Flex>

          <Steps
            current={currentStep}
            items={steps}
            style={{ marginBottom: '2rem', width: '100%' }}
          />

          {currentStep === 0 && (
            <Form
              form={sendOtpForm}
              name="send-otp-form"
              layout="vertical"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              onFinish={onSendOtp}
              onFinishFailed={onSendOtpFailed}
              autoComplete="off"
              requiredMark={false}
              style={{ width: '100%' }}
            >
              <Form.Item<SendOtpFieldType>
                label="Phone Number"
                name="phone"
                rules={[
                  { required: true, message: 'Please input your phone number' },
                  { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Enter your 10-digit phone number"
                  size="large"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                >
                  Send OTP
                </Button>
              </Form.Item>
            </Form>
          )}

          {currentStep === 1 && (
            <Form
              form={verifyOtpForm}
              name="verify-otp-form"
              layout="vertical"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              onFinish={onVerifyOtp}
              onFinishFailed={onVerifyOtpFailed}
              autoComplete="off"
              requiredMark={false}
              style={{ width: '100%' }}
            >
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <Text>OTP sent to: <Text strong>{phoneNumber}</Text></Text>
              </div>
              <Form.Item<VerifyOtpFieldType>
                label="Enter OTP"
                name="otp"
                rules={[
                  { required: true, message: 'Please input the OTP' },
                  { pattern: /^[0-9]{6}$/, message: 'Please enter a valid 6-digit OTP' },
                ]}
              >
                <Input
                  prefix={<SafetyOutlined />}
                  placeholder="Enter 6-digit OTP"
                  size="large"
                  maxLength={6}
                />
              </Form.Item>
              <Form.Item>
                                 <Flex gap="small" vertical>
                   <Button
                     type="primary"
                     htmlType="submit"
                     size="large"
                     loading={loading}
                     block
                   >
                     Verify OTP & Login
                   </Button>
                   <Button
                     type="default"
                     size="large"
                     onClick={handleBackToPhone}
                     block
                   >
                     Change Phone Number
                   </Button>
                 </Flex>
              </Form.Item>
            </Form>
          )}

          <Divider className="m-0">or</Divider>
        </Flex>
      </Col>
    </Row>
  );
};
