import React, { useState, useEffect } from "react";
import api from "../api"; // FIX: Using secure API instance
import { 
  Box, Grid, Card, CardContent, Typography, TextField, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, MenuItem, IconButton, Divider, InputAdornment 
} from "@mui/material";
import { Add, Delete, Save, ReceiptLong, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CreateInvoice = () => {
  const navigate = useNavigate();
  
  // 1. Initial State
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: "Loading...",
    clientId: "",
    // REQUESTED FEATURE: Date is fixed to today
    date: new Date().toISOString().split('T')[0], 
    notes: "",
    terms: "Payment due within 15 days. Thank you for your business.",
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
  const [taxRate, setTaxRate] = useState(18); // Editable Tax Rate
  const [discountRate, setDiscountRate] = useState(0); // New Feature: Discount

  // 2. Load Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, productsRes, invRes] = await Promise.all([
          api.get("/client/"),
          api.get("/product/"),
          api.get("/invoices/lastinvno")
        ]);
        setClients(clientsRes.data);
        setProducts(productsRes.data);
        const nextNum = invRes.data.invoiceNo ? parseInt(invRes.data.invoiceNo) + 1 : 1;
        setInvoiceData(prev => ({ ...prev, invoiceNo: String(nextNum).padStart(5, "0") }));
      } catch (err) {
        toast.error("Failed to load initial data");
      }
    };
    fetchData();
  }, []);

  // 3. Logic Handling
  const handleProductSelect = (e) => {
    const product = products.find(p => p._id === e.target.value);
    if (product) {
      setCurrentItem({
        productId: product._id,
        name: product.name,
        quantity: 1,
        rate: product.price,
        amount: product.price
      });
    }
  };

  const addItem = () => {
    if (!currentItem.productId) return toast.warning("Select a product first");
    setItems([...items, currentItem]);
    setCurrentItem({ productId: "", name: "", quantity: 1, rate: 0, amount: 0 });
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Recalculate totals whenever items, tax, or discount changes
  useEffect(() => {
    const sub = items.reduce((acc, item) => acc + item.amount, 0);
    const discAmount = (sub * discountRate) / 100;
    const taxableAmount = sub - discAmount;
    const taxAmount = (taxableAmount * taxRate) / 100;
    
    setTotals({
      subtotal: sub.toFixed(2),
      discount: discAmount.toFixed(2),
      tax: taxAmount.toFixed(2),
      totalAmount: (taxableAmount + taxAmount).toFixed(2)
    });
  }, [items, taxRate, discountRate]);

  // 4. Submit
  const handleSubmit = async () => {
    if (!invoiceData.clientId || items.length === 0) return toast.error("Please fill required fields");

    const payload = {
      ...invoiceData,
      products: items.map(i => ({ product: i.productId, quantity: i.quantity, rate: i.rate, amount: i.amount })),
      subtotal: totals.subtotal,
      tax: totals.tax,
      totalAmount: totals.totalAmount,
      // Sending custom fields to backend (ensure your Invoice Model has these fields)
      notes: invoiceData.notes,
      terms: invoiceData.terms
    };

    try {
      await api.post("/invoices", payload);
      toast.success("Invoice Created!");
      navigate("/invoicelist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Creation failed");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          <ReceiptLong sx={{ verticalAlign: 'middle', mr: 1, mb: 0.5 }} />
          New Invoice
        </Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Col: Invoice Info */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Info</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Invoice #" value={invoiceData.invoiceNo} disabled variant="filled" />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Date" 
                  value={invoiceData.date} 
                  disabled // REQUESTED FEATURE: LOCKED DATE
                  InputProps={{
                    startAdornment: <InputAdornment position="start">📅</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Select Client"
                  value={invoiceData.clientId}
                  onChange={(e) => setInvoiceData({ ...invoiceData, clientId: e.target.value })}
                >
                  {clients.map(c => (
                    <MenuItem key={c._id} value={c._id}>{c.firstName} {c.lastName}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Right Col: Items & Customization */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Items</Typography>
            
            {/* Item Adder */}
            <Box display="flex" gap={2} mb={2} alignItems="center">
              <TextField 
                select label="Product" size="small" sx={{ flexGrow: 1 }}
                value={currentItem.productId} 
                onChange={handleProductSelect}
              >
                {products.map(p => <MenuItem key={p._id} value={p._id}>{p.name} (${p.price})</MenuItem>)}
              </TextField>
              <TextField 
                label="Qty" type="number" size="small" sx={{ width: 80 }}
                value={currentItem.quantity}
                onChange={(e) => {
                  const q = Number(e.target.value);
                  setCurrentItem(prev => ({ ...prev, quantity: q, amount: q * prev.rate }));
                }}
              />
              <Typography sx={{ width: 80, textAlign: 'right' }}>${currentItem.amount}</Typography>
              <Button variant="contained" onClick={addItem}><Add /></Button>
            </Box>

            {/* Items Table */}
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Qty</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">${item.rate}</TableCell>
                      <TableCell align="right">${item.amount}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="error" onClick={() => removeItem(index)}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center">No items added</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 2 }} />

            {/* Footer: Customization & Totals */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                 {/* REQUESTED FEATURE: CUSTOMIZE OPTION */}
                <Typography variant="subtitle2" color="primary">Invoice Customization</Typography>
                <TextField 
                  fullWidth multiline rows={2} label="Notes" margin="dense" size="small"
                  value={invoiceData.notes}
                  onChange={e => setInvoiceData({...invoiceData, notes: e.target.value})}
                />
                <TextField 
                  fullWidth multiline rows={2} label="Terms & Conditions" margin="dense" size="small"
                  value={invoiceData.terms}
                  onChange={e => setInvoiceData({...invoiceData, terms: e.target.value})}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Subtotal:</Typography>
                  <Typography fontWeight="bold">${totals.subtotal}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography>Discount (%):</Typography>
                  <TextField 
                    type="number" size="small" variant="standard" sx={{ width: 50, textAlign: 'right' }}
                    value={discountRate} onChange={e => setDiscountRate(Number(e.target.value))}
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography>Tax Rate (%):</Typography>
                  <TextField 
                    type="number" size="small" variant="standard" sx={{ width: 50, textAlign: 'right' }}
                    value={taxRate} onChange={e => setTaxRate(Number(e.target.value))}
                  />
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="h5" color="primary">Total:</Typography>
                  <Typography variant="h5" color="primary">${totals.totalAmount}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Box mt={3} textAlign="right">
              <Button 
                variant="contained" size="large" 
                startIcon={<Save />} onClick={handleSubmit}
                sx={{ px: 4, borderRadius: 2 }}
              >
                Generate Invoice
              </Button>
            </Box>

          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateInvoice;