import React, { useState, useEffect } from "react";
import { Container, Form, Button, Table, Alert, FormGroup, Label, Input } from "reactstrap";

const CreateInvoice = () => {
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [clientDetails, setClientDetails] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [rate, setRate] = useState(0);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    fetch("/api/invoices/lastinvno")
      .then((response) => response.json())
      .then((data) => {
        const newInvoiceNumber = data.invoiceNo ? parseInt(data.invoiceNo) + 1 : 1;
        setInvoiceNumber(String(newInvoiceNumber).padStart(5, "0"));
      })
      .catch((error) => setError(error.message));

    fetch("/api/client/")
      .then((response) => response.json())
      .then((data) => setClientDetails(data))
      .catch((error) => setError(error.message));

    fetch("/api/product/")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => setError(error.message));
  }, []);

  const handleClientChange = (event) => {
    setSelectedClient(event.target.value);
  };

  const handleProductChange = (event) => {
    const selectedProductId = event.target.value;
    const selectedProduct = products.find((product) => product._id === selectedProductId);
    console.log("selectedProduct", selectedProduct);
    setSelectedProduct(selectedProduct.name);
    setRate(selectedProduct.price);
  };

  const handleQuantityChange = (event) => {
    const quantity = event.target.value;
    setQuantity(quantity);
    setAmount(quantity * rate);
  };

  const handleAddItem = () => {
    const item = { name: selectedProduct, quantity, price: rate, amount };
    setItems([...items, item]);
    setSubtotal(subtotal + amount);
    setTax((subtotal + amount) * 0.18);
    setTotalAmount(subtotal + amount + ((subtotal + amount) * 0.18));
    setSelectedProduct("");
    setQuantity(0);
    setRate(0);
    setAmount(0);
  };

  const handleCreateBill = () => {
    if (selectedClient && items.length > 0) {
      const bill = {
        invoiceNo: invoiceNumber,
        client: selectedClient,
        products: items.map((item) => ({
          product: products.find((product) => product.name === item.name)._id,
          quantity: item.quantity,
          rate: item.price,
          amount: item.amount,
        })),
        subtotal,
        tax,
        totalAmount,
      };

      fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bill),
      })
        .then((response) => response.json())
        .then(() => {
          alert("Bill created successfully!");
          window.location.reload();
        })
        .catch((error) => setError(error.message));
    } else {
      setError("Please select a client and add items to the invoice");
    }
  };

  // Quantity validation
  const isValidQuantity = (quantity) => quantity > 0;

  return (
    <Container className="mt-5">
      <h4>Create Invoice</h4>
      {error && <Alert color="danger">{error}</Alert>}
      <Form>
        <FormGroup>
          <Label for="invoiceNumber">Invoice Number</Label>
          <Input type="text" id="invoiceNumber" value={invoiceNumber} readOnly />
        </FormGroup>
        <FormGroup>
          <Label for="client">Select Client</Label>
          <Input type="select" id="client" value={selectedClient} onChange={handleClientChange}>
            <option value="">Select Client</option>
            {clientDetails.map((client) => (
              <option value={client._id} key={client._id}>
                {client.firstName} {client.lastName}
              </option>
            ))}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="product">Select Product</Label>
          <Input type="select" id="product" value={selectedProduct.name} placeholder={selectedProduct} onChange={handleProductChange}>
          console.log("selectedProduct", selectedProduct);
            <option value="">Select Product</option>
            {products.map((product) => (
              <option value={product._id} key={product._id}>
                {product.name}
              </option>
            ))}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="quantity">Quantity</Label>
          <Input
            type="number"
            id="quantity"
            value={quantity}
            onChange={handleQuantityChange}
            required
            invalid={!isValidQuantity(quantity) && quantity > 0} // Real-time validation
          />
        </FormGroup>
        <Button color="primary" onClick={handleAddItem}>Add Item</Button>
      </Form>
      <hr />
      <h4>Invoice Items</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.price}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h4>Invoice Totals</h4>
      <Table>
        <tbody>
          <tr>
            <td>Subtotal</td>
            <td>{subtotal}</td>
          </tr>
          <tr>
            <td>Tax (18%)</td>
            <td>{tax}</td>
          </tr>
          <tr>
            <td>Total Amount</td>
            <td>{totalAmount}</td>
          </tr>
        </tbody>
      </Table>
      <Button color="success" onClick={handleCreateBill}>Create Bill</Button>
    </Container>
  );
};

export default CreateInvoice;
