import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { FaUsers, FaFileInvoiceDollar, FaBox, FaChartLine } from 'react-icons/fa';
import './Overview.css'; // Make sure this file exists, or the inline styles below will suffice

const Overview = ({ data }) => {
    // Fallback values if data isn't loaded yet
    const { 
        totalClients = 0, 
        totalInvoices = 0, 
        totalProducts = 0, 
        totalRevenue = 0 
    } = data || {};

    const stats = [
        {
            title: 'Total Revenue',
            value: `Rs. ${totalRevenue.toLocaleString()}`,
            icon: <FaChartLine size={24} />,
            color: 'success', // Bootstrap color class
            bg: '#d1e7dd'     // Custom light background
        },
        {
            title: 'Total Invoices',
            value: totalInvoices,
            icon: <FaFileInvoiceDollar size={24} />,
            color: 'primary',
            bg: '#cfe2ff'
        },
        {
            title: 'Active Clients',
            value: totalClients,
            icon: <FaUsers size={24} />,
            color: 'info',
            bg: '#cff4fc'
        },
        {
            title: 'Inventory Items',
            value: totalProducts,
            icon: <FaBox size={24} />,
            color: 'warning',
            bg: '#fff3cd'
        }
    ];

    return (
        <Row>
            {stats.map((stat, index) => (
                <Col md={6} xl={3} className="mb-4" key={index}>
                    <Card className="border-0 shadow-sm h-100 overview-card">
                        <CardBody className="d-flex align-items-center">
                            <div 
                                className={`rounded-circle d-flex align-items-center justify-content-center me-3 text-${stat.color}`}
                                style={{ width: '60px', height: '60px', backgroundColor: stat.bg }}
                            >
                                {stat.icon}
                            </div>
                            <div>
                                <h6 className="text-muted mb-1 text-uppercase small fw-bold">{stat.title}</h6>
                                <h3 className="mb-0 fw-bold">{stat.value}</h3>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default Overview;