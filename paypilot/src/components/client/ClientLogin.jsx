// src/components/client/ClientLogin.jsx
import React, { useState } from 'react';
import { Container, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import axios from 'axios';
import Lottie from 'lottie-react';
import animationData from '../animation/Animation - 1733831017954.json';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify'; 
import './ClientLogin.css';

const ClientLogin = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) return toast.error('Please enter a valid email address');

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/client/send-otp', { email });
      if (response.data.success) {
        setIsOtpSent(true);
        toast.success('OTP sent successfully!');
      }
    } catch (error) {
      // Backend Error Handling
      const msg = error.response?.data?.message || 'Failed to send OTP.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error('Please enter a valid 6-digit OTP');

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/client/verify-otp', { email, otp });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        toast.success('Login Successful! Redirecting...');
        setTimeout(() => window.location.href = '/client-dashboard', 1500);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid OTP.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer position="top-center" />
      <div className="login-content">
        <div className="login-form-container">
          <div className="login-header">
            <h1>Client Portal</h1>
            <p>Secure login for billing & orders</p>
          </div>
          
          {!isOtpSent ? (
            <Form onSubmit={handleLogin} className="login-form">
              <FormGroup>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </FormGroup>
              <Button type="submit" color="primary" className="w-100" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'} <FiArrowRight />
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleVerifyOtp} className="login-form">
               <Alert color="info">OTP sent to {email}</Alert>
              <FormGroup>
                <Label>Enter OTP</Label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  className="text-center letter-spacing-2"
                  disabled={loading}
                />
              </FormGroup>
              <Button type="submit" color="success" className="w-100" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </Button>
              <div className="text-center mt-3">
                  <small className="text-muted" style={{cursor:'pointer'}} onClick={() => setIsOtpSent(false)}>Wrong Email? Go Back</small>
              </div>
            </Form>
          )}
        </div>
        <div className="login-graphic d-none d-md-block">
          <Lottie animationData={animationData} loop={true} />
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;