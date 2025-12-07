import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, DollarSign, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [overviewData, setOverviewData] = useState(null);

    // Mock Data (replace with API data)
    const chartData = [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
    ];
    
    const pieData = [
        { name: 'Paid', value: 400 },
        { name: 'Pending', value: 300 },
        { name: 'Overdue', value: 100 },
    ];
    const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Green, Yellow, Red

    useEffect(() => {
        // Simulate API call
        setTimeout(() => setLoading(false), 1000);
        // api.get('/overview/').then(res => ... );
    }, []);

    const StatCard = ({ title, value, icon: Icon, trend, className }) => (
        <div className={cn("p-6 bg-card rounded-xl border border-border shadow-sm", className)}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold mt-2 text-foreground">{value}</h3>
                    <p className="text-xs mt-2 flex items-center gap-1 text-green-600">
                        <ArrowUpRight size={14} />
                        {trend}
                    </p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="flex h-full items-center justify-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Overview of your billing status.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard 
                    title="Total Sales" 
                    value="$24,000" 
                    icon={DollarSign} 
                    trend="+12.5% from last month"
                />
                <StatCard 
                    title="Pending Invoices" 
                    value="12" 
                    icon={AlertTriangle} 
                    trend="+2 new today"
                />
                <StatCard 
                    title="Weekly Growth" 
                    value="+15%" 
                    icon={TrendingUp} 
                    trend="Consistent growth"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Bar Chart */}
                <div className="col-span-4 bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="font-semibold mb-4 text-foreground">Weekly Sales Analytics</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
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
                                    tickFormatter={(value) => `$${value}`} 
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
        </div>
    );
};

export default Dashboard;