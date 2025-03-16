import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProductsPage = () => {
  // Mock products data (in a real app, this would come from an API call)
  const mockProducts = [
    {
      id: '1',
      name: 'Smartphone X',
      price: 699.99,
      imageUrl: 'https://via.placeholder.com/150',
      description: 'Latest smartphone with advanced features',
      category: 'Electronics'
    },
    {
      id: '2',
      name: 'Laptop Pro',
      price: 1299.99,
      imageUrl: 'https://via.placeholder.com/150',
      description: 'Powerful laptop for professionals',
      category: 'Electronics'
    },
    {
      id: '3',
      name: 'Wireless Headphones',
      price: 199.99,
      imageUrl: 'https://via.placeholder.com/150',
      description: 'High-quality sound with noise cancellation',
      category: 'Audio'
    },
    {
      id: '4',
      name: 'Smart Watch',
      price: 249.99,
      imageUrl: 'https://via.placeholder.com/150',
      description: 'Track your fitness and stay connected',
      category: 'Wearables'
    },
    {
      id: '5',
      name: 'Digital Camera',
      price: 499.99,
      imageUrl: 'https://via.placeholder.com/150',
      description: 'Capture your memories in high resolution',
      category: 'Photography'
    },
    {
      id: '6',
      name: 'Portable Speaker',
      price: 89.99,
      imageUrl: 'https://via.placeholder.com/150',
      description: 'Take your music anywhere',
      category: 'Audio'
    }
  ];

  // Mock categories
  const categories = ['All', 'Electronics', 'Audio', 'Wearables', 'Photography'];

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  // Filter and sort products
  const filteredProducts = mockProducts
    .filter(product => {
      // Filter by search term
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by category
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by selected criteria
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price_asc') {
        return a.price - b.price;
      } else if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      return 0;
    });

  return (
    <Container>
      <h1 className="mb-4 page-header">Products</h1>
      
      {/* Filters and Search */}
      <Row className="mb-4">
        <Col md={4} className="mb-3 mb-md-0">
          <InputGroup>
            <Form.Control
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="outline-secondary"
                onClick={() => setSearchTerm('')}
              >
                Clear
              </Button>
            )}
          </InputGroup>
        </Col>
        <Col md={4} className="mb-3 mb-md-0">
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by: Name</option>
            <option value="price_asc">Sort by: Price (Low to High)</option>
            <option value="price_desc">Sort by: Price (High to Low)</option>
          </Form.Select>
        </Col>
      </Row>
      
      {/* Products Grid */}
      <Row>
        {filteredProducts.length === 0 ? (
          <Col className="text-center py-5">
            <h3>No products found</h3>
            <p className="text-muted">Try changing your search or filter criteria</p>
          </Col>
        ) : (
          filteredProducts.map((product) => (
            <Col key={product.id} md={4} sm={6} className="mb-4">
              <Card className="h-100">
                <Card.Img 
                  variant="top" 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="product-image" 
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {product.category}
                  </Card.Subtitle>
                  <Card.Text className="text-primary fw-bold mb-2">
                    ${product.price.toFixed(2)}
                  </Card.Text>
                  <Card.Text className="text-muted mb-4">
                    {product.description}
                  </Card.Text>
                  <div className="mt-auto d-flex">
                    <Button
                      as={Link}
                      to={`/products/${product.id}`}
                      variant="outline-primary"
                      className="flex-grow-1 me-2"
                    >
                      Details
                    </Button>
                    <Button variant="primary" className="flex-grow-1">
                      Add to Cart
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default ProductsPage;
