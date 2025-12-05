import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Modal } from 'reactstrap';
import axios from 'axios';
import Lottie from 'lottie-react';
import animationData from './animation/Animation - order compleated.json';

const AcceptOrder = () => {
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false); // New state for details modal
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('/api/orders/');
                console.log("Fetched orders", response.data);
                setOrders(response.data);
            } catch (error) {
                setError('Failed to fetch orders');
            }
        };

        const fetchInventory = async () => {
            try {
                const response = await axios.get('/api/product/');
                console.log("Fetched inventory", response.data);
                setInventory(response.data);
            } catch (error) {
                setError('Failed to fetch inventory');
            }
        };

        fetchOrders();
        fetchInventory();
    }, []);

    const handleAcceptOrder = (order) => {
        setSelectedOrder(order);
        setModalOpen(true);
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setDetailsModalOpen(true); // Open details modal
    };

    const handleConfirmOrder = async () => {
        if (selectedOrder) {
            const items = selectedOrder.products.map(product => {
                const inventoryItem = inventory.find(item => item._id === product.productId._id);
                return {
                    ...product,
                    availableQuantity: inventoryItem ? inventoryItem.quantity : 0,
                    rate: inventoryItem ? inventoryItem.price : 0,
                    amount: (inventoryItem ? inventoryItem.price : 0) * product.quantity
                };
            });

            const canFulfill = items.every(item => item.availableQuantity >= item.quantity);

            if (canFulfill) {
                const subtotal = items.reduce((acc, item) => acc + (item.amount), 0);
                const tax = subtotal * 0.18;
                const totalAmount = subtotal + tax;

                const invoiceData = {
                    client: selectedOrder.clientId._id,
                    products: items.map(item => ({
                        product: item.productId,
                        quantity: item.quantity,
                        rate: item.rate,
                        amount: item.amount
                    })),
                    subtotal: subtotal,
                    tax: tax,
                    totalAmount: totalAmount
                };

                try {
                    await axios.post('/api/invoices/', invoiceData);
                    await axios.patch(`/api/orders/${selectedOrder._id}`, { status: "Fulfilled" });
                    setModalOpen(false);
                    setSelectedOrder(null);
                    setDetailsModalOpen(false);
                    setSuccess(true);
                    setTimeout(() => {
                        setSuccess(false);
                        window.location.reload();
                    }, 4000);

                } catch (error) {
                    setError('Failed to fulfill the order');
                }
            } else {
                setError('Cannot fulfill order due to insufficient inventory.');
            }
        }
    };

    const canFulfillOrders = orders.filter(order => {
        if (order.status === "Fulfilled") {
            return false;
        }
        const items = order.products.map(product => {
            const inventoryItem = inventory.find(item => item._id === product.productId._id);
            return { ...product, availableQuantity: inventoryItem ? inventoryItem.quantity : 0 };
        });
        return items.every(item => item.availableQuantity >= item.quantity);
    });

    const cannotFulfillOrders = orders.filter(order => {
        if (order.status === "Fulfilled") {
            return false;
        }
        const items = order.products.map(product => {
            const inventoryItem = inventory.find(item => item._id === product.productId._id);
            return { ...product, availableQuantity: inventoryItem ? inventoryItem.quantity : 0 };
        });
        return !items.every(item => item.availableQuantity >= item.quantity);
    });

    const fulfilledOrders = orders.filter(order => order.status === "Fulfilled");

    return (
        <Container className="mt-5" style={{ marginTop: "80px" }}>
            <h2>Accept Orders</h2>
            {error && <Alert color="danger">{error}</Alert>}

            <h4>Orders That Can Be Fulfilled</h4>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Client Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {canFulfillOrders.map(order => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.clientId.firstName} {order.clientId.lastName}</td>
                            <td>{order.status}</td>
                            <td>
                                <Button color="info" onClick={() => handleViewDetails(order)}>View Details</Button>
                                <Button color="success" onClick={() => handleAcceptOrder(order)}>Accept</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <h4>Orders That Cannot Be Fulfilled</h4>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Client ID</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {cannotFulfillOrders.map(order => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.clientId._id}</td>
                            <td>{order.status}</td>
                            <td>
                                <Button color="info" onClick={() => handleViewDetails(order)}>View Details</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <h4>Fulfilled Orders</h4>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Client Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {fulfilledOrders.map(order => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.clientId.firstName} {order.clientId.lastName}</td>
                            <td>{order.status}</td>
                            <td>
                                <Button color="info" onClick={() => handleViewDetails(order)}>View Details</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal for Confirming Order Acceptance */}
            <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} style={{marginTop:'150px'}}>
                <div className="modal-header">
                    <h5 className="modal-title">Confirm Order Acceptance</h5>
                    <button type="button" className="close" onClick={() => setModalOpen(false)}>
                        <span>&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <p>Are you sure you want to accept order {selectedOrder?._id}?</p>
                </div>
                <div className="modal-footer">
                    <Button color="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button color="primary" onClick={handleConfirmOrder}>Confirm</Button>
                </div>
            </Modal>

            {/* Modal for Viewing Order Details */}
            <Modal isOpen={detailsModalOpen} toggle={() => setDetailsModalOpen(false)} style={{marginTop:'150px'}}>
                <div className="modal-header">
                    <h5 className="modal-title">Order Details</h5>
                    <button type="button" className="close" onClick={() => setDetailsModalOpen(false)}>
                        <span>&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    {selectedOrder && (
                        <div>
                            <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                            <p><strong>Client Name:</strong> {selectedOrder.clientId.firstName} {selectedOrder.clientId.lastName}</p>
                            <p><strong>Order Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                            <p><strong>Status:</strong> {selectedOrder.status}</p>
                            <p><strong>Subtotal:</strong> {selectedOrder.subtotal}</p>
                            <p><strong>Tax:</strong> {selectedOrder.tax}</p>
                            <p><strong>Total Amount:</strong> {selectedOrder.totalAmount}</p>
                            <h5>Products:</h5>
                            <ul>
                                {selectedOrder.products.map(product => (
                                    <li key={product.productId}>
                                        {product.productId.name} - Quantity: {product.quantity} - Price: {product.productId.price}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <Button color="secondary" onClick={() => setDetailsModalOpen(false)}>Close</Button>
                </div>
            </Modal>
                
                {/* Success Animation */}
                <Modal isOpen={success} toggle={() => setSuccess(false)} style={{marginTop:'150px', backgroundColor:"transparent"}}>
                    <div className="modal-body">
                        <Lottie animationData={animationData} style={{width: '100%', height: '100%'}} />
                    </div>
                </Modal>
        </Container>
        
    );
};

export default AcceptOrder;