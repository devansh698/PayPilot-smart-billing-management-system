import React, { useState, useEffect } from "react";
import api from "../api";
import { Search, User, Mail, Shield, Trash2, Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";
import { Label } from "./ui/Label";
import ConfirmationModal from "./ui/ConfirmationModal";

const EmployeeManager = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "admin" // Default role
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Assuming your backend exposes a route to get all users
      // If not, you might need to create one in server/routes/LoginPage.js or similar
      const res = await api.get("/login/"); 
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", newUser);
      toast.success("Employee added successfully");
      setShowAddModal(false);
      fetchUsers();
      setNewUser({ username: "", email: "", phone: "", password: "", role: "admin" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add employee");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
        await api.delete(`/login/${deleteId}`);
        toast.success("User removed");
        fetchUsers();
    } catch(err) {
        toast.error("Failed to remove user");
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage system users and permissions.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
            <Plus size={16} className="mr-2" /> Add Employee
        </Button>
      </div>

      <Card>
        <div className="p-6 border-b border-border">
             <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                    placeholder="Search employees..."
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
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {user.username?.[0]?.toUpperCase()}
                     </div>
                     {user.username}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4 text-muted-foreground">{user.phone || "N/A"}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="flex w-fit items-center gap-1">
                        <Shield size={12} />
                        {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(user._id)}>
                        <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="font-bold text-lg">Add New Employee</h3>
                    <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
                </div>
                <CardContent className="p-6 pt-4">
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                            <Button type="submit">Create User</Button>
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
        title="Delete Employee"
        message="Are you sure you want to remove this employee? This action cannot be undone."
        isDestructive={true}
      />
    </div>
  );
};

export default EmployeeManager;