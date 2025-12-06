// paypilot/src/components/ClientList.jsx (Improved)
import React, { useState, useEffect } from "react";
import api from "../api"; // Use your configured API instance
import { 
  Box, Paper, Typography, Button, TextField, InputAdornment, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, TablePagination
} from "@mui/material";
import { Search, Add, Edit, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get("/client/"); // Use interceptor api
      setClients(res.data);
    } catch (error) {
      toast.error("Failed to fetch clients");
    }
  };

  const filteredClients = clients.filter(client => 
    client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Client Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => navigate("/add-client")}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Add Client
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #eee' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search clients..."
          size="small"
          sx={{ mb: 2, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><Search color="action" /></InputAdornment>
            ),
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((client) => (
                <TableRow key={client._id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box 
                        sx={{ 
                          width: 40, height: 40, bgcolor: 'primary.light', 
                          color: 'primary.main', borderRadius: '50%', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 'bold'
                        }}
                      >
                        {client.firstName[0]}
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {client.firstName} {client.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {client.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={client.verified ? "Verified" : "Pending"} 
                      color={client.verified ? "success" : "warning"} 
                      size="small" 
                      variant="soft"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary"><Edit fontSize="small"/></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error"><Delete fontSize="small"/></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredClients.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Paper>
    </Box>
  );
};
export default ClientList;