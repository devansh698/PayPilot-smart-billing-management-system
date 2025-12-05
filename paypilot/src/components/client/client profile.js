// src/components/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { fetchClientProfile, updateClientProfile } from '../api.js';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';

const ProfilePage = () => {
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await fetchClientProfile();
                setProfile(response.data);
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
        try {
            await updateClientProfile(profile);
            alert('Profile updated successfully!');
        } catch (error) {
            setError('Failed to update profile');
        }
    };

    return (
        <Container className="mt-5">
            <Row>
                <Col md={6}>
                    {loading ? (
                        <h2>Loading...</h2>
                    ) : (
                        <Form onSubmit={handleUpdateProfile}>
                            <h2>Profile</h2>
                            <FormGroup>
                                <Label>First Name</Label>
                                <Input type="text" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} required />
                            </FormGroup>
                            <FormGroup>
                                <Label>Last Name</Label>
                                <Input type="text" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
                            </FormGroup>
                            {/* Add other fields as necessary */}
                            <Button type="submit" color="primary">Update Profile</Button>
                            {error && <Alert color="danger">{error}</Alert>}
                        </Form>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;