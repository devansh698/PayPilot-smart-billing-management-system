import React, { useState, useEffect } from "react";
import api from "../api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from "recharts";
import { Download, Filter, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const ReportGenerator = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0], // 6 months ago
    end: new Date().toISOString().split('T')[0] // Today
  });

  useEffect(() => {
    fetchReportData();
  }, []); // Refetch when dates change if you want auto-update, otherwise via button

  const fetchReportData = async () => {
    setLoading(true);
    try {
        // You might need to adjust backend to accept query params
        // const res = await api.get(`/salesreport?start=${dateRange.start}&end=${dateRange.end}`);
        // For now, using mock or fetching all and filtering on frontend if backend doesn't support
        
        // Mocking structure for demonstration as backend response might vary
        const mockData = [
            { name: 'Jan', sales: 4000, revenue: 2400 },
            { name: 'Feb', sales: 3000, revenue: 1398 },
            { name: 'Mar', sales: 2000, revenue: 9800 },
            { name: 'Apr', sales: 2780, revenue: 3908 },
            { name: 'May', sales: 1890, revenue: 4800 },
            { name: 'Jun', sales: 2390, revenue: 3800 },
        ];
        setSalesData(mockData);
    } catch (err) {
        console.error("Report fetch error", err);
    } finally {
        setLoading(false);
    }
  };

  const handleExport = () => {
    // Convert data to CSV
    const headers = ["Month", "Sales", "Revenue"];
    const csvContent = [
        headers.join(","),
        ...salesData.map(row => `${row.name},${row.sales},${row.revenue}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `sales_report_${dateRange.start}_to_${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Financial and sales analytics.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
            <Input 
                type="date" 
                value={dateRange.start} 
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})} 
                className="w-auto"
            />
            <span className="text-muted-foreground">to</span>
            <Input 
                type="date" 
                value={dateRange.end} 
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})} 
                className="w-auto"
            />
            <Button variant="outline" onClick={fetchReportData}>
                <Filter size={16} className="mr-2"/> Filter
            </Button>
            <Button onClick={handleExport}>
                <Download size={16} className="mr-2"/> Export CSV
            </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full text-primary"><TrendingUp /></div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <h3 className="text-2xl font-bold">
                        ${salesData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
                    </h3>
                </div>
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts ... (Same as before) */}
        <Card className="col-span-1">
            <CardHeader><CardTitle>Sales Volume</CardTitle></CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="sales" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
        <Card className="col-span-1">
            <CardHeader><CardTitle>Revenue</CardTitle></CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportGenerator;