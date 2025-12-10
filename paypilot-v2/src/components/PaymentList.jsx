import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Package, X } from "lucide-react";
import { toast } from 'react-toastify';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import ConfirmationModal from "./ui/ConfirmationModal";

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const PAGE_LIMIT = 10;
  const paymentMethods = ["Bank Transfer", "Credit Card", "Cash", "Cheque", "PayPal"];

  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchTerm, filterMethod]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let url = `/payment?page=${currentPage}&limit=${PAGE_LIMIT}&search=${searchTerm}`;
      if (filterMethod !== "All") {
        url += `&paymentMethod=${filterMethod}`;
      }
      url += `&sortBy=createdAt&sortOrder=desc`;
      
      const res = await api.get(url);
      
      // Access data from the paginated response structure
      setPayments(res.data.payments || []);
      setTotalPages(res.data.totalPages || 1);

    } catch (error) {
      console.error("Failed to fetch payments", error);
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment record?")) {
      try {
        await api.delete(`/payment/${id}`);
        toast.success("Payment record deleted!");
        if (payments.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        } else {
            fetchPayments();
        }
      } catch (error) {
        toast.error("Failed to delete payment");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset page on new search
  };
  
  const handleFilterChange = (method) => {
      setFilterMethod(method);
      setCurrentPage(1); // Reset page on new filter
  }

  const getMethodVariant = (method) => {
    switch (method) {
        case 'Credit Card': return 'primary';
        case 'PayPal': return 'info';
        case 'Bank Transfer': return 'outline';
        case 'Cash': return 'warning';
        default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">Record and manage all payments received.</p>
        </div>
        <Button onClick={() => navigate("/record-payment")}>
          <Plus size={16} className="mr-2" />
          Record Payment
        </Button>
      </div>

      <Card>
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="relative max-w-sm w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                    placeholder="Search payment method..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
                <Button variant={filterMethod === "All" ? "default" : "outline"} size="sm" onClick={() => handleFilterChange("All")}>All</Button>
                {paymentMethods.map(method => (
                    <Button 
                        key={method}
                        variant={filterMethod === method ? getMethodVariant(method) : "outline"} 
                        size="sm" 
                        onClick={() => handleFilterChange(method)}
                    >
                        {method}
                    </Button>
                ))}
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-3">Payment ID</th>
                <th className="px-6 py-3">Invoice No.</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                 <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">Loading payments...</td></tr>
              ) : payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">#{payment.paymentId?.slice(-6).toUpperCase() || payment._id.slice(-6).toUpperCase()}</td>
                    {/* Assuming invoiceId and clientId are populated as per backend route /payment */}
                    <td className="px-6 py-4 text-muted-foreground">{payment.invoiceId?.invoiceNumber || "N/A"}</td>
                    <td className="px-6 py-4">{payment.clientId?.name || payment.clientId?.firstName || "Unknown"}</td>
                    <td className="px-6 py-4 font-medium text-green-600">${payment.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getMethodVariant(payment.paymentMethod)}>
                        {payment.paymentMethod}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(payment._id)}>
                            <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">No payments found for current criteria.</td></tr>
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

export default PaymentList;