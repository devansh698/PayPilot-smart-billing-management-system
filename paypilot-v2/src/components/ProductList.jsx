import React, { useState, useEffect } from 'react';
import api from '../api'; // Corrected import path
import { Container, Table, Button, Card, CardBody, Badge } from 'reactstrap';
import { FaEdit, FaTrash, FaBoxOpen, FaSearch } from 'react-icons/fa'; // Added FaSearch
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const PAGE_LIMIT = 10;

    useEffect(() => {
        // Re-fetch products whenever currentPage or searchTerm changes
        fetchProducts(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    const fetchProducts = async (page, search) => {
        setLoading(true);
        try {
            // Use pagination and search query parameters
            const res = await api.get(`/product/?page=${page}&limit=${PAGE_LIMIT}&search=${search}`);
            
            // FIX: Extract the product array from the paginated response
            setProducts(res.data.products || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Delete this product?")) {
            try {
                await api.delete(`/product/${id}`);
                toast.success("Product deleted");
                // Check if the current page is now empty and needs to navigate back
                if (products.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchProducts(currentPage, searchTerm); // Refresh current list
                }
            } catch (err) {
                toast.error("Failed to delete product");
            }
        }
    };
    
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to page 1 on new search
    }

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
                    {/* Search and Filter Section */}
                    <div className="mb-3 d-flex align-items-center">
                        <div className="input-group" style={{maxWidth: '300px'}}>
                            <span className="input-group-text"><FaSearch/></span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                    
                    {loading ? (
                        <p className="text-center my-4">Loading products...</p>
                    ) : products.length === 0 ? (
                        <p className="text-center my-4">No products found for the current search criteria.</p>
                    ) : (
                        <Table hover responsive className="mb-4">
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
                                            {/* FIX: Use product.quantity instead of product.stock */}
                                            <span className={product.quantity < 10 ? "text-danger fw-bold" : "text-success"}>
                                                {product.quantity || 0} units
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            {/* Assuming Edit link navigates to /edit-product/:id */}
                                            <Link to={`/edit-product/${product._id}`}> 
                                                <Button size="sm" outline color="primary" className="me-2"><FaEdit/></Button>
                                            </Link>
                                            <Button size="sm" outline color="danger" onClick={() => handleDelete(product._id)}><FaTrash/></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                    
                    {/* Pagination Controls */}
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Page {currentPage} of {totalPages}</small>
                        <div>
                            <Button 
                                size="sm" 
                                color="secondary" 
                                outline 
                                className="me-2"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button 
                                size="sm" 
                                color="secondary" 
                                outline
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Container>
    );
};

export default ProductList;