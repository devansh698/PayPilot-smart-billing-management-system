import React, { useState, useEffect } from "react";
import { Container, Table, Button, Alert } from "reactstrap";
import ModalImage from "react-modal-image"; // Updated import
// import "react-modal-image/style.css"; // Removed this line if the file doesn't exist

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("/api/product/");
                const data = await response.json();
                setProducts(data);
                setLoading(false);
            } catch (error) {
                setError("Failed to fetch products");
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <Container className="mt-5">
            <h1 className="page-title">Products</h1>
            {loading && <p>Loading products...</p>}
            {error && <Alert color="danger">{error}</Alert>}
            <Table className="table table-striped">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Image</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => {
                        const imageUrl = `/uploads/${product.image}`;
                        return (
                            <tr key={product._id}>
                                <td>{product.name}</td>
                                <td>{product.description}</td>
                                <td>${product.price}</td>
                                <td style={{
                                width: 90,
                                height: 90,
                                borderRadius: 10,
                                objectFit: "cover",
                              }}>
                                    <ModalImage
                                        small={imageUrl}
                                        large={imageUrl}
                                        alt={product.name}
                                        
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </Container>
    );
};

export default ProductList;