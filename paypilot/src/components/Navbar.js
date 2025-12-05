// paypilot/src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { 
  AppBar, Toolbar, IconButton, Typography, Box, Badge, Menu, MenuItem, 
  List, ListItem, ListItemText, Divider, Avatar 
} from "@mui/material";
import { Menu as MenuIcon, Notifications, ExitToApp, Person } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
// FIX: Import the configured 'api' instance instead of raw 'axios'
// This ensures the Authorization token is sent with the request
import api from '../api'; 
import { toast } from 'react-toastify';

const Navbar = ({ onMenuClick, isMobile }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifEl, setNotifEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      // FIX: Use 'api.get' instead of 'axios.get'
      const res = await api.get('/notifications'); 
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (error) {
      // It's often good to suppress 401 errors in polling to avoid console spam if logged out
      if (error.response && error.response.status !== 401) {
        console.error("Failed to fetch notifications");
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.info("Logged out successfully");
    navigate("/login");
  };

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', color: '#333' }}>
      <Toolbar>
        {isMobile && (
          <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#1a237e' }}>
          PayPilot <span style={{fontSize: '0.8rem', color: '#666'}}>Admin Portal</span>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
          {/* Notifications Icon */}
          <IconButton onClick={(e) => setNotifEl(e.currentTarget)}>
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* User Profile Icon */}
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
             <Avatar sx={{ width: 35, height: 35, bgcolor: '#1a237e' }}>A</Avatar>
          </IconButton>
        </Box>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notifEl}
          open={Boolean(notifEl)}
          onClose={() => setNotifEl(null)}
          PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
        >
          <Typography sx={{ p: 2, fontWeight: 'bold' }}>Notifications</Typography>
          <Divider />
          <List dense>
            {notifications.length > 0 ? notifications.map((n, i) => (
              <ListItem key={i} button divider>
                <ListItemText 
                  primary={n.message} 
                  secondary={new Date(n.date).toLocaleString()} 
                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                />
              </ListItem>
            )) : (
              <ListItem><ListItemText primary="No new notifications" /></ListItem>
            )}
          </List>
        </Menu>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => navigate('/profile')}>
            <Person sx={{ mr: 1 }} /> Profile
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: 'red' }}>
            <ExitToApp sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;