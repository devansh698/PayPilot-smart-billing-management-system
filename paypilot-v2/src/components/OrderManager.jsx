import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Modal, Form } from 'reactstrap';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/orders/');
                const data = await response.json();
                setOrders(data);
            } catch (error) {
                setError('Failed to fetch orders');
            }
        };

        const fetchInventory = async () => {
            try {
                const response = await fetch('/api/product/');
                const data = await response.json();
                setInventory(data);
            } catch (error) {
                setError('Failed to fetch inventory');
            }
        };

        fetchOrders();
        fetchInventory();
    }, []);

    const handleAcceptOrder = async (order) => {
        setSelectedOrder(order);
        setModalOpen(true);
    };

    const handleConfirmOrder = async () => {
        if (selectedOrder) {
            const items = selectedOrder.products.map(product => {
                const inventoryItem = inventory.find(item => item._id === product.productId);
                return { ...product, availableQuantity: inventoryItem ? inventoryItem.quantity : 0 };
            });
    
            const canFulfill = items.every(item => item.availableQuantity >= item.quantity);
    
            if (canFulfill) {
                // Create invoice
                const invoiceData = {
                    client: selectedOrder.clientId,
                    products: items.map(item => ({
                        product: item.productId,
                        quantity: item.quantity,
                        rate: item.price,
                        amount: item.price * item.quantity,
                    })),
                    subtotal: items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                    tax: items.reduce((acc, item) => acc + (item.price * item.quantity), 0) * 0.18,
                    totalAmount: items.reduce((acc, item) => acc + (item.price * item.quantity), 0) * 1.18,
                };
    
                try {
                    const response = await fetch('http://localhost:3001/api/invoices/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(invoiceData),
                    });
    
                    const invoice = await response.json();
                    
                    // Update inventory
                    await Promise.all(items.map(item => {
                        return fetch(`/api/product/${item.productId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ quantity: item.availableQuantity - item.quantity }),
                        });
                    }));
    
                    // Update order status
                    await fetch(`/api/orders/${selectedOrder._id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'Fulfilled' }),
                    });
    
                    // Send notification (you can implement the notification API as needed)
                    alert(`Order ${selectedOrder._id} has been fulfilled and invoice ${invoice._id} created.`);
                    setModalOpen(false);
                    setSelectedOrder(null);
                } catch (error) {
                    setError('Failed to fulfill the order');
                }
            } else {
                setError('Cannot fulfill order due to insufficient inventory.');
            }
        }
    };

    return (
        <Container className="mt-5">
            <h2>Order Manager</h2>
            {error && <Alert color="danger">{error}</Alert>}
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Client</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.clientId}</td>
                            <td>{order.status}</td>
                            <td>
                                <Button color="success" onClick={() => handleAcceptOrder(order)}>Fulfill Order</Button>
                            </ td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
                <Modal.Header toggle={() => setModalOpen(false)}>
                    <Modal.Title>Confirm Order Fulfillment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to fulfill this order?</p>
                    <p>Order ID: {selectedOrder ? selectedOrder._id : ''}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button color="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button color="primary" onClick={handleConfirmOrder}>Confirm</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default OrderManager;