import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HomePage = () => {
  // Mock featured products
  const featuredProducts = [
    {
      id: '1',
      name: 'Smartphone X',
      price: 699.99,
      imageUrl: 'https://via.placeholder.com/150',
      description: 'Latest smartphone with advanced features'
    },
    {
      id: '2',
      name: 'Laptop Pro',
      price: 1299.99,
      imageUrl: 'https://via.placeholder.com/150',
      description: 'Powerful laptop for professionals'
    },
    {
      id: '3',
      name: 'Wireless Headphones',
      price: 199.99,
      imageUrl: 'https://via.placeholder.com/150',
      description: 'High-quality sound with noise cancellation'
    }
  ];

  return (
    <Container>
      {/* Hero Section */}
      <Row className="mb-5">
        <Col>
          <div className="bg-primary text-white p-5 rounded shadow">
            <h1>Welcome to MicroCommerce</h1>
            <p className="lead">
              Discover our wide range of products in our microservices-based e-commerce platform.
            </p>
            <Button
              as={Link}
              to="/products"
              variant="light"
              size="lg"
              className="mt-3"
            >
              Shop Now
            </Button>
          </div>
        </Col>
      </Row>

      {/* Featured Products */}
      <h2 className="mb-4">Featured Products</h2>
      <Row>
        {featuredProducts.map((product) => (
          <Col key={product.id} md={4} className="mb-4">
            <Card className="h-100">
              <Card.Img 
                variant="top" 
                src={product.imageUrl} 
                alt={product.name} 
                className="product-image"
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>${product.price.toFixed(2)}</Card.Text>
                <Card.Text className="text-muted mb-4">
                  {product.description}
                </Card.Text>
                <div className="mt-auto">
                  <Button
                    as={Link}
                    to={`/products/${product.id}`}
                    variant="outline-primary"
                    className="w-100"
                  >
                    View Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Info Sections */}
      <Row className="mt-5">
        <Col md={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="mb-3 fs-1 text-primary">
                <i className="bi bi-truck"></i> 📦
              </div>
              <Card.Title>Fast Shipping</Card.Title>
              <Card.Text>
                Get your products delivered quickly and reliably.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="mb-3 fs-1 text-primary">
                <i className="bi bi-shield-check"></i> 🔒
              </div>
              <Card.Title>Secure Payments</Card.Title>
              <Card.Text>
                Your transactions are protected with the latest security.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="mb-3 fs-1 text-primary">
                <i className="bi bi-arrow-counterclockwise"></i> ↩️
              </div>
              <Card.Title>Easy Returns</Card.Title>
              <Card.Text>
                Not satisfied? Return your products within 30 days.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
