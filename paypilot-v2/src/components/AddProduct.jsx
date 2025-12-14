import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, Package, DollarSign, Layers, Tag, Store } from "lucide-react"; 
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import SearchableSelect from "./ui/SearchableSelect";
import { useStore } from "../context/StoreContext";

const AddProduct = () => {
  const { stores, isSuperAdmin, currentStore } = useStore();
  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    brand: "",
    quantity: "",
    description: "",
    image: "",
    store: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Set default store if not superadmin
    if (!isSuperAdmin && currentStore) {
      setProduct(prev => ({ ...prev, store: currentStore._id }));
    }
  }, [isSuperAdmin, currentStore]);

  const categories = [
      { value: "Service", label: "Service" },
      { value: "Electronics", label: "Electronics" },
      { value: "Software", label: "Software" },
      { value: "Consulting", label: "Consulting" },
      { value: "Other", label: "Other" }
  ];

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate store selection
    if (!product.store) {
      toast.error("Please select a store");
      return;
    }

    if (!product.name || !product.price || !product.category || !product.brand) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('price', product.price);
      formData.append('category', product.category);
      formData.append('brand', product.brand);
      formData.append('quantity', product.quantity || '0');
      formData.append('description', product.description);
      formData.append('store', product.store);
      
      if (product.image) {
        formData.append('image', product.image);
      }

      await api.post("/product/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }); 
      toast.success("Product added successfully!");
      navigate("/product-management");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add product");
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
                        <Label htmlFor="quantity">Initial Stock</Label> {/* Label updated for clarity */}
                        <div className="relative">
                            <Layers className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                            <Input
                                id="quantity" name="quantity" type="number" // FIX 2: Changed name/id to 'quantity'
                                placeholder="0"
                                className="pl-9"
                                value={product.quantity} onChange={(e) => setProduct({...product, quantity: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Store Selection - Required for superadmin */}
                {isSuperAdmin && stores && stores.length > 0 && (
                    <div className="space-y-2">
                        <Label htmlFor="store">Store *</Label>
                        <div className="relative">
                            <Store className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                            <select
                                id="store"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-9 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={product.store}
                                onChange={(e) => setProduct({...product, store: e.target.value})}
                                required
                            >
                                <option value="">Select a store...</option>
                                {stores.map(store => (
                                    <option key={store._id} value={store._id}>
                                        {store.name} - {store.address.city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                        <Input
                            id="brand"
                            name="brand"
                            placeholder="e.g. Apple, Samsung"
                            className="pl-9"
                            value={product.brand}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <SearchableSelect 
                        label="Category *"
                        options={categories}
                        value={product.category}
                        onChange={(val) => setProduct({...product, category: val})}
                        placeholder="Select Category..."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="image">Product Image</Label>
                    <Input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProduct({...product, image: e.target.files[0]})}
                    />
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