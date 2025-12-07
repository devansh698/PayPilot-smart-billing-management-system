import React, { useState, useEffect } from "react";
import api from "../api";
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

const AcceptOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/order/all"); // Adjust endpoint if needed
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/order/${id}`, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const filteredOrders = filter === "All" ? orders : orders.filter(o => o.status === filter);

  // Stats
  const pendingCount = orders.filter(o => o.status === "Pending").length;
  const completedCount = orders.filter(o => o.status === "Completed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Order Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage client orders.</p>
        </div>
        <div className="flex gap-2">
            <Button variant={filter === "All" ? "default" : "outline"} onClick={() => setFilter("All")}>All</Button>
            <Button variant={filter === "Pending" ? "default" : "outline"} onClick={() => setFilter("Pending")}>Pending</Button>
            <Button variant={filter === "Completed" ? "default" : "outline"} onClick={() => setFilter("Completed")}>Completed</Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><ShoppingCart size={24} /></div>
            <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
            </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full"><Clock size={24} /></div>
            <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full"><CheckCircle size={24} /></div>
            <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
            </div>
        </Card>
      </div>

      <Card>
        <div className="p-6 border-b border-border">
             <h3 className="font-semibold text-lg">Recent Orders</h3>
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
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4">{order.client?.firstName || "Unknown"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">${order.totalAmount}</td>
                  <td className="px-6 py-4">
                    <Badge variant={order.status === 'Completed' ? 'success' : order.status === 'Pending' ? 'warning' : 'destructive'}>
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
                    </div>
                  </td>
                </tr>
              ))}
               {filteredOrders.length === 0 && (
                <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                        No orders found.
                    </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AcceptOrder;