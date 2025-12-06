import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Alert } from 'reactstrap';

const SaleReport = () => {
    const [salesReports, setSalesReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect (() => {
        const fetchSalesReports = async () => {
            try {
                const response = await fetch('/api/sales-reports/');
                const data = await response.json();
                setSalesReports(data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch sales reports');
                setLoading(false);
            }
        };
        fetchSalesReports();
    }, []);

    return (
        <Container className="mt-5">
            <h1 className="page-title">Sales Report</h1>
            {loading && <p>Loading sales reports...</p>}
            {error && <Alert color="danger">{error}</Alert>}
            <Table className="table table-striped">
                <thead>
                    <tr>
                        <th>Report ID</th>
                        <th>Date</th>
                        <th>Total Sales</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    {salesReports.map((report) => (
                        <tr key={report.id}>
                            <td>{report.id}</td>
                            <td>{new Date(report.date).toLocaleDateString()}</td>
                            <td>${report.totalSales}</td>
                            <td>
                                <Button color="info">View Details</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default SaleReport;