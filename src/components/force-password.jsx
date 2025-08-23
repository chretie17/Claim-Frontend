
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import API_URL from '../api';

const ForcePasswordReset = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
    const navigate = useNavigate();

    // Password strength checker
    const checkPasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 3) {
        score = 5; // Maximum score for 3+ characters
    } else {
        feedback.push('At least 3 characters required');
    }

    setPasswordStrength({ score, feedback });
};

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setNewPassword(password);
        checkPasswordStrength(password);
    };

    const getStrengthColor = (score) => {
        if (score <= 2) return 'bg-red-500';
        if (score <= 3) return 'bg-yellow-500';
        if (score <= 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthText = (score) => {
        if (score <= 2) return 'Weak';
        if (score <= 3) return 'Fair';
        if (score <= 4) return 'Good';
        return 'Strong';
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Password reset submission started');
    
    if (newPassword !== confirmPassword) {
        console.log('Password mismatch error');
        setMessage({ text: 'Passwords do not match', type: 'error' });
        return;
    }

    if (newPassword.length < 3) {
        console.log('Password length error');
        setMessage({ text: 'Password must be at least 3 characters', type: 'error' });
        return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
        const token = localStorage.getItem('token');
        const requestPayload = { newPassword };
        console.log('Request payload:', requestPayload);
        console.log('Authorization token:', token);
        console.log('API URL:', `${API_URL}/users/force-password-reset`);
        
        const response = await axios.post(
            `${API_URL}/users/force-password-reset`,
            requestPayload,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Response from server:', response.data);
        setMessage({ text: response.data.message, type: 'success' });
        
        console.log('Starting redirect countdown');
        setTimeout(() => {
            console.log('Clearing local storage');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('user');
            console.log('Redirecting to login page');
            navigate('/login', { 
                state: { message: 'Password updated successfully! Please log in again.' }
            });
        }, 2000);

    } catch (error) {
        console.error('Password reset error:', error);
        console.error('Error response:', error.response);
        const errorMsg = error.response?.data?.message || 'Failed to update password. Please try again.';
        setMessage({ text: errorMsg, type: 'error' });
        setIsLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Warning Header */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-red-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
                        <div className="flex items-center">
                            <AlertTriangle className="h-6 w-6 text-white mr-3" />
                            <div>
                                <h1 className="text-xl font-bold text-white">Password Reset Required</h1>
                                <p className="text-red-100 text-sm">Your account security needs attention</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <Lock className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-medium text-red-800">Security Notice</h3>
                                    <p className="text-sm text-red-700 mt-1">
                                        Your account was created by an administrator with a temporary password. 
                                        Please set a new secure password to continue.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* New Password Field */}
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        required
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter your new password"
                                        value={newPassword}
                                        onChange={handlePasswordChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {newPassword && (
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-600">Password Strength:</span>
                                            <span className={`font-medium ${
                                                passwordStrength.score <= 2 ? 'text-red-600' :
                                                passwordStrength.score <= 3 ? 'text-yellow-600' :
                                                passwordStrength.score <= 4 ? 'text-blue-600' : 'text-green-600'
                                            }`}>
                                                {getStrengthText(passwordStrength.score)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                                                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                            ></div>
                                        </div>
                                        {passwordStrength.feedback.length > 0 && (
                                            <div className="text-xs text-gray-600">
                                                <span>Missing: {passwordStrength.feedback.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-sm text-red-600 mt-2">Passwords do not match</p>
                                )}
                            </div>

                            {/* Password Requirements */}
                           <div className="bg-gray-50 rounded-lg p-4">
    <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
    <ul className="text-xs text-gray-600 space-y-1">
        <li className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${newPassword.length >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            At least 3 characters long
        </li>
    </ul>
</div>

                            {/* Submit Button */}
                            <button
    type="submit"
    disabled={isLoading || newPassword.length < 3 || newPassword !== confirmPassword}
    className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-300 ${
        isLoading || newPassword.length < 3 || newPassword !== confirmPassword
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
    }`}

                            >
                                <div className="flex justify-center items-center">
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                            Updating Password...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-5 h-5 mr-2" />
                                            Update Password
                                        </>
                                    )}
                                </div>
                            </button>

                            {/* Message Display */}
                            {message.text && (
                                <div className={`p-4 rounded-lg border ${
                                    message.type === 'error' 
                                        ? 'bg-red-50 border-red-200 text-red-700' 
                                        : 'bg-green-50 border-green-200 text-green-700'
                                }`}>
                                    <div className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${
                                            message.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                                        }`}></div>
                                        <p className="text-sm font-medium">{message.text}</p>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                                🔒 This is a secure connection. Your password will be encrypted and stored safely.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Help Text */}
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Need help? Contact your administrator or IT support team.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForcePasswordReset;
            