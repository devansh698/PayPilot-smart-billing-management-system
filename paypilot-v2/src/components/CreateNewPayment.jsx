import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, CheckCircle, CreditCard, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import SearchableSelect from "./ui/SearchableSelect";

const CreateNewPayment = () => {
  const [payment, setPayment] = useState({
    invoiceId: "",
    amount: "",
    // Note: This date field is included but the backend primarily uses createdAt.
    date: new Date().toISOString().split('T')[0], 
    paymentMethod: "Bank Transfer", // Renamed to match backend field
    paymentId: "" // Used for reference/transaction ID to match backend field
  });
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch unpaid invoices to populate dropdown
    // FIX 1 & 2: Correct endpoint to /invoice and handle paginated response structure
    api.get("/invoices?paymentStatus=Pending&limit=1000")
      .then(res => setInvoices(res.data.invoices || [])) 
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const selectedInvoice = invoices.find(inv => inv._id === payment.invoiceId);
    if (!selectedInvoice) {
        return toast.error("Please select a valid invoice.");
    }
    
    // Prepare payload, including invoiceNo for notification (as required by backend)
    const payload = {
        invoiceId: payment.invoiceId,
        amount: Number(payment.amount),
        paymentMethod: payment.paymentMethod,
        paymentId: payment.paymentId,
        invoiceNo: selectedInvoice.invoiceNo
    };
    
    try {
      // FIX 3: Correct submission endpoint to /payment
      await api.post("/payments", payload); 
      toast.success("Payment recorded successfully");
      navigate("/payment-manager");
    } catch (error) {
      console.error("Payment submission failed:", error);
      toast.error(error.response?.data?.message || "Failed to record payment");
    }
  };
  
  // Helper to extract client name for dropdown (assuming 'client' is populated)
  const getClientName = (client) => {
      if (!client) return "N/A";
      return client.firstName && client.lastName ? `${client.firstName} ${client.lastName}` : (client.name || "Unknown Client");
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Record Payment</h1>
            <p className="text-muted-foreground mt-1">Log a new payment received.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label>Select Invoice</Label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={payment.invoiceId}
                        onChange={(e) => {
                            const id = e.target.value;
                            const inv = invoices.find(i => i._id === id);
                            setPayment({ 
                                ...payment, 
                                invoiceId: id,
                                // Auto-populate amount with invoice total
                                amount: inv ? inv.totalAmount : "" 
                            });
                        }}
                        required
                    >
                        <option value="">-- Choose Invoice --</option>
                        {invoices.map(inv => (
                            <option key={inv._id} value={inv._id}>
                                #{inv.invoiceNo} - {getClientName(inv.client)} (${inv.totalAmount})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Amount Received</Label>
                        <Input
                            type="number"
                            value={payment.amount}
                            onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                            required
                            placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Payment Date</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                            <Input
                                type="date"
                                className="pl-9"
                                value={payment.date}
                                onChange={(e) => setPayment({ ...payment, date: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 pl-9 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={payment.paymentMethod}
                            onChange={(e) => setPayment({ ...payment, paymentMethod: e.target.value })}
                        >
                            <option>Bank Transfer</option>
                            <option>Credit Card</option>
                            <option>Cash</option>
                            <option>Cheque</option>
                            <option>PayPal</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Reference / Transaction ID</Label>
                    <Input
                        placeholder="e.g. Transaction ID 12345"
                        value={payment.paymentId}
                        onChange={(e) => setPayment({ ...payment, paymentId: e.target.value })}
                    />
                </div>

                <Button type="submit" className="w-full" size="lg">
                    <CheckCircle size={18} className="mr-2" /> Confirm Payment
                </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateNewPayment;