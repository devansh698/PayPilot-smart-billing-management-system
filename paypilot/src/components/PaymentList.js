import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert } from 'reactstrap';
import './PaymentList.css';

const PaymentList = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await fetch('/api/payments/');
                const data = await response.json();
                console.log(data);
                setPayments(data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch payments');
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    return (
        <div className="payment-list-container">
            <Container className="mt-5">
                <h1 className="page-title">Payments</h1>
                {loading && <p>Loading payments...</p>}
                {error && <Alert color="danger">{error}</Alert>}
                <Table className="payment-table">
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Invoice No.</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment) => (
                            <tr key={payment.id}>
                                <td>{payment.id}</td>
                                <td>{payment.invoiceNo}</td>
                                <td>{payment.amount}</td>
                                <td>{new Date(payment.date).toLocaleDateString()}</td>
                                <td>{payment.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
        </div>
    );
};

export default PaymentList;
