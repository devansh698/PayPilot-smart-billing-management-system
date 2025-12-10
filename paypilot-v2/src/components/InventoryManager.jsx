import React, { useState, useEffect } from "react";
import api from "../api";
import { Search, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

const InventoryManager = () => {
  const [stockData, setStockData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStock(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const fetchStock = async (page, search) => {
    setLoading(true);
    try {
      // FIX 1: Use pagination and search. Fetch products.
      const res = await api.get(`/product?page=${page}&limit=10&search=${search}`);
      // FIX 1: Access the 'products' array from the paginated response
      setStockData(res.data.products || []); 
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch stock", error);
      toast.error("Failed to fetch inventory");
    } finally {
        setLoading(false);
    }
  };

  const updateStock = async (id, newQuantity) => {
    try {
        // FIX 2: Change PUT to PATCH and send 'quantity' field to match backend route
        await api.patch(`/product/${id}`, { quantity: newQuantity }); 
        toast.success("Stock updated");
        fetchStock(currentPage, searchTerm); // Refresh list
    } catch (err) {
        toast.error("Update failed");
    }
  };

  // Filtering is now handled by the backend search query
  const filteredStock = stockData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Stats calculation
  const allProducts = stockData;
  const lowStockThreshold = 10; // Assuming threshold is 10 based on original file logic
  const lowStockCount = allProducts.filter(i => i.quantity < lowStockThreshold).length;
  const outOfStockCount = allProducts.filter(i => i.quantity === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Stock Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and adjust inventory levels.</p>
        </div>
        <Button variant="outline" onClick={() => fetchStock(currentPage, searchTerm)}>
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
                {lowStockCount}
            </p>
        </Card>
        <Card className="p-4 bg-card border-l-4 border-l-red-500">
            <p className="text-sm text-muted-foreground">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">
                {outOfStockCount}
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
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to page 1 on new search
                    }}
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
              {loading ? (
                <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">Loading inventory...</td>
                </tr>
              ) : stockData.length > 0 ? (
                stockData.map((item) => (
                    // FIX 3: Use item.quantity instead of item.stock
                    <tr key={item._id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{item.name}</td>
                        <td className="px-6 py-4">
                            <span className={`font-bold ${item.quantity < lowStockThreshold ? 'text-red-600' : 'text-foreground'}`}>
                                {item.quantity}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            {item.quantity === 0 ? (
                                <Badge variant="destructive">Out of Stock</Badge>
                            ) : item.quantity < lowStockThreshold ? (
                                <Badge variant="warning" className="flex w-fit items-center gap-1">
                                    <AlertTriangle size={12} /> Low Stock
                                </Badge>
                            ) : (
                                <Badge variant="success">In Stock</Badge>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8" 
                                    onClick={() => updateStock(item._id, Math.max(0, item.quantity - 1))}
                                    disabled={item.quantity === 0}
                                >
                                    <ArrowDownRight size={14} />
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8" 
                                    onClick={() => updateStock(item._id, item.quantity + 1)}
                                >
                                    <ArrowUpRight size={14} />
                                </Button>
                            </div>
                        </td>
                    </tr>
                ))
              ) : (
                <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex justify-between items-center p-6 border-t border-border">
            <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
            <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default InventoryManager;