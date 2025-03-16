import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Table, ListGroup, Alert } from 'react-bootstrap';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data loading
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      // This would be an actual API fetch in a real application
      const mockOrders = {
        '1001': {
          id: '1001',
          date: '2025-03-15T10:30:00Z',
          status: 'delivered',
          subtotal: 899.98,
          shippingCost: 15.99,
          tax: 73.50,
          total: 989.47,
          items: [
            {
              id: '1',
              name: 'Smartphone X',
              price: 699.99,
              quantity: 1,
              imageUrl: 'https://via.placeholder.com/100'
            },
            {
              id: '2',
              name: 'Wireless Headphones',
              price: 199.99,
              quantity: 1,
              imageUrl: 'https://via.placeholder.com/100'
            }
          ],
          shipping: {
            method: 'Express',
            cost: 15.99,
            address: {
              name: 'John Doe',
              street: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              zipCode: '12345',
              country: 'USA'
            },
            trackingNumber: 'TRK123456789',
            carrier: 'FedEx',
            estimatedDelivery: '2025-03-18T10:30:00Z',
            actualDelivery: '2025-03-17T14:22:00Z'
          },
          payment: {
            method: 'Credit Card',
            last4: '1234',
            cardBrand: 'Visa',
            billingAddress: {
              name: 'John Doe',
              street: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              zipCode: '12345',
              country: 'USA'
            }
          },
          timeline: [
            { date: '2025-03-15T10:30:00Z', event: 'Order Placed' },
            { date: '2025-03-15T14:22:00Z', event: 'Payment Confirmed' },
            { date: '2025-03-16T09:15:00Z', event: 'Order Shipped' },
            { date: '2025-03-17T14:22:00Z', event: 'Order Delivered' }
          ]
        },
        '1002': {
          id: '1002',
          date: '2025-03-05T14:20:00Z',
          status: 'shipped',
          subtotal: 1349.98,
          shippingCost: 4.99,
          tax: 108.00,
          total: 1462.97,
          items: [
            {
              id: '3',
              name: 'Laptop Pro',
              price: 1299.99,
              quantity: 1,
              imageUrl: 'https://via.placeholder.com/100'
            },
            {
              id: '4',
              name: 'Wireless Mouse',
              price: 49.99,
              quantity: 1,
              imageUrl: 'https://via.placeholder.com/100'
            }
          ],
          shipping: {
            method: 'Standard',
            cost: 4.99,
            address: {
              name: 'John Doe',
              street: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              zipCode: '12345',
              country: 'USA'
            },
            trackingNumber: 'TRK987654321',
            carrier: 'UPS',
            estimatedDelivery: '2025-03-10T14:20:00Z'
          },
          payment: {
            method: 'PayPal',
            email: 'user@example.com',
            billingAddress: {
              name: 'John Doe',
              street: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              zipCode: '12345',
              country: 'USA'
            }
          },
          timeline: [
            { date: '2025-03-05T14:20:00Z', event: 'Order Placed' },
            { date: '2025-03-05T15:40:00Z', event: 'Payment Confirmed' },
            { date: '2025-03-07T10:15:00Z', event: 'Order Shipped' }
          ]
        },
        '1003': {
          id: '1003',
          date: '2025-02-20T09:15:00Z',
          status: 'processing',
          subtotal: 299.98,
          shippingCost: 9.99,
          tax: 24.00,
          total: 333.97,
          items: [
            {
              id: '5',
              name: 'Wireless Earbuds',
              price: 149.99,
              quantity: 2,
              imageUrl: 'https://via.placeholder.com/100'
            }
          ],
          shipping: {
            method: 'Priority',
            cost: 9.99,
            address: {
              name: 'John Doe',
              street: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              zipCode: '12345',
              country: 'USA'
            },
            estimatedDelivery: '2025-02-25T09:15:00Z'
          },
          payment: {
            method: 'Credit Card',
            last4: '5678',
            cardBrand: 'Mastercard',
            billingAddress: {
              name: 'John Doe',
              street: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              zipCode: '12345',
              country: 'USA'
            }
          },
          timeline: [
            { date: '2025-02-20T09:15:00Z', event: 'Order Placed' },
            { date: '2025-02-20T10:30:00Z', event: 'Payment Confirmed' },
          ]
        }
      };
      
      if (mockOrders[orderId]) {
        setOrder(mockOrders[orderId]);
        setLoading(false);
      } else {
        setError('Order not found');
        setLoading(false);
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [orderId]);

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading order details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
        <Button as={Link} to="/orders" variant="primary">
          Back to Orders
        </Button>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Order Not Found</Alert.Heading>
          <p>We couldn't find the order you're looking for.</p>
        </Alert>
        <Button as={Link} to="/orders" variant="primary">
          Back to Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h1 className="page-header mb-0">Order #{order.id}</h1>
        <Button as={Link} to="/orders" variant="outline-primary">
          Back to Orders
        </Button>
      </div>
      
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <Row className="align-items-center">
            <Col md={3}>
              <small className="text-muted">Order Date</small>
              <p className="mb-0">{formatDate(order.date)}</p>
            </Col>
            <Col md={6}>
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
      </Card>
      
      <Row>
        <Col lg={8}>
          {/* Order Items */}
          <Card className="mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Items</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th className="text-center">Price</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="me-3" 
                            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                          />
                          <div>
                            <p className="mb-0 fw-bold">{item.name}</p>
                            <small className="text-muted">SKU: PR-{item.id.padStart(6, '0')}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-center align-middle">${item.price.toFixed(2)}</td>
                      <td className="text-center align-middle">{item.quantity}</td>
                      <td className="text-end align-middle fw-bold">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light">
                  <tr>
                    <td colSpan="3" className="text-end">Subtotal</td>
                    <td className="text-end">${order.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end">Shipping</td>
                    <td className="text-end">${order.shippingCost.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end">Tax</td>
                    <td className="text-end">${order.tax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end fw-bold">Total</td>
                    <td className="text-end fw-bold">${order.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </Table>
            </Card.Body>
          </Card>
          
          {/* Order Timeline */}
          <Card className="mb-4 mb-lg-0">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Order Timeline</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {order.timeline.map((event, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <div className="me-auto">
                      <div className="fw-bold">{event.event}</div>
                    </div>
                    <span>{formatDate(event.date)}</span>
                  </ListGroup.Item>
                ))}
                
                {order.status === 'shipped' && (
                  <ListGroup.Item className="d-flex justify-content-between align-items-center text-muted">
                    <div className="me-auto">
                      <div className="fw-bold">Expected Delivery</div>
                    </div>
                    <span>{formatDate(order.shipping.estimatedDelivery)}</span>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          {/* Shipping Information */}
          <Card className="mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Shipping Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Delivery Address</h6>
                <p className="mb-0">{order.shipping.address.name}</p>
                <p className="mb-0">{order.shipping.address.street}</p>
                <p className="mb-0">
                  {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.zipCode}
                </p>
                <p className="mb-0">{order.shipping.address.country}</p>
              </div>
              
              <div className="mb-3">
                <h6>Shipping Method</h6>
                <p className="mb-0">{order.shipping.method} (${order.shipping.cost.toFixed(2)})</p>
              </div>
              
              {order.shipping.trackingNumber && (
                <div className="mb-0">
                  <h6>Tracking Information</h6>
                  <p className="mb-0">Carrier: {order.shipping.carrier}</p>
                  <p className="mb-0">
                    Tracking Number: {order.shipping.trackingNumber}
                  </p>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => alert('This would link to tracking page')}
                  >
                    Track Package
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
          
          {/* Payment Information */}
          <Card className="mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Payment Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Payment Method</h6>
                {order.payment.method === 'Credit Card' ? (
                  <p className="mb-0">
                    {order.payment.cardBrand} •••• {order.payment.last4}
                  </p>
                ) : (
                  <p className="mb-0">
                    {order.payment.method} ({order.payment.email})
                  </p>
                )}
              </div>
              
              <div className="mb-0">
                <h6>Billing Address</h6>
                <p className="mb-0">{order.payment.billingAddress.name}</p>
                <p className="mb-0">{order.payment.billingAddress.street}</p>
                <p className="mb-0">
                  {order.payment.billingAddress.city}, {order.payment.billingAddress.state} {order.payment.billingAddress.zipCode}
                </p>
                <p className="mb-0">{order.payment.billingAddress.country}</p>
              </div>
            </Card.Body>
          </Card>
          
          {/* Actions */}
          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">Order Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-primary"
                  onClick={() => alert('This would download the invoice')}
                >
                  Download Invoice
                </Button>
                
                {order.status === 'processing' && (
                  <Button 
                    variant="outline-danger" 
                    onClick={() => alert('Cancel functionality would be implemented here')}
                  >
                    Cancel Order
                  </Button>
                )}
                
                {order.status === 'delivered' && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => alert('Return functionality would be implemented here')}
                  >
                    Return Items
                  </Button>
                )}
                
                <Button 
                  variant="outline-secondary"
                  onClick={() => alert('Support functionality would be implemented here')}
                >
                  Contact Support
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetailsPage;
