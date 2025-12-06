import React, { useState } from "react";
import axios from "axios";
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Card, CardBody } from "reactstrap";
import Lottie from "lottie-react";
import animationData from "./animation/Animation - 1733831017954.json"; // Ensure path is correct
import { toast } from "react-toastify";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/auth/login", { email, password });
      setIsOtpSent(true);
      toast.info("OTP sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/verify-otp-login", { email, otp });
      localStorage.setItem("token", response.data.token);
      toast.success("Login Successful!");
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", alignItems: "center" }}>
      <Container>
        <Row className="align-items-center justify-content-center">
          {/* Animation Column - Hidden on small screens */}
          <Col md={6} className="d-none d-md-block text-center">
            <Lottie animationData={animationData} style={{ maxWidth: "500px", margin: "0 auto" }} />
          </Col>

          {/* Login Form Column */}
          <Col md={5}>
            <Card className="shadow border-0 p-3">
              <CardBody>
                <div className="text-center mb-4">
                  <h3 className="fw-bold text-primary">Welcome Back</h3>
                  <p className="text-muted">Sign in to PayPilot Admin Portal</p>
                </div>

                {!isOtpSent ? (
                  <Form onSubmit={handleLogin}>
                    <FormGroup className="mb-3">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="p-2"
                      />
                    </FormGroup>
                    <FormGroup className="mb-3">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="p-2"
                      />
                    </FormGroup>
                    <Button color="primary" block size="lg" type="submit" disabled={loading}>
                      {loading ? "Authenticating..." : "Login"}
                    </Button>
                  </Form>
                ) : (
                  <Form onSubmit={handleVerifyOtp}>
                    <div className="text-center mb-3">
                      <span className="badge bg-info">OTP Sent to {email}</span>
                    </div>
                    <FormGroup className="mb-3">
                      <Label>One-Time Password (OTP)</Label>
                      <Input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        className="text-center p-2"
                        style={{ letterSpacing: "2px", fontSize: "1.2rem" }}
                      />
                    </FormGroup>
                    <Button color="success" block size="lg" type="submit" disabled={loading}>
                      {loading ? "Verifying..." : "Verify & Enter"}
                    </Button>
                    <div className="text-center mt-3">
                        <small className="text-muted cursor-pointer" onClick={() => setIsOtpSent(false)} style={{cursor:'pointer'}}>
                            Wrong email? Go Back
                        </small>
                    </div>
                  </Form>
                )}

                <div className="text-center mt-4 border-top pt-3">
                  <small>Don't have an account? <a href="/register" className="text-decoration-none">Register here</a></small>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;