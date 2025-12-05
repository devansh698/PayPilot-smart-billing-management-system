// src/components/ClientLogin.jsx
import React, { useState } from 'react';
import { Container, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import axios from 'axios';
import Lottie from 'lottie-react';
import animationData from '../animation/Animation - 1733831017954.json';
import animationData1 from '../animation/Animation - registation sucessfull.json';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import './ClientLogin.css';

const ClientLogin = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/client/send-otp', { email });
      if (response.data.success) {
        setIsOtpSent(true);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/client/verify-otp', { email, otp });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/client-dashboard';
        }, 2000);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {success && (
        <div className="success-overlay">
          <div className="success-animation">
            <Lottie animationData={animationData1} />
          </div>
        </div>
      )}
      
      <div className="login-content">
        <div className="login-form-container">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Sign in to access your client dashboard</p>
          </div>
          
          {error && <Alert color="danger" className="login-alert">{error}</Alert>}
          
          {!isOtpSent ? (
            <Form onSubmit={handleLogin} className="login-form">
              <FormGroup>
                <Label for="email" className="form-label">
                  <FiMail className="input-icon" /> Email Address
                </Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  invalid={!isValidEmail(email) && email.length > 0}
                />
              </FormGroup>
              
              <Button 
                type="submit" 
                color="primary" 
                className="login-btn"
                disabled={loading || !isValidEmail(email)}
              >
                {loading ? (
                  <span className="btn-loader"></span>
                ) : (
                  <>
                    Send OTP <FiArrowRight className="btn-icon" />
                  </>
                )}
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleVerifyOtp} className="login-form">
              <FormGroup>
                <Label for="otp" className="form-label">
                  <FiLock className="input-icon" /> Enter OTP
                </Label>
                <Input
                  type="text"
                  id="otp"
                  placeholder="Enter the 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="form-input"
                  maxLength="6"
                />
                <p className="otp-note">
                  We've sent a 6-digit OTP to {email}
                </p>
              </FormGroup>
              
              <Button 
                type="submit" 
                color="primary" 
                className="login-btn"
                disabled={loading || otp.length < 6}
              >
                {loading ? (
                  <span className="btn-loader"></span>
                ) : (
                  <>
                    Verify & Login <FiArrowRight className="btn-icon" />
                  </>
                )}
              </Button>
              
              <button 
                type="button" 
                className="resend-link"
                onClick={() => setIsOtpSent(false)}
              >
                Didn't receive OTP? Resend
              </button>
            </Form>
          )}
        </div>
        
        <div className="login-graphic">
          <Lottie animationData={animationData} />
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;