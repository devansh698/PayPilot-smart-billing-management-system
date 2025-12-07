import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, Package, DollarSign, Tag, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    description: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/product/add", product);
      toast.success("Product added successfully!");
      navigate("/product-management");
    } catch (error) {
      toast.error("Failed to add product");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Add Product</h1>
            <p className="text-muted-foreground mt-1">Create a new item in your inventory.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <div className="relative">
                        <Package className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                        <Input
                            id="name" name="name"
                            placeholder="e.g. Web Development Service"
                            className="pl-9"
                            value={product.name} onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                            <Input
                                id="price" name="price" type="number"
                                placeholder="0.00"
                                className="pl-9"
                                value={product.price} onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stock">Initial Stock</Label>
                        <div className="relative">
                            <Layers className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                            <Input
                                id="stock" name="stock" type="number"
                                placeholder="0"
                                className="pl-9"
                                value={product.stock} onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                        <select
                            id="category" name="category"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={product.category} onChange={handleChange}
                        >
                            <option value="">Select Category</option>
                            <option value="Service">Service</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Software">Software</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea 
                        id="description" name="description"
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="Product description..."
                        value={product.description} onChange={handleChange}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg">
                        <Save size={18} className="mr-2" /> Save Product
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;