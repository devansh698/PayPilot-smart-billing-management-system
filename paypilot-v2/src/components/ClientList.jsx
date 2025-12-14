import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Phone, Mail } from "lucide-react";
import { toast } from 'react-toastify';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";


const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const PAGE_LIMIT = 10;

  useEffect(() => {
    // Re-fetch clients whenever currentPage or searchTerm changes
    fetchClients(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const fetchClients = async (page, search) => {
    setLoading(true);
    try {
      // Use search term and pagination in the API call
      const res = await api.get(`/client?page=${page}&limit=${PAGE_LIMIT}&search=${search}`);
      setClients(res.data.clients || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-client/${id}`); // Assumes /edit-client/:id route
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
        try {
            // FIX: Use the correct DELETE endpoint
            await api.delete(`/client/${id}`); 
            toast.success("Client deleted successfully");
            if (clients.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchClients(currentPage, searchTerm);
            }
        } catch (error) {
            toast.error("Failed to delete client");
        }
    }
  }
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 on new search
  };


  // Stats calculation is now based on all fetched clients for the current page
  const totalClients = clients.length;
  const verifiedClients = clients.filter(c => c.verified).length;
  // NOTE: This component does not know the true total count across all pages, which would require a separate, non-paginated endpoint.

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your client relationships.</p>
        </div>
        <Button onClick={() => navigate("/add-client")}> {/* FIX: Add Client Navigation */}
          <Plus size={16} className="mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards - Note: Total Clients count is only for the current page's data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Clients on Page</p>
          <p className="text-2xl font-bold mt-2">{totalClients}</p> 
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Verified on Page</p>
          <p className="text-2xl font-bold mt-2 text-green-600">{verifiedClients}</p>
        </Card>
        {/* Placeholder stats as per reference */}
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active Invoices</p>
          <p className="text-2xl font-bold mt-2">--</p>
        </Card>
        <Card className="p-4">
           <p className="text-sm text-muted-foreground">Total Revenue</p>
           <p className="text-2xl font-bold mt-2">--</p>
        </Card>
      </div>

      <Card>
        <div className="p-6 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search clients..."
              className="pl-9"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-3">Client Name</th>
                <th className="px-6 py-3">Contact Info</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                    Loading clients...
                  </td>
                </tr>
              )}
              {!loading && clients.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                    No clients found.
                  </td>
                </tr>
              )}
              {clients.map((client) => ( // Use 'clients' array directly
                <tr key={client._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Assuming first name exists, otherwise use email initial */}
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {client.firstName ? client.firstName[0] : client.email ? client.email[0].toUpperCase() : 'C'}
                      </div>
                      <span className="font-medium">{client.firstName} {client.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-muted-foreground">
                      <span className="flex items-center gap-2"><Mail size={12}/> {client.email}</span>
                      <span className="flex items-center gap-2"><Phone size={12}/> {client.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={client.verified ? "success" : "warning"}>
                      {client.verified ? "Verified" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(client._id)}>
                            <Edit size={16} className="text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(client._id)}>
                            <Trash2 size={16} className="text-destructive" />
                        </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex justify-between items-center p-6 border-t border-border">
            <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
            <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default ClientList;