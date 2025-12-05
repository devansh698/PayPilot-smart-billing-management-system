import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Alert,
} from "reactstrap";
import axios from "axios";
import Lottie from "lottie-react";
import loadingAnimation from './animation/Animation - loading.json';
import animationData from './animation/Animation - invoice list.json';
import './InvoiceList.css';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [detailsModal, setDetailsModal] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [productDetails, setProductDetails] = useState([]);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('/api/invoices/');
      setInvoices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to fetch invoices. Please try again later.');
      setLoading(false);
    }
  };

  const toggleDetailsModal = () => setDetailsModal(!detailsModal);

  const viewInvoiceDetails = async (invoiceId) => {
    try {
        const response = await axios.get(`/api/invoices/`);
        const invoice = response.data.find((invoice) => invoice._id === invoiceId);
        if (!invoice) {
            alert('Invoice not found');
            return;
        }
        setInvoiceDetails(invoice);
        setSelectedInvoice(invoice);

        // Fetch product details
        const details = await Promise.all(invoice.products.map(async (product) => {
            const productDetail = await findproduct(product.product);
            return {
                ...product,
                name: productDetail.name,
                price: productDetail.price
            };
        }));
        setProductDetails(details); // Set the fetched product details
        toggleDetailsModal();
    } catch (error) {
        console.error('Error fetching invoice details:', error);
    }
};

const findproduct = async (productId) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/product/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product details:', error);
    }
};

const generatePrintableBill = async() => {
    if (!invoiceDetails) {
        return; // Ensure invoice details are available
    }

    // Assuming invoiceDetails contains products, subtotal, tax, and totalAmount
    const { products, subtotal = 0, tax = 0, totalAmount = 0 } = invoiceDetails;

    const productRows = await Promise.all(products.map(async (product) => {
        const productDetails = await findproduct(product.product);
        return `
        <tr>
            <td>${productDetails.name || "Unknown Product"}</td>
            <td>${product.quantity || 0}</td>
            <td>Rs.${(productDetails.price || 0).toFixed(2)}</td>
            <td>Rs.${((productDetails.price || 0) * (product.quantity || 0)).toFixed(2)}</td>
        </tr>
    `;
    })).then(rows => rows.join(''));

    const billContent = `
        <html>
        <head>
            <title>Invoice Bill</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .header img { max-width: 150px; }
                .company-details, .client-details { margin-bottom: 20px; }
                .company-details h2, .client-details h2 { margin: 0; }
                .company-details p, .client-details p { margin: 5px 0; }
                .invoice-details { border: 1px solid #ccc; padding: 20px; margin-bottom: 20px; }
                .footer { text-align: center; margin-top: 30px; }
                .footer p { margin: 5px 0; }
                .total { font-weight: bold; font-size: 1.2em; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="./logo.png" alt="Company Logo" />
                <h1>Your Company Name</h1>
                <p>Your Company Address</p>
                <p>Your Company Phone</p>
                <p>Your Company Email</p>
            </div>
            <div class="company-details">
                <h2>Company Details</h2>
                <p>Your Company Name</p>
                <p>Your Company Address</p>
                <p>Your Company Phone</p>
                <p>Your Company Email</p>
            </div>
            <div class="client-details">
                <h2>Client Details</h2>
                <p><strong>Client Name:</strong> ${invoiceDetails.client.firstName} ${invoiceDetails.client.lastName || "Unknown"}</p>
                <p><strong>Client Email:</strong> ${invoiceDetails.client.email || "N/A"}</p>
                <p><strong>Client Address:</strong> ${invoiceDetails.client.company.address || "N/A"}</p>
                <p><strong>GST No:</strong> ${invoiceDetails.client.company.gstNumber || "N/A"}</p>
            </div>
            <div class="invoice-details">
                <h2>Invoice Details</h2>
                <p><strong>Invoice No:</strong> ${invoiceDetails.invoiceNo || "N/A"}</p>
                <p><strong>Date:</strong> ${new Date(invoiceDetails.date).toLocaleDateString()}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Product/Service</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
 <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${productRows}
                </tbody>
            </table>
            <div class="invoice-details">
                <p><strong>Subtotal:</strong> Rs.${subtotal.toFixed(2)}</p>
                <p><strong>Tax:</strong> Rs.${tax.toFixed(2)}</p>
                <p class="total"><strong>Total Amount:</strong> Rs.${totalAmount.toFixed(2)}</p>
            </div>
            <div class="footer">
                <p>Thank you for your business!</p>
                <p class="thank-you">We appreciate your prompt payment.</p>
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(billContent);
    printWindow.document.close();
    printWindow.print();
};

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <Container className="mt-5">
      <h1 className="page-title">Invoices</h1>
      {error && <Alert color="danger">{error}</Alert>}
      {loading ? (
        <div className="loading-container">
          <Lottie animationData={loadingAnimation} loop={true} autoplay={true} height={400} width={400} />
        </div>
      ) : (
        <div style={{ display: 'flex' }}>
          <Table className="table table-light" style={{width:"65%"}}>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Invoice No.</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td>{invoice.client.firstName}</td>
                  <td>{invoice.invoiceNo}</td>
                  <td>{new Date(invoice.date).toLocaleDateString()}</td>
                  <td>Rs.{invoice.totalAmount}</td>
                  <td>
                    <Button color="primary" onClick={() => viewInvoiceDetails(invoice._id)}> View Details</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div style={{width:"40%",padding:"15% 0 10% 0"}}>
            <Lottie
              animationData={animationData} style={{width:"100%"}}
            />
          </div>
        </div>
      )}

      <Modal isOpen={detailsModal} toggle={toggleDetailsModal} style={{ maxWidth: '800px', margin: '30px auto',marginTop:"140px"
      }}>
        <div className="modal-header">
          <h5 className="modal-title">Invoice Details</h5>
        </div>
        <div className="modal-body">
        {invoiceDetails && (
                    <div>
                        <h5>Invoice No: {invoiceDetails.invoiceNo}</h5>
                        <p>Client Name: {invoiceDetails.client.firstName} {invoiceDetails.client.lastName}</p>
                        <p>Client Email: {invoiceDetails.client.email}</p>
                        <p>Invoice Date: {new Date(invoiceDetails.date).toLocaleDateString()}</p>
                        <p>Subtotal: Rs.{invoiceDetails.subtotal.toFixed(2)}</p>
                        <p>Tax: Rs.{invoiceDetails.tax.toFixed(2)}</p>
                        <p>Total Amount: Rs.{invoiceDetails.totalAmount.toFixed(2)}</p>
                        <p>Payment Status: {invoiceDetails.paymentStatus}</p>
                        <p>Products:</p>
                        <ul>
                            {productDetails.map(product => (
                                <li key={product._id}>
                                    <p>Product Name: {product.name}</p>
                                    <p>Quantity: {product.quantity}</p>
                                    <p>Rate: Rs.{product.price}</p>
                                    <p>Amount: Rs.{product.amount.toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
        </div>
        <div className="modal-footer">
          <Button color="secondary" onClick={toggleDetailsModal}>Close</Button>
          <Button color="primary" onClick={generatePrintableBill}>Print Bill</Button>
        </div>
      </Modal>
    </Container>
  );
};

export default InvoiceList;
