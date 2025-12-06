// src/components/client/ClientPayments.jsx
import React, { useEffect, useState } from 'react';
import { 
  Container, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, 
  Input, Alert, Card, Badge, Row, Col 
} from 'reactstrap';
import axios from 'axios';
import { FiDollarSign, FiCheckCircle, FiClock, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { curentuser } from '../api';
import './ClientPayment.css';

const ClientPayment = () => {
    const [allInvoices, setAllInvoices] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [previousPayments, setPreviousPayments] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);
    const [modal, setModal] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState({ invoices: true, payments: true, processing: false });

    // Load user and data on mount
    useEffect(() => {
        const userData = curentuser();
        if(userData){
             setUser(userData._id);
             fetchInvoices();
             fetchPreviousPayments(userData._id);
        }
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(prev => ({ ...prev, invoices: true }));
            const response = await axios.get('/api/clientroutes/invoices');
            setAllInvoices(response.data);
            const pendingInvoices = response.data.filter(invoice => invoice.paymentStatus === 'Pending');
            setInvoices(pendingInvoices);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error(error.response?.data?.message || 'Failed to load invoices');
        } finally {
            setLoading(prev => ({ ...prev, invoices: false }));
        }
    };

    const fetchPreviousPayments = async (userId) => {
        try {
            setLoading(prev => ({ ...prev, payments: true }));
            const idToUse = userId || user;
            const response = await axios.get(`/api/clientroutes/payments?clientId=${idToUse}`);
            setPreviousPayments(response.data);
        } catch (error) {
            console.error('Error fetching history:', error);
            toast.error('Failed to load payment history');
        } finally {
            setLoading(prev => ({ ...prev, payments: false }));
        }
    };

    const toggleModal = () => setModal(!modal);

    const handleSelectInvoice = (invoice) => {
        if (selectedInvoice && selectedInvoice._id === invoice._id) {
            setSelectedInvoice(null);
            setTotalAmount(0);
        } else {
            setSelectedInvoice(invoice);
            setTotalAmount(invoice.totalAmount);
        }
    };

    const handlePaymentInitiation = async () => {
        if (!selectedInvoice) {
            toast.warning('Please select an invoice to pay.');
            return;
        }

        setLoading(prev => ({ ...prev, processing: true }));

        try {
            // 1. Create Order on Backend
            const orderUrl = "/api/payments/razorpay-order";
            const { data: orderData } = await axios.post(orderUrl, { 
                amount: totalAmount,
                currency: "INR" 
            });

            // 2. Open Razorpay
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || "YOUR_TEST_KEY_HERE", // Add this to your .env file
                amount: orderData.amount,
                currency: orderData.currency,
                name: "PayPilot Billing",
                description: `Invoice #${selectedInvoice.invoiceNo}`,
                order_id: orderData.id, // This comes from the backend
                handler: async function (response) {
                    // 3. Verify Payment on Backend
                    try {
                        const verifyUrl = "/api/payments/razorpay-verify";
                        await axios.post(verifyUrl, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        // 4. Save Payment Record & Update Invoice
                        await axios.post('/api/clientroutes/payments', {
                            invoiceId: selectedInvoice._id,
                            clientId: user,
                            paymentMethod: 'Razorpay',
                            paymentId: response.razorpay_payment_id,
                            amount: totalAmount,
                            invoiceNo: selectedInvoice.invoiceNo
                        });

                        // 5. Update Invoice Status
                        await axios.put(`/api/clientroutes/invoices/${selectedInvoice._id}`, {
                            paymentStatus: 'Paid'
                        });

                        toast.success('Payment Verified & Successful!');
                        resetPaymentState();
                        fetchPreviousPayments(user);
                        fetchInvoices();

                    } catch (verifyError) {
                        console.error(verifyError);
                        toast.error("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: "Client User", // You can fetch real user details here
                    email: "client@example.com",
                    contact: "9999999999"
                },
                theme: { color: "#3B82F6" },
                modal: {
                    ondismiss: function() {
                        setLoading(prev => ({ ...prev, processing: false }));
                        toast.info('Payment cancelled.');
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
            toggleModal(); // Close our custom modal, let Razorpay take over

        } catch (error) {
            console.error("Payment init error:", error);
            toast.error(error.response?.data?.message || "Could not initiate payment.");
            setLoading(prev => ({ ...prev, processing: false }));
        }
    };

    const resetPaymentState = () => {
        setSelectedInvoice(null);
        setTotalAmount(0);
        setLoading(prev => ({ ...prev, processing: false }));
    };

    const getStatusBadge = (status) => {
        const colors = { 'Paid': 'success', 'Pending': 'warning', 'Failed': 'danger' };
        return <Badge color={colors[status] || 'secondary'}>{status}</Badge>;
    };

    return (
        <Container fluid className="client-payment p-4">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-primary">Invoices & Payments</h2>
                    <p className="text-muted">Manage your outstanding dues safely.</p>
                </div>
                <Button outline color="primary" onClick={() => { fetchInvoices(); fetchPreviousPayments(user); }}>
                    <FiRefreshCw /> Refresh
                </Button>
            </div>

            <Row>
                <Col lg={8}>
                    <Card className="shadow-sm border-0 mb-4">
                        <div className="card-header bg-white border-bottom p-3">
                            <h5 className="mb-0">Pending Invoices</h5>
                        </div>
                        <div className="table-responsive">
                            <Table hover className="align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th width="5%">Select</th>
                                        <th>Invoice #</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th className="text-end">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading.invoices ? (
                                        <tr><td colSpan="5" className="text-center p-4">Loading...</td></tr>
                                    ) : invoices.length > 0 ? (
                                        invoices.map(inv => (
                                            <tr 
                                                key={inv._id} 
                                                className={selectedInvoice?._id === inv._id ? 'table-primary' : ''}
                                                style={{cursor: 'pointer'}}
                                                onClick={() => handleSelectInvoice(inv)}
                                            >
                                                <td>
                                                    <Input type="radio" checked={selectedInvoice?._id === inv._id} readOnly/>
                                                </td>
                                                <td className="fw-bold">{inv.invoiceNo}</td>
                                                <td>{new Date(inv.date).toLocaleDateString()}</td>
                                                <td>{getStatusBadge(inv.paymentStatus)}</td>
                                                <td className="text-end fw-bold">₹{inv.totalAmount.toFixed(2)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="text-center p-4 text-muted">No pending invoices. Great job!</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="shadow-sm border-0 mb-4 bg-primary text-white">
                        <div className="card-body">
                            <h5 className="card-title">Payment Summary</h5>
                            <hr className="opacity-25"/>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Selected Invoice:</span>
                                <span className="fw-bold">{selectedInvoice ? selectedInvoice.invoiceNo : '-'}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span>Total Payable:</span>
                                <span className="fs-4 fw-bold">₹{totalAmount.toFixed(2)}</span>
                            </div>
                            <Button 
                                color="light" 
                                block 
                                className="text-primary fw-bold w-100"
                                disabled={!selectedInvoice || loading.processing}
                                onClick={toggleModal}
                            >
                                {loading.processing ? 'Processing...' : 'Pay Now'}
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Confirmation Modal */}
            <Modal isOpen={modal} toggle={toggleModal} centered>
                <ModalHeader toggle={toggleModal}>Confirm Payment</ModalHeader>
                <ModalBody>
                    <p>You are initiating a secure payment via Razorpay.</p>
                    <div className="bg-light p-3 rounded">
                        <div className="d-flex justify-content-between">
                            <span>Invoice Number:</span>
                            <strong>{selectedInvoice?.invoiceNo}</strong>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <span>Amount:</span>
                            <strong className="text-primary">₹{totalAmount.toFixed(2)}</strong>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleModal} disabled={loading.processing}>Cancel</Button>
                    <Button color="primary" onClick={handlePaymentInitiation} disabled={loading.processing}>
                        {loading.processing ? 'Processing...' : 'Proceed to Pay'}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Previous History Section (Simplified for brevity) */}
            <h5 className="mt-4 mb-3">Payment History</h5>
             <Card className="shadow-sm border-0">
                <Table responsive>
                    <thead><tr><th>Payment ID</th><th>Invoice</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                        {previousPayments.map(p => (
                            <tr key={p._id}>
                                <td><small className="text-muted">#{p.paymentId?.slice(-8)}</small></td>
                                <td>{p.invoiceNo || 'N/A'}</td>
                                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                <td className="text-success">₹{p.amount}</td>
                                <td><Badge color="success">Paid</Badge></td>
                            </tr>
                        ))}
                         {previousPayments.length === 0 && <tr><td colSpan="5" className="text-center text-muted">No history found</td></tr>}
                    </tbody>
                </Table>
            </Card>
        </Container>
    );
};

export default ClientPayment;