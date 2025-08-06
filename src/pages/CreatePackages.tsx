import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Button,
  Form,
  Input,
  Select,
  Divider,
  message,
  UploadFile,
  UploadProps,
  Upload,
  Spin,
} from 'antd';
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../components';
import { authenticatedFetch, API_ENDPOINTS } from '../utils/auth';

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

// Smileone interfaces
interface SmileoneProduct {
  id: string;
  spu: string;
  price: string;
  cost_price: string;
  discount: number | string;
}

interface SmileoneProductResponse {
  success: boolean;
  message: string;
  data: {
    product: SmileoneProduct[];
  };
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

interface ApiResponse {
  success: boolean;
  data: Product[];
}

interface GamesResponse {
  success: boolean;
  count: number;
  games: Game[];
}

interface ApiProvider {
  id: string;
  name: string;
  apiUrl: string;
  description: string;
  partnerId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiProvidersResponse {
  message: string;
  count: number;
  apis: ApiProvider[];
}

interface PackageFormValues {
  gameId: string;
  amount: number;
  commission: number;
  cashback: number;
  logo: UploadFile[];
  status: 'active' | 'inactive';
  description: string;
  apiMappings: any[];
}

const CreatePackagesPage: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<{ [key: string]: Product[] }>({});
  const [smileoneProducts, setSmileoneProducts] = useState<{
    [key: string]: SmileoneProduct[];
  }>({});
  const [loadingProducts, setLoadingProducts] = useState<{
    [key: string]: boolean;
  }>({});
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [productVariations, setProductVariations] = useState<{
    [key: string]: ProductDetail;
  }>({});
  const [loadingVariations, setLoadingVariations] = useState<{
    [key: string]: boolean;
  }>({});
  const [apiProviders, setApiProviders] = useState<ApiProvider[]>([]);
  const [loadingApiProviders, setLoadingApiProviders] = useState(false);

  const fetchProductDetail = async (productId: string) => {
    try {
      setLoadingVariations((prev) => ({ ...prev, [productId]: true }));
      const response = await fetch(API_ENDPOINTS.MOOGOLD_PRODUCT_DETAIL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: 'product/product_detail',
          product_id: parseInt(productId),
        }),
      });
      const data: ProductDetailResponse = await response.json();
      console.log(data);

