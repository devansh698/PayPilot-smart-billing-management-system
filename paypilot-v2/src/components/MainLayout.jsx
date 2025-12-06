import React, { useState } from 'react';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const drawerWidth = 260;

const MainLayout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <CssBaseline />
            
            {/* 1. Sidebar (Fixed on Desktop, Temporary on Mobile) */}
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                {isMobile ? (
                    <Sidebar 
                        variant="temporary"
                        open={mobileOpen}
                        onClose={() => setMobileOpen(false)}
                        PaperProps={{ sx: { width: drawerWidth } }}
                    />
                ) : (
                    <Sidebar 
                        variant="permanent"
                        open
                        PaperProps={{ sx: { width: drawerWidth, borderRight: '1px solid #e0e0e0' } }}
                    />
                )}
            </Box>

            {/* 2. Main Content Area (Scrollable) */}
            <Box sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100vh',
                overflow: 'hidden' 
            }}>
                {/* Navbar stays at the top of the content area */}
                <Navbar onMenuClick={() => setMobileOpen(!mobileOpen)} isMobile={isMobile} />
                
                {/* Scrollable Content */}
                <Box component="main" sx={{ 
                    flexGrow: 1, 
                    p: 3, 
                    overflowY: 'auto', 
                    bgcolor: '#f4f6f8' 
                }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;