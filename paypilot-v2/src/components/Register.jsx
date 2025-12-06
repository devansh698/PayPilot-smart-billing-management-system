import React, { useState } from "react";
import axios from "axios";
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Card, CardBody, FormFeedback } from "reactstrap";
import Lottie from "lottie-react";
import animationData from "./animation/Animation - registation.json"; 
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    let tempErrors = {};
    if (!formData.username) tempErrors.username = "Name is required";
    if (!formData.email.includes("@")) tempErrors.email = "Invalid email";
    if (formData.password.length < 6) tempErrors.password = "Password must be at least 6 chars";
    if (formData.password !== formData.confirmPassword) tempErrors.confirmPassword = "Passwords do not match";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await axios.post("/api/auth/register", formData);
      toast.success("Registration Successful!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center" }}>
      <Container>
        <Row className="justify-content-center align-items-center">
          <Col md={5}>
            <Card className="shadow-lg border-0 p-4">
              <CardBody>
                <div className="text-center mb-4">
                  <h3 className="fw-bold text-primary">Create Account</h3>
                </div>
                <Form onSubmit={handleRegister}>
                  <FormGroup>
                    <Label>Full Name</Label>
                    <Input 
                      invalid={!!errors.username} 
                      value={formData.username} 
                      onChange={e => setFormData({...formData, username: e.target.value})} 
                    />
                    <FormFeedback>{errors.username}</FormFeedback>
                  </FormGroup>
                  <FormGroup>
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      invalid={!!errors.email} 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                    <FormFeedback>{errors.email}</FormFeedback>
                  </FormGroup>
                  <FormGroup>
                    <Label>Password</Label>
                    <Input 
                      type="password" 
                      invalid={!!errors.password} 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                    <FormFeedback>{errors.password}</FormFeedback>
                  </FormGroup>
                  <FormGroup>
                    <Label>Confirm Password</Label>
                    <Input 
                      type="password" 
                      invalid={!!errors.confirmPassword} 
                      value={formData.confirmPassword} 
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                    />
                    <FormFeedback>{errors.confirmPassword}</FormFeedback>
                  </FormGroup>
                  <Button color="primary" block size="lg" disabled={loading}>
                    {loading ? "Creating..." : "Sign Up"}
                  </Button>
                </Form>
                <div className="text-center mt-3">
                  <small>Already have an account? <Link to="/login">Login</Link></small>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={6} className="d-none d-md-block">
             <Lottie animationData={animationData} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;