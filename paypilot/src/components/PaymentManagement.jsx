import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Alert } from 'reactstrap';
import './PaymentManagement.css';

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 7;

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/payments/');
                const data = await response.json();
                console.log(data); // Log the fetched data
                setPayments(data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch payments');
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this payment?')) {
            try {
                await fetch(`/api/payments/${id}`, { method: 'DELETE' });
                setPayments(payments.filter(payment => payment._id !== id));
            } catch (error) {
                setError('Failed to delete payment');
            }
        }
    };

    // No filtering logic, just use the full payments array
    const totalPages = Math.ceil(payments.length / itemsPerPage);
    const displayedPayments = payments.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
    
    console.log(displayedPayments); // Log displayed payments

    return (
        <div className="payment-management-container">
            <Container className="mt-5">
                <h1 className="page-title">Payment Management</h1>
                {loading && <p>Loading payments...</p>}
                {error && <Alert color="danger">{error}</Alert>}
                
                <Table className="payment-table">
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Invoice Number</th>
                            <th>Client Name</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedPayments.map((payment) => (
                            <tr key={payment._id}>
                                <td>{payment.paymentId}</td>
                                <td>{payment.invoiceId.invoiceNo}</td>
                                <td>{payment.clientId.firstName+" "+payment.clientId.lastName}</td>
                                <td>Rs. {payment.amount.toFixed(2)}</td>
                                <td>
                                    <Button color="danger" onClick={() => handleDelete(payment._id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <div className="pagination">
                    <Button 
                        disabled={currentPage === 0} 
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Previous
                    </Button>
                    <span> Page {currentPage + 1} of {totalPages} </span>
                    <Button 
                        disabled={currentPage >= totalPages - 1} 
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default PaymentManagement;