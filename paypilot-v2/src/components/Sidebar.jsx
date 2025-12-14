import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, FileText, Users, Package, ShoppingCart, 
    CreditCard, User, BarChart3, Box, LogOut, ChevronDown, Store, Settings
} from 'lucide-react';
import { cn } from '../lib/utils'; // Make sure you created this in Step 4
import axios from 'axios';
import api from '../api';
const Sidebar = ({ className }) => {
    const location = useLocation();
    const [userRole, setUserRole] = useState(null);
    const [expandedMenu, setExpandedMenu] = useState(null);

    useEffect(() => {
        // Mock role for UI testing if API fails
        api.get('/auth/me')
            .then(res => setUserRole(res.data.role))
            .catch(() => setUserRole('admin'));
    }, []);

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { 
            label: 'Invoices', 
            icon: <FileText size={20} />, 
            role: 'Invoice Manager',
            submenu: [
                { path: '/invoicelist', label: 'All Invoices' },
                { path: '/create-invoice', label: 'New Invoice' }
            ]
        },
        { path: '/client-list', label: 'Clients', icon: <Users size={20} />, role: 'Client Manager' },
        { path: '/AcceptOrder', label: 'Orders', icon: <ShoppingCart size={20} />, role: 'Order Manager' },
        { 
            label: 'Inventory', 
            icon: <Package size={20} />, 
            role: 'Inventory Manager',
            submenu: [
                { path: '/product-management', label: 'Products' },
                { path: '/inventory-manager', label: 'Stock' }
            ]
        },
        { path: '/create-new-payment', label: 'Payments', icon: <CreditCard size={20} />, role: 'Payment Manager' },
        { path: '/report-generator', label: 'Reports', icon: <BarChart3 size={20} />, role: 'Report Manager' },
        { path: '/employee-manager', label: 'Employees', icon: <User size={20} />, role: 'Employee Manager' },
        { path: '/store-list', label: 'Stores', icon: <Store size={20} />, role: 'admin' },
        { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    const hasPermission = (requiredRole) => {
        if (!requiredRole) return true;
        if (userRole === 'admin') return true;
        return userRole === requiredRole;
    };

    return (
        <aside className={cn("w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0", className)}>
            {/* Logo */}
            <div className="p-6 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground font-bold text-xl">
                        PP
                    </div>
                    <div>
                        <h1 className="font-bold text-foreground">PayPilot</h1>
                        <p className="text-xs text-muted-foreground">Billing System</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {menuItems.map((item, index) => (
                    hasPermission(item.role) && (
                        <div key={index}>
                            {item.submenu ? (
                                <>
                                    <button
                                        onClick={() => setExpandedMenu(expandedMenu === item.label ? null : item.label)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
                                            expandedMenu === item.label
                                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                                        )}
                                    >
                                        <span className="flex items-center gap-3">
                                            {item.icon}
                                            {item.label}
                                        </span>
                                        <ChevronDown size={16} className={cn("transition-transform", expandedMenu === item.label && "rotate-180")} />
                                    </button>
                                    {expandedMenu === item.label && (
                                        <div className="mt-1 ml-4 space-y-1 border-l border-sidebar-border pl-2">
                                            {item.submenu.map((subitem) => (
                                                <Link
                                                    key={subitem.path}
                                                    to={subitem.path}
                                                    className={cn(
                                                        "block px-4 py-2 text-sm rounded-md transition-colors",
                                                        location.pathname === subitem.path
                                                            ? "text-sidebar-primary font-medium bg-sidebar-accent/20"
                                                            : "text-muted-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    {subitem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
                                        location.pathname === item.path
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            )}
                        </div>
                    )
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-sidebar-border">
                <button 
                    onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;