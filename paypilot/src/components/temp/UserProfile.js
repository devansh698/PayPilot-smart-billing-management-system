import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';

const UserProfile = () => {
    const [userData, setUserData] = useState({ name: '', email: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/user/profile/');
                const data = await response.json();
                setUserData(data);
            } catch (error) {
                setError('Failed to fetch user data');
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/user/profile/', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            alert('Profile updated successfully!');
        } catch (error) {
            setError('Failed to update profile');
        }
    };

    return (
        <Container className="mt-5">
            <Row>
                <Col md={6}>
                    <h2>User Profile</h2>
                    {error && <Alert color="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label>Name</Label>
                            <Input type="text" name="name" value={userData.name} onChange={handleChange} required />
                        </FormGroup>
                        <FormGroup>
                            <Label>Email</Label>
                            <Input type="email" name="email" value={userData.email} onChange={handleChange} required />
                        </FormGroup>
                        <Button type="submit" color="primary">Update Profile</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default UserProfile;