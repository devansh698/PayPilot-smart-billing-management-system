// src/components/client/ClientDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Container, Row, Col, Card, CardBody, CardTitle, 
  CardText, Table, Alert, Badge, Progress 
} from 'reactstrap';
import { FiUser, FiShoppingBag, FiDollarSign, FiBell, FiPackage } from 'react-icons/fi';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/clientroutes/dashboard');
        setData(response.data);
      } catch (error) {
        setError('Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'warning',
      'completed': 'success',
      'shipped': 'info',
      'cancelled': 'danger'
    };
    return <Badge color={statusMap[status.toLowerCase()] || 'secondary'}>{status}</Badge>;
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p>Loading your dashboard...</p>
    </div>
  );
  
  if (error) return <Alert color="danger" className="mt-4">{error}</Alert>;

  return (
    <Container fluid className="client-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, <span>{data.profile.firstName}</span>!</h1>
        <p className="subtitle">Here's what's happening with your account today</p>
      </div>

      <Row className="summary-cards">
        <Col md={3}>
          <Card className="summary-card">
            <CardBody>
              <div className="card-icon user">
                <FiUser />
              </div>
              <CardTitle>Profile Status</CardTitle>
              <CardText>
                {data.profile.verified ? 'Verified' : 'Pending Verification'}
              </CardText>
              <Progress 
                value={data.profile.verified ? 100 : 70} 
                color={data.profile.verified ? 'success' : 'warning'}
              />
            </CardBody>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="summary-card">
            <CardBody>
              <div className="card-icon order">
                <FiShoppingBag />
              </div>
              <CardTitle>Total Orders</CardTitle>
              <CardText>{data.profile.totalOrders || 0}</CardText>
            </CardBody>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="summary-card">
            <CardBody>
              <div className="card-icon payment">
                <FiDollarSign />
              </div>
              <CardTitle>Pending Amount</CardTitle>
              <CardText>${data.profile.pendingdues || 0}</CardText>
            </CardBody>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="summary-card">
            <CardBody>
              <div className="card-icon purchase">
                <FiPackage />
              </div>
              <CardTitle>Total Purchases</CardTitle>
              <CardText>${data.profile.totalbought || 0}</CardText>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="main-content">
        <Col lg={8}>
          <Card className="activity-card">
            <CardBody>
              <div className="card-header">
                <CardTitle>Recent Orders</CardTitle>
                <a href="/orders" className="view-all">View All</a>
              </div>
              <div className="table-responsive">
                <Table hover className="activity-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map(order => (
                      <tr key={order._id}>
                        <td>#{order._id.slice(-6)}</td>
                        <td>{new Date(order.date).toLocaleDateString()}</td>
                        <td>${order.amount}</td>
                        <td>{getStatusBadge(order.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="notifications-card">
            <CardBody>
              <div className="card-header">
                <CardTitle>
                  <FiBell className="icon" /> Notifications
                </CardTitle>
                <span className="badge">{data.notifications.length}</span>
              </div>
              <ul className="notifications-list">
                {data.notifications.map(notification => (
                  <li key={notification._id} className={notification.read ? '' : 'unread'}>
                    <div className="notification-content">
                      <p>{notification.message}</p>
                      <small>{new Date(notification.date).toLocaleString()}</small>
                    </div>
                    {!notification.read && <span className="unread-dot"></span>}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ClientDashboard;