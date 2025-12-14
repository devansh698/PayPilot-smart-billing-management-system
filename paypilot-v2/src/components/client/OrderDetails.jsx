import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, CardBody, CardHeader, CardTitle, Table, Alert, Button, Badge } from 'reactstrap';
import api from '../../api';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiTag, FiCalendar, FiDollarSign, FiPackage } from 'react-icons/fi';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrderDetails = async () => {
        try {
            // Fetch order details from the client portal route
            const res = await api.get(`/clients/orders/${id}`);
            setOrder(res.data);
        } catch (error) {
            toast.error("Failed to fetch order details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    if (loading) return <Container className="mt-5"><p>Loading order details...</p></Container>;
    if (!order) return <Container className="mt-5"><Alert color="danger">Order not found or access denied.</Alert></Container>;

    const getStatusColor = (status) => {
        const s = status ? status.toLowerCase() : '';
        if (s.includes('completed')) return 'success';
        if (s.includes('accepted')) return 'primary';
        if (s.includes('pending')) return 'warning';
        return 'secondary';
    };

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Order Details: #{order._id.slice(-6).toUpperCase()}</h2>
                <Button color="secondary" outline onClick={() => navigate(-1)}>
                    <FiArrowLeft className="me-2" /> Back to Orders
                </Button>
            </div>
            
            <Card className="mb-4">
                <CardBody>
                    <Row>
                        <Col md={3}><p className="text-muted mb-0"><FiTag className="me-2" />Status:</p><h5 className="mb-0"><Badge color={getStatusColor(order.status)}>{order.status}</Badge></h5></Col>
                        <Col md={3}><p className="text-muted mb-0"><FiCalendar className="me-2" />Date:</p><h5>{new Date(order.createdAt).toLocaleDateString()}</h5></Col>
                        <Col md={3}><p className="text-muted mb-0"><FiDollarSign className="me-2" />Subtotal:</p><h5>₹{order.subtotal.toFixed(2)}</h5></Col>
                        <Col md={3}><p className="text-muted mb-0"><FiDollarSign className="me-2" />Total:</p><h4 className="text-primary">₹{order.totalAmount.toFixed(2)}</h4></Col>
                    </Row>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="d-flex align-items-center">
                        <FiPackage className="me-2" /> Ordered Items
                    </CardTitle>
                </CardHeader>
                <CardBody>
                    <Table responsive striped size="sm">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.products.map((item, index) => (
                                <tr key={index}>
                                    {/* Product is not populated in the current clients/orders/:id route, so we use the name field if available, otherwise show ID */}
                                    <td>{item.name || item.productId}</td> 
                                    <td>{item.quantity}</td>
                                    <td>₹{item.price?.toFixed(2) || 'N/A'}</td>
                                    <td>₹{item.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        </Container>
    );
};

export default OrderDetails;