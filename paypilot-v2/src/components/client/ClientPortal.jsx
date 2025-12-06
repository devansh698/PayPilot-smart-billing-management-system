import React from 'react';
import { Container } from 'reactstrap';
import Sidebar from './Sidebar.jsx';
import Navbar from '../Navbar.js';
import ClientDashboard from './ClientDashboard';
import ClientProfile from './ClientProfile';
import ClientOrders from './ClientOrders';
import ClientPayments from './ClientPayments';

const ClientPortal = () => {
    return (
        <Container fluid>
            <Navbar />
            <div className="row">
                <div className="col-md-3">
                    <Sidebar />
                </div>
                <div className="col-md-9">
                    <ClientDashboard /> {/* Default component, can be switched based on route */}
                    <ClientProfile />
                    <ClientOrders />
                    <ClientPayments />
                </div>
            </div>
        </Container>
    );
};

export default ClientPortal;