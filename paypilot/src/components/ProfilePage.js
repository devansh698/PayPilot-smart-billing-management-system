import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Container, Row, Col, Form, FormGroup, Label, Input, Button, Card, CardBody, Badge 
} from 'reactstrap';
import { FaUserCircle, FaLock, FaSave, FaUserEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext'; // Assuming you have this, otherwise remove
import LoadingPage from './LoadingPage';

const ProfilePage = () => {
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // Axios interceptor in App.js handles the token
            const res = await axios.get('/api/auth/me');
            setProfile(res.data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load profile data.");
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match!");
            return;
        }

        setUpdating(true);
        try {
            await axios.patch(`/api/user/${profile._id}/change-password`, {
                oldPassword: passwords.current,
                newPassword: passwords.new
            });
            toast.success("Password updated successfully!");
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <LoadingPage />;

    return (
        <Container fluid className="mt-4">
            <h2 className="mb-4"><FaUserEdit className="me-2"/> My Profile</h2>
            
            <Row>
                {/* Profile Details Card */}
                <Col md={6} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <CardBody className="text-center p-5">
                            <div className="mb-4">
                                <FaUserCircle size={100} className="text-primary opacity-50" />
                            </div>
                            <h3>{profile.username}</h3>
                            <Badge color="info" className="mb-3">{profile.role || 'User'}</Badge>
                            
                            <div className="text-start mt-4 px-md-5">
                                <FormGroup>
                                    <Label className="text-muted small">Email Address</Label>
                                    <Input value={profile.email} disabled className="bg-light" />
                                </FormGroup>
                                <FormGroup>
                                    <Label className="text-muted small">Phone Number</Label>
                                    <Input value={profile.phone || 'N/A'} disabled className="bg-light" />
                                </FormGroup>
                                <FormGroup>
                                    <Label className="text-muted small">Member Since</Label>
                                    <Input value={new Date(profile.createdAt || Date.now()).toLocaleDateString()} disabled className="bg-light" />
                                </FormGroup>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                {/* Security Settings Card */}
                <Col md={6} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <CardBody className="p-4">
                            <h4 className="mb-4"><FaLock className="me-2"/> Security Settings</h4>
                            <Form onSubmit={handlePasswordChange}>
                                <FormGroup>
                                    <Label>Current Password</Label>
                                    <Input 
                                        type="password" 
                                        value={passwords.current}
                                        onChange={e => setPasswords({...passwords, current: e.target.value})}
                                        required
                                    />
                                </FormGroup>
                                <hr className="my-4"/>
                                <FormGroup>
                                    <Label>New Password</Label>
                                    <Input 
                                        type="password" 
                                        value={passwords.new}
                                        onChange={e => setPasswords({...passwords, new: e.target.value})}
                                        required
                                        minLength="6"
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Confirm New Password</Label>
                                    <Input 
                                        type="password" 
                                        value={passwords.confirm}
                                        onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                        required
                                    />
                                </FormGroup>

                                <Button color="warning" block type="submit" disabled={updating} className="mt-3">
                                    <FaSave className="me-2"/> 
                                    {updating ? "Updating..." : "Change Password"}
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