import React, { useState, useEffect } from "react";
import api from "../api";
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, ShoppingCart, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const AcceptOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1); // NEW
  const [totalPages, setTotalPages] = useState(1); // NEW
  const PAGE_LIMIT = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filter]); // Depend on page and filter

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // FIX 1: Correct endpoint to /order. Implement pagination/filtering.
      let url = `/orders?page=${currentPage}&limit=${PAGE_LIMIT}&sortBy=createdAt&sortOrder=desc`;
      if (filter !== "All") {
        url += `&status=${filter}`;
      }
      
      const res = await api.get(url); 
      setOrders(res.data.orders || []); 
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      // Endpoint is correct: PATCH /order/:id
      await api.patch(`/orders/${id}`, { status }); 
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed. Check stock availability.");
    }
  };

  // Stats
  const allOrders = orders; // Use the current page data for display stats
  const pendingCount = allOrders.filter(o => o.status === "Pending").length;
  const completedCount = allOrders.filter(o => o.status === "Completed").length;
  
  const getStatusVariant = (status) => {
    switch (status) {
        case 'Completed': return 'success';
        case 'Accepted': return 'default';
        case 'Rejected':
        case 'Cancelled': return 'destructive';
        case 'Pending': 
        default: return 'warning';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Order Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage client orders.</p>
        </div>
        <div className="flex gap-2">
            <Button variant={filter === "All" ? "default" : "outline"} onClick={() => {setFilter("All"); setCurrentPage(1);}}>All</Button>
            <Button variant={filter === "Pending" ? "default" : "outline"} onClick={() => {setFilter("Pending"); setCurrentPage(1);}}>Pending</Button>
            <Button variant={filter === "Completed" ? "default" : "outline"} onClick={() => {setFilter("Completed"); setCurrentPage(1);}}>Completed</Button>
            <Button variant="outline" onClick={fetchOrders} size="icon"><RefreshCw size={16} /></Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><ShoppingCart size={24} /></div>
            <div>
                <p className="text-sm text-muted-foreground">Orders on Page</p>
                <p className="text-2xl font-bold">{allOrders.length}</p>
            </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full"><Clock size={24} /></div>
            <div>
                <p className="text-sm text-muted-foreground">Pending on Page</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full"><CheckCircle size={24} /></div>
            <div>
                <p className="text-sm text-muted-foreground">Completed on Page</p>
                <p className="text-2xl font-bold">{completedCount}</p>
            </div>
        </Card>
      </div>

      <Card>
        <div className="p-6 border-b border-border">
             <h3 className="font-semibold text-lg">Order List</h3>
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
                ) : allOrders.length > 0 ? (
                    allOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4 font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                            {/* NOTE: Client data is populated in the backend as 'clientId' object */}
                            <td className="px-6 py-4">{order.clientId?.username || order.clientId?.email || "Unknown"}</td> 
                            <td className="px-6 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-medium">${order.totalAmount}</td>
                            <td className="px-6 py-4">
                                <Badge variant={getStatusVariant(order.status)}>
                                    {order.status}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    {order.status === 'Pending' && (
                                        <>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => updateStatus(order._id, 'Accepted')}>
                                                Accept
                                            </Button>
                                            <Button size="sm" variant="destructive" className="h-8" onClick={() => updateStatus(order._id, 'Rejected')}>
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                    {order.status === 'Accepted' && (
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8" onClick={() => updateStatus(order._id, 'Completed')}>
                                            Complete
                                        </Button>
                                    )}
                                    <Button size="sm" variant="ghost" onClick={() => console.log('View Order')}>
                                        <Eye size={16} />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                            No orders found.
                        </td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>
         {/* Pagination Controls (NEW) */}
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

export default AcceptOrder;