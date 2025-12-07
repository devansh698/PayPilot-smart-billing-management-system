import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, FileText, CreditCard, User, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'react-toastify';

const ClientLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('clientToken'); // Ensure you use the correct token key
        toast.info("Logged out");
        navigate('/client-login');
    };

    const menuItems = [
        { path: '/client-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/client-orders', label: 'My Orders', icon: <ShoppingCart size={20} /> },
        // Add paths for invoices/payments if you have them migrated
        // { path: '/client-invoices', label: 'Invoices', icon: <FileText size={20} /> },
        // { path: '/client-payments', label: 'Payments', icon: <CreditCard size={20} /> },
        { path: '/client-profile', label: 'Profile', icon: <User size={20} /> },
    ];

    return (
        <div className="flex min-h-screen bg-background">
            {/* Client Sidebar */}
            <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col fixed h-full">
                <div className="p-6 border-b border-border">
                    <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                        <span className="p-1 bg-primary text-primary-foreground rounded">CP</span> Client Portal
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                                location.pathname === item.path
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-border">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    >
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default ClientLayout;