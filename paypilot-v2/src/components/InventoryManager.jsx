import React, { useState, useEffect } from "react";
import api from "../api";
import { Search, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { Card, CardContent } from "./ui/Card";
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
      console.error("Failed to fetch stock");
    }
  };

  const updateStock = async (id, newStock) => {
    try {
        await api.put(`/product/${id}`, { stock: newStock });
        toast.success("Stock updated");
        fetchStock();
    } catch (err) {
        toast.error("Update failed");
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
                <th className="px-6 py-3 text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStock.map((item) => (
                <tr key={item._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${item.stock < 10 ? 'text-red-600' : 'text-foreground'}`}>
                        {item.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.stock === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                    ) : item.stock < 10 ? (
                        <Badge variant="warning" className="flex w-fit items-center gap-1">
                            <AlertTriangle size={12} /> Low Stock
                        </Badge>
                    ) : (
                        <Badge variant="success">In Stock</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateStock(item._id, item.stock - 1)}>
                            <ArrowDownRight size={14} />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateStock(item._id, item.stock + 1)}>
                            <ArrowUpRight size={14} />
                        </Button>
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