// src/components/client/PaymentModal.jsx
import React, { useState } from 'react';
import { 
  Modal, ModalHeader, ModalBody, ModalFooter, 
  Button, Form, FormGroup, Label, Input, Alert, Row, Col 
} from 'reactstrap';
import { FiDollarSign, FiCreditCard, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import './PaymentModal.css';

const PaymentModal = ({ isOpen, toggle, orderId }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/client/payments', { 
                orderId, 
                amount,
                paymentMethod
            });
            setSuccess('Payment successful!');
            setError(null);
            setTimeout(() => {
                toggle();
                setSuccess(null);
            }, 2000);
        } catch (error) {
            setError('Payment failed. Please try again.');
            setSuccess(null);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} className="payment-modal" centered>
            <ModalHeader toggle={toggle}>Make Payment</ModalHeader>
            <ModalBody>
                {error && <Alert color="danger">{error}</Alert>}
                {success && <Alert color="success">{success}</Alert>}
                
                <Form onSubmit={handlePayment}>
                    <FormGroup>
                        <Label for="amount">
                            <FiDollarSign className="input-icon" /> Amount
                        </Label>
                        <Input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="1"
                            step="0.01"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Payment Method</Label>
                        <Row className="payment-methods">
                            <Col sm={6}>
                                <div 
                                    className={`method-option ${paymentMethod === 'credit_card' ? 'selected' : ''}`}
                                    onClick={() => setPaymentMethod('credit_card')}
                                >
                                    <FiCreditCard className="method-icon" />
                                    <span>Credit Card</span>
                                    {paymentMethod === 'credit_card' && <FiCheck className="check-icon" />}
                                </div>
                            </Col>
                            <Col sm={6}>
                                <div 
                                    className={`method-option ${paymentMethod === 'bank_transfer' ? 'selected' : ''}`}
                                    onClick={() => setPaymentMethod('bank_transfer')}
                                >
                                    <FiCreditCard className="method-icon" />
                                    <span>Bank Transfer</span>
                                    {paymentMethod === 'bank_transfer' && <FiCheck className="check-icon" />}
                                </div>
                            </Col>
                        </Row>
                    </FormGroup>

                    <Button 
                        type="submit" 
                        color="primary" 
                        className="submit-btn"
                        disabled={!amount || parseFloat(amount) <= 0}
                    >
                        Process Payment
                    </Button>
                </Form>
            </ModalBody>
        </Modal>
    );
};

export default PaymentModal;