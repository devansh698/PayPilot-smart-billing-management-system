import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Or use api instance
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, AlertTriangle, Package } from "lucide-react";
import { toast } from 'react-toastify';
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";
import LoadingPage from './LoadingPage';
import api from '../api';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/product/');
            setProducts(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.stock < 10).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory</h1>
                    <p className="text-muted-foreground mt-1">Manage products and stock levels.</p>
                </div>
                <Link to="/add-product">
                    <Button>
                        <Plus size={16} className="mr-2" /> Add Product
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold mt-2">{totalProducts}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">In Stock</p>
                    <p className="text-2xl font-bold mt-2 text-green-600">{totalProducts - lowStockCount}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Low Stock</p>
                    <p className="text-2xl font-bold mt-2 text-yellow-600">{lowStockCount}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Out of Stock</p>
                    <p className="text-2xl font-bold mt-2 text-red-600">{outOfStockCount}</p>
                </Card>
            </div>

            <Card>
                <div className="p-6 border-b border-border space-y-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="Search products..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {lowStockCount > 0 && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
                            <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
                            <div>
                                <p className="text-sm font-semibold text-yellow-700">Low Stock Alert</p>
                                <p className="text-sm text-yellow-600/90 mt-1">{lowStockCount} products are running low on stock.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-3">Product Name</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Stock Level</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                                        <Package size={16} className="text-muted-foreground" />
                                        {product.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline">{product.category || 'General'}</Badge>
                                    </td>
                                    <td className="px-6 py-4">${product.price}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-medium ${product.stock < 10 ? "text-red-500" : "text-green-600"}`}>
                                            {product.stock} units
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Edit size={16} className="text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product._id)}>
                                                <Trash2 size={16} className="text-destructive" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                             {filteredProducts.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                                        No products found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ProductList;