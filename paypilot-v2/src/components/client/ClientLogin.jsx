import React, { useState } from "react";
import api from "../../api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { LogIn, Mail, Lock, ArrowRight, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";

const ClientLogin = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/client/login", credentials);
      localStorage.setItem("clientToken", res.data.token);
      toast.success("Welcome to the Client Portal");
      navigate("/client-dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-2">
                <UserCheck size={24} />
            </div>
            <CardTitle className="text-2xl font-bold">Client Portal</CardTitle>
            <p className="text-sm text-muted-foreground">Sign in to view invoices and orders</p>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                        <Input
                            id="email" name="email" type="email"
                            className="pl-9"
                            placeholder="client@example.com"
                            value={credentials.email} onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                        <Input
                            id="password" name="password" type="password"
                            className="pl-9"
                            placeholder="••••••••"
                            value={credentials.password} onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                    Access Portal <ArrowRight size={16} className="ml-2" />
                </Button>

                <div className="text-center text-sm text-muted-foreground mt-4">
                    Not a client yet? <Link to="/" className="text-primary hover:underline">Contact Support</Link>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLogin;