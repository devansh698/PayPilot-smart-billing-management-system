// src/components/client/PaymentModal.jsx
import React, { useState } from 'react';
import { 
  Modal, ModalHeader, ModalBody, ModalFooter, 
  Button, Form, FormGroup, Label, Input, Alert, Row, Col 
} from 'reactstrap';
import { FiDollarSign, FiCreditCard, FiCheck } from 'react-icons/fi';
import api from '../../api';
import { toast } from 'react-toastify'; 

// Helper function for Razorpay (must be loaded in index.html for production)
const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// Assuming orderId is actually the invoiceId for payment
const PaymentModal = ({ isOpen, toggle, invoiceId, amountDue, invoiceNo, fetchInvoices }) => { 
    const [amount, setAmount] = useState(amountDue || '');
    const [paymentMethod, setPaymentMethod] = useState('Razorpay'); // Default to Razorpay
    const [loading, setLoading] = useState(false);

    // Resets state when modal opens/closes
    React.useEffect(() => {
        setAmount(amountDue || '');
    }, [isOpen, amountDue]);

    const displayRazorpay = async (razorpayOrder) => {
        const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
            toast.error('Razorpay SDK failed to load. Please try again.');
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use environment variable for key ID
            amount: amountDue * 100, // Amount in paise
            currency: 'INR',
            name: 'PayPilot Billing',
            description: `Payment for Invoice #${invoiceNo}`,
            order_id: razorpayOrder.id,
            handler: async function (response) {
                setLoading(true);
                try {
                    // 1. Verify payment signature on backend
                    const verificationRes = await api.post('/payment/razorpay-verify', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });

                    if (verificationRes.status === 200) {
                        // 2. Record successful payment in the database using the client portal route
                        await api.post('/clients/payments', { 
                            invoiceId: invoiceId,
                            amount: amountDue,
                            paymentMethod: 'Razorpay',
                            paymentId: response.razorpay_payment_id,
                            invoiceNo: invoiceNo,
                        });
                        
                        toast.success('Payment successfully completed!');
                        if (fetchInvoices) fetchInvoices(); 
                        toggle();
                    }
                } catch (error) {
                    toast.error('Payment verification failed. Please contact support.');
                } finally {
                    setLoading(false);
                }
            },
            theme: {
                color: '#3399cc',
            },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (paymentMethod !== 'Razorpay') {
             return toast.error('Only Razorpay is enabled for online payments.');
        }
        if (amountDue <= 0) {
             return toast.error('Amount must be greater than zero.');
        }

        setLoading(true);
        try {
            // 1. Create a Razorpay Order ID on the backend
            const orderRes = await api.post('/payment/razorpay-order', {
                amount: amountDue, 
            });

            await displayRazorpay(orderRes.data);
        } catch (error) {
            toast.error('Could not initiate payment. Server error.');
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} className="payment-modal" centered>
            <ModalHeader toggle={toggle}>Make Payment for Invoice #{invoiceNo}</ModalHeader>
            <ModalBody>
                
                <Form onSubmit={handlePayment}>
                    <FormGroup>
                        <Label for="amount">
                            <FiDollarSign className="input-icon" /> Amount Due
                        </Label>
                        <Input
                            type="number"
                            id="amount"
                            value={amount}
                            disabled
                            readOnly
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Payment Method</Label>
                        <Row className="payment-methods">
                            <Col sm={6}>
                                <div 
                                    className={`method-option ${paymentMethod === 'Razorpay' ? 'selected' : ''}`}
                                    onClick={() => setPaymentMethod('Razorpay')}
                                >
                                    <FiCreditCard className="method-icon" />
                                    <span>Razorpay</span>
                                    {paymentMethod === 'Razorpay' && <FiCheck className="check-icon" />}
                                </div>
                            </Col>
                            {/* Disable other methods */}
                            <Col sm={6}>
                                <div 
                                    className={`method-option disabled`}
                                >
                                    <FiCreditCard className="method-icon" />
                                    <span>Bank Transfer (Manual)</span>
                                </div>
                            </Col>
                        </Row>
                    </FormGroup>

                    <Button 
                        type="submit" 
                        color="primary" 
                        className="submit-btn"
                        disabled={loading || paymentMethod !== 'Razorpay'}
                    >
                        {loading ? 'Processing...' : 'Pay Now with Razorpay'}
                    </Button>
                </Form>
            </ModalBody>
        </Modal>
    );
};

export default PaymentModal;