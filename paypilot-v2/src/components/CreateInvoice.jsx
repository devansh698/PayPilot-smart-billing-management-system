import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, Plus, Trash2, Calendar, FileText, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import SearchableSelect from "./ui/SearchableSelect";
import { useStore } from "../context/StoreContext";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { stores, isSuperAdmin, currentStore } = useStore();

  // State
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: "Loading...",
    clientId: "",
    date: new Date().toISOString().split('T')[0],
    notes: "",
    terms: "Payment due within 15 days. Thank you for your business.",
    store: "",
  });

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  // Line Items
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    productId: "", name: "", quantity: 1, rate: 0, amount: 0
  });

  // Financials
  const [totals, setTotals] = useState({
    subtotal: 0, tax: 0, discount: 0, totalAmount: 0
  });
  const [taxRate, setTaxRate] = useState(18);
  const [discountRate, setDiscountRate] = useState(0);

  const fetchProductsForStore = async (storeId) => {
    try {
      const storeFilter = storeId ? `&store=${storeId}` : '';
      const productsRes = await api.get(`/product/?limit=1000${storeFilter}`);
      setProducts(productsRes.data.products || []);
    } catch (err) {
      console.error("Failed to load products:", err);
      toast.error("Failed to load products for selected store");
    }
  };

  // Load Data
  useEffect(() => {
    // Set default store if not superadmin
    if (!isSuperAdmin && currentStore) {
      setInvoiceData(prev => ({ ...prev, store: currentStore._id }));
    }
    
    const fetchData = async () => {
      try {
        const storeId = invoiceData.store || currentStore?._id;
        const storeFilter = storeId ? `&store=${storeId}` : '';
        const [clientsRes, productsRes, invRes] = await Promise.all([
          api.get("/client/?limit=1000"),
          api.get(`/product/?limit=1000${storeFilter}`),
          api.get("/invoices/lastinvno")
        ]);

        // FIX: Extract the client array from the paginated response
        setClients(clientsRes.data.clients || []);

        // FIX: Extract the product array from the paginated response
        setProducts(productsRes.data.products || []);

        const nextNum = invRes.data.invoiceNo ? parseInt(invRes.data.invoiceNo) + 1 : 1;
        setInvoiceData(prev => ({ ...prev, invoiceNo: String(nextNum).padStart(5, "0") }));
      } catch (err) {
        console.error("Failed to load initial data:", err);
        toast.error("Failed to load initial data. Check client and product endpoints.");
      }
    };
    fetchData();
  }, []);

  // Logic
  const handleProductSelect = (e) => {
    const product = products.find(p => p._id === e);
    if (product) {
      // NOTE: Ensure product.price is a number
      const rate = Number(product.price) || 0;
      setCurrentItem({
        productId: product._id,
        name: product.name,
        quantity: 1,
        rate: rate,
        amount: rate // 1 * rate
      });
    }
  };

  const addItem = () => {
    if (!currentItem.productId) return toast.warning("Select a product first");
    if (currentItem.quantity <= 0) return toast.error("Quantity must be greater than zero.");

    // Check if the product is already in the list to prevent duplicates or manage quantity update
    // For simplicity, we just add the item:
    setItems([...items, currentItem]);
    setCurrentItem({ productId: "", name: "", quantity: 1, rate: 0, amount: 0 });
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const sub = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const discAmount = (sub * (discountRate / 100));
    const taxableAmount = sub - discAmount;
    const taxAmount = (taxableAmount * (taxRate / 100));

    setTotals({
      subtotal: sub.toFixed(2),
      discount: discAmount.toFixed(2),
      tax: taxAmount.toFixed(2),
      totalAmount: (taxableAmount + taxAmount).toFixed(2)
    });
  }, [items, taxRate, discountRate]);

  const handleSubmit = async () => {
    if (!invoiceData.clientId) return toast.error("Please select a client.");
    if (items.length === 0) return toast.error("Please add at least one line item.");
    
    // Validate store selection
    const storeId = invoiceData.store || currentStore?._id;
    if (!storeId) {
      toast.error("Please select a store");
      return;
    }

    const payload = {
      client: invoiceData.clientId,
      date: invoiceData.date,
      notes: invoiceData.notes,
      terms: invoiceData.terms,
      store: storeId,

      products: items.map(i => ({
        product: i.productId,
        quantity: i.quantity,
        rate: Number(i.rate),
        amount: Number(i.amount)
      })),

      subtotal: Number(totals.subtotal),
      tax: Number(totals.tax),
      totalAmount: Number(totals.totalAmount),
    };

    try {
      await api.post("/invoices", payload); // Use /invoice endpoint
      toast.success("Invoice Created!");
      navigate("/invoicelist");
    } catch (err) {
      console.error("Invoice Creation Error:", err.response || err);
      // Backend error messages should be available in err.response.data.error
      toast.error(err.response?.data?.error || err.response?.data?.message || "Creation failed. Check product stock.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">New Invoice</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Column: Invoice Info */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <div className="flex items-center px-3 py-2 border border-input rounded-md bg-muted/50 text-muted-foreground">
                  <FileText size={16} className="mr-2 opacity-50" />
                  {invoiceData.invoiceNo}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                  <Input
                    value={invoiceData.date}
                    disabled
                    className="pl-9 bg-muted/50"
                  />
                </div>
              </div>

              {/* Store Selection - Required for superadmin */}
              {isSuperAdmin && stores && stores.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="store">Store *</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                    <select
                      id="store"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-9 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={invoiceData.store}
                      onChange={(e) => {
                        setInvoiceData({ ...invoiceData, store: e.target.value });
                        // Reload products for selected store
                        fetchProductsForStore(e.target.value);
                      }}
                      required
                    >
                      <option value="">Select a store...</option>
                      {stores.map(store => (
                        <option key={store._id} value={store._id}>
                          {store.name} - {store.address.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <SearchableSelect 
                  label="Client *"
                  options={clients.map(c => ({ value: c._id, label: `${c.firstName} ${c.lastName} (${c.email})` }))}
                  value={invoiceData.clientId}
                  onChange={(val) => setInvoiceData({ ...invoiceData, clientId: val })}
                  placeholder="Select Client..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Terms & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Notes</Label>
                <textarea
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[80px]"
                  value={invoiceData.notes}
                  onChange={e => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                  placeholder="Add notes..."
                />
              </div>
              <div className="space-y-2">
                <Label>Terms</Label>
                <textarea
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[80px]"
                  value={invoiceData.terms}
                  onChange={e => setInvoiceData({ ...invoiceData, terms: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Line Items */}
        <div className="md:col-span-2 space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <span className="text-sm text-muted-foreground">{items.length} items added</span>
            </CardHeader>
            <CardContent className="flex-1">
              {/* Item Adder Form */}
              <div className="flex gap-3 mb-6 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex-1">
                  <SearchableSelect 
                        label="Product"
                        options={products.map(p => ({ key: p._id, value: p._id, label: `${p.name} ($${p.price || 0}) (Stock: ${p.quantity || 0})` }))}
                        value={currentItem.productId}
                        onChange={handleProductSelect}
                        placeholder="Select Product..."
                    />
                </div>
                <div className="w-24 pt-3">
                  <Label className="text-xs mb-1 block">Qty</Label>
                  <Input
                    type="number" min="1"
                    value={currentItem.quantity}
                    onChange={(e) => {
                      const q = Number(e.target.value);
                      setCurrentItem(prev => ({ ...prev, quantity: q, amount: q * prev.rate }));
                    }}
                  />
                </div>
                <div className="w-24 pt-6 mt-2">
                  <Button onClick={addItem} className="w-full">
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-md border border-border overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Rate</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">${item.rate.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-medium">${item.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => removeItem(index)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                          No items added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end border-t border-border pt-6">
                <div className="w-full md:w-1/2 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${totals.subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Discount (%)</span>
                    <Input
                      type="number"
                      className="w-20 h-7 text-right"
                      value={discountRate}
                      onChange={e => setDiscountRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Tax Rate (%)</span>
                    <Input
                      type="number"
                      className="w-20 h-7 text-right"
                      value={taxRate}
                      onChange={e => setTaxRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-xl font-bold text-primary">${totals.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Totals Section
              <div className="flex justify-end border-t border-border pt-6">
                <div className="w-full md:w-1/2 space-y-3">
                  <div className="w-full md:w-1/2 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${totals.subtotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Discount (%)</span>
                      <span className="font-medium">{discountRate}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Tax Rate (%)</span>
                      <span className="font-medium">{taxRate}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between items-center">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-xl font-bold text-primary">${totals.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div> */}
              <div className="flex justify-end mt-3 pt-3">
                <Button onClick={handleSubmit} size="lg" className="bg-primary hover:bg-primary/90">
                  <Save size={18} className="mr-2" /> Generate Invoice
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>


  );
};

export default CreateInvoice;