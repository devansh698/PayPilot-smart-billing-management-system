// src/components/client/ClientDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, Row, Col, Card, CardBody, CardTitle,
  Table, Badge, Progress, Spinner, Button
} from 'reactstrap';
import { FiUser, FiShoppingBag, FiDollarSign, FiBell } from 'react-icons/fi';
import './ClientDashboard.css';
import api from '../../api';

const ClientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/clientroutes/dashboard');
      setData(data);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner /> <span className="ms-2">Loading your dashboard…</span>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container className="text-center mt-5">
        <p>Failed to load data. Please refresh.</p>
        <Button color="primary" onClick={fetchDashboardData}>Retry</Button>
      </Container>
    );
  }
  return (
    <Container fluid className="p-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Welcome back, {data.profile?.firstName || 'User'}!</h2>
          <p className="text-muted mb-0">Overview of your billing and orders.</p>
        </div>
        <div className="text-end">
          <Badge color="light" className="text-dark p-2 border">ID: {data.profile?._id.slice(-6)}</Badge>
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col md={3}>
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary me-3">
                <FiShoppingBag size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Orders</h6>
                <h3 className="mb-0 fw-bold">{data.recentOrders?.length || 0}</h3>
              </div>
            </div>
          </div>
        </Col>
        <Col md={3}>
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning me-3">
                <FiDollarSign size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Pending Dues</h6>
                {/* Assuming you might calculate this from invoices later */}
                <h3 className="mb-0 fw-bold">₹{data.profile?.pendingdues || 0}</h3>
              </div>
            </div>
          </div>
        </Col>
        <Col md={3}>
          <div className="card shadow-sm border-0 h-100">
            <CardBody>
              <div className="d-flex justify-content-between mb-2">
                <h6 className="text-muted">Profile Completion</h6>
                <span className="fw-bold">{data.profile?.verified ? '100%' : '70%'}</span>
              </div>
              <Progress value={data.profile?.verified ? 100 : 70} color={data.profile?.verified ? 'success' : 'info'} size="sm" />
            </CardBody>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <CardBody>
              <CardTitle tag="h5" className="mb-3">Recent Orders</CardTitle>
              <Table responsive hover>
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders?.map(order => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-6)}</td>
                      <td>{new Date(order.createdAt || order.date).toLocaleDateString()}</td>
                      <td>₹{order.totalAmount || order.amount}</td>
                      <td><Badge color={order.status === 'Completed' ? 'success' : 'warning'}>{order.status}</Badge></td>
                    </tr>
                  ))}
                  {(!data.recentOrders || data.recentOrders.length === 0) && (
                    <tr><td colSpan="4" className="text-center text-muted">No recent orders.</td></tr>
                  )}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm border-0">
            <CardBody>
              <CardTitle tag="h5" className="mb-3"><FiBell className="me-2" />Notifications</CardTitle>
              <div className="notifications-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {data.notifications?.map((note, idx) => (
                  <div key={idx} className="border-bottom py-2">
                    <p className="mb-1 small">{note.message}</p>
                    <small className="text-muted">{new Date(note.createdAt || Date.now()).toLocaleTimeString()}</small>
                  </div>
                ))}
                {(!data.notifications || data.notifications.length === 0) && (
                  <p className="text-center text-muted">No new notifications.</p>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ClientDashboard;