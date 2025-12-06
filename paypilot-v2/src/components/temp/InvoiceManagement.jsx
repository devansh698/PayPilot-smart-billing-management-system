import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Alert } from 'reactstrap';

const InvoiceManagement = () => {
 const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await fetch('/api/invoices/');
                const data = await response.json();
                setInvoices(data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch invoices');
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
                setInvoices(invoices.filter(invoice => invoice._id !== id));
            } catch (error) {
                setError('Failed to delete invoice');
            }
        }
    };

    return (
        <Container className="mt-5">
            <h1>Invoice Management</h1>
            {loading && <p>Loading invoices...</p>}
            {error && <Alert color="danger">{error}</Alert>}
            <Table className="table table-striped">
                <thead>
                    <tr>
                        <th>Invoice Number</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((invoice) => (
                        <tr key={invoice._id}>
                            <td>{invoice.invoiceNumber}</td>
                            <td>{invoice.clientName}</td>
                            <td>{new Date(invoice.date).toLocaleDateString()}</td>
                            <td>${invoice.amount}</td>
                            <td>
                                <Button color="danger" onClick={() => handleDelete(invoice._id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default InvoiceManagement;