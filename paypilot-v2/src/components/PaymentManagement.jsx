import React, { useState, useEffect } from "react";
import api from "../api";
import { Search, CreditCard, DollarSign, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payment/");
      setPayments(res.data);
    } catch (error) {
      console.error("Fetch error");
    }
  };

  const filteredPayments = payments.filter(p => 
    p.invoice?.invoiceNo?.includes(searchTerm) || 
    p.amount.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">View and manage payment history.</p>
        </div>
        <Link to="/create-new-payment">
            <Button>
                <Plus size={16} className="mr-2" /> Record Payment
            </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full"><DollarSign size={24} /></div>
            <div>
                <p className="text-sm text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold">$--</p>
            </div>
         </Card>
      </div>

      <Card>
        <div className="p-6 border-b border-border">
             <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                    placeholder="Search by Invoice # or Amount..."
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
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{payment.invoice?.invoiceNo || "N/A"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-muted-foreground"/>
                        {payment.method}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-green-600">${payment.amount}</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{payment.reference || "-"}</td>
                </tr>
              ))}
               {filteredPayments.length === 0 && (
                <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                        No payments found.
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

export default PaymentManagement;