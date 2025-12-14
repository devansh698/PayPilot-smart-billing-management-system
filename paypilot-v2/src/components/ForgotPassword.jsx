import React, { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, Lock, ArrowRight, RotateCcw, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP & New Password
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Step 1: Send OTP
            await api.post("/user/forgot-password", { email });
            toast.success("OTP sent to your email!");
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP. Check email.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        try {
            // Step 2: Reset Password
            await api.post("/user/reset-password", { email, otp, newPassword });
            toast.success("Password reset successful! Please log in.");
            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.message || "Password reset failed. Check OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
            <Card className="w-full max-w-md shadow-lg border-border">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center mb-2">
                        <RotateCcw size={24} />
                    </div>
                    <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {step === 1 ? "Enter your email to receive a password reset OTP." : "Enter OTP and your new password."}
                    </p>
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
                                        placeholder="name@company.com"
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                {loading ? "Sending..." : <>Send OTP <ArrowRight size={16} className="ml-2" /></>}
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="otp">Verification Code (OTP)</Label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                    <Input
                                        id="otp" name="otp"
                                        className="pl-9"
                                        placeholder="6-digit code"
                                        value={otp} onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                    <Input
                                        id="newPassword" name="newPassword" type="password"
                                        className="pl-9"
                                        placeholder="••••••••"
                                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                {loading ? "Resetting..." : <>Reset Password <ArrowRight size={16} className="ml-2" /></>}
                            </Button>
                        </form>
                    )}

                    <div className="text-center text-sm text-muted-foreground mt-4">
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Back to Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;