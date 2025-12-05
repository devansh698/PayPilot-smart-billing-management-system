import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Badge, Card, CardBody } from "reactstrap";
import { FaPrint, FaEye, FaSearch, FaFileInvoiceDollar } from "react-icons/fa";
import LoadingPage from "./LoadingPage"; // Reuse your loading component

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailsModal, setDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('/api/invoices/');
      setInvoices(response.data);
      setFilteredInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = invoices.filter(inv => 
      inv.client.firstName.toLowerCase().includes(term) || 
      inv.invoiceNo.includes(term)
    );
    setFilteredInvoices(filtered);
  };

  const viewInvoiceDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setDetailsModal(true);
  };

  const generatePrintableBill = () => {
    if (!selectedInvoice) return;
    
    // Construct the print content
    const billContent = `
        <html>
        <head>
            <title>Invoice #${selectedInvoice.invoiceNo}</title>
            <style>
                body { font-family: 'Helvetica', sans-serif; padding: 40px; }
                .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                .company-info h1 { margin: 0; color: #333; }
                .invoice-meta { text-align: right; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
                td { padding: 12px; border-bottom: 1px solid #eee; }
                .totals { margin-top: 30px; text-align: right; }
                .total-row { font-size: 1.2em; font-weight: bold; color: #007bff; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-info">
                    <h1>PayPilot</h1>
                    <p>123 Business Rd, Tech City</p>
                </div>
                <div class="invoice-meta">
                    <h2>INVOICE</h2>
                    <p>#${selectedInvoice.invoiceNo}</p>
                    <p>Date: ${new Date(selectedInvoice.date).toLocaleDateString()}</p>
                </div>
            </div>
            
            <div class="client-info">
                <h3>Bill To:</h3>
                <p><strong>${selectedInvoice.client.firstName} ${selectedInvoice.client.lastName}</strong><br>
                ${selectedInvoice.client.email}</p>
            </div>

            <table>
                <thead>
                    <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr>
                </thead>
                <tbody>
                    ${selectedInvoice.products.map(p => `
                        <tr>
                            <td>${p.product?.name || 'Item'}</td>
                            <td>${p.quantity}</td>
                            <td>${p.rate}</td>
                            <td>${p.amount}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="totals">
                <p>Subtotal: ${selectedInvoice.subtotal}</p>
                <p>Tax (18%): ${selectedInvoice.tax}</p>
                <p class="total-row">Total: ${selectedInvoice.totalAmount}</p>
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(billContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <LoadingPage />;

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><FaFileInvoiceDollar className="me-2"/> Invoice History</h2>
        <div style={{ width: '300px' }}>
            <Input 
                placeholder="Search Client or Invoice #..." 
                value={searchTerm}
                onChange={handleSearch}
                prefix={<FaSearch />}
            />
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <CardBody>
          <Table hover responsive>
            <thead className="table-light">
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td className="fw-bold">{invoice.invoiceNo}</td>
                  <td>{invoice.client.firstName} {invoice.client.lastName}</td>
                  <td>{new Date(invoice.date).toLocaleDateString()}</td>
                  <td>${invoice.totalAmount.toFixed(2)}</td>
                  <td>
                    <Badge color={invoice.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                        {invoice.paymentStatus}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" color="info" outline onClick={() => viewInvoiceDetails(invoice)}>
                        <FaEye />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && <tr><td colSpan="6" className="text-center">No invoices found.</td></tr>}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={detailsModal} toggle={() => setDetailsModal(!detailsModal)} size="lg">
        <ModalHeader toggle={() => setDetailsModal(!detailsModal)}>Invoice Details</ModalHeader>
        <ModalBody>
          {selectedInvoice && (
            <div>
               <div className="d-flex justify-content-between">
                   <h5>Invoice #{selectedInvoice.invoiceNo}</h5>
                   <Badge color="primary">{selectedInvoice.paymentStatus}</Badge>
               </div>
               <hr/>
               <Table striped>
                   <thead>
                       <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                   </thead>
                   <tbody>
                       {selectedInvoice.products.map((p, i) => (
                           <tr key={i}>
                               <td>{p.product?.name || "Product"}</td>
                               <td>{p.quantity}</td>
                               <td>{p.rate}</td>
                               <td>{p.amount}</td>
                           </tr>
                       ))}
                   </tbody>
               </Table>
               <div className="text-end">
                   <h4>Total: ${selectedInvoice.totalAmount.toFixed(2)}</h4>
               </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
            <Button color="secondary" onClick={() => setDetailsModal(false)}>Close</Button>
            <Button color="primary" onClick={generatePrintableBill}><FaPrint className="me-2"/> Print</Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default InvoiceList;