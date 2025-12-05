// src/components/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { fetchClientProfile, updateClientProfile } from '../api.js';
import { 
  Container, Row, Col, Form, FormGroup, 
  Label, Input, Button, Alert, Card, CardBody, 
  CardTitle, CardText, Badge 
} from 'reactstrap';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock } from 'react-icons/fi';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchClientProfile();
        setProfile({
          ...response.data,
          password: '',
          confirmPassword: ''
        });
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch profile');
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (profile.password !== profile.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await updateClientProfile(profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p>Loading your profile...</p>
    </div>
  );

  return (
    <Container className="profile-page">
      <Row>
        <Col lg={4}>
          <Card className="profile-card">
            <CardBody>
              <div className="profile-header">
                <div className="avatar">
                  {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                </div>
                <CardTitle className="profile-name">
                  {profile.firstName} {profile.lastName}
                </CardTitle>
                <Badge color="success" className="verified-badge">
                  Verified Account
                </Badge>
              </div>
              
              <div className="profile-info">
                <div className="info-item">
                  <FiMail className="icon" />
                  <CardText>{profile.email}</CardText>
                </div>
                <div className="info-item">
                  <FiPhone className="icon" />
                  <CardText>{profile.phone || 'Not provided'}</CardText>
                </div>
                <div className="info-item">
                  <FiMapPin className="icon" />
                  <CardText>{profile.address || 'Not provided'}</CardText>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="edit-profile-card">
            <CardBody>
              <CardTitle className="edit-title">Edit Profile</CardTitle>
              
              {success && (
                <Alert color="success" className="alert-success">
                  Profile updated successfully!
                </Alert>
              )}
              {error && (
                <Alert color="danger" className="alert-error">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleUpdateProfile}>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="firstName">
                        <FiUser className="input-icon" /> First Name
                      </Label>
                      <Input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="lastName">Last Name</Label>
                      <Input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup>
                  <Label for="email">
                    <FiMail className="input-icon" /> Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="phone">
                    <FiPhone className="input-icon" /> Phone
                  </Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="address">
                    <FiMapPin className="input-icon" /> Address
                  </Label>
                  <Input
                    type="text"
                    id="address"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                  />
                </FormGroup>

                <hr className="divider" />

                <h5 className="section-title">
                  <FiLock className="section-icon" /> Change Password
                </h5>
                <p className="section-subtitle">Leave blank to keep current password</p>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="password">New Password</Label>
                      <Input
                        type="password"
                        id="password"
                        name="password"
                        value={profile.password}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="confirmPassword">Confirm Password</Label>
                      <Input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={profile.confirmPassword}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Button type="submit" color="primary" className="save-btn">
                  Save Changes
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;