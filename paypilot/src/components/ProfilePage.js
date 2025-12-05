import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../components/ThemeContext'; // Import useTheme

const ProfilePage = () => {
    const { user, error, logout } = useAuth();
    const [profile, setProfile] = useState({ _id: '', username: '', email: '', phone: '' });
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState(null);
    const { setTheme } = useTheme();

    const handleFetch = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = new Headers({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });
        const request = new Request('/api/auth/me', { method: 'GET', headers: headers });

        try {
            const response = await fetch(request);
            const data = await response.json();
            setProfile(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        handleFetch();
    }, []);

    const handleChangePassword = async () => {
        setPasswordError(null);
        if (password.newPassword !== password.confirmPassword) {
            setPasswordError('New password and confirm password do not match');
            return;
        }

        const headers = new Headers({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });
        const request = new Request(`/api/user/${profile._id}/change-password`, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify({ oldPassword: password.currentPassword, newPassword: password.newPassword }),
        });

        try {
            const response = await fetch(request);
            if (response.ok) {
                alert('Password changed successfully!');
                setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                const errorData = await response.json();
                setPasswordError(errorData.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Container className="mt-5">
            <Row>
                <Col md={6}>
                    {loading ? (
                        <h2>Loading...</h2>
                    ) : (
                        <div>
                            <h2>Profile</h2>
                            <p><strong>Username:</strong> {profile.username}</p>
                            <p><strong>Email:</strong> {profile.email}</p>
                            <p><strong>Phone:</strong> {profile.phone}</p>
                            <p><strong>Address:</strong> {profile.address}</p>
                            <Button onClick={logout} color="danger">Logout</Button>
                            {error && <Alert color="danger">{error}</Alert>}
                        </div>
                    )}
                </Col>
                <Col md={6}>
                    <h2>Change Password</h2>
                    <Form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
                        <FormGroup>
                            <Label>Current Password</Label>
                            <Input type="password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} required />
                        </FormGroup>
                        <FormGroup>
                            <Label>New Password</Label>
                            <Input type="password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} required />
                        </FormGroup>
                        <FormGroup>
                            <Label>Confirm New Password</Label>
                            <Input type="password" value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} required />
                        </FormGroup>
                        <Button type="submit" color="primary">Change Password</Button>
                        {passwordError && <Alert color="danger">{passwordError}</Alert>}
                    </Form>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col md={12}>
                    <Button color="light" onClick={() => setTheme('light')}>Light Theme</Button>
                    <Button color="dark" onClick={() => setTheme('dark')}>Dark Theme</Button>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;