      if (data.success) {
        setProductVariations((prev) => ({ ...prev, [productId]: data.data }));
        return data.data;
      } else {
        message.error('Failed to fetch product variations');
      }
    } catch (error) {
      console.error('Error fetching product variations:', error);
      message.error('Error fetching product variations');
    } finally {
      setLoadingVariations((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const fetchGames = async () => {
    try {
      setLoadingGames(true);
      console.log('Fetching games from:', API_ENDPOINTS.GAMES_GET_ALL);
      const response = await authenticatedFetch(API_ENDPOINTS.GAMES_GET_ALL);
      console.log('Response status:', response.status);

      if (!response.ok) {
        console.error(
          'Games API response not ok:',
          response.status,
          response.statusText
        );
        message.error(`Failed to fetch games: ${response.status}`);
        return;
      }

      const data: GamesResponse = await response.json();
      console.log('Games data:', data);

      if (data.success) {
        setGames(data.games);
        console.log('Games set successfully:', data.games.length);
        message.success(`Loaded ${data.count} games successfully`);
      } else {
        console.error('API returned success: false');
        message.error('Failed to fetch games');
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      message.error('Error fetching games');
    } finally {
      setLoadingGames(false);
    }
  };

  const fetchApiProviders = async () => {
    try {
      setLoadingApiProviders(true);
      console.log('Fetching API providers from:', API_ENDPOINTS.API_LIST);

      const response = await authenticatedFetch(API_ENDPOINTS.API_LIST);
      console.log('API providers response status:', response.status);

      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        message.error(`Failed to fetch API providers: ${response.status}`);
        return;
      }

      const data: ApiProvidersResponse = await response.json();
      console.log('API providers data:', data);

      if (data.apis && data.apis.length > 0) {
        setApiProviders(data.apis);
        console.log('API providers set successfully:', data.apis.length);
        message.success(`Loaded ${data.count} API providers successfully`);
      } else {
        console.error('No API providers found in response');
        message.error('No API providers found');
      }
    } catch (error) {
      console.error('Error fetching API providers:', error);
      message.error('Error fetching API providers');
    } finally {
      setLoadingApiProviders(false);
    }
  };

  useEffect(() => {
    console.log(
      'useEffect triggered - calling fetchGames and fetchApiProviders'
    );

    // Call fetchGames immediately
    fetchGames();

    // Add a small delay for API providers to ensure server is ready
    const timer = setTimeout(() => {
      fetchApiProviders();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const fetchMoogoldProducts = async () => {
    try {
      setLoadingProducts((prev) => ({ ...prev, moogold: true }));
      const response = await fetch(API_ENDPOINTS.MOOGOLD_PRODUCTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: 'product/list_product',
          category_id: 50,
        }),
      });
      const data: ApiResponse = await response.json();

      if (data.success) {
        setProducts((prev) => ({ ...prev, moogold: data.data }));
      } else {
        message.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching moogold products:', error);
      message.error('Error fetching products');
    } finally {
      setLoadingProducts((prev) => ({ ...prev, moogold: false }));
    }
  };

  const fetchSmileoneProducts = async (
    productType: string = 'mobilelegends'
  ) => {
    try {
      setLoadingProducts((prev) => ({ ...prev, smileone: true }));
      const response = await fetch(API_ENDPOINTS.SMILEONE_PRODUCTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: productType,
        }),
      });
      const data: SmileoneProductResponse = await response.json();

      if (data.success) {
        setSmileoneProducts((prev) => ({
          ...prev,
          [productType]: data.data.product,
        }));
      } else {
        message.error('Failed to fetch smileone products');
      }
    } catch (error) {
      console.error('Error fetching smileone products:', error);
      message.error('Error fetching smileone products');
    } finally {
      setLoadingProducts((prev) => ({ ...prev, smileone: false }));
    }
  };

  const handleApiProviderChange = (value: string, fieldName: number) => {
    const providerName = apiProviders.find((provider) => provider.id === value)
      ?.name;

    // Clear all related fields when API provider changes
    const currentValues = form.getFieldsValue();
    const apiMappings = [...currentValues.apiMappings];
    apiMappings[fieldName] = {
      apiProvider: value,
      productId: undefined,
      productTitle: undefined,
      selectedProductId: undefined,
      variationId: undefined,
    };
    form.setFieldsValue({ apiMappings });

    // Fetch products if moogold is selected and products not already loaded
    if (providerName === 'moogold' && !products.moogold) {
      fetchMoogoldProducts();
    }

    // Fetch products if smileone is selected and products not already loaded
    if (providerName === 'smileOne' && !smileoneProducts.mobilelegends) {
      fetchSmileoneProducts('mobilelegends');
    }
  };

  const handleProductSelect = async (
    value: string,
    option: any,
    fieldName: number
  ) => {
    const productId = option.key;
    const currentApiProvider = form.getFieldValue([
      'apiMappings',
      fieldName,
      'apiProvider',
    ]);
    const providerName = apiProviders.find(
      (provider) => provider.id === currentApiProvider
    )?.name;

    // Auto-fill the product ID when a product is selected
    const currentValues = form.getFieldsValue();
    const apiMappings = [...currentValues.apiMappings];
    
    if (providerName === 'smileone') {
      // For smileone, directly use the product ID without variations
      apiMappings[fieldName] = {
        ...apiMappings[fieldName],
        productTitle: value,
        selectedProductId: productId,
        productId: productId, // Use the product ID directly
        variationId: undefined, // Not needed for smileone
      };
    } else {
      // For moogold and others
      apiMappings[fieldName] = {
        ...apiMappings[fieldName],
        productTitle: value,
        selectedProductId: productId,
        productId: productId, // Set productId for smileone
        variationId: undefined, // Clear variation when product changes
      };
    }
    
    form.setFieldsValue({ apiMappings });

    // Fetch product variations only for moogold
    if (providerName === 'moogold') {
      await fetchProductDetail(productId);
    }
  };

  const handleVariationSelect = (variationId: string, fieldName: number) => {
    const currentValues = form.getFieldsValue();
    const apiMappings = [...currentValues.apiMappings];
    apiMappings[fieldName] = {
      ...apiMappings[fieldName],
      variationId: variationId,
      productId: variationId, // Use variation_id as the final productId for moogold
    };
    form.setFieldsValue({ apiMappings });
  };

  const getProductOptions = (apiProviderId: string) => {
    const providerName = apiProviders.find(
      (provider) => provider.id === apiProviderId
    )?.name;

    if (providerName === 'moogold' && products.moogold) {
      return products.moogold.map((product) => (
        <Option key={product.ID} value={product.post_title}>
          {product.post_title}
        </Option>
      ));
    }

    if (providerName === 'smileOne' && smileoneProducts.mobilelegends) {
      return smileoneProducts.mobilelegends.map((product) => (
        <Option key={product.id} value={product.spu}>
          {product.spu}
        </Option>
      ));
    }

    return [];
  };

  const onFinish = async (values: PackageFormValues) => {
    setSubmitting(true);
    try {
      const { gameId, ...packageData } = values;
      if (!gameId) {
        message.error('Please select a game');
        setSubmitting(false);
        return;
      }

      const formData = new FormData();

      formData.append('amount', String(packageData.amount));
      formData.append('commission', String(packageData.commission));
      formData.append('cashback', String(packageData.cashback));
      formData.append('status', packageData.status);
      formData.append('description', packageData.description);
      
      // Send apiMappings as individual fields in array format
      packageData.apiMappings.forEach((mapping, index) => {
        formData.append(`apiMappings[${index}][apiProvider]`, mapping.apiProvider);
        formData.append(`apiMappings[${index}][productId]`, mapping.productId);
        if (mapping.productTitle) {
          formData.append(`apiMappings[${index}][productTitle]`, mapping.productTitle);
        }
      });

      if (
        packageData.logo &&
        packageData.logo.length > 0 &&
        packageData.logo[0].originFileObj
      ) {
        formData.append('image', packageData.logo[0].originFileObj);
      } else {
        message.error('Please upload a package logo.');
        setSubmitting(false);
        return;
      }

      const response = await authenticatedFetch(
        API_ENDPOINTS.GAMES_CREATE_DIAMOND_PACK(gameId),
        {
          method: 'POST',
          body: formData,
        }
      );
      console.log(packageData);

      const result = await response.json();

      if (response.ok && result.success !== false) {
        message.success('Package created successfully!');
        form.resetFields();
      } else {
        message.error(result.message || 'Failed to create package');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      message.error('Error creating package');
    } finally {
      setSubmitting(false);
    }
  };

  const dummyRequest: UploadProps['customRequest'] = ({ onSuccess }) => {
    setTimeout(() => {
      if (onSuccess) onSuccess('ok');
    }, 0);
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };

  if (loadingApiProviders) {
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
        title="Create Packages"
        breadcrumbs={[
          {
            title: 'Games',
            path: '/games/game',
          },
          {
            title: 'Create Packages',
            path: '/games/create-packages',
          },
        ]}
      />
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Title level={2}>Create Game Package</Title>
            <Paragraph>
              Create and configure new game packages. Set up pricing, features,
              and availability for your game offerings.
            </Paragraph>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              style={{ marginTop: 24 }}
              initialValues={{ status: 'active', apiMappings: [{}] }}
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
                    return String(option.children)
                      .toLowerCase()
                      .includes(input.toLowerCase());
                  }}
                >
                  {games.map((game) => (
                    <Option key={game._id} value={game._id}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <img
                          src={game.image}
                          alt={game.name}
                          style={{ width: 24, height: 24, borderRadius: 4 }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              'none';
                          }}
                        />
                        <span>{game.name}</span>
                        <span style={{ color: '#666', fontSize: '12px' }}>
                          ({game.publisher})
                        </span>
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
                    rules={[
                      { required: true, message: 'Please enter commission' },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="Enter commission"
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="cashback"
                    label="Cashback"
                    rules={[
                      { required: true, message: 'Please enter cashback' },
                    ]}
                  >
                    <Input type="number" placeholder="Enter cashback" min={0} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="logo"
                    label="Logo"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    rules={[
                      { required: true, message: 'Please upload a logo' },
                    ]}
                  >
                    <Upload.Dragger
                      name="image"
                      customRequest={dummyRequest}
                      listType="picture"
                      maxCount={1}
                      accept="image/*"
                    >
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag file to this area
                      </p>
                      <p className="ant-upload-hint">
                        Support for a single image file.
                      </p>
                    </Upload.Dragger>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[
                      { required: true, message: 'Please select status' },
                    ]}
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
                rules={[
                  { required: true, message: 'Please enter description' },
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter package description"
                />
              </Form.Item>
              <Divider orientation="left">API Mappings</Divider>
              <Form.List name="apiMappings">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => {
                      const currentApiProvider = form.getFieldValue([
                        'apiMappings',
                        field.name,
                        'apiProvider',
                      ]);
                      const selectedProductId = form.getFieldValue([
                        'apiMappings',
                        field.name,
                        'selectedProductId',
                      ]);
                      const providerName = apiProviders.find(
                        (provider) => provider.id === currentApiProvider
                      )?.name;
                      const productDetail = selectedProductId
                        ? productVariations[selectedProductId]
                        : null;

                      return (
                        <div
                          key={String(field.name)}
                          style={{
                            marginBottom: 16,
                            padding: 16,
                            border: '1px solid #d9d9d9',
                            borderRadius: 6,
                          }}
                        >
                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'apiProvider']}
                                label="API Provider"
                                rules={[
                                  {
                                    required: true,
                                    message: 'Select API Provider',
                                  },
                                ]}
                              >
                                <Select
                                  placeholder="Select API Provider"
                                  onChange={(value) =>
                                    handleApiProviderChange(value, field.name)
                                  }
                                >
                                  {apiProviders.map((provider) => (
                                    <Option
                                      key={provider.id}
                                      value={provider.id}
                                    >
                                      {provider.name}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              {providerName === 'moogold' ||
                              providerName === 'smileOne' ? (
                                <Form.Item
                                  {...field}
                                  name={[field.name, 'productTitle']}
                                  label="Product"
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Select Product',
                                    },
                                  ]}
                                >
                                  <Select
                                    placeholder="Select Product"
                                    showSearch
                                    loading={
                                      loadingProducts[providerName || '']
                                    }
                                    filterOption={(input, option) => {
                                      if (!option?.children) return false;
                                      return String(option.children)
                                        .toLowerCase()
                                        .includes(input.toLowerCase());
                                    }}
                                    onChange={(value, option) =>
                                      handleProductSelect(
                                        value,
                                        option,
                                        field.name
                                      )
                                    }
                                  >
                                    {getProductOptions(currentApiProvider)}
                                  </Select>
                                </Form.Item>
                              ) : (
                                <Form.Item
                                  {...field}
                                  name={[field.name, 'productTitle']}
                                  label="Product Title"
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Enter Product Title',
                                    },
                                  ]}
                                >
                                  <Input placeholder="Product Title" />
                                </Form.Item>
                              )}
                            </Col>
                            {/* Only show variations for moogold */}
                            {providerName === 'moogold' &&
                              selectedProductId && (
                                <Col span={10}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'variationId']}
                                    label="Variation"
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Select Variation',
                                      },
                                    ]}
                                  >
                                    <Select
                                      placeholder="Select Variation"
                                      loading={
                                        loadingVariations[selectedProductId]
                                      }
                                      onChange={(value) =>
                                        handleVariationSelect(value, field.name)
                                      }
                                      optionLabelProp="label"
                                    >
                                      {productDetail?.Variation?.map(
                                        (variation) => (
                                          <Option
                                            key={variation.variation_id}
                                            value={variation.variation_id.toString()}
                                            label={`${variation.variation_name} - ${variation.variation_price}`}
                                          >
                                            <div style={{ padding: '8px 0' }}>
                                              <div
                                                style={{
                                                  fontWeight: 500,
                                                  marginBottom: 4,
                                                }}
                                              >
                                                {variation.variation_name}
                                              </div>
                                              <div
                                                style={{
                                                  display: 'flex',
                                                  justifyContent:
                                                    'space-between',
                                                  alignItems: 'center',
                                                }}
                                              >
                                                <span
                                                  style={{
                                                    color: '#666',
                                                    fontSize: '12px',
                                                  }}
                                                >
                                                  ID: {variation.variation_id}
                                                </span>
                                                <span
                                                  style={{
                                                    color: '#52c41a',
                                                    fontWeight: 'bold',
                                                  }}
                                                >
                                                  ${variation.variation_price}
                                                </span>
                                              </div>
                                            </div>
                                          </Option>
                                        )
                                      )}
                                    </Select>
                                  </Form.Item>
                                </Col>
                              )}
                            {/* For smileone, show product ID as read-only field */}
                            {providerName === 'smileOne' &&
                              selectedProductId && (
                                <Col span={4}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'productId']}
                                    label="Product ID"
                                  >
                                    <Input 
                                      placeholder="Product ID" 
                                      value={selectedProductId}
                                      readOnly 
                                      style={{ backgroundColor: '#f5f5f5' }}
                                    />
                                  </Form.Item>
                                </Col>
                              )}
                            {/* For other providers, show manual product ID input */}
                            {providerName !== 'moogold' &&
                              providerName !== 'smileOne' && (
                                <Col span={4}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'productId']}
                                    label="Product ID"
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Product ID is required',
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Product ID" />
                                  </Form.Item>
                                </Col>
                              )}
                            <Col span={2}>
                              {fields.length > 1 && (
                                <Form.Item label=" ">
                                  <Button
                                    type="text"
                                    danger
                                    icon={<MinusCircleOutlined />}
                                    onClick={() => remove(field.name)}
                                    style={{ marginTop: 4 }}
                                  />
                                </Form.Item>
                              )}
                            </Col>
                          </Row>
                          {/* Moogold Product Detail Display */}
                          {productDetail && (
                            <Row
                              style={{
                                marginTop: 8,
                                padding: '8px 12px',
                                backgroundColor: '#f6f6f6',
                                borderRadius: 4,
                              }}
                            >
                              <Col span={24}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                  }}
                                >
                                  <img
                                    src={productDetail.Image_URL}
                                    alt={productDetail.Product_Name}
                                    style={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 4,
                                    }}
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = 'none';
                                    }}
                                  />
                                  <div>
                                    <div style={{ fontWeight: 500 }}>
                                      {productDetail.Product_Name}
                                    </div>
                                    <div
                                      style={{
                                        color: '#666',
                                        fontSize: '12px',
                                      }}
                                    >
                                      {productDetail.Variation?.length}{' '}
                                      variations available
                                    </div>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          )}
                          {/* Smileone Product Detail Display */}
                          {providerName === 'smileOne' &&
                            selectedProductId &&
                            smileoneProducts.mobilelegends && (
                              <Row
                                style={{
                                  marginTop: 8,
                                  padding: '8px 12px',
                                  backgroundColor: '#f6f6f6',
                                  borderRadius: 4,
                                }}
                              >
                                <Col span={24}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 12,
                                    }}
                                  >
                                    <div>
                                      <div style={{ fontWeight: 500 }}>
                                        {
                                          smileoneProducts.mobilelegends.find(
                                            (p) => p.id === selectedProductId
                                          )?.spu
                                        }
                                      </div>
                                      <div
                                        style={{
                                          color: '#666',
                                          fontSize: '12px',
                                        }}
                                      >
                                        Price: $
                                        {
                                          smileoneProducts.mobilelegends.find(
                                            (p) => p.id === selectedProductId
                                          )?.price
                                        }{' '}
                                        | Cost: $
                                        {
                                          smileoneProducts.mobilelegends.find(
                                            (p) => p.id === selectedProductId
                                          )?.cost_price
                                        }{' '}
                                        | Discount: {
                                          smileoneProducts.mobilelegends.find(
                                            (p) => p.id === selectedProductId
                                          )?.discount
                                        }%
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
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                        block
                      >
                        Add API Mapping
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={submitting}
                >
                  Create Package
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CreatePackagesPage;