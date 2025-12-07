import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Card, CardBody, Badge } from 'reactstrap';
import { FaEdit, FaTrash, FaBoxOpen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import api from './api.jsx';

const ProductList = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/product/');
            setProducts(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Delete this product?")) {
            try {
                await api.delete(`/product/${id}`);
                toast.success("Product deleted");
                setProducts(products.filter(p => p._id !== id));
            } catch (err) {
                toast.error("Failed to delete");
            }
        }
    };

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Product Inventory</h2>
                <Link to="/add-product">
                    <Button color="success"><FaBoxOpen className="me-2"/> Add Product</Button>
                </Link>
            </div>

            <Card className="shadow-sm border-0">
                <CardBody>
                    <Table hover responsive>
                        <thead className="table-light">
                            <tr>
                                <th>Product Name</th>
                                <th>Price</th>
                                <th>Category</th>
                                <th>Stock</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td className="fw-bold">{product.name}</td>
                                    <td>${product.price}</td>
                                    <td><Badge color="info">{product.category || 'General'}</Badge></td>
                                    <td>
                                        <span className={product.stock < 10 ? "text-danger fw-bold" : "text-success"}>
                                            {product.stock || 0} units
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <Button size="sm" outline color="primary" className="me-2"><FaEdit/></Button>
                                        <Button size="sm" outline color="danger" onClick={() => handleDelete(product._id)}><FaTrash/></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        </Container>
    );
};

export default ProductList;