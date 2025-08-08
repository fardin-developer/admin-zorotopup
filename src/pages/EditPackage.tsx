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
  Space,
  Divider,
  message,
  Spin,
  Upload,
  Image,
  Tag,
} from 'antd';
import {
  MinusCircleOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../components';
import { useNavigate, useParams } from 'react-router-dom';
import { API_ENDPOINTS, API_BASE_URL, authenticatedFetch } from '../utils/auth';
import type { UploadProps } from 'antd/es/upload/interface';

const { Title, Paragraph } = Typography;
const { Option } = Select;

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
  id: string;
  name: string;
}

interface ApiMapping {
  apiProvider: {
    _id: string;
    name: string;
    apiUrl: string;
    description: string;
  };
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

interface ApiProvidersResponse {
  message: string;
  count: number;
  apis: ApiProvider[];
}

const EditPackagePage: React.FC = () => {
  const navigate = useNavigate();
  const { gameId, packageId } = useParams<{
    gameId: string;
    packageId: string;
  }>();

  // Mobile-friendly styles
  const mobileStyles = {
    card: {
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    formItem: {
      marginBottom: '16px',
    },
    select: {
      width: '100%',
    },
    button: {
      width: '100%',
      maxWidth: '200px',
    },
    mappingCard: {
      border: '1px solid #d9d9d9',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: '#fafafa',
    },
  };
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
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
  const [packageData, setPackageData] = useState<DiamondPack | null>(null);
  const [editingMappings, setEditingMappings] = useState<{
    [key: number]: boolean;
  }>({});
  const [apiProviders, setApiProviders] = useState<ApiProvider[]>([]);
  const [loadingApiProviders, setLoadingApiProviders] = useState(false);

  const fetchPackageData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/games/diamond-pack/${packageId}`
      );
      const data: PackageResponse = await response.json();

      if (data.success) {
        setPackageData(data.diamondPack);

        // Prepare form data - map API response format to form format
        const formData = {
          gameId: data.diamondPack.game,
          amount: data.diamondPack.amount,
          commission: data.diamondPack.commission,
          cashback: data.diamondPack.cashback,
          logo: [], // Initialize as empty array for Upload component
          description: data.diamondPack.description,
          status: data.diamondPack.status,
          apiMappings: data.diamondPack.apiMappings.map((mapping) => ({
            apiProvider: mapping.apiProvider._id, // Use _id from the nested apiProvider object
            productId: mapping.productId,
          })),
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
      setLoadingVariations((prev) => ({ ...prev, [productId]: true }));
      const response = await fetch(
        `${API_BASE_URL}/moogold/product/product_detail`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: 'product/product_detail',
            product_id: parseInt(productId),
          }),
        }
      );
      const data: ProductDetailResponse = await response.json();

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
      const response = await authenticatedFetch(API_ENDPOINTS.GAMES_GET_ALL);
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

  const fetchApiProviders = async () => {
    try {
      setLoadingApiProviders(true);
      const response = await fetch(API_ENDPOINTS.API_LIST);
      const data: ApiProvidersResponse = await response.json();

      if (data.apis && data.apis.length > 0) {
        setApiProviders(data.apis);
      } else {
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
    if (gameId && packageId) {
      fetchGames();
      fetchApiProviders();
      fetchPackageData();
    }
  }, [gameId, packageId]);

  const fetchMoogoldProducts = async () => {
    try {
      setLoadingProducts((prev) => ({ ...prev, moogold: true }));
      const response = await fetch(
        `${API_BASE_URL}/moogold/product/list_product`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: 'product/list_product',
            category_id: 50,
          }),
        }
      );
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
      productId: variationId, // Use variation_id as the final productId
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
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '4px',
            minHeight: '40px',
            justifyContent: 'center'
          }}>
            <div style={{ 
              fontWeight: 500, 
              fontSize: '14px',
              lineHeight: '1.2',
              wordBreak: 'break-word'
            }}>
              {product.post_title}
            </div>
          </div>
        </Option>
      ));
    }

    if (providerName === 'smileOne' && smileoneProducts.mobilelegends) {
      return smileoneProducts.mobilelegends.map((product) => (
        <Option key={product.id} value={product.spu}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '4px',
            minHeight: '40px',
            justifyContent: 'center'
          }}>
            <div style={{ 
              fontWeight: 500, 
              fontSize: '14px',
              lineHeight: '1.2',
              wordBreak: 'break-word'
            }}>
              {product.spu}
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              fontSize: '12px',
              color: '#666'
            }}>
              <Tag color="blue">${product.price}</Tag>
              <Tag color="green">₹{product.cost_price}</Tag>
              <Tag color="orange">{product.discount}% off</Tag>
            </div>
          </div>
        </Option>
      ));
    }

    return [];
  };

  const toggleEditMapping = (fieldName: number) => {
    setEditingMappings((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));

    // If enabling edit mode for moogold, fetch products
    const currentApiProvider = form.getFieldValue([
      'apiMappings',
      fieldName,
      'apiProvider',
    ]);
    const providerName = apiProviders.find(
      (provider) => provider.id === currentApiProvider
    )?.name;

    if (
      !editingMappings[fieldName] &&
      providerName === 'moogold' &&
      !products.moogold
    ) {
      fetchMoogoldProducts();
    }
    if (
      !editingMappings[fieldName] &&
      providerName === 'smileOne' &&
      !smileoneProducts.mobilelegends
    ) {
      fetchSmileoneProducts('mobilelegends');
    }
  };

  const cancelEditMapping = (fieldName: number) => {
    setEditingMappings((prev) => ({
      ...prev,
      [fieldName]: false,
    }));

    // Reset to original values if available
    if (packageData?.apiMappings[fieldName]) {
      const currentValues = form.getFieldsValue();
      const apiMappings = [...currentValues.apiMappings];
      apiMappings[fieldName] = {
        apiProvider: packageData.apiMappings[fieldName].apiProvider._id,
        productId: packageData.apiMappings[fieldName].productId,
      };
      form.setFieldsValue({ apiMappings });
    }
  };

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const { gameId: formGameId, ...packageUpdateData } = values;

      if (!packageId) {
        message.error('Package ID is missing');
        setSubmitting(false);
        return;
      }

      const formData = new FormData();

      formData.append('amount', String(packageUpdateData.amount));
      formData.append('commission', String(packageUpdateData.commission));
      formData.append('cashback', String(packageUpdateData.cashback));
      formData.append('status', packageUpdateData.status);
      formData.append('description', packageUpdateData.description);

      // Handle logo upload - if new file is uploaded, use it; otherwise keep current
      if (packageUpdateData.logo && packageUpdateData.logo.length > 0 && packageUpdateData.logo[0].originFileObj) {
        formData.append('image', packageUpdateData.logo[0].originFileObj);
      } else {
        // If no new file is uploaded, send the current logo URL
        formData.append('logo', packageUpdateData.logo);
      }

      // Send apiMappings as individual fields in array format
      packageUpdateData.apiMappings.forEach((mapping: any, index: number) => {
        formData.append(`apiMappings[${index}][apiProvider]`, mapping.apiProvider);
        formData.append(`apiMappings[${index}][productId]`, mapping.productId);
        if (mapping.productTitle) {
          formData.append(`apiMappings[${index}][productTitle]`, mapping.productTitle);
        }
      });

      const response = await authenticatedFetch(
        API_ENDPOINTS.GAMES_UPDATE_DIAMOND_PACK(packageId),
        {
          method: 'PUT',
          body: formData,
        }
      );

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

  if (loading || loadingApiProviders) {
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
          style={{ 
            width: '100%', 
            maxWidth: '200px',
            marginBottom: '16px'
          }}
        >
          Back to Packages
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Title level={2}>Edit Game Package</Title>
            <Paragraph>
              Update and modify the game package configuration. Change pricing,
              features, and availability settings.
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
                    return String(option.children)
                      .toLowerCase()
                      .includes(input.toLowerCase());
                  }}
                  style={{ width: '100%' }}
                  dropdownStyle={{ 
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}
                >
                  {games.map((game) => (
                    <Option key={game._id} value={game._id}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          minHeight: '40px',
                          padding: '4px 0'
                        }}
                      >
                        <img
                          src={game.image}
                          alt={game.name}
                          style={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: 6,
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              'none';
                          }}
                        />
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          flex: 1,
                          minWidth: 0
                        }}>
                          <span style={{ 
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '1.2'
                          }}>
                            {game.name}
                          </span>
                          <span style={{ 
                            color: '#666', 
                            fontSize: '12px',
                            lineHeight: '1.2'
                          }}>
                            {game.publisher}
                          </span>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="amount"
                    label="Amount"
                    rules={[{ required: true, message: 'Please enter amount' }]}
                  >
                    <Input type="number" placeholder="Enter amount" min={0} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
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
                <Col xs={24} sm={12} md={8}>
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
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
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
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[
                      { required: true, message: 'Please select status' },
                    ]}
                  >
                    <Select style={{ width: '100%' }}>
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              {/* Current Logo Preview */}
              {packageData?.logo && (
                <Row gutter={16}>
                  <Col span={24}>
                    <div style={{ marginBottom: 16 }}>
                      <Title level={5}>Current Logo:</Title>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Image
                          src={packageData.logo}
                          alt="Current package logo"
                          width={100}
                          height={100}
                          style={{ objectFit: 'cover', borderRadius: 8 }}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                        />
                        <div>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>
                            Current Package Logo
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>
                            Upload a new image to replace this logo
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
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
                      const currentProductId = form.getFieldValue([
                        'apiMappings',
                        field.name,
                        'productId',
                      ]);
                      const providerName = apiProviders.find(
                        (provider) => provider.id === currentApiProvider
                      )?.name;
                      const productDetail = selectedProductId
                        ? productVariations[selectedProductId]
                        : null;
                      const isEditing = editingMappings[field.name];

                      return (
                        <div
                          key={String(field.name)}
                          style={mobileStyles.mappingCard}
                        >
                          <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={6}>
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
                                  disabled={!isEditing}
                                  onChange={(value) =>
                                    handleApiProviderChange(value, field.name)
                                  }
                                  style={{ width: '100%' }}
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

                            {!isEditing ? (
                              <Col xs={24} sm={12}>
                                <Form.Item label="Product ID">
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 8,
                                      flexWrap: 'wrap'
                                    }}
                                  >
                                    <Input
                                      value={currentProductId}
                                      readOnly
                                      style={{ flex: 1, minWidth: '200px' }}
                                    />
                                    <Button
                                      icon={<EditOutlined />}
                                      onClick={() =>
                                        toggleEditMapping(field.name)
                                      }
                                      size="small"
                                    >
                                      Edit
                                    </Button>
                                  </div>
                                </Form.Item>
                              </Col>
                            ) : (
                              <>
                                <Col xs={24} sm={12} md={6}>
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
                                        style={{ width: '100%' }}
                                        dropdownStyle={{ 
                                          maxHeight: '300px',
                                          overflow: 'auto'
                                        }}
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
                                <Col xs={24} sm={12} md={6}>
                                  {providerName === 'moogold' &&
                                  selectedProductId ? (
                                    <Form.Item
                                      {...field}
                                      name={[field.name, 'variationId']}
                                      label="Product ID (Variation)"
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
                                          handleVariationSelect(
                                            value,
                                            field.name
                                          )
                                        }
                                        optionLabelProp="label"
                                        style={{ width: '100%' }}
                                        dropdownStyle={{ 
                                          maxHeight: '300px',
                                          overflow: 'auto'
                                        }}
                                      >
                                        {productDetail?.Variation?.map(
                                          (variation) => (
                                            <Option
                                              key={variation.variation_id}
                                              value={variation.variation_id.toString()}
                                              label={`${variation.variation_name} - $${variation.variation_price}`}
                                            >
                                              <div style={{ 
                                                padding: '12px 0',
                                                minHeight: '50px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '6px'
                                              }}>
                                                <div
                                                  style={{
                                                    fontWeight: 500,
                                                    fontSize: '14px',
                                                    lineHeight: '1.3',
                                                    wordBreak: 'break-word'
                                                  }}
                                                >
                                                  {variation.variation_name}
                                                </div>
                                                <div
                                                  style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    flexWrap: 'wrap',
                                                    gap: '8px'
                                                  }}
                                                >
                                                  <Tag color="default" style={{ fontSize: '11px' }}>
                                                    ID: {variation.variation_id}
                                                  </Tag>
                                                  <Tag color="success" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                                                    ${variation.variation_price}
                                                  </Tag>
                                                </div>
                                              </div>
                                            </Option>
                                          )
                                        )}
                                      </Select>
                                    </Form.Item>
                                  ) : providerName === 'smileOne' &&
                                    selectedProductId ? (
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
                                  ) : (
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
                                  )}
                                </Col>
                              </>
                            )}

                            <Col xs={24} sm={12} md={isEditing ? 2 : 4}>
                              <Form.Item label=" ">
                                {isEditing ? (
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    <Button
                                      size="small"
                                      onClick={() =>
                                        cancelEditMapping(field.name)
                                      }
                                      style={{ width: '100%' }}
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
                                    style={{ marginTop: 4, width: '100%' }}
                                  />
                                )}
                              </Form.Item>
                            </Col>
                          </Row>
                          {productDetail && isEditing && (
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
                            smileoneProducts.mobilelegends &&
                            isEditing && (
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
                                        | Cost: ₹
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
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={submitting}
                    style={{ width: '100%', maxWidth: '300px' }}
                  >
                    Update Package
                  </Button>
                  <Button 
                    size="large" 
                    onClick={handleBackToPackages}
                    style={{ width: '100%', maxWidth: '300px' }}
                  >
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