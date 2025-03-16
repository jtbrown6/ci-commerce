import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CartPage = () => {
  // In a real application, this would come from an API or state management
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      productId: '1',
      name: 'Smartphone X',
      price: 699.99,
      quantity: 1,
      imageUrl: 'https://via.placeholder.com/100'
    },
    {
      id: '2',
      productId: '3',
      name: 'Wireless Headphones',
      price: 199.99,
      quantity: 2,
      imageUrl: 'https://via.placeholder.com/100'
    }
  ]);
  
  const [subtotal, setSubtotal] = useState(0);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Calculate subtotal when cart items change
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubtotal(total);
  }, [cartItems]);

  // Handle quantity changes
  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item from cart
  const handleRemoveItem = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Apply promo code
  const handleApplyPromoCode = () => {
    // Mock promo code logic - in a real app this would validate against an API
    if (promoCode.toLowerCase() === 'discount10') {
      setDiscount(subtotal * 0.1); // 10% discount
      alert('Promo code applied: 10% discount');
    } else {
      alert('Invalid promo code');
      setDiscount(0);
    }
  };

  // Calculate shipping cost based on selected method
  const getShippingCost = () => {
    switch(shippingMethod) {
      case 'express':
        return 15.99;
      case 'priority':
        return 9.99;
      case 'standard':
      default:
        return 4.99;
    }
  };

  // Calculate total with shipping and discount
  const getTotal = () => {
    return subtotal + getShippingCost() - discount;
  };

  // Proceed to checkout
  const handleCheckout = () => {
    alert('Proceeding to checkout... In a real application, this would navigate to a checkout page.');
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4 page-header">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>Your cart is empty</Alert.Heading>
          <p>
            Add items to your cart by browsing our products.
          </p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button as={Link} to="/products" variant="primary">
              View Products
            </Button>
          </div>
        </Alert>
      ) : (
        <Row>
          {/* Cart Items */}
          <Col lg={8} className="mb-4">
            <Card>
              <Card.Header className="bg-light">
                <Row className="fw-bold">
                  <Col md={6}>Product</Col>
                  <Col md={2} className="text-center">Price</Col>
                  <Col md={2} className="text-center">Quantity</Col>
                  <Col md={2} className="text-center">Total</Col>
                </Row>
              </Card.Header>
              <ListGroup variant="flush">
                {cartItems.map(item => (
                  <ListGroup.Item key={item.id} className="py-3 cart-item">
                    <Row className="align-items-center">
                      <Col md={6}>
                        <div className="d-flex align-items-center">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="me-3" 
                            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                          />
                          <div>
                            <h5 className="mb-1">
                              <Link to={`/products/${item.productId}`} className="text-decoration-none">
                                {item.name}
                              </Link>
                            </h5>
                            <Button 
                              variant="link" 
                              className="p-0 text-danger" 
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </Col>
                      <Col md={2} className="text-center">
                        ${item.price.toFixed(2)}
                      </Col>
                      <Col md={2} className="text-center">
                        <div className="d-flex align-items-center justify-content-center">
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="mx-2">{item.quantity}</span>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </Col>
                      <Col md={2} className="text-center fw-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Card.Footer className="d-flex justify-content-between">
                <Button 
                  as={Link} 
                  to="/products" 
                  variant="outline-primary"
                >
                  Continue Shopping
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={() => setCartItems([])}
                >
                  Clear Cart
                </Button>
              </Card.Footer>
            </Card>
          </Col>
          
          {/* Order Summary */}
          <Col lg={4}>
            <Card>
              <Card.Header className="bg-light">
                <h4 className="mb-0">Order Summary</h4>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 pb-0">
                    Subtotal
                    <span>${subtotal.toFixed(2)}</span>
                  </ListGroup.Item>
                  
                  <ListGroup.Item className="px-0">
                    <Form.Group className="mb-3">
                      <Form.Label>Shipping</Form.Label>
                      <Form.Select 
                        value={shippingMethod}
                        onChange={(e) => setShippingMethod(e.target.value)}
                      >
                        <option value="standard">Standard Shipping - $4.99</option>
                        <option value="priority">Priority Shipping - $9.99</option>
                        <option value="express">Express Shipping - $15.99</option>
                      </Form.Select>
                    </Form.Group>
                  </ListGroup.Item>
                  
                  <ListGroup.Item className="px-0">
                    <Form.Group className="mb-3">
                      <Form.Label>Promo Code</Form.Label>
                      <div className="d-flex">
                        <Form.Control 
                          type="text" 
                          placeholder="Enter code" 
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                        />
                        <Button 
                          variant="outline-secondary" 
                          className="ms-2"
                          onClick={handleApplyPromoCode}
                        >
                          Apply
                        </Button>
                      </div>
                    </Form.Group>
                  </ListGroup.Item>
                  
                  {discount > 0 && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 py-1 text-success">
                      Discount
                      <span>-${discount.toFixed(2)}</span>
                    </ListGroup.Item>
                  )}
                  
                  <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 py-1">
                    Shipping
                    <span>${getShippingCost().toFixed(2)}</span>
                  </ListGroup.Item>
                  
                  <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 pt-3">
                    <div>
                      <strong>Total</strong>
                      <small className="text-muted"> (including shipping)</small>
                    </div>
                    <span className="fw-bold fs-5">${getTotal().toFixed(2)}</span>
                  </ListGroup.Item>
                </ListGroup>
                
                <Button 
                  variant="primary" 
                  className="w-100 mt-3"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CartPage;
