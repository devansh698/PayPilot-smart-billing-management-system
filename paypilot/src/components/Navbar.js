// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box } from "@mui/material";
import { FaUser, FaBell, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { useState, useEffect } from "react";
import './Navbar.css';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [notifications, setNotifications] = useState([
    "Your order has been shipped.",
    "Your invoice is ready.",
    "New message from support.",
  ]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleMenuOpen = (event) => {
    setDropdownOpen(event.currentTarget);
  };

  const handleMenuClose = () => {
    setDropdownOpen(null);
  };

  return (
    <AppBar position="fixed" className="navbar">
      <Toolbar style={{width:"100%"}}>
        <Link to="/dashboard" className="logo-link">
          <img
            src="logo.png"
            alt="Logo"
            className="logo"
          />
        </Link>
        <Box sx={{ flexGrow: 1 }} />
        {isLoggedIn ? (
          <>
            <Link to="/profile" className="nav-link">
              <IconButton>
                <FaUser />
              </IconButton>
            </Link>
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
            >
              <FaBell />
            </IconButton>
            <Menu
              id="long-menu"
              anchorEl={dropdownOpen}
              keepMounted
              open={Boolean(dropdownOpen)}
              onClose={handleMenuClose}
            >
              <MenuItem>
                <Typography variant="h6">Notifications</Typography>
              </MenuItem>
              {notifications.map((notification, index) => (
                <MenuItem key={index}>{notification}</MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              <IconButton>
                <FaSignInAlt />
              </IconButton>
            </Link>
            <Link to="/signup" className="nav-link">
              <IconButton>
                <FaUserPlus />
              </IconButton>
            </Link>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
