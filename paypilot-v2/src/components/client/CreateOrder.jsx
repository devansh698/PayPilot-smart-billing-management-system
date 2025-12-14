import React, { useState, useEffect } from 'react';
import { Container, Form, FormGroup, Label, Input, Button, Card, CardBody, CardHeader, CardTitle, Alert, Table, Row, Col } from 'reactstrap';
import api from '../../api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiSave, FiShoppingCart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const CreateOrder = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [lineItems, setLineItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [taxRate, setTaxRate] = useState(10); // Default tax rate
    const [totalAmount, setTotalAmount] = useState(0);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    // Fetch available products
    useEffect(() => {
        api.get('/product?limit=1000') // Fetch all products for selection
            .then(res => setProducts(res.data.products || []))
            .catch(() => toast.error("Failed to load products."))
            .finally(() => setLoading(false));
    }, []);

    // Calculate totals whenever lineItems or taxRate changes
    useEffect(() => {
        const newSubtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
        const tax = newSubtotal * (taxRate / 100);
        const newTotalAmount = newSubtotal + tax;

        setSubtotal(newSubtotal);
        setTotalAmount(newTotalAmount);
    }, [lineItems, taxRate]);

    const handleAddItem = () => {
        const product = products.find(p => p._id === selectedProductId);
        const qty = Number(quantity);
        
        if (!product || qty <= 0) return toast.warning("Please select a product and valid quantity.");

        // NOTE: Stock check is performed by the backend on submission, 
        // but a client-side warning is helpful.
        if (product.quantity < qty) {
            toast.error(`Only ${product.quantity} units of ${product.name} are available.`);
            return;
        }

        const newItem = {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: qty,
            amount: product.price * qty,
        };

        setLineItems([...lineItems, newItem]);
        setSelectedProductId('');
        setQuantity(1);
    };

    const handleRemoveItem = (index) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (lineItems.length === 0) return toast.error("Please add at least one item to the order.");

        const payload = {
            products: lineItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                amount: item.amount,
            })),
            subtotal: subtotal,
            tax: subtotal * (taxRate / 100),
            totalAmount: totalAmount,
        };

        try {
            // FIX: Submit to the client portal route
            await api.post('/clients/orders', payload);
            toast.success("Order placed successfully! Pending admin approval.");
            navigate('/client-portal/orders');
        } catch (error) {
            // Backend handles stock check and returns 400 if insufficient
            toast.error(error.response?.data?.message || "Failed to place order. Check product stock.");
        }
    };

    if (loading) return <Container className="mt-5"><p>Loading order form...</p></Container>;

    return (
        <Container className="mt-5">
            <Card>
                <CardHeader>
                    <CardTitle className="d-flex align-items-center">
                        <FiShoppingCart className="me-2" /> Place New Order
                    </CardTitle>
                </CardHeader>
                <CardBody>
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-4 p-3 bg-light rounded border">
                            <Col md={5} className="mb-3 mb-md-0">
                                <FormGroup>
                                    <Label for="productSelect">Select Product</Label>
                                    <Input type="select" name="productSelect" id="productSelect" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                                        <option value="">-- Choose Product --</option>
                                        {products.map(p => (
                                            <option key={p._id} value={p._id}>
                                                {p.name} (₹{p.price.toFixed(2)}) - Stock: {p.quantity}
                                            </option>
                                        ))}
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={3}>
                                <FormGroup>
                                    <Label for="quantityInput">Quantity</Label>
                                    <Input type="number" name="quantityInput" id="quantityInput" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
                                </FormGroup>
                            </Col>
                            <Col md={4} className="d-flex align-items-end">
                                <Button color="secondary" onClick={handleAddItem} disabled={!selectedProductId || quantity <= 0} className="w-100">
                                    <FiPlus /> Add Item
                                </Button>
                            </Col>
                        </Row>

                        {lineItems.length > 0 && (
                            <Table bordered responsive size="sm" className="mb-4">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Rate</th>
                                        <th>Qty</th>
                                        <th>Amount</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lineItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.name}</td>
                                            <td>₹{item.price.toFixed(2)}</td>
                                            <td>{item.quantity}</td>
                                            <td>₹{item.amount.toFixed(2)}</td>
                                            <td>
                                                <Button size="sm" color="danger" outline onClick={() => handleRemoveItem(index)}>
                                                    <FiTrash2 />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}

                        {/* Totals Summary */}
                        <div className="d-flex justify-content-end">
                            <div style={{ width: '300px' }}>
                                <div className="d-flex justify-content-between">
                                    <span>Subtotal:</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Tax ({taxRate}%):</span>
                                    <span>₹{(subtotal * (taxRate / 100)).toFixed(2)}</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between fw-bold fs-5">
                                    <span>Total:</span>
                                    <span>₹{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end mt-4">
                            <Button type="submit" color="success" size="lg" disabled={lineItems.length === 0}>
                                <FiSave className="me-2" /> Submit Order
                            </Button>
                        </div>
                    </Form>
                </CardBody>
            </Card>
        </Container>
    );
};

export default CreateOrder;