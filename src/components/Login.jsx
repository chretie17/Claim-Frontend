
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import API_URL from '../api';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Image from '../assets/prime-insurance.jpeg';

const Login = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showMessage, setShowMessage] = useState({ visible: false, text: '', type: 'success' });
    const navigate = useNavigate();
    const location = useLocation();

    // Display message from location state (e.g., from password reset)
    useEffect(() => {
        if (location.state?.message) {
            displayMessage(location.state.message, location.state.type || 'success');
            // Clear the state to prevent showing the message again
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/users/login`, { usernameOrEmail, password });
            
            // Check if password reset is required
            if (response.data.mustResetPassword) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                displayMessage('Password reset required. You will be redirected to set a new password.', 'warning');
                
                setTimeout(() => {
                    navigate('/force-password-reset');
                }, 2000);
                return;
            }

            // Normal login flow
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

    const getMessageStyles = (type) => {
        switch (type) {
            case 'error':
                return 'bg-red-500';
            case 'warning':
                return 'bg-orange-500';
            case 'success':
            default:
                return 'bg-green-500';
        }
    };

    const getMessageIcon = (type) => {
        switch (type) {
            case 'error':
                return (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                );
            case 'warning':
                return (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                );
            case 'success':
            default:
                return (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex">
            {/* Left Panel - Hero Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 z-10"></div>
                <img 
                    src={Image} 
                    alt="Prime Insurance" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-center p-12 text-white">
                    <div className="max-w-lg">
                        <h2 className="text-4xl font-bold mb-6">Protect What Matters Most</h2>
                        <p className="text-xl mb-8 text-blue-100">
                            Your trusted partner in comprehensive insurance solutions. 
                            Secure your future with ClaimGuard's advanced protection plans.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-blue-100">24/7 Claims Processing</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-blue-100">Instant Policy Management</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-blue-100">Expert Support Team</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
                
                <div className="w-full max-w-md relative z-10">
                    {/* Mobile Logo */}
                    <div className="flex items-center justify-center mb-8 lg:hidden">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h1 className="text-2xl font-bold text-gray-900">ClaimGuard</h1>
                            <p className="text-blue-600 text-sm">Insurance Solutions</p>
                        </div>
                    </div>

                    {/* Desktop Logo */}
                    <div className="hidden lg:flex items-center justify-center mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h1 className="text-3xl font-bold text-gray-900">ClaimGuard</h1>
                            <p className="text-blue-600">Insurance Solutions</p>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-600">Access your claim management portal</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 lg:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-2">
                                        Username or Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="usernameOrEmail"
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter your username or email"
                                            value={usernameOrEmail}
                                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>
                                
                                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-300 ${
                                    isLoading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
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
                                            Sign In to ClaimGuard
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link 
                                    to="/register" 
                                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                >
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Security Badges */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500 mb-3">Enterprise-grade security platform</p>
                        <div className="flex justify-center space-x-6">
                            <div className="flex items-center text-xs text-gray-500">
                                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                SOC 2 Certified
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                                <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                256-bit SSL
                            </div>
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div className="mt-4 text-center">
                        <span className="text-xs text-gray-500">
                            By accessing this system, you agree to our{' '}
                            <Link to="/terms" className="text-blue-600 hover:text-blue-500 underline transition-colors">Terms of Service</Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="text-blue-600 hover:text-blue-500 underline transition-colors">Privacy Policy</Link>
                        </span>
                    </div>
                </div>
            </div>

            {/* Message Notification */}
            {showMessage.visible && (
                <div className={`fixed top-6 right-6 z-50 max-w-sm overflow-hidden rounded-xl shadow-2xl transform transition-all duration-500 ${getMessageStyles(showMessage.type)} animate-slide-in`}>
                    <div className="flex items-center p-4">
                        <div className="flex-shrink-0 mr-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {getMessageIcon(showMessage.type)}
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-white text-sm font-medium">{showMessage.text}</p>
                        </div>
                    </div>
                    <div className="h-1 bg-white/20">
                        <div className={`h-full animate-progress ${
                            showMessage.type === 'error' ? 'bg-red-200' : 
                            showMessage.type === 'warning' ? 'bg-orange-200' : 'bg-green-200'
                        }`}></div>
                    </div>
                </div>
            )}

            {/* Animations */}
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