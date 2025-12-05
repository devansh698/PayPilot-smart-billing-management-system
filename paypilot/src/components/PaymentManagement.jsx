import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Button, Badge, Card, CardBody, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { FaMoneyBillWave, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await axios.get('/api/payments/');
            setPayments(res.data);
        } catch (error) {
            console.error("Error fetching payments", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this payment record?')) {
            try {
                await axios.delete(`/api/payments/${id}`);
                setPayments(payments.filter(p => p._id !== id));
                toast.success("Payment deleted");
            } catch (error) {
                toast.error("Failed to delete payment");
            }
        }
    };

    // Pagination Logic
    const pageCount = Math.ceil(payments.length / pageSize);
    const displayedPayments = payments.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    return (
        <Container fluid>
            <h2 className="mb-4"><FaMoneyBillWave className="me-2"/> Payment History</h2>
            
            <Card className="shadow-sm border-0">
                <CardBody>
                    <Table hover responsive>
                        <thead className="table-light">
                            <tr>
                                <th>Payment ID</th>
                                <th>Invoice #</th>
                                <th>Client</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedPayments.map((payment) => (
                                <tr key={payment._id}>
                                    <td><small className="text-muted">{payment.paymentId || payment._id.slice(-8)}</small></td>
                                    <td>
                                        <Badge color="secondary">{payment.invoiceId?.invoiceNo || 'N/A'}</Badge>
                                    </td>
                                    <td>
                                        {payment.clientId ? `${payment.clientId.firstName} ${payment.clientId.lastName}` : 'Unknown Client'}
                                    </td>
                                    <td className="text-success fw-bold">Rs. {payment.amount.toFixed(2)}</td>
                                    <td>
                                        <Button size="sm" outline color="danger" onClick={() => handleDelete(payment._id)}>
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && <tr><td colSpan="5" className="text-center">No payment records found.</td></tr>}
                        </tbody>
                    </Table>

                    {/* Simple Pagination */}
                    {pageCount > 1 && (
                        <div className="d-flex justify-content-center mt-3">
                            <Button 
                                disabled={currentPage === 0} 
                                onClick={() => setCurrentPage(c => c - 1)}
                                className="me-2"
                            >
                                Previous
                            </Button>
                            <span className="align-self-center">Page {currentPage + 1} of {pageCount}</span>
                            <Button 
                                disabled={currentPage === pageCount - 1} 
                                onClick={() => setCurrentPage(c => c + 1)}
                                className="ms-2"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardBody>
            </Card>
        </Container>
    );
};

export default PaymentManagement;