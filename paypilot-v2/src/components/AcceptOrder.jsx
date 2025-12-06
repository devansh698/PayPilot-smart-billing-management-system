import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter, Badge, Card, CardBody } from 'reactstrap';
import { FaCheckCircle, FaWarehouse, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AcceptOrder = () => {
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [confirmModal, setConfirmModal] = useState(false);
    const [detailsModal, setDetailsModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ordersRes, inventoryRes] = await Promise.all([
                axios.get('/api/orders/'),
                axios.get('/api/product/')
            ]);
            setOrders(ordersRes.data);
            setInventory(inventoryRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    // Logic to check if we have enough stock
    const checkStockAvailability = (orderProducts) => {
        return orderProducts.every(item => {
            const stockItem = inventory.find(inv => inv._id === item.productId._id);
            return stockItem && stockItem.stock >= item.quantity; // changed from 'quantity' to 'stock' based on typical schema
        });
    };

    const handleAcceptOrder = async () => {
        if (!selectedOrder) return;
        
        // Prepare Invoice Data
        // (Simplified logic based on your original file)
        const invoicePayload = {
            client: selectedOrder.clientId._id,
            products: selectedOrder.products.map(p => ({
                product: p.productId._id,
                quantity: p.quantity,
                rate: p.productId.price,
                amount: p.productId.price * p.quantity
            })),
            // Calculate totals...
            subtotal: selectedOrder.totalAmount / 1.18, // approximate reverse tax
            tax: selectedOrder.totalAmount - (selectedOrder.totalAmount / 1.18),
            totalAmount: selectedOrder.totalAmount
        };

        try {
            await axios.post('/api/invoices/', invoicePayload);
            await axios.patch(`/api/orders/${selectedOrder._id}`, { status: "Fulfilled" });
            
            toast.success("Order Accepted & Invoice Created!");
            setConfirmModal(false);
            fetchData(); // Refresh list
        } catch (err) {
            toast.error("Failed to accept order.");
        }
    };

    const pendingOrders = orders.filter(o => o.status !== 'Fulfilled');
    const completedOrders = orders.filter(o => o.status === 'Fulfilled');

    return (
        <Container fluid>
            <h2 className="mb-4"><FaWarehouse className="me-2"/> Order Management</h2>

            <Card className="mb-4 shadow-sm">
                <CardBody>
                    <h5 className="mb-3 text-primary">Pending Orders</h5>
                    <Table hover responsive>
                        <thead className="table-light">
                            <tr>
                                <th>Order ID</th>
                                <th>Client</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Stock Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingOrders.map(order => {
                                const hasStock = checkStockAvailability(order.products);
                                return (
                                    <tr key={order._id}>
                                        <td>#{order._id.slice(-6)}</td>
                                        <td>{order.clientId.firstName} {order.clientId.lastName}</td>
                                        <td>{new Date(order.date).toLocaleDateString()}</td>
                                        <td>${order.totalAmount}</td>
                                        <td>
                                            {hasStock ? 
                                                <Badge color="success">In Stock</Badge> : 
                                                <Badge color="danger">Insufficient Stock</Badge>
                                            }
                                        </td>
                                        <td>
                                            <Button size="sm" color="info" className="me-2" onClick={() => { setSelectedOrder(order); setDetailsModal(true); }}>View</Button>
                                            <Button 
                                                size="sm" 
                                                color="success" 
                                                disabled={!hasStock}
                                                onClick={() => { setSelectedOrder(order); setConfirmModal(true); }}
                                            >
                                                Accept
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {pendingOrders.length === 0 && <tr><td colSpan="6" className="text-center text-muted">No pending orders.</td></tr>}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>

            <Card className="shadow-sm">
                <CardBody>
                    <h5 className="mb-3 text-secondary">Completed History</h5>
                    <Table responsive>
                        <thead><tr><th>Order ID</th><th>Client</th><th>Date</th><th>Status</th></tr></thead>
                        <tbody>
                            {completedOrders.map(order => (
                                <tr key={order._id}>
                                    <td>#{order._id.slice(-6)}</td>
                                    <td>{order.clientId.firstName} {order.clientId.lastName}</td>
                                    <td>{new Date(order.date).toLocaleDateString()}</td>
                                    <td><Badge color="secondary">Fulfilled</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>

            {/* Confirm Modal */}
            <Modal isOpen={confirmModal} toggle={() => setConfirmModal(false)}>
                <ModalHeader>Confirm Order</ModalHeader>
                <ModalBody>
                    Are you sure you want to accept this order? This will deduce stock and generate an invoice automatically.
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setConfirmModal(false)}>Cancel</Button>
                    <Button color="success" onClick={handleAcceptOrder}>Confirm & Generate Invoice</Button>
                </ModalFooter>
            </Modal>
            
            {/* Details Modal */}
             <Modal isOpen={detailsModal} toggle={() => setDetailsModal(false)}>
                <ModalHeader>Order Details</ModalHeader>
                <ModalBody>
                    {selectedOrder && (
                        <ul>
                            {selectedOrder.products.map(p => (
                                <li key={p.productId._id}>
                                    {p.productId.name} x {p.quantity} units
                                </li>
                            ))}
                        </ul>
                    )}
                </ModalBody>
            </Modal>
        </Container>
    );
};

export default AcceptOrder;