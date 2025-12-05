// src/components/OrdersPage.js
import React, { useEffect, useState } from 'react';
import { fetchClientOrders } from '../api';
import { Container, Table, Button, Alert } from 'reactstrap';
import { useHistory } from 'react-router-dom'; // Import useHistory for navigation

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const history = useHistory(); // Initialize useHistory

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const response = await fetchClientOrders();
                setOrders(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch orders');
                setLoading(false);
            }
        };
        loadOrders();
    }, []);

    // Define handleViewOrder function
    const handleViewOrder = (orderId) => {
        // Navigate to the order detail page
        history.push(`/orders/${orderId}`);
    };

    // Navigate to CreateOrder page
    const handleCreateOrder = () => {
        history.push('/create-order'); // Adjust the path based on your routing setup
    };

    return (
        <Container className="mt-5">
            <h2>Your Orders</h2>
            {loading ? (
                <h2>Loading...</h2>
            ) : (
                <>
                    {error && <Alert color="danger">{error}</Alert>}
                    <Table striped>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>{order.status}</td>
                                    <td>
                                        <Button color="info" onClick={() => handleViewOrder(order._id)}>View</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Button color="primary" onClick={handleCreateOrder}>Create New Order</Button>
                </>
            )}
        </Container>
    );
};

export default OrdersPage;