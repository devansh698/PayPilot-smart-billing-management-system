import React, { useState, useEffect } from "react";
import api from "../../api";
import ClientLayout from "./ClientLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import SearchableSelect from "../ui/SearchableSelect";

const CreateOrder = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available products
    api.get("/product/").then(res => setProducts(res.data)).catch(console.error);
  }, []);

  const productOptions = products.map(p => ({
      value: p._id,
      label: `${p.name} - $${p.price}`
  }));

  const handleAddToCart = () => {
      if (!selectedProductId) return;
      const product = products.find(p => p._id === selectedProductId);
      if (!product) return;

      const existing = cart.find(item => item._id === product._id);
      if (existing) {
          setCart(cart.map(item => item._id === product._id ? { ...item, qty: item.qty + 1 } : item));
      } else {
          setCart([...cart, { ...product, qty: 1 }]);
      }
      setSelectedProductId(""); // Reset selection
  };

  const removeFromCart = (id) => {
      setCart(cart.filter(item => item._id !== id));
  };

  const updateQty = (id, newQty) => {
      if (newQty < 1) return;
      setCart(cart.map(item => item._id === id ? { ...item, qty: newQty } : item));
  };

  const calculateTotal = () => {
      return cart.reduce((acc, item) => acc + (item.price * item.qty), 0).toFixed(2);
  };

  const handleSubmit = async () => {
      if (cart.length === 0) return toast.error("Cart is empty");
      
      const orderData = {
          products: cart.map(i => ({ product: i._id, quantity: i.qty })),
          totalAmount: calculateTotal()
      };

      try {
          await api.post("/client/orders", orderData);
          toast.success("Order placed successfully!");
          navigate("/client-orders");
      } catch (err) {
          toast.error("Failed to place order");
      }
  };

  return (
    <ClientLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Order</h1>
                <p className="text-muted-foreground mt-1">Select products and place your order.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Selection Area */}
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Add Products</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <SearchableSelect 
                                    label="Search Product"
                                    options={productOptions}
                                    value={selectedProductId}
                                    onChange={setSelectedProductId}
                                    placeholder="Type to search products..."
                                />
                            </div>
                            <Button onClick={handleAddToCart} className="mb-[2px]">
                                <Plus size={16} className="mr-2" /> Add to Cart
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Popular/All Products Grid (Optional visual aid) */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Available Products</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {products.slice(0, 6).map(product => (
                            <div key={product._id} className="p-4 bg-card border border-border rounded-lg flex justify-between items-center hover:shadow-sm transition-shadow cursor-pointer" onClick={() => { setSelectedProductId(product._id); }}>
                                <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">${product.price}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedProductId(product._id); handleAddToCart(); }}>
                                    Add
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Summary */}
            <div className="md:col-span-1">
                <Card className="sticky top-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart size={20} /> Your Cart
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {cart.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">Your cart is empty.</p>
                        ) : (
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item._id} className="flex justify-between items-center bg-muted/30 p-2 rounded">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">${item.price} x {item.qty}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                type="number" className="h-7 w-12 px-1 text-center" 
                                                value={item.qty} onChange={(e) => updateQty(item._id, parseInt(e.target.value))}
                                            />
                                            <button onClick={() => removeFromCart(item._id)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="border-t border-border pt-4 mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold">Total:</span>
                                <span className="text-xl font-bold text-primary">${calculateTotal()}</span>
                            </div>
                            <Button className="w-full" size="lg" onClick={handleSubmit} disabled={cart.length === 0}>
                                Place Order
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default CreateOrder;