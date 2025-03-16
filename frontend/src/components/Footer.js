import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row>
          <Col md={6} className="mb-3 mb-md-0">
            <h5>MicroCommerce</h5>
            <p className="text-muted">
              A microservices e-commerce application built for learning DevOps and CI/CD.
            </p>
          </Col>
          <Col md={3} className="mb-3 mb-md-0">
            <h5>Services</h5>
            <ul className="list-unstyled">
              <li>User Service</li>
              <li>Product Service</li>
              <li>Cart Service</li>
              <li>Order Service</li>
            </ul>
          </Col>
          <Col md={3}>
            <h5>Technologies</h5>
            <ul className="list-unstyled">
              <li>Node.js</li>
              <li>Express</li>
              <li>React</li>
              <li>PostgreSQL</li>
            </ul>
          </Col>
        </Row>
        <hr className="my-3" />
        <Row>
          <Col className="text-center">
            <p className="mb-0">
              © {new Date().getFullYear()} MicroCommerce. For educational purposes only.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
