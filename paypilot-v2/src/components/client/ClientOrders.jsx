// src/components/client/ClientOrders.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Container, Table, Alert, Button, Badge, Row, Col, Card 
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiPackage, FiClock, FiCheckCircle, FiTruck } from 'react-icons/fi';
import Lottie from 'lottie-react';
import animationData from '../animation/Animation - order placed main.json';
import './ClientOrders.css';

const ClientOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('/api/clientroutes/orders');
                setOrders(response.data);
            } catch (error) {
                setError('Failed to fetch orders.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleCreateOrder = () => {
        setSuccess(true);
        setTimeout(() => navigate('/create-order'), 1500);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { color: 'warning', icon: <FiClock className="status-icon" /> },
            'completed': { color: 'success', icon: <FiCheckCircle className="status-icon" /> },
            'shipped': { color: 'info', icon: <FiTruck className="status-icon" /> },
            'cancelled': { color: 'danger' }
        };
        const statusInfo = statusMap[status.toLowerCase()] || { color: 'secondary' };
        return (
            <Badge color={statusInfo.color} className="status-badge">
                {statusInfo.icon || ''} {status}
            </Badge>
        );
    };

    return (
        <Container fluid className="client-orders">
            {success && (
                <div className="success-overlay">
                    <div className="success-animation">
                        <Lottie animationData={animationData} />
                    </div>
                </div>
            )}
            
            <Row className="page-header">
                <Col>
                    <h1>My Orders</h1>
                    <p className="subtitle">View and manage your orders</p>
                </Col>
                <Col className="text-right">
                    <Button 
                        color="primary" 
                        onClick={handleCreateOrder}
                        className="create-order-btn"
                    >
                        <FiPlus className="btn-icon" /> Create New Order
                    </Button>
                </Col>
            </Row>

            {loading ? (
                <Card className="loading-card">
                    <div className="spinner"></div>
                    <p>Loading your orders...</p>
                </Card>
            ) : error ? (
                <Alert color="danger" className="alert-error">{error}</Alert>
            ) : (
                <Card className="orders-card">
                    <div className="table-responsive">
                        <Table hover className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Total Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <tr key={order._id}>
                                            <td>#{order._id.slice(-6)}</td>
                                            <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                            <td>{getStatusBadge(order.status)}</td>
                                            <td>Rs.{order.totalAmount.toFixed(2)}</td>
                                            <td>
                                                <Button 
                                                    color="link" 
                                                    size="sm"
                                                    onClick={() => navigate(`/orders/${order._id}`)}
                                                >
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center no-orders">
                                            <FiPackage className="empty-icon" />
                                            <p>No orders found</p>
                                            <Button 
                                                color="primary" 
                                                onClick={handleCreateOrder}
                                            >
                                                Create Your First Order
                                            </Button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card>
            )}
        </Container>
    );
};

export default ClientOrders;