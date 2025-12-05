import React from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import img from "./assets/section2.png"
const Section2 = () => {
    return (
        <div className="section2" style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '100vh', display: 'flex', alignItems: 'center' }}>
            <Container>
                <Row>
                    <Col md={6} className="offset-md-3 text-center text-primary">
                        <h1>Plan Your Financial Future</h1>
                        <p>We provide the tools and resources you need to build a secure and prosperous future.</p>
                        <Button color="primary">Learn More</Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Section2;