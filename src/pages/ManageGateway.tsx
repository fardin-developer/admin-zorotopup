import { Avatar, Badge, Button, Card, Col, Row, Space } from 'antd';
import { PageHeader } from '../components';
import Title from 'antd/es/typography/Title';
import Paragraph from 'antd/es/typography/Paragraph';
import React, { useState } from 'react';

interface Gateway {
  id: string;
  name: string;
  description: string;
  logo: React.ReactElement;
}

const gateways: Gateway[] = [
  {
    id: 'one-gateway',
    name: 'One-Gateway',
    description:
      'A reliable and secure solution for all your primary transaction needs.',
    logo: (
      <Avatar
        shape="square"
        size="large"
        style={{ backgroundColor: '#1890ff' }}
      >
        OG
      </Avatar>
    ),
  },
  {
    id: 'ekqr',
    name: 'EkQR',
    description: 'Enable fast and easy payments through dynamic QR codes.',
    logo: (
      <Avatar
        shape="square"
        size="large"
        style={{ backgroundColor: '#52c41a' }}
      >
        EQ
      </Avatar>
    ),
  },
  {
    id: 'payu',
    name: 'PayU',
    description:
      'A popular and versatile gateway with broad payment method support.',
    logo: (
      <Avatar
        shape="square"
        size="large"
        style={{ backgroundColor: '#faad14' }}
      >
        PU
      </Avatar>
    ),
  },
];

const ManageGateway = () => {
  const [selectedGateway, setSelectedGateway] = useState(gateways[0].id);

  const handleSave = () => {
    console.log(`Saving selected gateway: ${selectedGateway}`);
    alert(`Active gateway set to: ${selectedGateway}`);
  };

  return (
    <>
      <PageHeader
        title="Manage Gateway"
        breadcrumbs={[{ title: 'Gateway', path: '/gateway' }]}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '24px',
        }}
      >
        <Card
          title="Select Active Payment Gateway"
          style={{ maxWidth: 800, width: '100%' }}
        >
          <Paragraph
            type="secondary"
            style={{ display: 'block', marginBottom: 24 }}
          >
            Choose the primary payment gateway that will be used for all
            transactions. The active gateway will be highlighted.
          </Paragraph>

          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {gateways.map((gateway) => (
              <GatewayCard
                key={gateway.id}
                gateway={gateway}
                isSelected={selectedGateway === gateway.id}
                onSelect={setSelectedGateway}
              />
            ))}
          </Space>

          <Button type="primary" onClick={handleSave} style={{ marginTop: 24 }}>
            Save Changes
          </Button>
        </Card>
      </div>
    </>
  );
};

const GatewayCard = ({
  gateway,
  isSelected,
  onSelect,
}: {
  gateway: Gateway;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) => {
  const cardStyle = {
    cursor: 'pointer',
    border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
    transition: 'all 0.3s',
    height: '100%',
  };

  return (
    <Badge.Ribbon
      text="Active"
      color="blue"
      style={{ display: isSelected ? 'block' : 'none' }}
    >
      <Card hoverable style={cardStyle} onClick={() => onSelect(gateway.id)}>
        <Row align="middle" gutter={16}>
          <Col>{gateway.logo}</Col>
          <Col flex="auto">
            <Title level={5} style={{ margin: 0 }}>
              {gateway.name}
            </Title>
            <Paragraph
              type="secondary"
              style={{ margin: '4px 0 0 0', fontSize: '12px' }}
            >
              {gateway.description}
            </Paragraph>
          </Col>
        </Row>
      </Card>
    </Badge.Ribbon>
  );
};

export default ManageGateway;
