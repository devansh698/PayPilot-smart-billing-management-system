// src/components/CreateOrder.js
import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Alert, Input } from 'reactstrap';
import axios from 'axios';

const CreateOrder = () => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState({});
    const [subtotal, setSubtotal] = useState(0);
    const [taxRate] = useState(0.1); // Example tax rate of 10%
    const [tax, setTax] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/product/');
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to fetch products.');
            }
        };

        fetchProducts();
    }, []);

    const handleQuantityChange = (productId, quantity) => {
        if (quantity < 0) return; // Prevent negative quantities
        setSelectedProducts({
            ...selectedProducts,
            [productId]: quantity,
        });
    };

    useEffect(() => {
        const calculateAmounts = () => {
            let subtotalCalc = 0;
            for (const productId in selectedProducts) {
                const product = products.find(prod => prod._id === productId);
                if (product) {
                    subtotalCalc += product.price * selectedProducts[productId];
                }
            }
            const taxCalc = subtotalCalc * taxRate;
            const totalCalc = subtotalCalc + taxCalc;

            setSubtotal(subtotalCalc);
            setTax(taxCalc);
            setTotalAmount(totalCalc);
        };

        calculateAmounts();
    }, [selectedProducts, products, taxRate]);

    const handlePlaceOrder = async () => {
        const orderDetails = Object.keys(selectedProducts).map(productId => ({
            productId: productId, // Product ID
            quantity: selectedProducts[productId], // Quantity
        }));
    
        try {
            setLoading(true);
            console.log(orderDetails);
            await axios.post('/api/clientroutes/orders', {
                products: orderDetails,
                subtotal: subtotal.toFixed(2),
                tax: tax.toFixed(2),
                totalAmount: totalAmount.toFixed(2),
            });
            alert('Order placed successfully!');
            // Reset state
            setSelectedProducts({});
            setSubtotal(0);
            setTax(0);
            setTotalAmount(0);
        } catch (error) {
            console.error('Error placing order:', error.response.data); // Log the error response
            setError('Failed to place order.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <h1>Create New Order</h1>
            {error && <Alert color="danger">{error}</Alert>}
            {loading && <Alert color="info">Placing your order...</Alert>}
            <Table className="table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product._id}>
                            <td>{product.name}</td>
                            <td>Rs.{product.price .toFixed(2)}</td>
                            <td>
                                <Input
                                    type="number"
                                    min="0"
                                    value={selectedProducts[product._id] || 0}
                                    onChange={(e) => handleQuantityChange(product._id, Number(e.target.value))}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <h2>Subtotal: Rs.{subtotal.toFixed(2)}</h2>
            <h2>Tax: Rs.{tax.toFixed(2)}</h2>
            <h2>Total Amount: Rs.{totalAmount.toFixed(2)}</h2>
            <Button color="primary" onClick={handlePlaceOrder} disabled={totalAmount === 0 || loading}>
                Place Order
            </Button>
        </Container>
    );
};

export default CreateOrder;