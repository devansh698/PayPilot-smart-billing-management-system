import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Package, X } from "lucide-react";
import { toast } from 'react-toastify';
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Badge } from "./ui/Badge";
import ConfirmationModal from "./ui/ConfirmationModal";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteId, setDeleteId] = useState(null);
    const [editProduct, setEditProduct] = useState(null);

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

    const handleDelete = async () => {
        if(!deleteId) return;
        try {
            await api.delete(`/product/${deleteId}`);
            toast.success("Product deleted");
            setProducts(products.filter(p => p._id !== deleteId));
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/product/${editProduct._id}`, editProduct);
            toast.success("Product updated");
            setEditProduct(null);
            fetchProducts();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Product Inventory</h1>
                    <p className="text-muted-foreground mt-1">Manage your products and services.</p>
                </div>
                <Link to="/add-product">
                    <Button>
                        <Plus size={16} className="mr-2" /> Add Product
                    </Button>
                </Link>
            </div>

            <Card>
                <div className="p-6 border-b border-border">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="Search products..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-3">Product Name</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Stock</th>
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
                                    <td className="px-6 py-4 font-bold">{product.stock}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => setEditProduct(product)}>
                                                <Edit size={16} className="text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(product._id)}>
                                                <Trash2 size={16} className="text-destructive" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Edit Modal */}
            {editProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="font-bold text-lg">Edit Product</h3>
                            <button onClick={() => setEditProduct(null)}><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleEditSave} className="space-y-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input value={editProduct.name} onChange={e => setEditProduct({...editProduct, name: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Price</Label>
                                        <Input type="number" value={editProduct.price} onChange={e => setEditProduct({...editProduct, price: e.target.value})} />
                                    </div>
                                    <div>
                                        <Label>Stock</Label>
                                        <Input type="number" value={editProduct.stock} onChange={e => setEditProduct({...editProduct, stock: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <Label>Category</Label>
                                    <Input value={editProduct.category} onChange={e => setEditProduct({...editProduct, category: e.target.value})} />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setEditProduct(null)}>Cancel</Button>
                                    <Button type="submit">Save Changes</Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            )}

            <ConfirmationModal 
                isOpen={!!deleteId} 
                onClose={() => setDeleteId(null)} 
                onConfirm={handleDelete}
                title="Delete Product"
                message="Are you sure? This will remove the item from inventory."
                isDestructive={true}
            />
        </div>
    );
};

export default ProductList;