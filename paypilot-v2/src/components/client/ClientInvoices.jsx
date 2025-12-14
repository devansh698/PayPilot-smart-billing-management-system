import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, CardBody, Badge, Alert } from 'reactstrap';
import api from '../../api';
import { toast } from 'react-toastify';
import PaymentModal from './PaymentModal'; // Assuming PaymentModal is in the same directory
import { FiEye, FiDollarSign } from 'react-icons/fi';

const ClientInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const PAGE_LIMIT = 10;

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            // Fetch invoices from the client portal route
            const res = await api.get(`/clients/invoices?page=${currentPage}&limit=${PAGE_LIMIT}&sortBy=date&sortOrder=desc`);
            
            setInvoices(res.data.invoices || []);
            setTotalPages(res.data.totalPages || 1);

        } catch (error) {
            toast.error("Failed to fetch invoices.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [currentPage]);

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const handlePayClick = (invoice) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    const getStatusColor = (status) => {
        const s = status ? status.toLowerCase() : '';
        if (s.includes('paid') || s.includes('completed')) return 'success';
        if (s.includes('pending')) return 'warning';
        if (s.includes('overdue')) return 'danger';
        return 'secondary';
    };

    if (loading) return <Container className="mt-5"><p>Loading invoices...</p></Container>;

    return (
        <Container className="mt-5">
            <h1>Your Invoices</h1>
            
            <Card className="shadow-sm border-0 mt-4">
                <CardBody>
                    {invoices.length === 0 ? (
                        <Alert color="info">No invoices found.</Alert>
                    ) : (
                        <Table hover responsive>
                            <thead className="table-light">
                                <tr>
                                    <th>Invoice No.</th>
                                    <th>Date</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(invoice => (
                                    <tr key={invoice._id}>
                                        <td className="fw-bold">#{invoice.invoiceNo}</td>
                                        <td>{new Date(invoice.date).toLocaleDateString()}</td>
                                        <td>₹{invoice.totalAmount.toFixed(2)}</td>
                                        <td><Badge color={getStatusColor(invoice.paymentStatus)}>{invoice.paymentStatus}</Badge></td>
                                        <td className="text-end">
                                            <Button size="sm" color="info" outline className="me-2" onClick={() => console.log('View invoice details')}>
                                                <FiEye />
                                            </Button>
                                            {invoice.paymentStatus.toLowerCase() === 'pending' && (
                                                <Button size="sm" color="success" onClick={() => handlePayClick(invoice)}>
                                                    <FiDollarSign /> Pay Now
                                                </Button>
                                            )}
                                        </td>
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

            {selectedInvoice && (
                <PaymentModal
                    isOpen={isModalOpen}
                    toggle={toggleModal}
                    invoiceId={selectedInvoice._id}
                    amountDue={selectedInvoice.totalAmount}
                    invoiceNo={selectedInvoice.invoiceNo}
                    fetchInvoices={fetchInvoices} // Pass refresh function
                />
            )}
        </Container>
    );
};

export default ClientInvoices;