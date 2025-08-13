import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../api';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [showMessage, setShowMessage] = useState({ visible: false, text: '', type: 'success' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/users/login`, { usernameOrEmail, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.dispatchEvent(new Event('roleChange'));
            
            // Updated success message based on role
            let welcomeMessage = 'Login successful. Welcome to ClaimGuard Insurance!';
            if (response.data.role === 'admin') {
                welcomeMessage = 'Welcome back, Administrator! System control at your fingertips.';
            } else if (response.data.role === 'claim-manager') {
                welcomeMessage = 'Welcome back, Claim Manager! Claims awaiting your review.';
            } else if (response.data.role === 'client') {
                welcomeMessage = 'Welcome back! Your policy dashboard is ready.';
            }
            
            displayMessage(welcomeMessage, 'success');
            
            setTimeout(() => {
                if (response.data.role === 'admin' || response.data.role === 'claim-manager') {
                    navigate('/dashboard');
                } else {
                    navigate('/');
                }
            }, 1500);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Access denied. Please verify your credentials and try again.';
            displayMessage(errorMsg, 'error');
            setIsLoading(false);
        }
    };

    const displayMessage = (text, type = 'success') => {
        setShowMessage({ visible: true, text, type });
        setTimeout(() => {
            setShowMessage({ visible: false, text: '', type: 'success' });
        }, 4000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            {/* Geometric Pattern Overlay */}
            <div className="absolute inset-0 opacity-5">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />
                </svg>
            </div>

            <div className="relative z-10 min-h-screen flex">
                {/* Left Panel - Company Branding */}
                <div className="hidden lg:flex lg:w-2/5 flex-col justify-center p-12 relative">
                    <div className="max-w-lg">
                        {/* Logo and Brand */}
                        <div className="flex items-center mb-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl blur-xl opacity-60"></div>
                                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-2xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h1 className="text-4xl font-bold text-white tracking-tight">ClaimGuard</h1>
                                <p className="text-blue-300 font-medium">Insurance Solutions</p>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4">Intelligent Claim Management</h2>
                        <p className="text-blue-200 text-lg mb-12 leading-relaxed">
                            Streamline your insurance operations with our comprehensive claim management platform. 
                            Built for efficiency, designed for reliability.
                        </p>

                        {/* Feature Cards */}
                        <div className="space-y-4">
                            <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">Smart Claims Processing</h3>
                                    <p className="text-blue-200 text-sm">AI-powered claim evaluation and automated workflows</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">Real-time Analytics</h3>
                                    <p className="text-blue-200 text-sm">Comprehensive dashboards and performance insights</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                                <div className="p-2 bg-cyan-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">Enterprise Security</h3>
                                    <p className="text-blue-200 text-sm">Bank-level encryption and compliance standards</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex space-x-8 mt-12">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">99.9%</div>
                                <div className="text-blue-300 text-sm">Uptime</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">24/7</div>
                                <div className="text-blue-300 text-sm">Support</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">50K+</div>
                                <div className="text-blue-300 text-sm">Claims Processed</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="w-full lg:w-3/5 flex items-center justify-center p-6 lg:p-12">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="flex items-center justify-center mb-8 lg:hidden">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl blur-lg opacity-60"></div>
                                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3">
                                <h1 className="text-2xl font-bold text-white">ClaimGuard</h1>
                                <p className="text-blue-300 text-sm">Insurance Solutions</p>
                            </div>
                        </div>

                        {/* Login Card */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"></div>
                            <div className="relative p-8 lg:p-10">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                                    <p className="text-blue-200">Access your claim management portal</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-blue-200 mb-2">
                                                Username or Email
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="usernameOrEmail"
                                                    type="text"
                                                    required
                                                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                                    placeholder="Enter your username or email"
                                                    value={usernameOrEmail}
                                                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    className="w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                                                    placeholder="Enter your password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                id="remember-me"
                                                name="remember-me"
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-500 focus:ring-blue-400 bg-white/10 border-white/30 rounded"
                                            />
                                            <label htmlFor="remember-me" className="ml-2 text-sm text-blue-200">
                                                Remember me
                                            </label>
                                        </div>
                                        
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full relative overflow-hidden py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-300 ${
                                            isLoading 
                                                ? 'bg-blue-400/50 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/25 hover:scale-105'
                                        }`}
                                    >
                                        <div className="flex justify-center items-center">
                                            {isLoading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                                    Authenticating...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                                                    </svg>
                                                    Access ClaimGuard Portal
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </form>

                                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                                    <p className="text-sm text-blue-200">
                                        Need system access? 
                                        <Link to="/" className="ml-1 font-medium text-blue-300 hover:text-blue-100 transition-colors">
                                            Contact IT Administrator
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Security Badges */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-blue-300 mb-4">Enterprise-grade security platform</p>
                            <div className="flex justify-center space-x-6">
                                <div className="flex items-center text-xs text-blue-400">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    SOC 2 Certified
                                </div>
                                <div className="flex items-center text-xs text-blue-400">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    256-bit SSL
                                </div>
                                <div className="flex items-center text-xs text-blue-400">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    ISO 27001
                                </div>
                            </div>
                        </div>

                        {/* Legal Links */}
                        <div className="mt-6 text-center">
                            <span className="text-xs text-blue-400">
                                By accessing this system, you agree to our{' '}
                                <a href="#" className="text-blue-300 hover:text-blue-100 underline transition-colors">Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="text-blue-300 hover:text-blue-100 underline transition-colors">Privacy Policy</a>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Message Notification */}
            {showMessage.visible && (
                <div className={`fixed top-6 right-6 z-50 max-w-sm overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-500 ${
                    showMessage.type === 'error' 
                        ? 'bg-gradient-to-r from-red-500/90 to-red-600/90 backdrop-blur-sm' 
                        : 'bg-gradient-to-r from-emerald-500/90 to-green-600/90 backdrop-blur-sm'
                } animate-slide-in border border-white/20`}>
                    <div className="flex items-center p-4">
                        <div className="flex-shrink-0 mr-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                showMessage.type === 'error' ? 'bg-red-100/20' : 'bg-green-100/20'
                            }`}>
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {showMessage.type === 'error' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    )}
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-white text-sm font-medium">{showMessage.text}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-white/20">
                        <div className={`h-full animate-progress ${
                            showMessage.type === 'error' ? 'bg-red-200' : 'bg-green-200'
                        }`}></div>
                    </div>
                </div>
            )}

            {/* Enhanced Animations */}
            <style jsx>{`
                @keyframes slide-in {
                    from { 
                        opacity: 0; 
                        transform: translateX(100%) translateY(-20px) scale(0.95); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateX(0) translateY(0) scale(1); 
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-progress {
                    animation: progress 4s linear forwards;
                }
            `}</style>
        </div>
    );
};

export default Login;