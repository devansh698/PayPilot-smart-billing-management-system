import React, { useState, useEffect } from "react";
import api from "../api";
import { Search, User, Mail, Shield, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";

const EmployeeManager = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/all"); // Ensure this endpoint exists
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users");
    }
  };

  const handleDelete = async (id) => {
      if(window.confirm("Remove this user?")) {
        try {
            await api.delete(`/users/${id}`);
            toast.success("User removed");
            fetchUsers();
        } catch(err) {
            toast.error("Failed to remove");
        }
      }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage system users and permissions.</p>
        </div>
        <Button>
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
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <User size={16} />
                     </div>
                     {user.name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="flex w-fit items-center gap-1">
                        <Shield size={12} />
                        {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(user._id)}>
                        <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeManager;