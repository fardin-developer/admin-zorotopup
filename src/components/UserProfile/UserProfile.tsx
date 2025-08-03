import React from 'react';
import { Avatar, Dropdown, Space, Typography, Button, message } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getUser, clearAuth, isAuthenticated } from '../../utils/auth';
import { PATH_AUTH } from '../../constants';

const { Text } = Typography;

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();
  const authenticated = isAuthenticated();

  const handleLogout = () => {
    clearAuth();
    message.success('Logged out successfully');
    navigate(PATH_AUTH.signin);
  };

  if (!authenticated || !user) {
    return (
      <Button type="primary" onClick={() => navigate(PATH_AUTH.signin)}>
        Login
      </Button>
    );
  }

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <div>
          <Text strong>{user.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {user.email}
          </Text>
        </div>
      ),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => {
        message.info('Settings page coming soon');
      },
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
      <Space style={{ cursor: 'pointer' }}>
        <Avatar icon={<UserOutlined />} />
        <Text>{user.name}</Text>
      </Space>
    </Dropdown>
  );
}; 