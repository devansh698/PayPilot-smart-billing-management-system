import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Container, Row, Col, Card, CardBody, Form, FormGroup, 
  Label, Input, Button, Table, Alert 
} from "reactstrap";
import { FaTrash, FaPlus, FaCalculator } from "react-icons/fa";

const CreateInvoice = () => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: "",
    clientId: "",
    clientName: "", // For display/logic if needed
    date: new Date().toISOString().split('T')[0]
  });

  // Lists for Dropdowns
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  // Item Line State
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    name: "",
    quantity: 1,
    rate: 0,
    amount: 0
  });

  // Totals
  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0,
    totalAmount: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 1. Fetch Initial Data (Clients, Products, Last Invoice #)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, productsRes, invRes] = await Promise.all([
          axios.get("/api/client/"),
          axios.get("/api/product/"),
          axios.get("/api/invoices/lastinvno")
        ]);

        setClients(clientsRes.data);
        setProducts(productsRes.data);
        
        // Auto-generate next Invoice Number
        const nextNum = invRes.data.invoiceNo ? parseInt(invRes.data.invoiceNo) + 1 : 1;
        setInvoiceData(prev => ({ ...prev, invoiceNo: String(nextNum).padStart(5, "0") }));
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load initial data.");
      }
    };
    fetchData();
  }, []);

  // 2. Handle Product Selection
  const handleProductSelect = (e) => {
    const prodId = e.target.value;
    const product = products.find(p => p._id === prodId);
    
    if (product) {
      setCurrentItem({
        productId: product._id,
        name: product.name,
        quantity: 1,
        rate: product.price,
        amount: product.price * 1
      });
    } else {
        setCurrentItem({ productId: "", name: "", quantity: 1, rate: 0, amount: 0 });
    }
  };

  // 3. Handle Quantity Change
  const handleQuantityChange = (e) => {
    const qty = parseFloat(e.target.value) || 0;
    setCurrentItem(prev => ({
      ...prev,
      quantity: qty,
      amount: qty * prev.rate
    }));
  };

  // 4. Add Item to List
  const handleAddItem = () => {
    if (!currentItem.productId || currentItem.quantity <= 0) {
      setError("Please select a product and valid quantity.");
      return;
    }
    
    const newItems = [...items, currentItem];
    setItems(newItems);
    calculateTotals(newItems);
    
    // Reset Current Item
    setCurrentItem({ productId: "", name: "", quantity: 1, rate: 0, amount: 0 });
    setError("");
  };

  // 5. Remove Item
  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    calculateTotals(newItems);
  };

  // 6. Calculate Totals
  const calculateTotals = (currentItems) => {
    const subtotal = currentItems.reduce((acc, item) => acc + item.amount, 0);
    const tax = subtotal * 0.18; // 18% Tax
    setTotals({
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      totalAmount: parseFloat((subtotal + tax).toFixed(2))
    });
  };

  // 7. Submit Invoice
  const handleSubmit = async () => {
    if (!invoiceData.clientId || items.length === 0) {
      setError("Please select a client and add at least one item.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        invoiceNo: invoiceData.invoiceNo,
        client: invoiceData.clientId,
        date: invoiceData.date,
        products: items.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        })),
        subtotal: totals.subtotal,
        tax: totals.tax,
        totalAmount: totals.totalAmount
      };

      await axios.post("/api/invoices", payload);
      setSuccess("Invoice created successfully!");
      setItems([]);
      setTotals({ subtotal: 0, tax: 0, totalAmount: 0 });
      setInvoiceData(prev => ({ ...prev, clientId: "" }));
      
      // Refresh invoice number for next one
      setTimeout(() => window.location.reload(), 1500);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to create invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><FaCalculator className="me-2"/> New Invoice</h2>
        <Button color="secondary" onClick={() => window.history.back()}>Back</Button>
      </div>

      {error && <Alert color="danger">{error}</Alert>}
      {success && <Alert color="success">{success}</Alert>}

      <Row>
        {/* Left Col: Client & Invoice Info */}
        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <CardBody>
              <h5>Invoice Details</h5>
              <FormGroup>
                <Label>Invoice Number</Label>
                <Input value={invoiceData.invoiceNo} disabled className="bg-light" />
              </FormGroup>
              <FormGroup>
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={invoiceData.date} 
                  onChange={(e) => setInvoiceData({...invoiceData, date: e.target.value})} 
                />
              </FormGroup>
              <FormGroup>
                <Label>Client</Label>
                <Input 
                  type="select" 
                  value={invoiceData.clientId}
                  onChange={(e) => setInvoiceData({...invoiceData, clientId: e.target.value})}
                >
                  <option value="">-- Select Client --</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </CardBody>
          </Card>
        </Col>

        {/* Right Col: Product Adder & List */}
        <Col md={8}>
          <Card className="shadow-sm">
            <CardBody>
              <h5>Add Products</h5>
              <Row className="g-2 align-items-end mb-3">
                <Col md={5}>
                  <Label>Product</Label>
                  <Input 
                    type="select" 
                    value={currentItem.productId} 
                    onChange={handleProductSelect}
                  >
                    <option value="">Select Product</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} (${p.price})</option>
                    ))}
                  </Input>
                </Col>
                <Col md={3}>
                  <Label>Quantity</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={currentItem.quantity} 
                    onChange={handleQuantityChange} 
                  />
                </Col>
                <Col md={2}>
                   <Label>Amount</Label>
                   <Input value={currentItem.amount.toFixed(2)} disabled />
                </Col>
                <Col md={2}>
                  <Button color="primary" block onClick={handleAddItem}><FaPlus/></Button>
                </Col>
              </Row>

              <Table striped responsive className="mt-3">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.rate}</td>
                      <td>${item.amount.toFixed(2)}</td>
                      <td>
                        <Button size="sm" color="danger" outline onClick={() => handleRemoveItem(idx)}>
                          <FaTrash size={12}/>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan="5" className="text-center text-muted">No items added yet.</td></tr>
                  )}
                </tbody>
              </Table>

              {/* Totals Section */}
              <div className="d-flex justify-content-end mt-4">
                <div style={{ width: '250px' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <strong>${totals.subtotal}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax (18%):</span>
                    <strong>${totals.tax}</strong>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-2">
                    <h5>Total:</h5>
                    <h5 className="text-primary">${totals.totalAmount}</h5>
                  </div>
                </div>
              </div>

              <div className="text-end mt-4">
                <Button 
                  color="success" 
                  size="lg" 
                  onClick={handleSubmit} 
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Create Invoice"}
                </Button>
              </div>

            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateInvoice;