import React, { useState, useEffect } from 'react';
import api from '../api'; // FIX: Use secure api
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, AttachMoney, Warning } from '@mui/icons-material';

// You will need to migrate your 'Overview' component to MUI as well, 
// or simpler: render summary cards directly here.
const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [overviewData, setOverviewData] = useState(null);

    const chartData = [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
    ];
    
    const pieData = [
        { name: 'Paid', value: 400 },
        { name: 'Pending', value: 300 },
        { name: 'Overdue', value: 100 },
    ];
    const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

    useEffect(() => {
        api.get('/overview/')
            .then(res => {
                setOverviewData(res.data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    const StatCard = ({ title, value, icon, color }) => (
        <Card sx={{ height: '100%', borderLeft: `5px solid ${color}` }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography color="textSecondary" variant="subtitle2" textTransform="uppercase">
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                            {value}
                        </Typography>
                    </Box>
                    <Box sx={{ color: color, p: 1, borderRadius: '50%', bgcolor: `${color}22` }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" mb={3}>
                Dashboard Overview
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={4}>
                    <StatCard title="Total Sales" value="$24,000" icon={<AttachMoney />} color="#1976d2" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard title="Pending Invoices" value="12" icon={<Warning />} color="#ed6c02" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard title="Weekly Growth" value="+15%" icon={<TrendingUp />} color="#2e7d32" />
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" mb={2}>Weekly Sales Analytics</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="sales" fill="#1976d2" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" mb={2}>Payment Status</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;