import React from 'react';
import { Container, Row, Col, Button } from 'reactstrap';

const NotFoundPage = () => {
    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6} className="text-center">
                    <h1>404 - Page Not Found</h1>
                    <p>Sorry, the page you are looking for does not exist.</p>
                    <Button color="primary" href="/">Go to Home</Button>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFoundPage;