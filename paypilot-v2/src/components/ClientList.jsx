import React, { useState, useEffect } from "react";
import api from "../api";
import { Search, Plus, Edit, Trash2, Phone, Mail, Download, X } from "lucide-react";
import { toast } from 'react-toastify';
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";
import { Label } from "./ui/Label";
import ConfirmationModal from "./ui/ConfirmationModal";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'add' or 'edit'
  const [currentClient, setCurrentClient] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "" });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get("/client/");
      setClients(res.data);
    } catch (error) {
      toast.error("Failed to fetch clients");
    }
  };

  const handleDelete = async () => {
    if(!deleteId) return;
    try {
      await api.delete(`/client/${deleteId}`);
      toast.success("Client deleted");
      fetchClients();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
        if (modalMode === 'add') {
            await api.post("/client/", currentClient);
            toast.success("Client added");
        } else {
            await api.put(`/client/${currentClient._id}`, currentClient);
            toast.success("Client updated");
        }
        setModalMode(null);
        fetchClients();
        setCurrentClient({ firstName: "", lastName: "", email: "", phone: "", address: "" });
    } catch (err) {
        toast.error("Operation failed");
    }
  };

  const handleExport = () => {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Address"];
    const csvData = [
        headers.join(","),
        ...clients.map(c => `${c.firstName},${c.lastName},${c.email},${c.phone},"${c.address||''}"`)
    ].join("\n");
    
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "clients_list.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredClients = clients.filter(client => 
    client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your client base.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
                <Download size={16} className="mr-2"/> Export
            </Button>
            <Button onClick={() => { setModalMode('add'); setCurrentClient({ firstName: "", lastName: "", email: "", phone: "", address: "" }); }}>
                <Plus size={16} className="mr-2" /> Add Client
            </Button>
        </div>
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
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredClients.map((client) => (
                <tr key={client._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{client.firstName} {client.lastName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{client.email}</td>
                  <td className="px-6 py-4">{client.phone}</td>
                  <td className="px-6 py-4">
                    <Badge variant={client.verified ? "success" : "warning"}>
                      {client.verified ? "Verified" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setCurrentClient(client); setModalMode('edit'); }}>
                            <Edit size={16} className="text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(client._id)}>
                            <Trash2 size={16} className="text-destructive" />
                        </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Client Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="font-bold text-lg">{modalMode === 'add' ? 'Add Client' : 'Edit Client'}</h3>
                    <button onClick={() => setModalMode(null)}><X size={20} /></button>
                </div>
                <CardContent className="p-6 pt-4">
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>First Name</Label><Input value={currentClient.firstName} onChange={e => setCurrentClient({...currentClient, firstName: e.target.value})} required/></div>
                            <div><Label>Last Name</Label><Input value={currentClient.lastName} onChange={e => setCurrentClient({...currentClient, lastName: e.target.value})} required/></div>
                        </div>
                        <div><Label>Email</Label><Input type="email" value={currentClient.email} onChange={e => setCurrentClient({...currentClient, email: e.target.value})} required/></div>
                        <div><Label>Phone</Label><Input value={currentClient.phone} onChange={e => setCurrentClient({...currentClient, phone: e.target.value})} required/></div>
                        <div><Label>Address</Label><Input value={currentClient.address} onChange={e => setCurrentClient({...currentClient, address: e.target.value})}/></div>
                        
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setModalMode(null)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
      )}

      <ConfirmationModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete}
        title="Delete Client"
        message="Are you sure you want to remove this client? This might affect existing invoices."
        isDestructive={true}
      />
    </div>
  );
};

export default ClientList;