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

const CreateOrder = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available products for client to order
    api.get("/product/").then(res => setProducts(res.data)).catch(console.error);
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
        setCart(cart.map(item => item._id === product._id ? { ...item, qty: item.qty + 1 } : item));
    } else {
        setCart([...cart, { ...product, qty: 1 }]);
    }
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
            {/* Products List */}
            <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map(product => (
                        <Card key={product._id} className="flex flex-col justify-between">
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-lg">{product.name}</h3>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="font-bold text-primary text-lg">${product.price}</span>
                                    <Button size="sm" onClick={() => addToCart(product)}>
                                        <Plus size={16} className="mr-1" /> Add
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Cart / Summary */}
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