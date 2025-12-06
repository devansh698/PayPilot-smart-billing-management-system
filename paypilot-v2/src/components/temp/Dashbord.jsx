import React from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText } from 'reactstrap';

const Dashboard = () => {
    return (
        <Container className="mt-5">
            <h1>Dashboard</h1>
            <Row>
                <Col md={4}>
                    <Card className="mb-4">
                        <CardBody>
                            <CardTitle tag="h5">Total Invoices</CardTitle>
                            <CardText>50</CardText>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4">
                        <CardBody>
                            <CardTitle tag="h5">Total Payments</CardTitle>
                            <CardText>$10,000</CardText>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4">
                        <CardBody>
                            <CardTitle tag="h5">Total Clients</CardTitle>
                            <CardText>30</CardText>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col md={12}>
                    <Card>
                        <CardBody>
                            <CardTitle tag="h5">Recent Activities</CardTitle>
                            <CardText>Last invoice created on 01/01/2023</CardText>
                            <CardText>Payment received from Client A</CardText>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;