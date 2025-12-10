import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, User, Menu, LogOut, UserCircle } from "lucide-react";
import api from "../api";
import { toast } from "react-toastify";
import { cn } from "../lib/utils";

const Navbar = ({ onMenuClick, isMobile }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      // FIX 1 & 2: Fetch only unread notifications and specify limit for the dropdown.
      const res = await api.get('/notifications?limit=10&isRead=false&sortBy=createdAt&sortOrder=desc');
      
      // FIX 1: Access the notifications array and total count from the paginated response object
      const data = res.data.notifications || []; 
      const totalCount = res.data.totalCount || 0; 
      
      setNotifications(data);
      setUnreadCount(totalCount);
    } catch (error) {
      // The 401 error is likely due to an expired token, but handling the response structure properly is necessary.
      if (error.response && error.response.status !== 401) {
        console.error("Failed to fetch notifications");
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.info("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        {isMobile && (
          <button onClick={onMenuClick} className="p-2 hover:bg-accent rounded-md">
            <Menu size={20} />
          </button>
        )}
        
        {/* Search Bar (Visual only to match reference) */}
        <div className="hidden md:block relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifMenu(!showNotifMenu); setShowProfileMenu(false); }}
            className="p-2 hover:bg-accent rounded-full transition-colors relative"
          >
            <Bell size={20} className="text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-border font-semibold text-sm">Notifications ({unreadCount})</div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n, i) => (
                    <div key={i} className="px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 cursor-pointer">
                      <p className="text-sm text-foreground">{n.message}</p>
                      {/* FIX 3: Use n.createdAt for consistency with backend date fields */}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p> 
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-4 text-center text-sm text-muted-foreground">No new notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifMenu(false); }}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <User size={20} />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
              <button 
                onClick={() => navigate('/profile')}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center gap-2"
              >
                <UserCircle size={16} /> Profile
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;