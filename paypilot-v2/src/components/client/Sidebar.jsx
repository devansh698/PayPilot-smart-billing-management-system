import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, NavItem } from 'reactstrap';
import { FiHome, FiFileText, FiDollarSign, FiShoppingBag, FiUser } from 'react-icons/fi';
import './Sidebar.css'; // Assuming this file exists for styling

const ClientSidebar = () => {
    return (
        <div className="client-sidebar bg-light border-end">
            <h5 className="p-3 mb-4 border-bottom">Client Portal</h5>
            <Nav vertical className="px-3">
                <NavItem>
                    <NavLink to="/client-portal/dashboard" className="nav-link" activeClassName="active">
                        <FiHome className="me-2" /> Dashboard
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink to="/client-portal/invoices" className="nav-link" activeClassName="active">
                        <FiFileText className="me-2" /> Invoices
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink to="/client-portal/payments" className="nav-link" activeClassName="active">
                        <FiDollarSign className="me-2" /> Payments
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink to="/client-portal/orders" className="nav-link" activeClassName="active">
                        <FiShoppingBag className="me-2" /> Orders
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink to="/client-portal/profile" className="nav-link" activeClassName="active">
                        <FiUser className="me-2" /> Profile
                    </NavLink>
                </NavItem>
            </Nav>
        </div>
    );
};

export default ClientSidebar;