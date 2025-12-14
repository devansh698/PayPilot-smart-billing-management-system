import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const AddClient = () => {
    const [client, setClient] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setClient({ ...client, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Backend route for client creation is POST /client/ (server/routes/Client.js)
            await api.post("/client/", client); 
            toast.success("Client added successfully!");
            navigate("/client-list");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add client");
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Add New Client</h1>
                    <p className="text-muted-foreground mt-1">Fill out the details to register a new customer.</p>
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle>Client Details</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" name="firstName" placeholder="First Name" value={client.firstName} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" name="lastName" placeholder="Last Name" value={client.lastName} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="email@example.com" value={client.email} onChange={handleChange} required />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" placeholder="+1 (555) 000-0000" value={client.phone} onChange={handleChange} />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <textarea id="address" name="address" placeholder="123 Main St." className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={client.address} onChange={handleChange} />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" size="lg">
                                <Save size={18} className="mr-2" /> Save Client
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddClient;