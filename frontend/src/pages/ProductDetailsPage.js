import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Breadcrumb, Spinner, Alert } from 'react-bootstrap';

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Mock product data - in a real app, this would come from an API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // This would be an actual API fetch in a real application
      if (productId) {
        const mockProduct = {
          id: productId,
          name: productId === '1' ? 'Smartphone X' : 
                productId === '2' ? 'Laptop Pro' : 
                productId === '3' ? 'Wireless Headphones' : 
                `Product ${productId}`,
          price: productId === '1' ? 699.99 : 
                 productId === '2' ? 1299.99 : 
                 productId === '3' ? 199.99 : 
                 499.99,
          description: productId === '1' ? 'The latest smartphone with advanced features. High-resolution camera, fast processor, and all-day battery life.' : 
                      productId === '2' ? 'Powerful laptop for professionals. Perfect for development, design, and multitasking.' : 
                      productId === '3' ? 'High-quality sound with active noise cancellation. Comfortable for all-day wear.' : 
                      'This is a detailed description of the product. It includes information about its features, specifications, and usage.',
          category: productId === '1' ? 'Electronics' : 
                    productId === '2' ? 'Electronics' : 
                    productId === '3' ? 'Audio' : 
                    'General',
          imageUrl: 'https://via.placeholder.com/400',
          stock: 10,
          rating: 4.5,
          reviews: 27,
          specifications: {
            brand: 'TechBrand',
            model: `Model-${productId}`,
            dimensions: '15 x 7 x 0.8 cm',
            weight: '180g',
            warranty: '1 year'
          }
        };
        setProduct(mockProduct);
        setLoading(false);
      } else {
        setError('Product not found');
        setLoading(false);
      }
    }, 800); // Simulate network delay
  }, [productId]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 10)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    // In a real app, this would call an API to add the item to cart
    console.log(`Added ${quantity} of ${product.name} to cart`);
    alert(`Added ${quantity} of ${product.name} to cart`);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading product details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
        </Alert>
        <Button as={Link} to="/products" variant="primary">
          Back to Products
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Product not found
        </Alert>
        <Button as={Link} to="/products" variant="primary">
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Breadcrumb navigation */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/products' }}>Products</Breadcrumb.Item>
        <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        {/* Product Image */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Img 
              variant="top" 
              src={product.imageUrl} 
              alt={product.name} 
              className="img-fluid"
            />
          </Card>
        </Col>

        {/* Product Details */}
        <Col md={6}>
          <h1 className="mb-2">{product.name}</h1>
          <p className="text-muted mb-2">{product.category}</p>
          
          <div className="d-flex align-items-center mb-3">
            <span className="text-warning me-2">
              {'★'.repeat(Math.floor(product.rating))}
              {product.rating % 1 !== 0 ? '½' : ''}
              {'☆'.repeat(5 - Math.ceil(product.rating))}
            </span>
            <span className="text-muted">({product.reviews} reviews)</span>
          </div>

          <h3 className="text-primary mb-4">${product.price.toFixed(2)}</h3>
          
          <p className="mb-4">{product.description}</p>
          
          <div className="d-flex align-items-center mb-4">
            <div className="me-3">
              <label htmlFor="quantity" className="me-2">Quantity:</label>
              <input 
                type="number" 
                id="quantity" 
                className="form-control form-control-sm d-inline-block" 
                style={{ width: '70px' }}
                min="1" 
                max={product.stock} 
                value={quantity}
                onChange={handleQuantityChange}
              />
            </div>
            <div>
              <small className="text-muted">
                {product.stock > 0 
                  ? `${product.stock} items in stock` 
                  : 'Out of stock'}
              </small>
            </div>
          </div>

          <div className="d-grid gap-2 d-md-block">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              Add to Cart
            </Button>
            <Button 
              variant="outline-secondary" 
              size="lg" 
              className="ms-md-2 mt-2 mt-md-0"
              as={Link}
              to="/products"
            >
              Back to Products
            </Button>
          </div>
        </Col>
      </Row>

      {/* Product Specifications */}
      <Row className="mt-5">
        <Col>
          <h3 className="mb-4">Specifications</h3>
          <table className="table table-bordered">
            <tbody>
              {Object.entries(product.specifications).map(([key, value]) => (
                <tr key={key}>
                  <th style={{ width: '30%' }} className="table-light">{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Col>
      </Row>

      {/* Related Products section could go here */}
    </Container>
  );
};

export default ProductDetailsPage;
