// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Signup';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';
import CommunityPost from './pages/Forum/CommunityPost';
import AdminContentManagement from './pages/AdminPosts';
import ForgotPassword from './components/forgot-password';
import ResetPassword from './components/reset-password';
import Reports from './pages/Report';
import CommunicationHub from './pages/Chat';
import InsuranceClientPage from './pages/clientclaim/CLientclaim';
import AdminClaimsPage from './pages/AdminClaim';
import UserReportsPage from './pages/UserReport';
import ForcePasswordReset from './components/force-password';

const App = () => {
    const [role, setRole] = useState(localStorage.getItem('role'));

    useEffect(() => {
        const handleRoleChange = () => {
            setRole(localStorage.getItem('role'));
        };
        window.addEventListener('roleChange', handleRoleChange);
        return () => {
            window.removeEventListener('roleChange', handleRoleChange);
        };
    }, []);

    return (
        <BrowserRouter>
            {!role && <Navbar />}
            {(role === 'client') && <Navbar loggedIn />}
<div className="flex">
  {/* Sidebar for admin and manager */}
  {(role === 'admin' || role === 'claim-manager') && role !== null && <Sidebar />}

  {/* Main content area with conditional left margin */}
  <div className={`flex-1 p-4 ${role === 'admin' || role === 'claim-manager' ? 'ml-64' : ''}`}>
    <Routes>
        
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forum" element={<CommunityPost />} />
                        <Route path="/chat" element={<CommunicationHub />} />
                        <Route path="/adminforums" element={<AdminContentManagement />} />
                        <Route path="/force-password-reset" element={<ForcePasswordReset />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/manage-users" element={<ManageUsers />} />
                        <Route path="/client-claim" element={<InsuranceClientPage />} />
                        <Route path="/admin-claim" element={<AdminClaimsPage />} />
                        <Route path="/user-report" element={<UserReportsPage />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
};

export default App;