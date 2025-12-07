import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Phone, Mail } from "lucide-react";
import { toast } from 'react-toastify';
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get("/client/");
      setClients(res.data);
    } catch (error) {
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => 
    client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculation
  const totalClients = clients.length;
  const verifiedClients = clients.filter(c => c.verified).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your client relationships.</p>
        </div>
        <Button onClick={() => navigate("/add-client")}>
          <Plus size={16} className="mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Clients</p>
          <p className="text-2xl font-bold mt-2">{totalClients}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Verified Clients</p>
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
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredClients.map((client) => (
                <tr key={client._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {client.firstName[0]}
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
                        <Button variant="ghost" size="icon">
                            <Edit size={16} className="text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Trash2 size={16} className="text-destructive" />
                        </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ClientList;