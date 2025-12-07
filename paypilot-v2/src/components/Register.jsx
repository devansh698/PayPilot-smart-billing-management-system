import React, { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Mail, Lock, Phone, ArrowRight, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", formData);
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground mb-2">
                <LayoutDashboard size={24} />
            </div>
            <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
            <p className="text-sm text-muted-foreground">Join PayPilot to manage your billing.</p>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                        <Input
                            id="name" name="name"
                            className="pl-9"
                            placeholder="John Doe"
                            value={formData.name} onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                        <Input
                            id="email" name="email" type="email"
                            className="pl-9"
                            placeholder="name@company.com"
                            value={formData.email} onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                        <Input
                            id="phone" name="phone"
                            className="pl-9"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone} onChange={handleChange}
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
                            value={formData.password} onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                    Get Started <ArrowRight size={16} className="ml-2" />
                </Button>

                <div className="text-center text-sm text-muted-foreground mt-4">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                        Sign in
                    </Link>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;