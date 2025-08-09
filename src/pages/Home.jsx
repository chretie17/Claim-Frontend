import React, { useEffect, useState } from 'react';
import { Shield, Calculator, TrendingUp } from 'lucide-react';

// Mock Link component since react-router-dom isn't available
const Link = ({ to, children, className, onClick }) => {
    const handleClick = (e) => {
        if (onClick) onClick(e);
        window.location.href = to;
    };

    return (
        <a href={to} className={className} onClick={handleClick}>
            {children}
        </a>
    );
};

const Home = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // Check for user in memory storage on component mount
    useEffect(() => {
        const token = sessionStorage.getItem('token') || '';
        const role = sessionStorage.getItem('role') || '';
        
        setIsLoggedIn(token || role ? true : false);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
            </div>
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-grid-white/5 bg-[size:50px_50px]"></div>
            
            {/* Content container */}
            <div className="relative z-10 container mx-auto px-4 py-20">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl mb-8 transform hover:scale-110 transition-transform duration-300">
                        <Shield className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
                        Claim<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Smart</span>
                    </h1>
                    <p className="text-2xl text-slate-300 mb-4">Intelligent Insurance Claim Management</p>
                    <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                        Streamline your insurance claims process with our AI-powered platform. Fast, secure, and transparent claim management for modern insurance needs.
                    </p>
                </div>

                {isLoggedIn ? (
                    // Simple welcome message for logged-in users
                    <div className="text-center bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20">
                        <h2 className="text-4xl font-bold text-white mb-6">Welcome to ClaimSmart</h2>
                        <p className="text-xl text-slate-300 mb-8">
                            You are successfully logged in. Access your dashboard to manage your insurance claims and policies.
                        </p>
                        <Link 
                            to="/dashboard" 
                            className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <span>Go to Dashboard</span>
                            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                            </svg>
                        </Link>
                    </div>
                ) : (
                    // Landing page for visitors
                    <div className="space-y-20">
                        {/* Features Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="group bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:bg-white/10 transform hover:-translate-y-2 transition-all duration-300">
                                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl w-fit mb-6">
                                    <Calculator className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Assessment</h3>
                                <p className="text-slate-300">Advanced algorithms automatically assess your claims, providing instant preliminary evaluations and faster processing times.</p>
                            </div>

                            <div className="group bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:bg-white/10 transform hover:-translate-y-2 transition-all duration-300">
                                <div className="bg-gradient-to-br from-green-500 to-teal-600 p-4 rounded-2xl w-fit mb-6">
                                    <Shield className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Secure & Compliant</h3>
                                <p className="text-slate-300">Bank-level security with full compliance to insurance regulations. Your data is protected with end-to-end encryption.</p>
                            </div>

                            <div className="group bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:bg-white/10 transform hover:-translate-y-2 transition-all duration-300">
                                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-2xl w-fit mb-6">
                                    <TrendingUp className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Real-time Tracking</h3>
                                <p className="text-slate-300">Monitor your claim's progress in real-time with detailed status updates and transparent communication channels.</p>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="text-center bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-lg rounded-3xl p-12 border border-blue-500/30">
                            <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
                            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                                Join thousands of satisfied customers who trust ClaimSmart for their insurance needs. Experience the future of claim management.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link 
                                    to="/register" 
                                    className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <span>Create Account</span>
                                    <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                                    </svg>
                                </Link>
                                
                                <Link 
                                    to="/login" 
                                    className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-2xl border border-white/30 backdrop-blur-lg transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="text-4xl font-bold text-blue-400 mb-2">99.9%</div>
                                <div className="text-slate-300">Uptime Guarantee</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
                                <div className="text-slate-300">Customer Support</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-purple-400 mb-2">50K+</div>
                                <div className="text-slate-300">Claims Processed</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="relative z-10 mt-20 bg-black/20 backdrop-blur-lg border-t border-white/10 py-8">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <Shield className="h-6 w-6 text-blue-400" />
                        <span className="text-xl font-bold text-white">ClaimSmart</span>
                    </div>
                    <p className="text-slate-400 text-sm">
                        © {new Date().getFullYear()} ClaimSmart Insurance Management. All rights reserved.
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                        Revolutionizing insurance claim management with intelligent automation.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Home;