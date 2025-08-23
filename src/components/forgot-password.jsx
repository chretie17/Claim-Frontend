import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mail, Shield } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showMessage, setShowMessage] = useState({ visible: false, text: '', type: 'success' });
    const [emailSent, setEmailSent] = useState(false);
    const navigate = useNavigate();

    const API_URL = 'http://localhost:5000/api'; // Update with your API URL

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await axios.post(`${API_URL}/users/forgot-password`, { email });
            displayMessage(response.data.message, 'success');
            setEmailSent(true);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Something went wrong. Please try again.';
            displayMessage(errorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const displayMessage = (text, type = 'success') => {
        setShowMessage({ visible: true, text, type });
        setTimeout(() => {
            setShowMessage({ visible: false, text: '', type: 'success' });
        }, 5000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
            {/* Floating Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Back Button */}
                <div className="mb-6">
                    <Link 
                        to="/login"
                        className="inline-flex items-center text-blue-300 hover:text-blue-200 transition-colors group"
                    >
                        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl p-8">
                    {!emailSent ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg w-fit mx-auto mb-6">
                                    <Shield className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                                <p className="text-gray-600">Don't worry! Enter your email address and we'll send you a link to reset your password.</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
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
                                                Sending Reset Link...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-5 h-5 mr-2" />
                                                Send Reset Link
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                                <p className="text-sm text-gray-600">
                                    Remember your password?{' '}
                                    <Link 
                                        to="/login" 
                                        className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                    >
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Success State */}
                            <div className="text-center">
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-lg w-fit mx-auto mb-6">
                                    <Mail className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email!</h1>
                                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                                    <p className="text-green-800 font-medium mb-2">Reset link sent successfully</p>
                                    <p className="text-green-700 text-sm">
                                        We've sent a password reset link to <strong>{email}</strong>. 
                                        Please check your inbox and follow the instructions to reset your password.
                                    </p>
                                </div>
                                
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                    <p className="text-amber-800 text-sm">
                                        <strong>⏰ Note:</strong> The reset link will expire in 1 hour for security reasons.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            setEmailSent(false);
                                            setEmail('');
                                        }}
                                        className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Send to Different Email
                                    </button>
                                    
                                    <Link
                                        to="/login"
                                        className="block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-center hover:from-blue-700 hover:to-indigo-700 transition-colors"
                                    >
                                        Back to Login
                                    </Link>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        Didn't receive the email? Check your spam folder or{' '}
                                        <button 
                                            onClick={handleSubmit}
                                            className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                                        >
                                            resend the link
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Security Notice */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-blue-200 mb-2">🔒 Your security is our priority</p>
                    <p className="text-xs text-blue-300">
                        For your protection, password reset links expire after 1 hour
                    </p>
                </div>
            </div>

            {/* Message Notification */}
            {showMessage.visible && (
                <div className={`fixed top-6 right-6 z-50 max-w-sm overflow-hidden rounded-xl shadow-2xl transform transition-all duration-500 ${
                    showMessage.type === 'error' 
                        ? 'bg-red-500' 
                        : 'bg-green-500'
                } animate-slide-in`}>
                    <div className="flex items-center p-4">
                        <div className="flex-shrink-0 mr-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
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
                    animation: progress 5s linear forwards;
                }
            `}</style>
        </div>
    );
};

export default ForgotPassword;