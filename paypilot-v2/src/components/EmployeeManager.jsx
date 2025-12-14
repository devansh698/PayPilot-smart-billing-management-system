import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { Search, User, Mail, Shield, Trash2, Plus, Edit } from "lucide-react";
import { toast } from "react-toastify";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

const EmployeeManager = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_LIMIT = 10;

  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const fetchUsers = async (page, search) => {
    setLoading(true);
    try {
      // FIX 1: Use the correct backend route: /user
      const res = await api.get(`/user?page=${page}&limit=${PAGE_LIMIT}&search=${search}`); 
      setUsers(res.data.users || []); 
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to fetch employees");
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id) => {
      if(window.confirm("Are you sure you want to permanently remove this user?")) {
        try {
            // FIX 1: Correct delete endpoint
            await api.delete(`/user/${id}`); 
            toast.success("User removed");
            fetchUsers(currentPage, searchTerm);
        } catch(err) {
            toast.error("Failed to remove user");
        }
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage system users and permissions.</p>
        </div>
        <Button onClick={() => navigate('/add-employee')}> 
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
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); 
                    }}
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
              {loading ? (
                <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">Loading employees...</td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                    <tr key={user._id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-medium flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <User size={16} />
                            </div>
                            {user.username}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                        <td className="px-6 py-4">
                            <Badge variant="outline" className="flex w-fit items-center gap-1">
                                <Shield size={12} />
                                {user.role}
                            </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => navigate(`/edit-employee/${user._id}`)}>
                                    <Edit size={16} className="text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(user._id)}>
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </td>
                    </tr>
                ))
              ) : (
                <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No employees found.</td>
                </tr>
              )}
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

export default EmployeeManager;