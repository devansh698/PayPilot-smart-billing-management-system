import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, CardBody, CardTitle } from 'reactstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Overview from './Overview';
import LoadingPage from './LoadingPage';

const Dashboard = () => {
    const [overviewData, setOverviewData] = useState({});
    const [loading, setLoading] = useState(true);

    // Mock data for charts (Replace with API data if available)
    const chartData = [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
        { name: 'Sun', sales: 3490 },
    ];
    
    const pieData = [
        { name: 'Paid', value: 400 },
        { name: 'Pending', value: 300 },
        { name: 'Overdue', value: 100 },
    ];
    const COLORS = ['#0088FE', '#FFBB28', '#FF8042'];

    useEffect(() => {
        axios.get('/api/overview/')
            .then(response => {
                setOverviewData(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <LoadingPage />;

    return (
        <Container fluid>
            <h2 className="mb-4">Dashboard Overview</h2>
            
            {/* Summary Cards */}
            <Row className="mb-4">
                <Col>
                    <Overview data={overviewData} />
                </Col>
            </Row>

            {/* Analytics Charts */}
            <Row>
                <Col lg={8} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <CardBody>
                            <CardTitle tag="h5">Weekly Sales Analytics</CardTitle>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="sales" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col lg={4} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <CardBody>
                            <CardTitle tag="h5">Payment Status</CardTitle>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-center mt-2">
                                <span className="badge bg-primary me-2">Paid</span>
                                <span className="badge bg-warning me-2 text-dark">Pending</span>
                                <span className="badge bg-danger">Overdue</span>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;