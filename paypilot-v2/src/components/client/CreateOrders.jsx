import React, { useState, useEffect } from "react";
import api from "../../api";
import ClientLayout from "./ClientLayout";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

const ClientOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api.get("/client/orders")
       .then(res => setOrders(res.data))
       .catch(err => console.error(err));
  }, []);

  const filteredOrders = orders.filter(o => o._id.includes(searchTerm));

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Orders</h1>
            <p className="text-muted-foreground mt-1">Track history and status of your orders.</p>
          </div>
          <Link to="/create-order">
            <Button>
                <Plus size={16} className="mr-2" /> New Order
            </Button>
          </Link>
        </div>

        <Card>
            <div className="p-6 border-b border-border">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search Order ID..."
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
                            <th className="px-6 py-3">Order ID</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Total Items</th>
                            <th className="px-6 py-3">Total Amount</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-4 font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                                <td className="px-6 py-4 text-muted-foreground">{new Date(order.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{order.products.length} Items</td>
                                <td className="px-6 py-4 font-bold text-primary">${order.totalAmount}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={order.status === 'Completed' ? 'success' : order.status === 'Pending' ? 'warning' : 'outline'}>
                                        {order.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                         {filteredOrders.length === 0 && (
                             <tr><td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">No orders found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
      </div>
    </ClientLayout>
  );
};

export default ClientOrders;