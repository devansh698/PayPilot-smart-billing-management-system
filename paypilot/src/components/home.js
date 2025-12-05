import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card, CardBody } from 'reactstrap';
import { FaBolt, FaShieldAlt, FaChartLine } from 'react-icons/fa';
import NavbarComponent from './home/Navbar'; // Keep your existing Home Navbar
// import './home/home.css'; // Make sure to add some CSS for spacing

const Landing = () => {
  return (
    <div className="landing-page">
      <NavbarComponent />
      
      {/* Hero Section */}
      <section className="hero-section text-white text-center py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <Container>
          <Row className="justify-content-center">
            <Col md={8}>
              <h1 className="display-3 fw-bold mb-4">Smart Billing Made Simple</h1>
              <p className="lead mb-5 opacity-75">
                PayPilot handles your invoices, inventory, and clients seamlessly. 
                Focus on growing your business while we handle the paperwork.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/register">
                  <Button color="light" size="lg" className="px-5 text-primary fw-bold">Get Started</Button>
                </Link>
                <Link to="/login">
                  <Button outline color="light" size="lg" className="px-5">Login</Button>
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-white">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Why Choose PayPilot?</h2>
            <p className="text-muted">Everything you need to manage your business finances.</p>
          </div>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover-effect">
                <CardBody className="text-center p-4">
                  <div className="mb-3 text-primary"><FaBolt size={40}/></div>
                  <h4>Fast Invoicing</h4>
                  <p className="text-muted">Create professional invoices in seconds. Auto-calculate taxes and totals instantly.</p>
                </CardBody>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover-effect">
                <CardBody className="text-center p-4">
                  <div className="mb-3 text-success"><FaChartLine size={40}/></div>
                  <h4>Real-time Analytics</h4>
                  <p className="text-muted">Track your sales, revenue, and pending payments with our interactive dashboard.</p>
                </CardBody>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover-effect">
                <CardBody className="text-center p-4">
                  <div className="mb-3 text-info"><FaShieldAlt size={40}/></div>
                  <h4>Secure Portal</h4>
                  <p className="text-muted">Dedicated portals for your clients to view orders and manage their profiles securely.</p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 text-center">
        <Container>
          <p className="mb-0">&copy; {new Date().getFullYear()} PayPilot. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
};

export default Landing;