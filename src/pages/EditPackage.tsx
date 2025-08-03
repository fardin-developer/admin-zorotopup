import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Button, Form, Input, Select, Space, Divider, message, Spin } from 'antd';
import { MinusCircleOutlined, PlusOutlined, ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { PageHeader } from '../components';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface Product {
  ID: string;
  post_title: string;
}

interface Variation {
  variation_name: string;
  variation_id: number;
  variation_price: number;
}

interface ProductDetail {
  Product_Name: string;
  Image_URL: string;
  Variation: Variation[];
}

interface ProductDetailResponse {
  success: boolean;
  data: ProductDetail;
}

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

interface PackageResponse {
  success: boolean;
  diamondPack: DiamondPack;
  gameData: Game;
}

interface ApiResponse {
  success: boolean;
  data: Product[];
}

interface GamesResponse {
  success: boolean;
  count: number;
  games: Game[];
}

const apiProviders = [
  { _id: '6871caa609fd118035159e32', name: 'moogold' },
  { _id: '6871caa609fd118035159e33', name: 'smileone' },
];

const EditPackagePage: React.FC = () => {
  const navigate = useNavigate();
  const { gameId, packageId } = useParams<{ gameId: string; packageId: string }>();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<{ [key: string]: Product[] }>({});
  const [loadingProducts, setLoadingProducts] = useState<{ [key: string]: boolean }>({});
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [productVariations, setProductVariations] = useState<{ [key: string]: ProductDetail }>({});
  const [loadingVariations, setLoadingVariations] = useState<{ [key: string]: boolean }>({});
  const [packageData, setPackageData] = useState<DiamondPack | null>(null);
  const [editingMappings, setEditingMappings] = useState<{ [key: number]: boolean }>({});

  const fetchPackageData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://game.oneapi.in/api/v1/games/diamond-pack/${packageId}`);
      const data: PackageResponse = await response.json();
      
      if (data.success) {
        setPackageData(data.diamondPack);
        
        // Prepare form data - only set productId initially, no product selection
        const formData = {
          gameId: data.diamondPack.game,
          amount: data.diamondPack.amount,
          commission: data.diamondPack.commission,
          cashback: data.diamondPack.cashback,
          logo: data.diamondPack.logo,
          description: data.diamondPack.description,
          status: data.diamondPack.status,
          apiMappings: data.diamondPack.apiMappings.map(mapping => ({
            apiProvider: mapping.apiProvider._id,
            productId: mapping.productId
          }))
        };
        
        form.setFieldsValue(formData);
        message.success('Package data loaded successfully');
      } else {
        message.error('Failed to fetch package data');
        navigate(`/games/game/${gameId}/packages`);
      }
    } catch (error) {
      console.error('Error fetching package data:', error);
      message.error('Error fetching package data');
      navigate(`/games/game/${gameId}/packages`);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetail = async (productId: string) => {
    try {
      setLoadingVariations(prev => ({ ...prev, [productId]: true }));
      const response = await fetch('https://game.oneapi.in/api/v1/moogold/product/product_detail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: "product/product_detail",
          product_id: parseInt(productId)
        })
      });
      const data: ProductDetailResponse = await response.json();
      
      if (data.success) {
        setProductVariations(prev => ({ ...prev, [productId]: data.data }));
        return data.data;
      } else {
        message.error('Failed to fetch product variations');
      }
    } catch (error) {
      console.error('Error fetching product variations:', error);
      message.error('Error fetching product variations');
    } finally {
      setLoadingVariations(prev => ({ ...prev, [productId]: false }));
    }
  };

  const fetchGames = async () => {
    try {
      setLoadingGames(true);
      const response = await fetch('https://game.oneapi.in/api/v1/games/get-all');
      const data: GamesResponse = await response.json();
      
      if (data.success) {
        setGames(data.games);
      } else {
        message.error('Failed to fetch games');
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      message.error('Error fetching games');
    } finally {
      setLoadingGames(false);
    }
  };

  useEffect(() => {
    if (gameId && packageId) {
      fetchGames();
      fetchPackageData();
    }
  }, [gameId, packageId]);

  const fetchMoogoldProducts = async () => {
    try {
      setLoadingProducts(prev => ({ ...prev, moogold: true }));
      const response = await fetch('https://game.oneapi.in/api/v1/moogold/product/list_product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: "product/list_product",
          category_id: 50
        })
      });
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setProducts(prev => ({ ...prev, moogold: data.data }));
      } else {
        message.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching moogold products:', error);
      message.error('Error fetching products');
    } finally {
      setLoadingProducts(prev => ({ ...prev, moogold: false }));
    }
  };

  const handleApiProviderChange = (value: string, fieldName: number) => {
    const providerName = apiProviders.find(provider => provider._id === value)?.name;
    
    // Clear all related fields when API provider changes
    const currentValues = form.getFieldsValue();
    const apiMappings = [...currentValues.apiMappings];
    apiMappings[fieldName] = {
      apiProvider: value,
      productId: undefined,
      productTitle: undefined,
      selectedProductId: undefined,
      variationId: undefined
    };
    form.setFieldsValue({ apiMappings });

    // Fetch products if moogold is selected and products not already loaded
    if (providerName === 'moogold' && !products.moogold) {
      fetchMoogoldProducts();
    }
  };

  const handleProductSelect = async (value: string, option: any, fieldName: number) => {
    const productId = option.key;
    
    // Auto-fill the product ID when a product is selected
    const currentValues = form.getFieldsValue();
    const apiMappings = [...currentValues.apiMappings];
    apiMappings[fieldName] = {
      ...apiMappings[fieldName],
      productTitle: value,
      selectedProductId: productId,
      variationId: undefined // Clear variation when product changes
    };
    form.setFieldsValue({ apiMappings });

    // Fetch product variations
    await fetchProductDetail(productId);
  };

  const handleVariationSelect = (variationId: string, fieldName: number) => {
    const currentValues = form.getFieldsValue();
    const apiMappings = [...currentValues.apiMappings];
    apiMappings[fieldName] = {
      ...apiMappings[fieldName],
      variationId: variationId,
      productId: variationId // Use variation_id as the final productId
    };
    form.setFieldsValue({ apiMappings });
  };

  const getProductOptions = (apiProviderId: string) => {
    const providerName = apiProviders.find(provider => provider._id === apiProviderId)?.name;
    
    if (providerName === 'moogold' && products.moogold) {
      return products.moogold.map(product => (
        <Option key={product.ID} value={product.post_title}>
          {product.post_title}
        </Option>
      ));
    }
    
    return [];
  };

  const toggleEditMapping = (fieldName: number) => {
    setEditingMappings(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
    
    // If enabling edit mode for moogold, fetch products
    const currentApiProvider = form.getFieldValue(['apiMappings', fieldName, 'apiProvider']);
    const providerName = apiProviders.find(provider => provider._id === currentApiProvider)?.name;
    
    if (!editingMappings[fieldName] && providerName === 'moogold' && !products.moogold) {
      fetchMoogoldProducts();
    }
  };

  const cancelEditMapping = (fieldName: number) => {
    setEditingMappings(prev => ({
      ...prev,
      [fieldName]: false
    }));
    
    // Reset to original productId if available
    if (packageData?.apiMappings[fieldName]) {
      const currentValues = form.getFieldsValue();
      const apiMappings = [...currentValues.apiMappings];
      apiMappings[fieldName] = {
        apiProvider: packageData.apiMappings[fieldName].apiProvider._id,
        productId: packageData.apiMappings[fieldName].productId
      };
      form.setFieldsValue({ apiMappings });
    }
  };

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const { gameId: formGameId, ...packageUpdateData } = values;

      const response = await fetch(`https://game.oneapi.in/api/v1/games/diamond-pack/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageUpdateData)
      });

      const result = await response.json();
      
      if (response.ok && result.success !== false) {
        message.success('Package updated successfully!');
        navigate(`/games/game/${gameId}/packages`);
      } else {
        message.error(result.message || 'Failed to update package');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      message.error('Error updating package');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToPackages = () => {
    navigate(`/games/game/${gameId}/packages`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Title level={4}>Loading package data...</Title>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Edit Package"
        breadcrumbs={[
          {
            title: 'Games',
            path: '/games/game',
          },
          {
            title: 'Game Packages',
            path: `/games/game/${gameId}/packages`,
          },
          {
            title: 'Edit Package',
            path: `/games/game/${gameId}/packages/${packageId}/edit`,
          },
        ]}
      />
      
      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBackToPackages}
          size="large"
        >
          Back to Packages
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Title level={2}>Edit Game Package</Title>
            <Paragraph>
              Update and modify the game package configuration. Change pricing, features, and availability settings.
            </Paragraph>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              style={{ marginTop: 24 }}
            >
              <Form.Item
                name="gameId"
                label="Select Game"
                rules={[{ required: true, message: 'Please select a game' }]}
              >
                <Select
                  placeholder="Select a game"
                  showSearch
                  loading={loadingGames}
                  filterOption={(input, option) => {
                    if (!option?.children) return false;
                    return String(option.children).toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {games.map((game) => (
                    <Option key={game._id} value={game._id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img 
                          src={game.image} 
                          alt={game.name}
                          style={{ width: 24, height: 24, borderRadius: 4 }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <span>{game.name}</span>
                        <span style={{ color: '#666', fontSize: '12px' }}>({game.publisher})</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="amount"
                    label="Amount"
                    rules={[{ required: true, message: 'Please enter amount' }]}
                  >
                    <Input type="number" placeholder="Enter amount" min={0} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="commission"
                    label="Commission"
                    rules={[{ required: true, message: 'Please enter commission' }]}
                  >
                    <Input type="number" placeholder="Enter commission" min={0} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="cashback"
                    label="Cashback"
                    rules={[{ required: true, message: 'Please enter cashback' }]}
                  >
                    <Input type="number" placeholder="Enter cashback" min={0} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="logo"
                    label="Logo URL"
                    rules={[{ required: true, message: 'Please enter logo URL' }, { type: 'url', message: 'Please enter a valid URL' }]}
                  >
                    <Input placeholder="https://example.com/logo.png" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Select>
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <Input.TextArea rows={3} placeholder="Enter package description" />
              </Form.Item>
              <Divider orientation="left">API Mappings</Divider>
              <Form.List name="apiMappings">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => {
                      const currentApiProvider = form.getFieldValue(['apiMappings', field.name, 'apiProvider']);
                      const selectedProductId = form.getFieldValue(['apiMappings', field.name, 'selectedProductId']);
                      const currentProductId = form.getFieldValue(['apiMappings', field.name, 'productId']);
                      const providerName = apiProviders.find(provider => provider._id === currentApiProvider)?.name;
                      const productDetail = selectedProductId ? productVariations[selectedProductId] : null;
                      const isEditing = editingMappings[field.name];
                      
                      return (
                        <div key={String(field.name)} style={{ marginBottom: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 6 }}>
                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'apiProvider']}
                                label="API Provider"
                                rules={[{ required: true, message: 'Select API Provider' }]}
                              >
                                <Select 
                                  placeholder="Select API Provider"
                                  disabled={!isEditing}
                                  onChange={(value) => handleApiProviderChange(value, field.name)}
                                >
                                  {apiProviders.map((provider) => (
                                    <Option key={provider._id} value={provider._id}>{provider.name}</Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            
                            {!isEditing ? (
                              <Col span={12}>
                                <Form.Item
                                  label="Product ID"
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Input 
                                      value={currentProductId} 
                                      readOnly 
                                      style={{ flex: 1 }}
                                    />
                                    <Button 
                                      icon={<EditOutlined />} 
                                      onClick={() => toggleEditMapping(field.name)}
                                      size="small"
                                    >
                                      Edit
                                    </Button>
                                  </div>
                                </Form.Item>
                              </Col>
                            ) : (
                              <>
                                <Col span={6}>
                                  {providerName === 'moogold' ? (
                                    <Form.Item
                                      {...field}
                                      name={[field.name, 'productTitle']}
                                      label="Product"
                                      rules={[{ required: true, message: 'Select Product' }]}
                                    >
                                      <Select
                                        placeholder="Select Product"
                                        showSearch
                                        loading={loadingProducts.moogold}
                                        filterOption={(input, option) => {
                                          if (!option?.children) return false;
                                          return String(option.children).toLowerCase().includes(input.toLowerCase());
                                        }}
                                        onChange={(value, option) => handleProductSelect(value, option, field.name)}
                                      >
                                        {getProductOptions(currentApiProvider)}
                                      </Select>
                                    </Form.Item>
                                  ) : (
                                    <Form.Item
                                      {...field}
                                      name={[field.name, 'productTitle']}
                                      label="Product Title"
                                      rules={[{ required: true, message: 'Enter Product Title' }]}
                                    >
                                      <Input placeholder="Product Title" />
                                    </Form.Item>
                                  )}
                                </Col>
                                {providerName === 'moogold' && selectedProductId && (
                                  <Col span={8}>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, 'variationId']}
                                      label="Variation"
                                      rules={[{ required: true, message: 'Select Variation' }]}
                                    >
                                      <Select
                                        placeholder="Select Variation"
                                        loading={loadingVariations[selectedProductId]}
                                        onChange={(value) => handleVariationSelect(value, field.name)}
                                        optionLabelProp="label"
                                      >
                                        {productDetail?.Variation?.map((variation) => (
                                          <Option 
                                            key={variation.variation_id} 
                                            value={variation.variation_id.toString()}
                                            label={`${variation.variation_name} - ${variation.variation_price}`}
                                          >
                                            <div style={{ padding: '8px 0' }}>
                                              <div style={{ fontWeight: 500, marginBottom: 4 }}>
                                                {variation.variation_name}
                                              </div>
                                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: '#666', fontSize: '12px' }}>
                                                  ID: {variation.variation_id}
                                                </span>
                                                <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                                                  ${variation.variation_price}
                                                </span>
                                              </div>
                                            </div>
                                          </Option>
                                        ))}
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                )}
                                {providerName !== 'moogold' && (
                                  <Col span={4}>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, 'productId']}
                                      label="Product ID"
                                      rules={[{ required: true, message: 'Product ID is required' }]}
                                    >
                                      <Input placeholder="Product ID" />
                                    </Form.Item>
                                  </Col>
                                )}
                              </>
                            )}
                            
                            <Col span={isEditing ? 2 : 4}>
                              <Form.Item label=" ">
                                {isEditing ? (
                                  <Space>
                                    <Button 
                                      size="small" 
                                      onClick={() => cancelEditMapping(field.name)}
                                    >
                                      Cancel
                                    </Button>
                                  </Space>
                                ) : null}
                                {fields.length > 1 && (
                                  <Button
                                    type="text"
                                    danger
                                    icon={<MinusCircleOutlined />}
                                    onClick={() => remove(field.name)}
                                    style={{ marginTop: 4 }}
                                  />
                                )}
                              </Form.Item>
                            </Col>
                          </Row>
                          {productDetail && isEditing && (
                            <Row style={{ marginTop: 8, padding: '8px 12px', backgroundColor: '#f6f6f6', borderRadius: 4 }}>
                              <Col span={24}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <img 
                                    src={productDetail.Image_URL} 
                                    alt={productDetail.Product_Name}
                                    style={{ width: 40, height: 40, borderRadius: 4 }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  <div>
                                    <div style={{ fontWeight: 500 }}>{productDetail.Product_Name}</div>
                                    <div style={{ color: '#666', fontSize: '12px' }}>
                                      {productDetail.Variation?.length} variations available
                                    </div>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          )}
                        </div>
                      );
                    })}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                        Add API Mapping
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" size="large" loading={submitting}>
                    Update Package
                  </Button>
                  <Button size="large" onClick={handleBackToPackages}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default EditPackagePage; 