// src/components/client/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiUser, FiShoppingBag, FiCreditCard, 
  FiSettings, FiLogOut 
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/client-dashboard', icon: <FiHome />, label: 'Dashboard' },
        { path: '/client-profile', icon: <FiUser />, label: 'Profile' },
        { path: '/client-orders', icon: <FiShoppingBag />, label: 'Orders' },
        { path: '/client-payments', icon: <FiCreditCard />, label: 'Payments' },
        { path: '/client-settings', icon: <FiSettings />, label: 'Settings' }
    ];

    return (
        <div className="client-sidebar">
            <div className="sidebar-header">
                <h3>Client Portal</h3>
            </div>
            <nav className="sidebar-nav">
                <ul className="sidebar-list">
                    {navItems.map((item) => (
                        <li 
                            key={item.path} 
                            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <Link to={item.path} className="sidebar-link">
                                <span className="sidebar-icon">{item.icon}</span>
                                <span className="sidebar-label">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="sidebar-footer">
                <Link to="/logout" className="logout-btn">
                    <FiLogOut className="logout-icon" />
                    <span>Logout</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;