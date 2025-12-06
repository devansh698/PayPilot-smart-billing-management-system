// src/components/client/ClientNavbar.jsx
import React, { useState, useEffect } from "react";
import {
  Navbar as BootstrapNavbar,
  Nav,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Badge,
  NavItem,
  NavLink,
  Container,
  Row,
  Col
} from "reactstrap";
import {
  FiBell,
  FiUser,
  FiMessageSquare,
  FiSettings,
  FiLogOut,
  FiShoppingBag,
  FiDollarSign
} from "react-icons/fi";
import { Link } from "react-router-dom";
import "./ClientNavbar.css";

const ClientNavbar = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Your order has been shipped",
      read: false,
      type: "order",
      date: new Date(),
    },
    {
      id: 2,
      message: "New message from support",
      read: false,
      type: "message",
      date: new Date(Date.now() - 3600000),
    },
    {
      id: 3,
      message: "Your invoice is ready",
      read: true,
      type: "payment",
      date: new Date(Date.now() - 86400000),
    },
  ]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <FiShoppingBag />;
      case "message":
        return <FiMessageSquare />;
      case "payment":
        return <FiDollarSign />;
      default:
        return <FiBell />;
    }
  };

  return (
    <BootstrapNavbar expand="md" className="client-navbar">
      <Container fluid>
        <Row className="w-100 align-items-center">
          {/* Logo/Brand Section - Left Side */}
          <Col xs={6} md={4} className="d-flex align-items-center">
            <Link to="/client/dashboard" className="navbar-brand">
              <img 
                src="./logo.png" 
                alt="Company Logo" 
                className="navbar-logo" 
              />
            </Link>
          </Col>

          {/* Navigation Controls - Right Side */}
          <Col xs={6} md={8} className="d-flex justify-content-end">
            <Nav navbar className="align-items-center">
              {isLoggedIn ? (
                <>
                  {/* Notifications Dropdown */}
                  <NavItem className="mx-2">
                    <UncontrolledDropdown nav inNavbar>
                      <DropdownToggle nav className="position-relative">
                        <FiBell size={20} />
                        {unreadCount > 0 && (
                          <Badge 
                            color="danger" 
                            className="position-absolute notification-badge"
                            pill
                          >
                            {unreadCount}
                          </Badge>
                        )}
                      </DropdownToggle>
                      <DropdownMenu end className="notification-dropdown">
                        <DropdownItem header className="dropdown-header">
                          Notifications
                        </DropdownItem>
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <DropdownItem
                              key={notification.id}
                              className={`notification-item ${
                                !notification.read ? "unread" : ""
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="d-flex align-items-center">
                                <span className="me-2">
                                  {getNotificationIcon(notification.type)}
                                </span>
                                <div>
                                  <p className="mb-0">{notification.message}</p>
                                  <small className="text-muted">
                                    {notification.date.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </small>
                                </div>
                              </div>
                            </DropdownItem>
                          ))
                        ) : (
                          <DropdownItem disabled>No notifications</DropdownItem>
                        )}
                        <DropdownItem divider />
                        <DropdownItem className="text-center view-all">
                          View All Notifications
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </NavItem>

                  {/* User Profile Dropdown */}
                  <NavItem className="ms-2">
                    <UncontrolledDropdown nav inNavbar>
                      <DropdownToggle nav>
                        <div className="user-avatar">
                          <FiUser size={18} />
                        </div>
                      </DropdownToggle>
                      <DropdownMenu end className="profile-dropdown">
                        <DropdownItem header className="dropdown-header">
                          My Account
                        </DropdownItem>
                        <DropdownItem tag={Link} to="/client/profile">
                          <FiUser className="me-2" /> Profile
                        </DropdownItem>
                        <DropdownItem tag={Link} to="/client/settings">
                          <FiSettings className="me-2" /> Settings
                        </DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem tag={Link} to="/logout">
                          <FiLogOut className="me-2" /> Logout
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </NavItem>
                </>
              ) : (
                <NavItem>
                  <NavLink tag={Link} to="/login" className="nav-link">
                    Login
                  </NavLink>
                </NavItem>
              )}
            </Nav>
          </Col>
        </Row>
      </Container>
    </BootstrapNavbar>
  );
};

export default ClientNavbar;