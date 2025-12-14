import React, { useState, useEffect } from "react";
import api from "../api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { Download, Filter, TrendingUp, DollarSign, FileText, ShoppingCart, Package, FileDown, FileJson, FileText as FileTextIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useStore } from "../context/StoreContext";
import StoreFilter from "./StoreFilter";
import { toast } from "react-toastify";

const ReportGenerator = () => {
  const { isSuperAdmin, getActiveStoreId } = useStore();
  const [salesData, setSalesData] = useState([]);
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
        const storeId = getActiveStoreId();
        const params = storeId ? { store: storeId } : {};
        
        // Fetch dashboard data for comprehensive reports
        const res = await api.get("/chartsdata/all-data", { params });
        setReportData(res.data);
        
        // Transform sales report data
        if (res.data.dailySalesReport) {
            const transformed = res.data.dailySalesReport.map(item => ({
                name: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                sales: item.totalAmount || 0,
                revenue: item.totalAmount || 0
            }));
            setSalesData(transformed);
        } else {
            setSalesData([]);
        }
    } catch (err) {
        console.error("Report fetch error", err);
        toast.error("Failed to fetch report data");
    } finally {
        setLoading(false);
    }
  };

  const handleExport = (format = 'csv') => {
    if (salesData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `paypilot_report_${dateRange.start}_to_${dateRange.end}_${timestamp}`;

    if (format === 'csv') {
      // CSV Export
      const headers = ["Date", "Sales", "Revenue"];
      const csvContent = [
        headers.join(","),
        ...salesData.map(row => `${row.name},${row.sales || 0},${row.revenue || 0}`)
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Report exported as CSV');
    } else if (format === 'json') {
      // JSON Export
      const jsonData = {
        reportDate: new Date().toISOString(),
        dateRange: dateRange,
        summary: {
          totalRevenue: reportData.totalBilledAmount || 0,
          totalInvoices: reportData.numberOfInvoices || 0,
          totalPayments: reportData.totalNumberOfPayments || 0,
          totalPaymentReceived: reportData.totalPaymentReceived || 0,
        },
        dailyData: salesData,
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Report exported as JSON');
    } else if (format === 'pdf') {
      // PDF Export (using html2canvas and jsPDF)
      import('html2canvas').then(html2canvas => {
        import('jspdf').then(jsPDF => {
          const element = document.querySelector('.report-content') || document.body;
          html2canvas.default(element).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF.default('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;
            }

            pdf.save(`${filename}.pdf`);
            toast.success('Report exported as PDF');
          });
        });
      }).catch(err => {
        console.error('PDF export error:', err);
        toast.error('PDF export failed. Please try CSV or JSON.');
      });
    }
  };

  return (
    <div className="space-y-6 report-content">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive financial and sales analytics</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
            {isSuperAdmin && <StoreFilter />}
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
            <Button variant="outline" onClick={fetchReportData} disabled={loading}>
                <Filter size={16} className="mr-2"/> {loading ? 'Loading...' : 'Filter'}
            </Button>
            <div className="flex gap-2">
                <Button 
                    onClick={() => handleExport('csv')} 
                    disabled={salesData.length === 0}
                    variant="outline"
                >
                    <FileTextIcon size={16} className="mr-2"/> CSV
                </Button>
                <Button 
                    onClick={() => handleExport('json')} 
                    disabled={salesData.length === 0}
                    variant="outline"
                >
                    <FileJson size={16} className="mr-2"/> JSON
                </Button>
                <Button 
                    onClick={() => handleExport('pdf')} 
                    disabled={salesData.length === 0}
                >
                    <FileDown size={16} className="mr-2"/> PDF
                </Button>
            </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full text-primary"><TrendingUp size={24} /></div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <h3 className="text-2xl font-bold">
                        ₹{reportData.totalBilledAmount?.toLocaleString() || salesData.reduce((acc, curr) => acc + (curr.revenue || 0), 0).toLocaleString()}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">All time</p>
                </div>
            </div>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-full text-blue-500"><FileText size={24} /></div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Invoices</p>
                    <h3 className="text-2xl font-bold">{reportData.numberOfInvoices || 0}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Generated</p>
                </div>
            </div>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-full text-green-500"><ShoppingCart size={24} /></div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Payments</p>
                    <h3 className="text-2xl font-bold">{reportData.totalNumberOfPayments || 0}</h3>
                    <p className="text-xs text-muted-foreground mt-1">₹{reportData.totalPaymentReceived?.toLocaleString() || 0} received</p>
                </div>
            </div>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-full text-orange-500"><Package size={24} /></div>
                <div>
                    <p className="text-sm text-muted-foreground">Low Stock</p>
                    <h3 className="text-2xl font-bold text-red-600">{reportData.nooflowInventoryProducts || 0}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Items need attention</p>
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