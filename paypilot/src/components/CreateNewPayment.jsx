import { patch } from "@mui/material";
import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  Form,
  Alert,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import axios from 'axios';
import Lottie from "lottie-react";
import animationData1 from "./animation/Animation - order placed.json";

const PaymentList = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedInvoiceid, setSelectedInvoiceid] = useState(null);
  const [amount, setAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash"); 
  const [paymentId, setPaymentId] = useState("");
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    const fetchClients = async () => {
      const response = await fetch("/api/client/");
      const data = await response.json();
      setClients(data);
    };

    const fetchInvoices = async () => {
      const response = await fetch("/api/invoices/");
      const data = await response.json();
      setInvoices(data);
    };

    fetchClients();
    fetchInvoices();
  }, []);

  const handleClientChange = (clientid, invoiceid) => {
    setSelectedClient(clientid);
    handleInvoiceChange(invoiceid);
    setShowModal(true);
  };

  const handleInvoiceChange = (event) => {
    const invoice = invoices.find((invoice) => invoice._id === event);
    setSelectedInvoiceid(invoice._id);
    setSelectedInvoice(invoice.invoiceNo);
    setAmount(invoice.totalAmount);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    if (event.target.value === "Cash") {
      setPaymentId(`CASH-${Math.floor(Math.random() * 100000)}`);
    } else {
      setPaymentId("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedClient || !selectedInvoice || amount <= 0 || !paymentId) {
      setError("Please fill in all fields correctly.");
      return;
    }

    const paymentData = {
      clientId: selectedClient,
      invoiceId: selectedInvoiceid,
      amount: amount,
      paymentId: paymentId,
      paymentMethod: paymentMethod,
    };

    try {
      const response = await fetch("/api/payments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      axios.patch(`/api/invoices/${selectedInvoiceid}`, {
        paymentStatus: "Paid",
      })
      if (!response.ok) throw new Error("Failed to create payment");
      setShowModal(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 2000);

    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container className="mt-5">
      {success && (
        <div style={{display: "flex",justifyContent: "center",alignItems: "center",position: "fixed",top: 0,left: 0,right: 0,bottom: 0,zIndex: 1000,backgroundColor: "rgba(0, 0, 0, 0.5)"
        }}>
          <div style={{backgroundColor: "transparent", padding: "20px",alignItems:"center",justifyContent:"center",display:"flex"
          }}>
            <Lottie animationData={animationData1} style={{ width: "50%", height: "50%",alignSelf:"center" }} />
          </div>
        </div>
      )}
      <h4>Payment List</h4>
      {error && <Alert color="danger">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Client ID</th>
            <th>Client</th>
            <th>Invoice No</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
{invoices.map((invoice) => (
  invoice.paymentStatus === "Paid" ? null : (
    <tr key={invoice._id}>
      <td>{invoice.client._id}</td>
      <td>{invoice.client.firstName ? invoice.client.firstName : "N/a"}</td>
      <td>{invoice.invoiceNo}</td>
      <td>{invoice.totalAmount}</td>
      <td>
        <Button color="primary" onClick={() => handleClientChange(invoice.client._id, invoice._id)}>Pay</Button>
      </td>
    </tr>
  )
))}
        </tbody>
      </Table>

      <Modal isOpen={showModal} toggle={() => setShowModal(false)} style={{marginTop:"140px"}}>
        <ModalHeader toggle={() => setShowModal(false)}>
          <h1>New Payment</h1>
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="client">Select Client</Label>
              <Input type="select" id="client" value={selectedClient} onChange={handleClientChange}>
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option value={client._id} key={client._id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="invoice">Select Invoice</Label>
              <Input type="select" id="invoice" value={selectedInvoice} onChange={handleInvoiceChange}>
                <option value="selectedInvoice">{selectedInvoice}</option>
                {invoices.filter(invoice => invoice.client._id === selectedClient).map((invoice) => (
                  <option value={invoice._id} key={invoice._id}>
                    {invoice.invoiceNo}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="amount">Amount</Label>
              <Input type="number" id="amount" value={amount} readOnly />
            </FormGroup>
            <FormGroup>
              <Label for="paymentMethod">Payment Method</Label>
              <Input type="select" id="paymentMethod" value={paymentMethod} onChange={handlePaymentMethodChange}>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="RTGS">RTGS</option>
                <option value="NEFT">NEFT</option>
                <option value="IMPS">IMPS</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="paymentId">Payment ID</Label>
              <Input type="text" id="paymentId" value={paymentId} onChange={(e) => setPaymentId(e.target.value)} placeholder={paymentMethod === "Cash" ? "Generated ID" : "Enter Payment ID"} />
            </FormGroup>
            <Button type="submit" color="success">Submit Payment</Button>
          </Form>
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default PaymentList;