import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, CardBody, Badge, Alert } from 'reactstrap';
import api from '../../api';
import { toast } from 'react-toastify';
import { FiDollarSign, FiRefreshCw } from 'react-icons/fi';

const ClientPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const PAGE_LIMIT = 10;

    const fetchPayments = async () => {
        setLoading(true);
        try {
            // Fetch payments from the client portal route
            const res = await api.get(`/clients/payments?page=${currentPage}&limit=${PAGE_LIMIT}&sortBy=createdAt&sortOrder=desc`);
            
            setPayments(res.data.payments || []);
            setTotalPages(res.data.totalPages || 1);

        } catch (error) {
            toast.error("Failed to fetch payments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [currentPage]);

    const getMethodColor = (method) => {
        const m = method ? method.toLowerCase() : '';
        if (m.includes('card') || m.includes('razorpay')) return 'primary';
        if (m.includes('cash')) return 'success';
        return 'info';
    };

    if (loading) return <Container className="mt-5"><p>Loading payment history...</p></Container>;

    return (
        <Container className="mt-5">
            <h1>Payment History</h1>
            
            <Card className="shadow-sm border-0 mt-4">
                <CardBody>
                    {payments.length === 0 ? (
                        <Alert color="info">No payments recorded yet.</Alert>
                    ) : (
                        <Table hover responsive>
                            <thead className="table-light">
                                <tr>
                                    <th>Payment ID</th>
                                    <th>Invoice ID</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(payment => (
                                    <tr key={payment._id}>
                                        <td className="fw-bold">#{payment.paymentId?.slice(-6).toUpperCase() || payment._id.slice(-6).toUpperCase()}</td>
                                        {/* NOTE: Invoice is not populated in this backend route, showing ID */}
                                        <td>{payment.invoiceId}</td> 
                                        <td className="text-success fw-bold">₹{payment.amount.toFixed(2)}</td>
                                        <td><Badge color={getMethodColor(payment.paymentMethod)}>{payment.paymentMethod}</Badge></td>
                                        <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                    
                    {/* Pagination Controls */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <small className="text-muted">Page {currentPage} of {totalPages}</small>
                        <div>
                            <Button size="sm" color="secondary" outline className="me-2" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Previous</Button>
                            <Button size="sm" color="secondary" outline onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Next</Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Container>
    );
};

export default ClientPayments;