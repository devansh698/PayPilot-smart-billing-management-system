import React, { useState, useEffect } from "react";
import api from "../../api";
import ClientLayout from "./ClientLayout";
import { toast } from "react-toastify";
import { User, Phone, Mail, MapPin, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const ClientProfile = () => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    api.get("/client/me").then(res => setProfile(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => {
      setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
      e.preventDefault();
      try {
          await api.put("/client/update", profile);
          toast.success("Profile updated successfully");
      } catch (err) {
          toast.error("Failed to update profile");
      }
  };

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your contact information.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input name="firstName" value={profile.firstName} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input name="lastName" value={profile.lastName} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                            <Input name="email" value={profile.email} disabled className="pl-9 bg-muted/50" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                            <Input name="phone" value={profile.phone} onChange={handleChange} className="pl-9" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Address</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                            <Input name="address" value={profile.address} onChange={handleChange} className="pl-9" placeholder="123 Main St" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit">
                            <Save size={16} className="mr-2" /> Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
};

export default ClientProfile;