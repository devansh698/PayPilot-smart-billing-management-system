import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar'; 
// FIX 1: Import Outlet from react-router-dom instead of lucide-react
import { Outlet } from 'react-router-dom'; 
import { Menu } from 'lucide-react'; 

// Removed { children } from props since nested routes use Outlet
const MainLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <Sidebar className="w-64" />
                    <div 
                        className="flex-1 bg-black/50" 
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header Trigger */}
                <div className="md:hidden p-4 border-b border-border flex items-center bg-card">
                    <button onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-bold">PayPilot</span>
                </div>

                {/* Navbar */}
                <div className="hidden md:block">
                     <Navbar /> 
                </div>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/20">
                    <div className="max-w-7xl mx-auto">
                        {/* FIX 2: Use Outlet to render the nested route component (e.g., Dashboard, ClientList) */}
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;