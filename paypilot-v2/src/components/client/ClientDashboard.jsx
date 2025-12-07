import React, { useState, useEffect } from "react";
import api from "../../api";
import ClientLayout from "./ClientLayout";
import { ShoppingCart, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Link } from "react-router-dom";

const ClientDashboard = () => {
  const [stats, setStats] = useState({ totalOrders: 0, pending: 0, completed: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    // Replace with your actual client stats endpoints
    // const fetchStats = async () => { ... }
    // For now, mocking data or basic fetch structure
    api.get("/client/orders").then(res => {
        const orders = res.data;
        setRecentOrders(orders.slice(0, 5));
        setStats({
            totalOrders: orders.length,
            pending: orders.filter(o => o.status === 'Pending').length,
            completed: orders.filter(o => o.status === 'Completed').length
        });
    }).catch(err => console.error(err));
  }, []);

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here is your account overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 flex items-center gap-4 bg-primary/5 border-primary/20">
                <div className="p-4 bg-primary text-primary-foreground rounded-full">
                    <ShoppingCart size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <h2 className="text-3xl font-bold">{stats.totalOrders}</h2>
                </div>
            </Card>
            <Card className="p-6 flex items-center gap-4">
                <div className="p-4 bg-yellow-100 text-yellow-600 rounded-full">
                    <Clock size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <h2 className="text-3xl font-bold">{stats.pending}</h2>
                </div>
            </Card>
            <Card className="p-6 flex items-center gap-4">
                <div className="p-4 bg-green-100 text-green-600 rounded-full">
                    <CheckCircle size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <h2 className="text-3xl font-bold">{stats.completed}</h2>
                </div>
            </Card>
        </div>

        {/* Recent Orders Section */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Link to="/client-orders">
                    <Button variant="ghost" size="sm">View All <ArrowRight size={16} className="ml-1"/></Button>
                </Link>
            </CardHeader>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="px-6 py-3">Order ID</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {recentOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-4 font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                                <td className="px-6 py-4 text-muted-foreground">{new Date(order.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium">${order.totalAmount}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={order.status === 'Completed' ? 'success' : order.status === 'Pending' ? 'warning' : 'default'}>
                                        {order.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                        {recentOrders.length === 0 && (
                             <tr><td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No recent orders found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;