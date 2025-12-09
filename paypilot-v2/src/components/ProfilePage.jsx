import React, { useState, useEffect } from "react";
import api from "../api";
import { User, Mail, Shield, Save, Key } from "lucide-react";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Badge } from "./ui/Badge"; // <--- Added missing import

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "User",
    currentPassword: "",
    newPassword: ""
  });

  useEffect(() => {
    // Fetch user profile
    api.get("/auth/me").then(res => {
        setProfile(prev => ({ ...prev, ...res.data }));
    }).catch(err => console.error(err));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
        await api.put("/auth/update", { name: profile.name, email: profile.email });
        toast.success("Profile updated");
    } catch (err) {
        toast.error("Update failed");
    }
  };

  const handlePasswordChange = async (e) => {
      e.preventDefault();
      // Add password change logic here
      toast.info("Password change functionality to be implemented");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile information and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold">
                                {profile.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                                <p className="font-medium text-lg">{profile.name}</p>
                                <p className="text-sm text-muted-foreground">{profile.role}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                <Input 
                                    className="pl-9"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                <Input 
                                    className="pl-9"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button type="submit">
                                <Save size={16} className="mr-2" /> Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>

        {/* Security Card */}
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Current Password</Label>
                            <Input type="password" placeholder="••••••••" />
                        </div>
                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                <Input type="password" className="pl-9" placeholder="••••••••" />
                            </div>
                        </div>
                        <div className="pt-2">
                             <Button variant="outline" type="submit" className="w-full">
                                Update Password
                            </Button>
                        </div>
                    </form>
                    
                    <div className="mt-6 pt-6 border-t border-border">
                        <p className="text-sm font-medium mb-2">Role Permissions</p>
                        <Badge variant="outline" className="flex w-fit gap-2 py-1 px-3">
                            <Shield size={14} /> {profile.role}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;