import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, FileText, Plus, X, Printer, Download, Trash2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import LoadingPage from "./LoadingPage";
import api from "../api";
import { toast } from "react-toastify";
import ConfirmationModal from "./ui/ConfirmationModal";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const PAGE_LIMIT = 10;

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, searchTerm, filterStatus]); // Depend on pagination, search, and filter

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      let url = `/invoices?page=${currentPage}&limit=${PAGE_LIMIT}&search=${searchTerm}`;
      if (filterStatus !== "All") {
        url += `&paymentStatus=${filterStatus}`;
      }
      // Added sorting to show newest first
      url += `&sortBy=date&sortOrder=desc`; 

      const res = await api.get(url);
      // Access data from the paginated response structure
      setInvoices(res.data.invoices || []);
      setTotalPages(res.data.totalPages || 1);

    } catch (error) {
      console.error("Failed to fetch invoices", error);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice? This will restore stock.")) {
      try {
        await api.delete(`/invoices/${id}`);
        toast.success("Invoice deleted and stock restored!");
        // Refresh the list, checking if the current page is now empty
        if (invoices.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        } else {
            fetchInvoices();
        }
      } catch (error) {
        toast.error("Failed to delete invoice");
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
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('paid') || lowerStatus.includes('completed')) return 'success';
    if (lowerStatus.includes('pending')) return 'warning';
    if (lowerStatus.includes('overdue')) return 'destructive';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage and track all billing documents.</p>
        </div>
        <Button onClick={() => navigate("/create-invoice")}>
          <Plus size={16} className="mr-2" />
          Create Invoice
        </Button>
      </div>

      <Card>
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="relative max-w-sm w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                    placeholder="Search invoice number or status..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
                <Button variant={filterStatus === "All" ? "default" : "outline"} size="sm" onClick={() => handleFilterChange("All")}>All</Button>
                <Button variant={filterStatus === "Pending" ? "warning" : "outline"} size="sm" onClick={() => handleFilterChange("Pending")}>Pending</Button>
                <Button variant={filterStatus === "Paid" ? "success" : "outline"} size="sm" onClick={() => handleFilterChange("Paid")}>Paid</Button>
                <Button variant={filterStatus === "Overdue" ? "destructive" : "outline"} size="sm" onClick={() => handleFilterChange("Overdue")}>Overdue</Button>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-3">Invoice No.</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                 <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">Loading invoices...</td></tr>
              ) : invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{invoice.invoiceNo}</td>
                    {/* Assuming client object is populated with a name field */}
                    <td className="px-6 py-4">{invoice.client?.name || invoice.client?.firstName || "N/A"}</td> 
                    <td className="px-6 py-4 text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">${invoice.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(invoice.paymentStatus)}>
                          {invoice.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/invoice-details/${invoice._id}`)}>
                            <Eye size={16} className="text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(invoice._id)}>
                            <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">No invoices found for current criteria.</td></tr>
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

export default InvoiceList;