import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemIcon, ListItemText, Drawer, Box } from '@mui/material';
import { faHome, faFileInvoice, faBox, faUser, faChartBar, faCog, faWarehouse, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaLock } from 'react-icons/fa';
import axios from 'axios';
import './Sidebar.css';

const Sidebar = () => {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
            axios.get(`/api/auth/me`,)
            .then(response => {
                setUserRole(response.data.role);
            })
            .catch(error => {
                console.error("Error fetching user role:", error);
            });
    }, [userRole]);

    return (
        <Drawer variant="permanent" anchor="left" className="sidebar-drawer">
            <Box className="sidebar-header">
                <h2 className="sidebar-title">Your Logo</h2>
            </Box>
            <Box className="sidebar-content">
                <List>
                    {menuItems.map((item) => {
                        const isRestricted = 
                            (userRole === "Client Manager" && item.path === "/client-list") ||
                            (userRole === "Invoice Manager" && item.path === "/create-invoice") ||
                            (userRole === "Payment Manager" && item.path === "/create-new-payment") ||
                            (userRole === "Product Manager" && item.path === "/product-management") ||
                            (userRole === "Order Manager" && item.path === "/AcceptOrder") ||
                            (userRole === "Inventory Manager" && item.path === "/inventory-manager") ||
                            (userRole === "Report Manager" && item.path === "/report-generator") ||
                            (userRole === "Employee Manager" && item.path === "/employee-manager");
                            if (isRestricted) {
                                return null;
                            }
                        return (
                            <ListItem button key={item.path} component={Link} to={item.path} className="sidebar-item">
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={item.icon} className="sidebar-icon" />
                                </ListItemIcon>
                                <ListItemText primary={item.label} />
                                {isRestricted && <FaLock style={{ marginLeft: '8px', color: 'red' }} />}
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        </Drawer>
    );
};

// Menu items as an array
const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: faHome },
    { path: '/invoicelist', label: 'Invoice List', icon: faFileInvoice },
    { path: '/create-invoice', label: 'Create Invoice', icon: faFileInvoice },
    { path: '/client-list', label: 'Clients List', icon: faUser },
    { path: '/product-management', label: 'Product List', icon: faBox },
    { path: '/add-product', label: 'Add Product', icon: faBox },
    { path: '/report-generator', label: 'Reports', icon: faChartBar },
    { path: '/AcceptOrder', label: 'Orders', icon: faWarehouse },
    { path: '/inventory-manager', label: 'Inventory', icon: faWarehouse },
    { path: '/create-new-payment', label: 'Payments', icon: faCreditCard },
    { path: '/employee-manager', label: 'Employee', icon: faCog },
];

export default Sidebar;
