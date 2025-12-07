import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Eye, FileText, Plus, X, Printer, Download } from "lucide-react";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import LoadingPage from "./LoadingPage";
import api from "../api";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices/');
      setInvoices(response.data);
      setFilteredInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = invoices.filter(inv => 
      inv.client.firstName.toLowerCase().includes(term) || 
      inv.invoiceNo.toLowerCase().includes(term)
    );
    setFilteredInvoices(filtered);
  };

  const generatePrintableBill = () => {
    if (!selectedInvoice) return;
    
    const billContent = `
        <html>
        <head>
            <title>Invoice #${selectedInvoice.invoiceNo}</title>
            <style>
                body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                .company-info h1 { margin: 0; color: #3b82f6; }
                .invoice-meta { text-align: right; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
                td { padding: 12px; border-bottom: 1px solid #eee; }
                .totals { margin-top: 30px; text-align: right; }
                .total-row { font-size: 1.2em; font-weight: bold; color: #3b82f6; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-info">
                    <h1>PayPilot</h1>
                    <p>Smart Billing Solutions</p>
                </div>
                <div class="invoice-meta">
                    <h2>INVOICE</h2>
                    <p>#${selectedInvoice.invoiceNo}</p>
                    <p>Date: ${new Date(selectedInvoice.date).toLocaleDateString()}</p>
                </div>
            </div>
            
            <div class="client-info">
                <h3>Bill To:</h3>
                <p><strong>${selectedInvoice.client.firstName} ${selectedInvoice.client.lastName}</strong><br>
                ${selectedInvoice.client.email}</p>
            </div>

            <table>
                <thead>
                    <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr>
                </thead>
                <tbody>
                    ${selectedInvoice.products.map(p => `
                        <tr>
                            <td>${p.product?.name || 'Item'}</td>
                            <td>${p.quantity}</td>
                            <td>${p.rate}</td>
                            <td>${p.amount}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="totals">
                <p>Subtotal: $${selectedInvoice.subtotal}</p>
                <p>Tax: $${selectedInvoice.tax}</p>
                <p class="total-row">Total: $${selectedInvoice.totalAmount.toFixed(2)}</p>
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(billContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <LoadingPage />;

  // Calculate stats
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const pendingCount = filteredInvoices.filter(i => i.paymentStatus !== 'Paid').length;
  const paidCount = filteredInvoices.filter(i => i.paymentStatus === 'Paid').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage and track your billing history.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline"><Download size={16} className="mr-2"/> Export</Button>
            <Button><Plus size={16} className="mr-2"/> Create Invoice</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col justify-center">
            <span className="text-sm text-muted-foreground">Total Revenue</span>
            <span className="text-2xl font-bold">${totalAmount.toLocaleString()}</span>
        </Card>
        <Card className="p-4 flex flex-col justify-center">
            <span className="text-sm text-muted-foreground">Paid Invoices</span>
            <span className="text-2xl font-bold text-green-600">{paidCount}</span>
        </Card>
        <Card className="p-4 flex flex-col justify-center">
            <span className="text-sm text-muted-foreground">Pending Invoices</span>
            <span className="text-2xl font-bold text-yellow-600">{pendingCount}</span>
        </Card>
      </div>

      {/* Filter & Table */}
      <Card>
        <CardContent className="p-6">
            <div className="mb-6 max-w-sm relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                    placeholder="Search Client or Invoice #..." 
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
            </div>

            <div className="rounded-md border border-border overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="px-4 py-3">Invoice #</th>
                            <th className="px-4 py-3">Client</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredInvoices.map((invoice) => (
                            <tr key={invoice._id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 font-medium">{invoice.invoiceNo}</td>
                                <td className="px-4 py-3">{invoice.client.firstName} {invoice.client.lastName}</td>
                                <td className="px-4 py-3 text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</td>
                                <td className="px-4 py-3 font-medium">${invoice.totalAmount.toFixed(2)}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={invoice.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                                        {invoice.paymentStatus}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(invoice)}>
                                        <Eye size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {filteredInvoices.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                                    No invoices found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </CardContent>
      </Card>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold">Invoice Details</h2>
                        <p className="text-sm text-muted-foreground">#{selectedInvoice.invoiceNo}</p>
                    </div>
                    <button onClick={() => setSelectedInvoice(null)} className="text-muted-foreground hover:text-foreground">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="font-semibold text-lg">{selectedInvoice.client.firstName} {selectedInvoice.client.lastName}</p>
                            <p className="text-sm text-muted-foreground">{selectedInvoice.client.email}</p>
                        </div>
                        <Badge variant={selectedInvoice.paymentStatus === 'Paid' ? 'success' : 'warning'} className="text-base px-3 py-1">
                            {selectedInvoice.paymentStatus}
                        </Badge>
                    </div>

                    <div className="rounded-md border border-border overflow-hidden mb-6">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Product</th>
                                    <th className="px-4 py-2 text-right">Qty</th>
                                    <th className="px-4 py-2 text-right">Price</th>
                                    <th className="px-4 py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {selectedInvoice.products.map((p, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-2">{p.product?.name || "Product"}</td>
                                        <td className="px-4 py-2 text-right">{p.quantity}</td>
                                        <td className="px-4 py-2 text-right">${p.rate}</td>
                                        <td className="px-4 py-2 text-right font-medium">${p.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-48 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>${selectedInvoice.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax:</span>
                                <span>${selectedInvoice.tax}</span>
                            </div>
                            <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span className="text-primary">${selectedInvoice.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Close</Button>
                    <Button onClick={generatePrintableBill}>
                        <Printer size={16} className="mr-2" /> Print Invoice
                    </Button>
                </div>
            </Card>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;