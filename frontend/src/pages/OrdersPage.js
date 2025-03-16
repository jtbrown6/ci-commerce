import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Accordion } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const OrdersPage = () => {
  // In a real application, orders would come from an API
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data loading
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      // This would be a real API fetch in a production app
      const mockOrders = [
        {
          id: '1001',
          date: '2025-03-15T10:30:00Z',
          status: 'delivered',
          total: 899.97,
          items: [
            {
              id: '1',
              name: 'Smartphone X',
              price: 699.99,
              quantity: 1,
              imageUrl: 'https://via.placeholder.com/50'
            },
            {
              id: '2',
              name: 'Wireless Headphones',
              price: 199.99,
              quantity: 1,
              imageUrl: 'https://via.placeholder.com/50'
            }
          ],
          shipping: {
            method: 'Express',
            cost: 15.99,
            address: '123 Main St, Anytown, USA',
            trackingNumber: 'TRK123456789'
          },
          payment: {
            method: 'Credit Card',
            last4: '1234'
          }
        },
        {
          id: '1002',
          date: '2025-03-05T14:20:00Z',
          status: 'shipped',
          total: 1354.97,
          items: [
            {
              id: '3',
              name: 'Laptop Pro',
              price: 1299.99,
              quantity: 1,
              imageUrl: 'https://via.placeholder.com/50'
            },
            {
              id: '4',
              name: 'Wireless Mouse',
              price: 49.99,
              quantity: 1,
              imageUrl: 'https://via.placeholder.com/50'
            }
          ],
          shipping: {
            method: 'Standard',
            cost: 4.99,
            address: '123 Main St, Anytown, USA',
            trackingNumber: 'TRK987654321'
          },
          payment: {
            method: 'PayPal',
            email: 'user@example.com'
          }
        },
        {
          id: '1003',
          date: '2025-02-20T09:15:00Z',
          status: 'processing',
          total: 299.98,
          items: [
            {
              id: '5',
              name: 'Wireless Earbuds',
              price: 149.99,
              quantity: 2,
              imageUrl: 'https://via.placeholder.com/50'
            }
          ],
          shipping: {
            method: 'Priority',
            cost: 9.99,
            address: '123 Main St, Anytown, USA'
          },
          payment: {
            method: 'Credit Card',
            last4: '5678'
          }
        }
      ];
      
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to get status badge color
  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'primary';
      case 'processing':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4 page-header">My Orders</h1>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <h3>No Orders Found</h3>
            <p className="text-muted">You haven't placed any orders yet.</p>
            <Button as={Link} to="/products" variant="primary" className="mt-3">
              Start Shopping
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div>
          {orders.map(order => (
            <Card key={order.id} className="mb-4 order-item">
              <Card.Header className="bg-light">
                <Row className="align-items-center">
                  <Col md={3}>
                    <small className="text-muted">Order #</small>
                    <p className="mb-0 fw-bold">{order.id}</p>
                  </Col>
                  <Col md={3}>
                    <small className="text-muted">Placed on</small>
                    <p className="mb-0">{formatDate(order.date)}</p>
                  </Col>
                  <Col md={3}>
                    <small className="text-muted">Total</small>
                    <p className="mb-0 fw-bold">${order.total.toFixed(2)}</p>
                  </Col>
                  <Col md={3} className="text-md-end">
                    <Badge 
                      bg={getStatusBadgeVariant(order.status)}
                      className="order-status"
                    >
                      {order.status.toUpperCase()}
                    </Badge>
                  </Col>
                </Row>
              </Card.Header>
              
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <h5 className="mb-3">Items</h5>
                    {order.items.map(item => (
                      <div key={item.id} className="d-flex mb-2 align-items-center">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="me-3" 
                          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                        />
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-bold">{item.name}</p>
                          <small className="text-muted">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </small>
                        </div>
                        <div className="text-end fw-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </Col>
                  
                  <Col md={4}>
                    <h5 className="mb-3">Order Details</h5>
                    <Accordion flush>
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>Shipping Information</Accordion.Header>
                        <Accordion.Body>
                          <p className="mb-1"><strong>Method:</strong> {order.shipping.method}</p>
                          <p className="mb-1"><strong>Address:</strong> {order.shipping.address}</p>
                          {order.shipping.trackingNumber && (
                            <p className="mb-1"><strong>Tracking:</strong> {order.shipping.trackingNumber}</p>
                          )}
                          <p className="mb-0"><strong>Cost:</strong> ${order.shipping.cost.toFixed(2)}</p>
                        </Accordion.Body>
                      </Accordion.Item>
                      <Accordion.Item eventKey="1">
                        <Accordion.Header>Payment Information</Accordion.Header>
                        <Accordion.Body>
                          <p className="mb-1"><strong>Method:</strong> {order.payment.method}</p>
                          {order.payment.last4 && (
                            <p className="mb-0"><strong>Card:</strong> •••• {order.payment.last4}</p>
                          )}
                          {order.payment.email && (
                            <p className="mb-0"><strong>Account:</strong> {order.payment.email}</p>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </Col>
                </Row>
              </Card.Body>
              
              <Card.Footer className="text-end">
                <Button 
                  as={Link}
                  to={`/orders/${order.id}`}
                  variant="outline-primary"
                  size="sm"
                >
                  View Order Details
                </Button>
                
                {order.status === 'processing' && (
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    className="ms-2"
                    onClick={() => alert('Cancel functionality would be implemented here')}
                  >
                    Cancel Order
                  </Button>
                )}
                
                {order.status === 'delivered' && (
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    className="ms-2"
                    onClick={() => alert('Return functionality would be implemented here')}
                  >
                    Return Items
                  </Button>
                )}
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default OrdersPage;
