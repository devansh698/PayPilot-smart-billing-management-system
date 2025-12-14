import React from 'react';
import ClientSidebar from './Sidebar';
import ClientNavbar from './clientNavbar';
import { Outlet } from 'react-router-dom';
import { Container } from 'reactstrap';

const ClientPortal = () => {
    // This component acts as the main authenticated layout for the client portal.
    return (
        <div className="d-flex client-portal-layout">
            <ClientSidebar />
            <div className="flex-grow-1 d-flex flex-column">
                <ClientNavbar />
                <Container fluid className="p-4 flex-grow-1" style={{ overflowY: 'auto' }}>
                    {/* Outlet renders the matched child route (Dashboard, Invoices, etc.) */}
                    <Outlet />
                </Container>
            </div>
        </div>
    );
};

export default ClientPortal;