import React, { useState, useEffect } from "react";
import api from "../../api";
import ClientLayout from "./ClientLayout";
import { Search, CreditCard } from "lucide-react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

const ClientPayments = () => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api.get("/client/payments").then(res => setPayments(res.data)).catch(console.error);
  }, []);

  const filtered = payments.filter(p => p.invoiceNo?.includes(searchTerm));

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payment History</h1>
          <p className="text-muted-foreground mt-1">View all your past transactions.</p>
        </div>

        <Card>
            <div className="p-6 border-b border-border">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search Invoice #..."
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
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Invoice #</th>
                            <th className="px-6 py-3">Method</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.map((pay) => (
                            <tr key={pay._id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-4 text-muted-foreground">{new Date(pay.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium">{pay.invoiceNo}</td>
                                <td className="px-6 py-4 flex items-center gap-2">
                                    <CreditCard size={14} className="text-muted-foreground"/> {pay.method}
                                </td>
                                <td className="px-6 py-4 font-bold text-green-600">${pay.amount}</td>
                                <td className="px-6 py-4">
                                    <Badge variant="success">Success</Badge>
                                </td>
                            </tr>
                        ))}
                         {filtered.length === 0 && (
                             <tr><td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">No payments found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
      </div>
    </ClientLayout>
  );
};

export default ClientPayments;