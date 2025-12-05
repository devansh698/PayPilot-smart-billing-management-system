import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Divider, Box, Typography, Avatar 
} from '@mui/material';
import { 
    Dashboard as DashboardIcon, 
    Receipt as InvoiceIcon, 
    People as ClientIcon, 
    Inventory as ProductIcon, 
    BarChart as ReportIcon, 
    ShoppingCart as OrderIcon, 
    Payment as PaymentIcon, 
    Person as EmployeeIcon, 
    Warehouse as InventoryIcon,
    AddCircle as AddIcon
} from '@mui/icons-material';
import axios from 'axios';

const Sidebar = ({ open, onClose }) => {
    const location = useLocation();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        // Fetch role if not already in context (or rely on AuthContext)
        axios.get('/api/auth/me')
            .then(res => setUserRole(res.data.role))
            .catch(err => console.error("Role fetch error", err));
    }, []);

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/create-invoice', label: 'New Invoice', icon: <AddIcon />, role: 'Invoice Manager' },
        { path: '/invoicelist', label: 'Invoices', icon: <InvoiceIcon />, role: 'Invoice Manager' },
        { path: '/client-list', label: 'Clients', icon: <ClientIcon />, role: 'Client Manager' },
        { path: '/product-management', label: 'Products', icon: <ProductIcon />, role: 'Product Manager' },
        { path: '/AcceptOrder', label: 'Orders', icon: <OrderIcon />, role: 'Order Manager' },
        { path: '/inventory-manager', label: 'Inventory', icon: <InventoryIcon />, role: 'Inventory Manager' },
        { path: '/create-new-payment', label: 'Payments', icon: <PaymentIcon />, role: 'Payment Manager' },
        { path: '/report-generator', label: 'Reports', icon: <ReportIcon />, role: 'Report Manager' },
        { path: '/employee-manager', label: 'Employees', icon: <EmployeeIcon />, role: 'Employee Manager' },
    ];

    // Helper to check permission
    const hasPermission = (requiredRole) => {
        if (!requiredRole) return true; // Public to all admins
        if (userRole === 'admin') return true; // Super admin
        return userRole === requiredRole;
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Logo Area */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>PP</Avatar>
                <Typography variant="h6" fontWeight="bold" color="primary">
                    PayPilot
                </Typography>
            </Box>
            <Divider />

            {/* Menu List */}
            <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
                {menuItems.map((item) => (
                    hasPermission(item.role) && (
                        <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton 
                                component={Link} 
                                to={item.path}
                                selected={location.pathname === item.path}
                                onClick={onClose} // Close drawer on mobile click
                                sx={{
                                    borderRadius: 2,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.light',
                                        color: 'primary.contrastText',
                                        '& .MuiListItemIcon-root': { color: 'inherit' }
                                    },
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
                            </ListItemButton>
                        </ListItem>
                    )
                ))}
            </List>
            
            {/* Footer / User Info */}
            <Divider />
            <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                    Logged in as {userRole || 'User'}
                </Typography>
            </Box>
        </Box>
    );
};

export default Sidebar;