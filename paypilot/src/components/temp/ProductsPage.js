// src/components/ProductsPage.js
import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../api';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const loadProducts = async () => {
            const response = await fetchProducts();
            setProducts(response.data);
        };

        loadProducts();
    }, []);

    return (
        <div className="container">
            <h1>Products</h1>
            <ul className="list-group">
                {products.map(product => (
                    <li key={product.id} className="list-group-item">
                        {product.name} - ${product.price}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductsPage;