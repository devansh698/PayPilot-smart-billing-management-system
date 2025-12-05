import React from 'react';
import { Container, Row, Col } from 'reactstrap';

const Footer = () => {
    return (
        <footer className="bg-dark text-white py-4">
            <Container>
                <Row>
                    <Col md={3}>
                        <h1 className="text-white">PayPilot</h1>
                    </Col>
                    <Col md={3}>
                        <h4 className="text-white">Useful Links</h4>
                        <ul className="list-unstyled">
                            <li><a href="/about" className="text-white">About</a></li>
                            <li><a href="/products" className="text-white">Products</a></li>
                            <li><a href="/contact" className="text-white">For You</a></li>
                            <li><a href="/faq" className="text-white">FAQ</a></li>
                        </ul>
                    </Col>
                    <Col md={3}>
                        <h4 className="text-white">Contact Us</h4>
                        <p className="text-white">Email: info@PayPilot.com</p>
                        <p className="text-white">Phone: +91 9875705057</p>
                    </Col>
                    <Col md={3}>
                        <h4 className="text-white">Follow Us</h4>
                        <div className="social-icons">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white">Facebook</a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white">Twitter</a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white">LinkedIn</a>
                        </div>
                    </Col>
                </Row>
                <div className="footer-bottom text-center py-2">
                    <p className="text-white">&copy; {new Date().getFullYear()} PayPilot. All rights reserved.</p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;