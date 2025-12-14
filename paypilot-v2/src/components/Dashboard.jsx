import React, { useState, useEffect } from "react";
import api from "../api";
import { DollarSign, FileText, Users, ShoppingCart, RefreshCw, TrendingUp, Package, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { cn } from '../lib/utils';
import { useStore } from "../context/StoreContext";
import StoreFilter from "./StoreFilter";

// Safe hook wrapper
const useStoreSafe = () => {
    try {
        return useStore();
    } catch (e) {
        return { isSuperAdmin: false, getActiveStoreId: () => null };
    }
};

const Dashboard = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const { isSuperAdmin, getActiveStoreId } = useStoreSafe();

  const fetchData = async () => {
    try {
      const storeId = getActiveStoreId();
      const params = storeId ? { store: storeId } : {};
      const res = await api.get("/chartsdata/all-data", { params });
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30 seconds
    
    // Listen for store filter changes
    const handleStoreFilterChange = () => {
      fetchData();
    };
    window.addEventListener('storeFilterChanged', handleStoreFilterChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storeFilterChanged', handleStoreFilterChange);
    };
  }, [getActiveStoreId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };
  
  if (loading) return <div className="text-center mt-10">Loading Dashboard Data...</div>;

  // Transform daily sales data for chart - ensure we have 7 days
  const chartData = data.dailySalesReport?.map(item => ({
    name: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
    sales: item.totalAmount || 0
  })) || [];

  // Fill missing days with 0
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const existing = chartData.find(d => d.name === dayName);
    last7Days.push(existing || { name: dayName, sales: 0 });
  }

  // Calculate invoice status for pie chart
  const paidInvoices = data.numberOfInvoices - (data.noofoverdueInvoices || 0);
  const pieData = [
    { name: 'Paid', value: paidInvoices || 0 },
    { name: 'Unpaid', value: data.noofoverdueInvoices || 0 },
  ];
  const COLORS = ['#4ade80', '#f87171'];

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <div className="flex gap-2">
                {isSuperAdmin && <StoreFilter />}
                <Button variant="outline" onClick={fetchData}>
                    <RefreshCw size={16} className="mr-2" /> Refresh
                </Button>
            </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(data.totalBilledAmount || 0)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total value of all invoices</p>
                    {data.averageInvoiceValue && (
                        <p className="text-xs text-green-600 mt-1">Avg: {formatCurrency(data.averageInvoiceValue)}</p>
                    )}
                </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.numberOfInvoices || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total invoices generated</p>
                    {data.noofoverdueInvoices > 0 && (
                        <p className="text-xs text-red-600 mt-1">{data.noofoverdueInvoices} overdue</p>
                    )}
                </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Payments</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalNumberOfPayments || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">{formatCurrency(data.totalPaymentReceived || 0)} received</p>
                    {data.averagePaymentAmount && (
                        <p className="text-xs text-green-600 mt-1">Avg: {formatCurrency(data.averagePaymentAmount)}</p>
                    )}
                </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{data.nooflowInventoryProducts || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Items below safety threshold</p>
                    {data.noofoutOfStockProducts > 0 && (
                        <p className="text-xs text-red-600 mt-1">{data.noofoutOfStockProducts} out of stock</p>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Bar Chart */}
                <div className="col-span-4 bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="font-semibold mb-4 text-foreground">Weekly Sales Analytics</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={last7Days}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#888888" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <YAxis 
                                    stroke="#888888" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(value) => `₹${value}`} 
                                />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <Bar dataKey="sales" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="col-span-3 bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="font-semibold mb-4 text-foreground">Payment Status</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        {/* Additional Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {data.numberOfInvoices > 0 
                            ? `${Math.round(((data.numberOfInvoices - (data.noofoverdueInvoices || 0)) / data.numberOfInvoices) * 100)}%`
                            : '0%'
                        }
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Invoices paid on time</p>
                </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                        {data.pendingOrders || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
                </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <Package className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {data.totalProducts || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Active products in inventory</p>
                </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                        {(data.nooflowInventoryProducts || 0) + (data.noofoverdueInvoices || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                </CardContent>
            </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Last Invoice</span>
                            <span className="font-medium">
                                {data.lastInvoiceDate 
                                    ? new Date(data.lastInvoiceDate).toLocaleDateString()
                                    : 'N/A'
                                }
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Last Payment</span>
                            <span className="font-medium">
                                {data.lastPaymentDate 
                                    ? new Date(data.lastPaymentDate).toLocaleDateString()
                                    : 'N/A'
                                }
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Collection Rate</span>
                            <span className="font-medium text-green-600">
                                {data.totalBilledAmount > 0
                                    ? `${Math.round((data.totalPaymentReceived / data.totalBilledAmount) * 100)}%`
                                    : '0%'
                                }
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        {data.topCategories?.slice(0, 5).map((cat, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <span className="text-muted-foreground">{cat.name || 'N/A'}</span>
                                <span className="font-medium">{cat.count || 0}</span>
                            </div>
                        )) || (
                            <p className="text-muted-foreground text-sm">No category data available</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Revenue Growth</span>
                                <span className="font-medium text-green-600">+12%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Payment Collection</span>
                                <span className="font-medium text-blue-600">
                                    {data.totalBilledAmount > 0
                                        ? `${Math.round((data.totalPaymentReceived / data.totalBilledAmount) * 100)}%`
                                        : '0%'
                                    }
                                </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ 
                                        width: `${data.totalBilledAmount > 0 
                                            ? Math.round((data.totalPaymentReceived / data.totalBilledAmount) * 100) 
                                            : 0}%` 
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        
    </div>
  );
};

export default Dashboard;