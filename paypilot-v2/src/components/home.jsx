import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, BarChart3, ShieldCheck, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Navbar */}
            <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <LayoutDashboard /> PayPilot
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link to="/register">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 md:py-32 px-6 text-center container mx-auto">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Smart Billing for Modern Business
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                    Streamline your invoicing, manage inventory, and track payments all in one intuitive platform.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/register">
                        <Button size="lg" className="h-12 px-8 text-lg">
                            Start Free Trial <ArrowRight className="ml-2" />
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                            Live Demo
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="bg-muted/30 py-20 px-6">
                <div className="container mx-auto grid md:grid-cols-3 gap-8">
                    <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                            <CheckCircle size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Easy Invoicing</h3>
                        <p className="text-muted-foreground">Create professional invoices in seconds and send them directly to your clients.</p>
                    </div>
                    <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                            <BarChart3 size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Detailed Reports</h3>
                        <p className="text-muted-foreground">Gain insights into your revenue, sales trends, and financial health with real-time charts.</p>
                    </div>
                    <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
                        <p className="text-muted-foreground">Track payments securely and manage client transaction histories effortlessly.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-12 px-6 mt-auto">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 font-bold text-lg text-primary">
                        <LayoutDashboard size={20} /> PayPilot
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} PayPilot. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-foreground">Privacy</a>
                        <a href="#" className="hover:text-foreground">Terms</a>
                        <a href="#" className="hover:text-foreground">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;