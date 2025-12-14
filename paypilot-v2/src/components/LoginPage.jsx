import React, { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, Lock, Send, ArrowRight, LayoutDashboard, RotateCcw,KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const LoginPage = () => {
  const [step, setStep] = useState(1); // 1: Email/Pass, 2: OTP
  const [credentials, setCredentials] = useState({ email: "", password: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Step 1: Verify Email/Password
      const res = await api.post("/auth/login", {
        email: credentials.email,
        password: credentials.password
      });
      toast.success(res.data.message);
      setStep(2); // Move to OTP step
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Step 2: Verify OTP
      const res = await api.post("/auth/verify-otp-login", {
        email: credentials.email,
        otp: credentials.otp
      });

      localStorage.setItem("token", res.data.token);
      // Dispatch custom event to refresh AuthContext
      window.dispatchEvent(new CustomEvent('tokenSet'));
      toast.success("Login Successful!");
      // Small delay to ensure context updates, then navigate
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground mb-2">
            <LayoutDashboard size={24} />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 1 ? "Welcome Back" : "Verify OTP"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {step === 1 ? "Sign in to your PayPilot account" : `Enter the code sent to ${credentials.email}`}
          </p>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                  <Input
                    id="email" name="email" type="email"
                    className="pl-9"
                    placeholder="name@company.com"
                    value={credentials.email} onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-right text-sm mt-4">
                  <Link to="/forgot-password" className="text-muted-foreground hover:text-primary flex items-center justify-end gap-1">
                    <RotateCcw size={12} /> Forgot Password?
                  </Link>
                </div>
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

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Verifying..." : "Continue"} <ArrowRight size={16} className="ml-2" />
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                  <Input
                    id="otp" name="otp" type="text"
                    className="pl-9 tracking-widest"
                    placeholder="123456"
                    value={credentials.otp} onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Checking..." : "Verify & Login"}
              </Button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-muted-foreground hover:text-primary mt-2"
              >
                Back to Login
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;