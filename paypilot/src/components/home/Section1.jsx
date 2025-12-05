import React from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import img from "./assets/section1.png"
const Section1 = () => {
    return (
        <div className="section1" id='section1' style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '100vh', display: 'flex', alignItems: 'center' }}>
            <Container>
                <Row>
                    <Col md={6} className="offset-md-6 text-right text-white">
                        <h1>Unlock the Power of Smart</h1>
                        <p>Our innovative billing system is designed to revolutionalize the way you manage your finances.</p>
                        <Button color="primary">Get Started</Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Section1;