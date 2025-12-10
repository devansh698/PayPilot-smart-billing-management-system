import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const PAGE_LIMIT = 10;
  
  // Note: The stats calculation will only reflect the current page due to pagination,
  // which might be misleading for a real dashboard. For full stats, a separate, non-paginated API call would be needed.

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/orders?page=${currentPage}&limit=${PAGE_LIMIT}&search=${searchTerm}`;
      if (filterStatus !== "All") {
        url += `&status=${filterStatus}`;
      }
      url += `&sortBy=createdAt&sortOrder=desc`;

      const res = await api.get(url);
      
      // Access data from the paginated response structure
      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || 1);

    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      // Use PATCH method for partial update (status change)
      await api.patch(`/orders/${id}`, { status }); 
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error(`Failed to update status. Note: Rejected/Cancelled status restores stock.`);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order? This will restore stock.")) {
      try {
        await api.delete(`/orders/${id}`);
        toast.success("Order deleted and stock restored!");
        if (orders.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        } else {
            fetchOrders();
        }
      } catch (error) {
        toast.error("Failed to delete order");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset page on new search
  };
  
  const handleFilterChange = (status) => {
      setFilterStatus(status);
      setCurrentPage(1); // Reset page on new filter
  }

  const getStatusVariant = (status) => {
    switch (status) {
        case 'Completed': return 'success';
        case 'Accepted': return 'primary';
        case 'Pending': return 'warning';
        case 'Rejected':
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
  };
  
  // Stats calculation based on current page's data
  const totalOrders = orders.length; 
  const pendingCount = orders.filter(o => o.status === "Pending").length;
  const completedCount = orders.filter(o => o.status === "Completed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Order Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage client orders.</p>
        </div>
        <Button onClick={() => navigate("/create-order")}>
          <Plus size={16} className="mr-2" />
          New Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><ShoppingCart size={24} /></div>
            <div>
                <p className="text-sm text-muted-foreground">Orders on Page</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full"><ShoppingCart size={24} /></div>
            <div>
                <p className="text-sm text-muted-foreground">Pending on Page</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full"><ShoppingCart size={24} /></div>
            <div>
                <p className="text-sm text-muted-foreground">Completed on Page</p>
                <p className="text-2xl font-bold">{completedCount}</p>
            </div>
        </Card>
      </div>

      <Card>
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
             <div className="relative max-w-sm w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                    placeholder="Search order status..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
                <Button variant={filterStatus === "All" ? "default" : "outline"} size="sm" onClick={() => handleFilterChange("All")}>All</Button>
                <Button variant={filterStatus === "Pending" ? "warning" : "outline"} size="sm" onClick={() => handleFilterChange("Pending")}>Pending</Button>
                <Button variant={filterStatus === "Accepted" ? "default" : "outline"} size="sm" onClick={() => handleFilterChange("Accepted")}>Accepted</Button>
                <Button variant={filterStatus === "Completed" ? "success" : "outline"} size="sm" onClick={() => handleFilterChange("Completed")}>Completed</Button>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                 <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">Loading orders...</td></tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                    {/* Client data is populated in the backend */}
                    <td className="px-6 py-4">{order.clientId?.username || order.clientId?.firstName || "Unknown"}</td> 
                    <td className="px-6 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {order.status === 'Pending' && (
                            <>
                                <Button size="sm" className="h-8" onClick={() => handleStatusChange(order._id, 'Accepted')}>
                                    Accept
                                </Button>
                                <Button size="sm" variant="destructive" className="h-8" onClick={() => handleStatusChange(order._id, 'Rejected')}>
                                    Reject
                                </Button>
                            </>
                        )}
                        {order.status === 'Accepted' && (
                            <Button size="sm" className="h-8" onClick={() => handleStatusChange(order._id, 'Completed')}>
                                Complete
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(order._id)}>
                            <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">No orders found for current criteria.</td></tr>
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

export default OrderManager;