import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Table, Button, Modal, ModalHeader, ModalBody, 
  Card, CardBody
} from "reactstrap";
import { FaCreditCard, FaMoneyBill } from "react-icons/fa";
import { toast } from "react-toastify";

const CreateNewPayment = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ clientId: "", invoiceId: "", amount: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    // Load Razorpay SDK
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const fetchData = async () => {
    try {
      const [cRes, iRes] = await Promise.all([axios.get("/api/client/"), axios.get("/api/invoices/")]);
      setClients(cRes.data);
      setInvoices(iRes.data);
    } catch (err) { toast.error("Failed to load data"); }
  };

  // --- SECURE PAYMENT FLOW ---
  const handleRazorpayPayment = async (amount) => {
    setLoading(true);
    try {
      // Step 1: Create Order on Backend (Prevents Amount Tampering)
      const orderUrl = "/api/payments/razorpay-order";
      const { data: order } = await axios.post(orderUrl, { amount: amount });

      const options = {
        key: "rzp_test_YourKeyHere", // Replace with your Public Key
        amount: order.amount,
        currency: order.currency,
        name: "PayPilot Demo",
        description: "Invoice Payment",
        order_id: order.id, // Secure Order ID from Server
        handler: async function (response) {
          // Step 2: Verify Signature on Backend
          try {
             await axios.post("/api/payments/razorpay-verify", {
               razorpay_order_id: response.razorpay_order_id,
               razorpay_payment_id: response.razorpay_payment_id,
               razorpay_signature: response.razorpay_signature
             });
             
             // Step 3: If Verified, Save to DB
             toast.success("Payment Verified & Successful!");
             submitPayment(response.razorpay_payment_id, "Online");
          } catch (verifyErr) {
             toast.error("Payment verification failed! Potential fraud detected.");
             console.error(verifyErr);
          }
        },
        prefill: { name: "PayPilot User", email: "user@example.com", contact: "9999999999" },
        theme: { color: "#3399cc" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      toast.error("Failed to initiate payment. Server error.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitPayment = async (txnId, method) => {
    try {
      await axios.post("/api/payments/", {
        clientId: formData.clientId,
        invoiceId: formData.invoiceId,
        amount: formData.amount,
        paymentId: txnId,
        paymentMethod: method,
      });
      await axios.patch(`/api/invoices/${formData.invoiceId}`, { paymentStatus: "Paid" });
      
      toast.success("Payment Recorded!");
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error("Failed to record payment."); }
  };

  const handlePayClick = (inv) => {
    setFormData({ clientId: inv.client._id, invoiceId: inv._id, amount: inv.totalAmount });
    setModalOpen(true);
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Payment Portal</h2>
      <Card className="shadow-sm border-0"><CardBody>
        <Table hover responsive>
          <thead className="table-light">
            <tr><th>Invoice #</th><th>Client</th><th>Amount</th><th>Action</th></tr>
          </thead>
          <tbody>
            {invoices.filter(i => i.paymentStatus !== "Paid").map(inv => (
              <tr key={inv._id}>
                <td>{inv.invoiceNo}</td>
                <td>{inv.client?.firstName}</td>
                <td className="fw-bold text-danger">Rs. {inv.totalAmount}</td>
                <td><Button size="sm" color="primary" onClick={() => handlePayClick(inv)}>Pay</Button></td>
              </tr>
            ))}
            {invoices.filter(i => i.paymentStatus !== "Paid").length === 0 && (
                <tr><td colSpan="4" className="text-center text-muted">No pending invoices found</td></tr>
            )}
          </tbody>
        </Table>
      </CardBody></Card>

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
        <ModalHeader>Complete Payment</ModalHeader>
        <ModalBody>
          <div className="text-center mb-4">
             <h3>Rs. {formData.amount}</h3>
             <p className="text-muted">Total Payable Amount</p>
          </div>
          <div className="d-grid gap-2">
            <Button color="success" size="lg" disabled={loading} onClick={() => handleRazorpayPayment(formData.amount)}>
               <FaCreditCard className="me-2"/> 
               {loading ? "Processing..." : "Pay via Razorpay (Online)"}
            </Button>
            <Button color="secondary" disabled={loading} onClick={() => submitPayment(`CASH-${Date.now()}`, "Cash")}>
               <FaMoneyBill className="me-2"/> Mark as Paid (Cash)
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default CreateNewPayment;