import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, BarChart3, ShieldCheck, ArrowRight, LayoutDashboard, Store, Users, Package, CreditCard, TrendingUp, Zap, FileText } from 'lucide-react';
import { Button } from './ui/button';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 text-foreground flex flex-col">
            {/* Navbar */}
            <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50 shadow-sm">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            PP
                        </div>
                        PayPilot
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="hover:bg-accent">Login</Button>
                        </Link>
                        <Link to="/register">
                            <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 md:py-32 px-6 text-center container mx-auto">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Smart Billing Management System
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4">
                        Manage multiple stores, customers, employees, products, orders, and inventory all in one powerful platform.
                    </p>
                    <p className="text-lg text-muted-foreground mb-10">
                        Complete billing solution for modern businesses with real-time analytics and seamless client portal.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/register">
                            <Button size="lg" className="h-14 px-10 text-lg shadow-lg hover:shadow-xl transition-shadow">
                                Start Free Trial <ArrowRight className="ml-2" size={20} />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-2">
                                Live Demo
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="bg-muted/30 py-20 px-6">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Manage Your Business</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all hover:scale-105">
                            <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                                <Store size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Multi-Store Management</h3>
                            <p className="text-muted-foreground">Manage multiple store locations from a single dashboard with store-specific inventory and reporting.</p>
                        </div>
                        <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all hover:scale-105">
                            <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                                <FileText size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Easy Invoicing</h3>
                            <p className="text-muted-foreground">Create professional invoices in seconds with automatic calculations and email delivery.</p>
                        </div>
                        <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all hover:scale-105">
                            <div className="w-14 h-14 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mb-4">
                                <BarChart3 size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
                            <p className="text-muted-foreground">Real-time dashboards with detailed reports, sales trends, and financial insights.</p>
                        </div>
                        <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all hover:scale-105">
                            <div className="w-14 h-14 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center mb-4">
                                <Package size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Inventory Management</h3>
                            <p className="text-muted-foreground">Track stock levels, get low stock alerts, and manage product catalogs efficiently.</p>
                        </div>
                        <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all hover:scale-105">
                            <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center mb-4">
                                <Users size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Client Portal</h3>
                            <p className="text-muted-foreground">Clients can view invoices, place orders, track payments, and manage their accounts.</p>
                        </div>
                        <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all hover:scale-105">
                            <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center mb-4">
                                <ShieldCheck size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Secure & Reliable</h3>
                            <p className="text-muted-foreground">Two-factor authentication, role-based access, and enterprise-grade security.</p>
                        </div>
                        <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all hover:scale-105">
                            <div className="w-14 h-14 bg-teal-500/10 text-teal-500 rounded-xl flex items-center justify-center mb-4">
                                <CreditCard size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Payment Tracking</h3>
                            <p className="text-muted-foreground">Track all payments, manage payment methods, and integrate with Razorpay.</p>
                        </div>
                        <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all hover:scale-105">
                            <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center mb-4">
                                <TrendingUp size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Sales Reports</h3>
                            <p className="text-muted-foreground">Generate comprehensive sales reports with export capabilities and date filtering.</p>
                        </div>
                        <div className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all hover:scale-105">
                            <div className="w-14 h-14 bg-pink-500/10 text-pink-500 rounded-xl flex items-center justify-center mb-4">
                                <Zap size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Employee Management</h3>
                            <p className="text-muted-foreground">Assign roles, manage permissions, and track employee activities across stores.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-r from-primary/10 to-blue-600/10">
                <div className="container mx-auto text-center max-w-3xl">
                    <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Business?</h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        Join thousands of businesses using PayPilot to streamline their operations.
                    </p>
                    <Link to="/register">
                        <Button size="lg" className="h-14 px-10 text-lg">
                            Get Started Today <ArrowRight className="ml-2" size={20} />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-12 px-6 mt-auto bg-muted/30">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 font-bold text-lg text-primary mb-4">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                                    PP
                                </div>
                                PayPilot
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Smart billing management system for modern businesses.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">Features</a></li>
                                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                                <li><a href="#" className="hover:text-foreground">Updates</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">About</a></li>
                                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                                <li><a href="#" className="hover:text-foreground">Terms</a></li>
                                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} PayPilot. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-foreground transition-colors">Support</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;