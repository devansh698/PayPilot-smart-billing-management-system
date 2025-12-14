import React from 'react';
import { Navbar, NavbarBrand, Nav, NavItem, Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLogOut } from 'react-icons/fi';
// import './ClientNavbar.css'; // Assuming this file exists for styling

const ClientNavbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('clientToken'); // Use 'clientToken' or similar token key
        toast.info("Logged out of Client Portal.");
        navigate('/client-login');
    };

    return (
        <Navbar color="primary" dark expand="md" className="shadow client-navbar">
            <div className="d-flex w-100 justify-content-between align-items-center px-4">
                <NavbarBrand href="/client-portal/dashboard">
                    PayPilot Client Portal
                </NavbarBrand>
                <Nav className="ms-auto" navbar>
                    <NavItem>
                        <Button color="light" size="sm" onClick={handleLogout}>
                            <FiLogOut className="me-2" /> Logout
                        </Button>
                    </NavItem>
                </Nav>
            </div>
        </Navbar>
    );
};

export default ClientNavbar;