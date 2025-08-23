import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [showMessage, setShowMessage] = useState({ visible: false, text: '', type: 'success' });
    const [resetSuccess, setResetSuccess] = useState(false);
    const navigate = useNavigate();
    
    const token = searchParams.get('token');
    const API_URL = 'http://localhost:5000/api'; // Update with your API URL

    // Validate token on component mount
    useEffect(() => {
        if (!token) {
            displayMessage('Invalid reset link. Please request a new password reset.', 'error');
            setIsValidating(false);
            return;
        }

        const validateToken = async () => {
            try {
                await axios.get(`${API_URL}/users/verify-reset-token/${token}`);
                setIsValidToken(true);
            } catch (error) {
                const errorMsg = error.response?.data?.message || 'Invalid or expired reset link.';
                displayMessage(errorMsg, 'error');
                setIsValidToken(false);
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            displayMessage('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            displayMessage('Password must be at least 6 characters long', 'error');
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await axios.post(`${API_URL}/users/reset-password-token`, {
                token,
                newPassword: password
            });
            
            displayMessage(response.data.message, 'success');
            setResetSuccess(true);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
            
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to reset password. Please try again.';
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

    const getPasswordStrength = (password) => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
        if (password.length < 8) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
        if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return { strength: 4, label: 'Strong', color: 'bg-green-500' };
        }
        return { strength: 3, label: 'Good', color: 'bg-blue-500' };
    };

    const passwordStrength = getPasswordStrength(password);

    if (isValidating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
                <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl p-8 text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Validating Reset Link</h2>
                    <p className="text-gray-600">Please wait while we verify your reset token...</p>
                </div>
            </div>
        );
    }

    if (!isValidToken) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl p-8 text-center">
                        <div className="bg-red-100 p-4 rounded-2xl w-fit mx-auto mb-6">
                            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h1>
                        <p className="text-gray-600 mb-6">This password reset link is invalid or has expired. Please request a new one.</p>
                        
                        <div className="space-y-3">
                            <Link
                                to="/forgot-password"
                                className="block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-center hover:from-blue-700 hover:to-indigo-700 transition-colors"
                            >
                                Request New Reset Link
                            </Link>
                            <Link
                                to="/login"
                                className="block w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium text-center hover:bg-gray-200 transition-colors"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                    {!resetSuccess ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-lg w-fit mx-auto mb-6">
                                    <Lock className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
                                <p className="text-gray-600">Enter your new password below to complete the reset process.</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter your new password"
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
                                    
                                    {/* Password Strength Indicator */}
                                    {password && (
                                        <div className="mt-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-gray-600">Password Strength</span>
                                                <span className={`text-xs font-medium ${
                                                    passwordStrength.strength === 1 ? 'text-red-500' :
                                                    passwordStrength.strength === 2 ? 'text-yellow-500' :
                                                    passwordStrength.strength === 3 ? 'text-blue-500' :
                                                    'text-green-500'
                                                }`}>
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                    style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            className={`w-full pl-10 pr-12 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                                confirmPassword && password !== confirmPassword
                                                    ? 'border-red-300 focus:ring-red-500'
                                                    : confirmPassword && password === confirmPassword
                                                    ? 'border-green-300 focus:ring-green-500'
                                                    : 'border-gray-300 focus:ring-blue-500'
                                            }`}
                                            placeholder="Confirm your new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    
                                    {/* Password Match Indicator */}
                                    {confirmPassword && (
                                        <div className="mt-2 flex items-center text-sm">
                                            {password === confirmPassword ? (
                                                <>
                                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                                    <span className="text-green-600">Passwords match</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="h-4 w-4 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-red-600">Passwords do not match</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || password !== confirmPassword || password.length < 6}
                                    className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-300 ${
                                        isLoading || password !== confirmPassword || password.length < 6
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                                    }`}
                                >
                                    <div className="flex justify-center items-center">
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                                Resetting Password...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-5 h-5 mr-2" />
                                                Reset Password
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>

                            {/* Password Requirements */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        At least 6 characters long
                                    </li>
                                    <li className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${/(?=.*[a-z])(?=.*[A-Z])/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        Contains both uppercase and lowercase letters
                                    </li>
                                    <li className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${/(?=.*\d)/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        Contains at least one number
                                    </li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Success State */}
                            <div className="text-center">
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-lg w-fit mx-auto mb-6">
                                    <CheckCircle className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">Password Reset Successful!</h1>
                                
                                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                                    <p className="text-green-800 font-medium mb-2">Your password has been updated</p>
                                    <p className="text-green-700 text-sm">
                                        You can now use your new password to sign in to your ClaimGuard account.
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                    <p className="text-blue-800 text-sm">
                                        🚀 Redirecting you to the login page in a few seconds...
                                    </p>
                                </div>

                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors"
                                >
                                    Continue to Login
                                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                {/* Security Notice */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-blue-200 mb-2">🔒 Your account is now secure</p>
                    <p className="text-xs text-blue-300">
                        Make sure to keep your new password safe and don't share it with anyone
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 9 9 0118 0z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    )}
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white">
                                {showMessage.text}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResetPassword;
