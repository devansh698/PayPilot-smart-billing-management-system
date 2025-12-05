// src/components/client/OrderDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrderDetails } from '../api';
import { 
  Container, Card, CardBody, CardTitle, CardText, 
  Button, Alert, Badge, Row, Col, Table 
} from 'reactstrap';
import { 
  FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, 
  FiClock, FiDollarSign, FiInfo 
} from 'react-icons/fi';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadOrderDetails = async () => {
            try {
                const response = await fetchOrderDetails(id);
                setOrder(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch order details');
                setLoading(false);
            }
        };
        loadOrderDetails();
    }, [id]);

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { color: 'warning', icon: <FiClock /> },
            'processing': { color: 'info', icon: <FiPackage /> },
            'shipped': { color: 'primary', icon: <FiTruck /> },
            'delivered': { color: 'success', icon: <FiCheckCircle /> },
            'cancelled': { color: 'danger', icon: <FiInfo /> }
        };
        const statusInfo = statusMap[status.toLowerCase()] || { color: 'secondary' };
        return (
            <Badge color={statusInfo.color} className="status-badge">
                {statusInfo.icon} {status}
            </Badge>
        );
    };

    if (loading) {
        return (
            <Container className="order-detail-loading">
                <div className="spinner"></div>
                <p>Loading order details...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="order-detail-error">
                <Alert color="danger">{error}</Alert>
                <Button color="secondary" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Back to Orders
                </Button>
            </Container>
        );
    }

    return (
        <Container fluid className="order-detail">
            <Button 
                color="link" 
                onClick={() => navigate(-1)}
                className="back-btn"
            >
                <FiArrowLeft /> Back to Orders
            </Button>

            <Row className="page-header">
                <Col>
                    <h1>Order Details</h1>
                    <p className="subtitle">Order ID: #{order._id.slice(-6)}</p>
                </Col>
                <Col className="text-right">
                    {getStatusBadge(order.status)}
                </Col>
            </Row>

            <Row>
                <Col lg={8}>
                    <Card className="order-card">
                        <CardBody>
                            <CardTitle tag="h5" className="card-title">
                                <FiPackage className="title-icon" /> Order Items
                            </CardTitle>
                            <div className="table-responsive">
                                <Table hover className="items-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Unit Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map(item => (
                                            <tr key={item.productId}>
                                                <td>
                                                    <strong>{item.productName}</strong>
                                                    {item.description && (
                                                        <p className="item-description">{item.description}</p>
                                                    )}
                                                </td>
                                                <td>{item.quantity}</td>
                                                <td>Rs.{item.unitPrice.toFixed(2)}</td>
                                                <td>Rs.{(item.quantity * item.unitPrice).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3" className="text-right">
                                                <strong>Subtotal:</strong>
                                            </td>
                                            <td>
                                                <strong>Rs.{order.subtotal.toFixed(2)}</strong>
                                            </td>
                                        </tr>
                                        {order.tax > 0 && (
                                            <tr>
                                                <td colSpan="3" className="text-right">
                                                    <strong>Tax ({order.taxRate}%):</strong>
                                                </td>
                                                <td>
                                                    <strong>Rs.{order.tax.toFixed(2)}</strong>
                                                </td>
                                            </tr>
                                        )}
                                        {order.shipping > 0 && (
                                            <tr>
                                                <td colSpan="3" className="text-right">
                                                    <strong>Shipping:</strong>
                                                </td>
                                                <td>
                                                    <strong>Rs.{order.shipping.toFixed(2)}</strong>
                                                </td>
                                            </tr>
                                        )}
                                        <tr className="total-row">
                                            <td colSpan="3" className="text-right">
                                                <strong>Total:</strong>
                                            </td>
                                            <td>
                                                <strong>Rs.{order.totalAmount.toFixed(2)}</strong>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="info-card">
                        <CardBody>
                            <CardTitle tag="h5" className="card-title">
                                <FiInfo className="title-icon" /> Order Information
                            </CardTitle>
                            <div className="info-section">
                                <h6>Shipping Details</h6>
                                <CardText>
                                    <strong>Name:</strong> {order.shippingAddress.name}<br />
                                    <strong>Address:</strong> {order.shippingAddress.address}<br />
                                    {order.shippingAddress.address2 && (
                                        <>{order.shippingAddress.address2}<br /></>
                                    )}
                                    <strong>City:</strong> {order.shippingAddress.city}<br />
                                    <strong>State:</strong> {order.shippingAddress.state}<br />
                                    <strong>Postal Code:</strong> {order.shippingAddress.postalCode}<br />
                                    <strong>Phone:</strong> {order.shippingAddress.phone}
                                </CardText>
                            </div>

                            <div className="info-section">
                                <h6>Payment Information</h6>
                                <CardText>
                                    <strong>Method:</strong> {order.paymentMethod}<br />
                                    <strong>Status:</strong> {order.paymentStatus}<br />
                                    {order.paymentId && (
                                        <><strong>Transaction ID:</strong> {order.paymentId}</>
                                    )}
                                </CardText>
                            </div>

                            <div className="info-section">
                                <h6>Timeline</h6>
                                <CardText>
                                    <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}<br />
                                    {order.shippedDate && (
                                        <><strong>Shipped Date:</strong> {new Date(order.shippedDate).toLocaleString()}<br /></>
                                    )}
                                    {order.deliveredDate && (
                                        <><strong>Delivered Date:</strong> {new Date(order.deliveredDate).toLocaleString()}</>
                                    )}
                                </CardText>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OrderDetailPage;