import React, { useState, useEffect } from "react";
import api from "../api";
import { Search, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";

const InventoryManager = () => {
  const [stockData, setStockData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await api.get("/product/");
      setStockData(res.data);
    } catch (error) {
      toast.error("Failed to fetch stock");
    }
  };

  const updateStock = async (id, newStock) => {
    if (newStock < 0) return;
    try {
        // Using PUT endpoint from Product.js router
        await api.put(`/product/${id}`, { stock: newStock });
        
        // Optimistic update
        setStockData(stockData.map(item => 
            item._id === id ? { ...item, stock: newStock } : item
        ));
        toast.success("Stock updated");
    } catch (err) {
        toast.error("Update failed");
        fetchStock(); // Revert on fail
    }
  };

  const filteredStock = stockData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Stock Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and adjust inventory levels.</p>
        </div>
        <Button variant="outline" onClick={fetchStock}>
            <RefreshCw size={16} className="mr-2" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 bg-card border-l-4 border-l-green-500">
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="text-2xl font-bold">{stockData.length}</p>
        </Card>
        <Card className="p-4 bg-card border-l-4 border-l-yellow-500">
            <p className="text-sm text-muted-foreground">Low Stock Items</p>
            <p className="text-2xl font-bold text-yellow-600">
                {stockData.filter(i => i.stock < 10).length}
            </p>
        </Card>
        <Card className="p-4 bg-card border-l-4 border-l-red-500">
            <p className="text-sm text-muted-foreground">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">
                {stockData.filter(i => i.stock === 0).length}
            </p>
        </Card>
      </div>

      <Card>
        <div className="p-6 border-b border-border">
             <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                    placeholder="Search inventory..."
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
                <th className="px-6 py-3">Current Stock</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStock.map((item) => (
                <tr key={item._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{item.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateStock(item._id, item.stock - 1)}>
                            <ArrowDownRight size={12} />
                        </Button>
                        <span className={`font-bold w-8 text-center ${item.stock < 10 ? 'text-red-600' : ''}`}>
                            {item.stock}
                        </span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateStock(item._id, item.stock + 1)}>
                            <ArrowUpRight size={12} />
                        </Button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.stock === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                    ) : item.stock < 10 ? (
                        <Badge variant="warning">Low Stock</Badge>
                    ) : (
                        <Badge variant="success">In Stock</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                       <Input 
                            type="number" 
                            className="w-20 h-8" 
                            placeholder="Set"
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') updateStock(item._id, parseInt(e.currentTarget.value))
                            }}
                        />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default InventoryManager;