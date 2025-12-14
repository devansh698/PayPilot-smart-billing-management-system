import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, CardBody, Badge, Alert } from 'reactstrap';
import api from '../../api';
import { toast } from 'react-toastify';
import { FiEye, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ClientOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    
    const PAGE_LIMIT = 10;

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Fetch orders from the client portal route
            const res = await api.get(`/clients/orders?page=${currentPage}&limit=${PAGE_LIMIT}&sortBy=createdAt&sortOrder=desc`);
            
            setOrders(res.data.orders || []);
            setTotalPages(res.data.totalPages || 1);

        } catch (error) {
            toast.error("Failed to fetch orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [currentPage]);

    const getStatusColor = (status) => {
        const s = status ? status.toLowerCase() : '';
        if (s.includes('completed')) return 'success';
        if (s.includes('accepted')) return 'primary';
        if (s.includes('pending')) return 'warning';
        if (s.includes('rejected') || s.includes('cancelled')) return 'danger';
        return 'secondary';
    };

    if (loading) return <Container className="mt-5"><p>Loading orders...</p></Container>;

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Your Orders</h1>
                <Button color="success" onClick={() => navigate('/client-portal/create-order')}>
                    <FiPlus className="me-2" /> Place New Order
                </Button>
            </div>
            
            <Card className="shadow-sm border-0">
                <CardBody>
                    {orders.length === 0 ? (
                        <Alert color="info">You have not placed any orders yet.</Alert>
                    ) : (
                        <Table hover responsive>
                            <thead className="table-light">
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id}>
                                        <td className="fw-bold">#{order._id.slice(-6).toUpperCase()}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>₹{order.totalAmount.toFixed(2)}</td>
                                        <td><Badge color={getStatusColor(order.status)}>{order.status}</Badge></td>
                                        <td className="text-end">
                                            <Button size="sm" color="info" outline onClick={() => navigate(`/client-portal/orders/${order._id}`)}>
                                                <FiEye /> View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                    
                    {/* Pagination Controls */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <small className="text-muted">Page {currentPage} of {totalPages}</small>
                        <div>
                            <Button size="sm" color="secondary" outline className="me-2" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Previous</Button>
                            <Button size="sm" color="secondary" outline onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Next</Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Container>
    );
};

export default ClientOrders;