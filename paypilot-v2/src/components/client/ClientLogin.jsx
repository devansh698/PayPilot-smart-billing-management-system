import React, { useState } from "react";
import api from "../../api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, Lock, ArrowRight, Send, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const ClientLogin = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Step 1: Send OTP to client email
            await api.post("/auth/client/send-otp", { email });
            toast.success("OTP sent to your email!");
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP. User not found.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Step 2: Verify OTP
            const res = await api.post("/auth/client/verify-otp", { email, otp });
            
            // Store token and navigate
            localStorage.setItem('clientToken', res.data.token);
            toast.success("Login successful! Welcome to the portal.");
            navigate("/client-portal/dashboard");
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid or expired OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
            <Card className="w-full max-w-md shadow-lg border-border">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold">Client Login</CardTitle>
                    <p className="text-sm text-muted-foreground">Access your invoices and orders.</p>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                    <Input
                                        id="email" name="email" type="email"
                                        className="pl-9"
                                        placeholder="client@company.com"
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                {loading ? "Sending..." : <>Send Login Code <Send size={16} className="ml-2" /></>}
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <Alert color="info" className="mb-4 text-sm">
                                Enter the 6-digit code sent to <b>{email}</b>.
                            </Alert>
                            <div className="space-y-2">
                                <Label htmlFor="otp">Verification Code (OTP)</Label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                    <Input
                                        id="otp" name="otp"
                                        className="pl-9"
                                        placeholder="Enter OTP"
                                        value={otp} onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                {loading ? "Verifying..." : <>Verify & Log In <ArrowRight size={16} className="ml-2" /></>}
                            </Button>
                            <Button variant="link" onClick={() => setStep(1)} className="w-full text-sm">Resend Code / Change Email</Button>
                        </form>
                    )}

                    <div className="text-center text-sm text-muted-foreground mt-4">
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Admin/Employee Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ClientLogin;