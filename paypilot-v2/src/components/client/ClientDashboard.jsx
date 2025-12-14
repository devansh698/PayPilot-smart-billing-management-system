import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Container, Card, CardBody, CardHeader, CardTitle, Row, Col, Alert, Table, Button } from 'reactstrap';
import { FiFileText, FiDollarSign, FiShoppingBag, FiBell, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ClientDashboard = () => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // Fetch dashboard data from the client portal route
            const res = await api.get('/clients/dashboaed'); // Note the slight misspelling in backend route: /dashboaed
            setData(res.data);
        } catch (error) {
            toast.error("Failed to fetch dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Live data polling every 10 seconds
        const interval = setInterval(fetchData, 10000); 
        return () => clearInterval(interval); 
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    if (loading) return <Container className="mt-5"><p>Loading dashboard...</p></Container>;

    return (
        <Container fluid className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Welcome, {data.profile?.firstName || data.profile?.username || "Client"}!</h2>
                 <Button color="secondary" outline onClick={fetchData}>
                    <FiRefreshCw className="me-2" /> Refresh Data
                </Button>
            </div>
            

            <Row>
                {/* Placeholder for Invoice/Payment Status - Data not aggregated in /dashboaed route, using generic numbers */}
                <Col md={4} className="mb-4">
                    <Card className="shadow-sm border-0">
                        <CardBody className="d-flex justify-content-between align-items-center">
                            <div>
                                <CardTitle tag="h6" className="text-muted">Pending Invoices</CardTitle>
                                <h3 className="text-warning">3</h3>
                            </div>
                            <FiFileText size={30} className="text-warning" />
                        </CardBody>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="shadow-sm border-0">
                        <CardBody className="d-flex justify-content-between align-items-center">
                            <div>
                                <CardTitle tag="h6" className="text-muted">Recent Payments</CardTitle>
                                <h3 className="text-success">{data.recentPayments?.length || 0}</h3>
                            </div>
                            <FiDollarSign size={30} className="text-success" />
                        </CardBody>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="shadow-sm border-0">
                        <CardBody className="d-flex justify-content-between align-items-center">
                            <div>
                                <CardTitle tag="h6" className="text-muted">Recent Orders</CardTitle>
                                <h3 className="text-primary">{data.recentOrders?.length || 0}</h3>
                            </div>
                            <FiShoppingBag size={30} className="text-primary" />
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={6} className="mb-4">
                    <Card>
                        <CardHeader>Recent Orders</CardHeader>
                        <CardBody>
                            <Table responsive size="sm" className="mb-0">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recentOrders?.map(order => (
                                        <tr key={order._id}>
                                            <td>#{order._id.slice(-6)}</td>
                                            <td>{formatCurrency(order.totalAmount)}</td>
                                            <td>{order.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={6} className="mb-4">
                    <Card>
                        <CardHeader>Recent Notifications</CardHeader>
                        <CardBody>
                            {data.notifications?.length > 0 ? (
                                <ul className="list-unstyled mb-0">
                                    {data.notifications.map(notif => (
                                        <li key={notif._id} className="text-sm mb-2 d-flex">
                                            <FiBell className="me-2 text-info flex-shrink-0" />
                                            <div>{notif.message}</div>
                                        </li>
                                    ))}
                                </ul>
                            ) : <Alert color="secondary" className="mb-0">No recent notifications.</Alert>}
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ClientDashboard;