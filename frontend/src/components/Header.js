import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  // Mock user state - in a real app, this would come from a context or state management
  const loggedIn = false;
  const cartItemCount = 0;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">MicroCommerce</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/">Home</Nav.Link>
            <Nav.Link as={NavLink} to="/products">Products</Nav.Link>
            {loggedIn && (
              <Nav.Link as={NavLink} to="/orders">Orders</Nav.Link>
            )}
          </Nav>
          <Nav>
            <Nav.Link as={NavLink} to="/cart" className="position-relative me-3">
              Cart
              {cartItemCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartItemCount}
                </span>
              )}
            </Nav.Link>
            {loggedIn ? (
              <>
                <Nav.Link as={NavLink} to="/profile">Profile</Nav.Link>
                <Button variant="outline-light">Logout</Button>
              </>
            ) : (
              <>
                <Button variant="outline-light" className="me-2">Login</Button>
                <Button variant="primary">Register</Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
