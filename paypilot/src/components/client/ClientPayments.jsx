// src/components/client/ClientPayment.jsx
import React, { useEffect, useState } from 'react';
import { 
  Container, Table, Button, Modal, Form, 
  FormGroup, Label, Input, Alert, Card, Badge, Row, Col 
} from 'reactstrap';
import axios from 'axios';
import { FiDollarSign, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { curentuser } from '../api';
import './ClientPayment.css';

const ClientPayment = () => {
    const [allInvoices, setAllInvoices] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [previousPayments, setPreviousPayments] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);
    const [modal, setModal] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(curentuser()._id);
    const [loading, setLoading] = useState({
        invoices: true,
        payments: true
    });

    const fetchInvoices = async () => {
        try {
            const response = await axios.get('/api/clientroutes/invoices');
            setAllInvoices(response.data);
            const pendingInvoices = response.data.filter(invoice => invoice.paymentStatus === 'Pending');
            setInvoices(pendingInvoices);
            setLoading(prev => ({ ...prev, invoices: false }));
        } catch (error) {
            console.error('Error fetching invoices:', error);
            setError('Failed to load invoices');
            setLoading(prev => ({ ...prev, invoices: false }));
        }
    };

    const fetchPreviousPayments = async () => {
        try {
            const response = await axios.get(`/api/clientroutes/payments?clientId=${user}`);
            setPreviousPayments(response.data);
            setLoading(prev => ({ ...prev, payments: false }));
        } catch (error) {
            console.error('Error fetching previous payments:', error);
            setError('Failed to load payment history');
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

    const getPaymentStatusBadge = (status) => {
        const statusMap = {
            'Paid': { color: 'success', icon: <FiCheckCircle /> },
            'Pending': { color: 'warning', icon: <FiClock /> },
            'Failed': { color: 'danger', icon: <FiXCircle /> }
        };
        const statusInfo = statusMap[status] || { color: 'secondary' };
        return (
            <Badge color={statusInfo.color} className="status-badge">
                {statusInfo.icon} {status}
            </Badge>
        );
    };

    const handlePayment = async () => {
        if (!selectedInvoice) {
            setError('Please select an invoice.');
            return;
        }

        const options = {
            key: 'YOUR_RAZORPAY_TEST_KEY_ID',
            amount: totalAmount * 100,
            currency: 'INR',
            name: 'Your Company Name',
            description: 'Payment for Invoice No: ' + selectedInvoice.invoiceNo,
            image: 'https://your-logo-url.com/logo.png',
            handler: async function (response) {
                try {
                    await axios.post('/api/clientroutes/payments', {
                        invoiceId: selectedInvoice._id,
                        clientId: user,
                        paymentMethod: 'Razorpay',
                        paymentId: response.razorpay_payment_id,
                        amount: totalAmount,
                        invoiceNo: selectedInvoice.invoiceNo
                    });
                    await axios.put(`/api/clientroutes/invoices/${selectedInvoice._id}`, {
                        paymentStatus: 'Paid'
                    });
                    alert('Payment successful!');
                    resetPaymentState();
                    fetchPreviousPayments();
                    fetchInvoices();
                } catch (error) {
                    console.error('Error making payment:', error);
                    setError('Payment failed. Please try again.');
                }
            },
            prefill: {
                name: 'Client Name',
                email: 'client@example.com',
                contact: '9999999999'
            },
            theme: {
                color: '#3B82F6'
            }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    const resetPaymentState = () => {
        setSelectedInvoice(null);
        setTotalAmount(0);
        toggleModal();
    };

    useEffect(() => {
        fetchInvoices();
        fetchPreviousPayments();
        setUser(curentuser()._id);
    }, []);

    return (
        <Container fluid className="client-payment">
            <Row className="page-header">
                <Col>
                    <h1>Payments</h1>
                    <p className="subtitle">Manage your invoices and payments</p>
                </Col>
            </Row>

            {error && <Alert color="danger" className="alert-error">{error}</Alert>}

            <Row>
                <Col lg={8}>
                    <Card className="payment-card">
                        <div className="card-header">
                            <h3>Pending Invoices</h3>
                            {selectedInvoice && (
                                <div className="total-amount">
                                    <span>Selected Amount:</span>
                                    <strong>Rs.{totalAmount.toFixed(2)}</strong>
                                </div>
                            )}
                        </div>
                        {loading.invoices ? (
                            <div className="loading-placeholder">
                                <div className="spinner"></div>
                                <p>Loading invoices...</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="invoices-table">
                                    <thead>
                                        <tr>
                                            <th>Select</th>
                                            <th>Invoice No.</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.length > 0 ? (
                                            invoices.map(invoice => (
                                                <tr 
                                                    key={invoice._id} 
                                                    className={selectedInvoice?._id === invoice._id ? 'selected' : ''}
                                                    onClick={() => handleSelectInvoice(invoice)}
                                                >
                                                    <td>
                                                        <Input
                                                            type="radio"
                                                            checked={selectedInvoice?._id === invoice._id}
                                                            onChange={() => {}}
                                                        />
                                                    </td>
                                                    <td>{invoice.invoiceNo}</td>
                                                    <td>{new Date(invoice.date).toLocaleDateString()}</td>
                                                    <td>{getPaymentStatusBadge(invoice.paymentStatus)}</td>
                                                    <td>Rs.{invoice.totalAmount.toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="no-invoices">
                                                    <FiDollarSign className="empty-icon" />
                                                    <p>No pending invoices found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                        <div className="card-footer">
                            <Button 
                                color="primary" 
                                onClick={toggleModal} 
                                disabled={!selectedInvoice}
                                className="pay-btn"
                            >
                                Pay Selected Invoice
                            </Button>
                        </div>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="summary-card">
                        <div className="card-header">
                            <h3>Payment Summary</h3>
                        </div>
                        <div className="summary-content">
                            <div className="summary-item">
                                <span>Total Invoices:</span>
                                <strong>{allInvoices.length}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Pending:</span>
                                <strong>{invoices.length}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Paid:</span>
                                <strong>{allInvoices.length - invoices.length}</strong>
                            </div>
                            <div className="summary-item total">
                                <span>Total Amount Due:</span>
                                <strong>
                                    Rs.{invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0).toFixed(2)}
                                </strong>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Card className="history-card">
                        <div className="card-header">
                            <h3>Payment History</h3>
                        </div>
                        {loading.payments ? (
                            <div className="loading-placeholder">
                                <div className="spinner"></div>
                                <p>Loading payment history...</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Payment ID</th>
                                            <th>Invoice No.</th>
                                            <th>Date</th>
                                            <th>Method</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previousPayments.length > 0 ? (
                                            previousPayments.map(payment => {
                                                const invoice = allInvoices.find(inv => inv._id === payment.invoiceId);
                                                return (
                                                    <tr key={payment._id}>
                                                        <td>#{payment._id.slice(-6)}</td>
                                                        <td>{invoice ? invoice.invoiceNo : 'N/A'}</td>
                                                        <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                                        <td>{payment.paymentMethod}</td>
                                                        <td>Rs.{payment.amount.toFixed(2)}</td>
                                                        <td>{getPaymentStatusBadge('Paid')}</td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="no-payments">
                                                    <FiDollarSign className="empty-icon" />
                                                    <p>No payment history found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            <Modal isOpen={modal} toggle={toggleModal} className="payment-modal">
                <div className="modal-header">
                    <h5 className="modal-title">Confirm Payment</h5>
                </div>
                <div className="modal-body">
                    <p>You are about to make a payment of <strong>Rs.{totalAmount.toFixed(2)}</strong> for:</p>
                    <div className="invoice-details">
                        <p><strong>Invoice No:</strong> {selectedInvoice?.invoiceNo}</p>
                        <p><strong>Date:</strong> {selectedInvoice && new Date(selectedInvoice.date).toLocaleDateString()}</p>
                    </div>
                    <p className="note">You will be redirected to Razorpay to complete your payment.</p>
                </div>
                <div className="modal-footer">
                    <Button color="secondary" onClick={toggleModal}>Cancel</Button>
                    <Button color="primary" onClick={handlePayment}>Proceed to Payment</Button>
                </div>
            </Modal>
        </Container>
    );
};

export default ClientPayment;