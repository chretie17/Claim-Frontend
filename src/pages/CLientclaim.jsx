import React, { useState, useEffect } from 'react';
import { AlertCircle, Shield, FileText, Calculator, Check, X, Clock, AlertTriangle, Plus, Search, Filter, Eye, Download } from 'lucide-react';

const InsuranceClientPage = () => {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const user_id = user?.id;
    
    const [activeTab, setActiveTab] = useState('submit');
    const [claims, setClaims] = useState([]);
    const [insuranceConfig, setInsuranceConfig] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '', visible: false });
    const [userSummary, setUserSummary] = useState(null);
    
    // Form states
    const [claimForm, setClaimForm] = useState({
        insurance_type: '',
        insurance_category: '',
        claim_type: '',
        incident_date: '',
        claim_amount: '',
        description: ''
    });
    
    // Quote calculator state
    const [quoteForm, setQuoteForm] = useState({
        insurance_type: '',
        insurance_category: '',
        claim_amount: ''
    });
    const [quoteResult, setQuoteResult] = useState(null);
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedClaim, setSelectedClaim] = useState(null);
    
    // API base URL - replace with your actual API endpoint
    const API_URL = 'http://localhost:5000/api/claims';
    
    useEffect(() => {
        fetchInsuranceConfig();
        if (user_id) {
            fetchUserClaims();
            fetchUserSummary();
        }
    }, [user_id]);
    
    const fetchInsuranceConfig = async () => {
        try {
            const response = await fetch(`${API_URL}/config`);
            if (response.ok) {
                const config = await response.json();
                setInsuranceConfig(config);
            } else {
                throw new Error('Failed to fetch insurance config');
            }
        } catch (error) {
            console.error('Error fetching insurance config:', error);
            showMessage('Failed to load insurance configuration', 'error');
        }
    };
    
    const fetchUserClaims = async () => {
        try {
            const response = await fetch(`${API_URL}/user/${user_id}`);
            if (response.ok) {
                const userClaims = await response.json();
                // Ensure userClaims is always an array
                setClaims(Array.isArray(userClaims) ? userClaims : []);
            } else {
                throw new Error('Failed to fetch claims');
            }
        } catch (error) {
            console.error('Error fetching user claims:', error);
            setClaims([]); // Set empty array on error
            showMessage('Failed to load your claims', 'error');
        }
    };
    
    const fetchUserSummary = async () => {
        try {
            const response = await fetch(`${API_URL}/user/${user_id}/summary`);
            if (response.ok) {
                const summary = await response.json();
                setUserSummary(summary);
            }
        } catch (error) {
            console.error('Error fetching user summary:', error);
        }
    };
    
    const handleSubmitClaim = async (e) => {
        e.preventDefault();
        if (!user_id) {
            showMessage('Please log in to submit a claim', 'error');
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...claimForm,
                    user_id
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                showMessage('Claim submitted successfully! Claim Number: ' + result.claim_number, 'success');
                setClaimForm({
                    insurance_type: '',
                    insurance_category: '',
                    claim_type: '',
                    incident_date: '',
                    claim_amount: '',
                    description: ''
                });
                fetchUserClaims();
                fetchUserSummary();
                setActiveTab('claims');
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to submit claim');
            }
        } catch (error) {
            console.error('Error submitting claim:', error);
            showMessage(error.message || 'Failed to submit claim', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const handleCalculateQuote = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/quote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quoteForm)
            });
            
            if (response.ok) {
                const result = await response.json();
                setQuoteResult(result);
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to calculate quote');
            }
        } catch (error) {
            console.error('Error calculating quote:', error);
            showMessage(error.message || 'Failed to calculate coverage quote', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const handleCancelClaim = async (claimId) => {
        try {
            const response = await fetch(`${API_URL}/${claimId}/cancel`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                showMessage('Claim cancelled successfully', 'success');
                fetchUserClaims();
                fetchUserSummary();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to cancel claim');
            }
        } catch (error) {
            console.error('Error cancelling claim:', error);
            showMessage(error.message || 'Failed to cancel claim', 'error');
        }
    };
    
    const fetchClaimDetails = async (claimId) => {
        try {
            const response = await fetch(`${API_URL}/${claimId}`);
            if (response.ok) {
                const claimDetails = await response.json();
                setSelectedClaim(claimDetails);
            } else {
                throw new Error('Failed to fetch claim details');
            }
        } catch (error) {
            console.error('Error fetching claim details:', error);
            showMessage('Failed to load claim details', 'error');
        }
    };

const showMessage = (text, type = 'success') => {
        setMessage({ text, type, visible: true });
        setTimeout(() => {
            setMessage({ text: '', type: '', visible: false });
        }, 5000);
    };
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0
        }).format(amount);
    };
    
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'text-green-600 bg-green-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'processing': return 'text-blue-600 bg-blue-100';
            case 'cancelled': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    
    const getRiskLevelColor = (riskLevel) => {
        switch (riskLevel?.toUpperCase()) {
            case 'LOW': return 'text-green-600 bg-green-100';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
            case 'HIGH': return 'text-orange-600 bg-orange-100';
            case 'CRITICAL': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    
    const filteredClaims = Array.isArray(claims) ? claims.filter(claim => {
        const matchesSearch = searchTerm === '' || 
            claim.claim_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.claim_type?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterStatus === '' || claim.status === filterStatus;
        
        return matchesSearch && matchesFilter;
    }) : [];

    if (!user_id) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600 mb-4">Please log in to access your insurance claims.</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Insurance Claims Portal</h1>
                                <p className="text-sm text-gray-500">Welcome back, {user.name || 'User'}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">User ID: {user_id}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'submit', label: 'Submit Claim', icon: Plus },
                            { id: 'claims', label: 'My Claims', icon: FileText },
                            { id: 'calculator', label: 'Coverage Calculator', icon: Calculator }
                        ].map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Submit Claim Tab */}
                {activeTab === 'submit' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Submit New Claim</h2>
                                
                                <form onSubmit={handleSubmitClaim} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Insurance Type
                                            </label>
                                            <select
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                value={claimForm.insurance_type}
                                                onChange={(e) => setClaimForm({...claimForm, insurance_type: e.target.value, insurance_category: '', claim_type: ''})}
                                            >
                                                <option value="">Select insurance type</option>
                                                {Object.keys(insuranceConfig).map(type => (
                                                    <option key={type} value={type}>
                                                        {insuranceConfig[type]?.name || type}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Coverage Category
                                            </label>
                                            <select
                                                required
                                                disabled={!claimForm.insurance_type}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                                value={claimForm.insurance_category}
                                                onChange={(e) => setClaimForm({...claimForm, insurance_category: e.target.value})}
                                            >
                                                <option value="">Select category</option>
                                                {claimForm.insurance_type && insuranceConfig[claimForm.insurance_type]?.categories && 
                                                    Object.keys(insuranceConfig[claimForm.insurance_type].categories).map(category => (
                                                        <option key={category} value={category}>
                                                            {insuranceConfig[claimForm.insurance_type].categories[category].name}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Claim Type
                                            </label>
                                            <select
                                                required
                                                disabled={!claimForm.insurance_type}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                                value={claimForm.claim_type}
                                                onChange={(e) => setClaimForm({...claimForm, claim_type: e.target.value})}
                                            >
                                                <option value="">Select claim type</option>
                                                {claimForm.insurance_type && insuranceConfig[claimForm.insurance_type]?.claim_types?.map(type => (
                                                    <option key={type} value={type}>
                                                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Incident Date
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                value={claimForm.incident_date}
                                                onChange={(e) => setClaimForm({...claimForm, incident_date: e.target.value})}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Claim Amount (RWF)
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter claim amount"
                                                value={claimForm.claim_amount}
                                                onChange={(e) => setClaimForm({...claimForm, claim_amount: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            required
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Provide detailed description of the incident..."
                                            value={claimForm.description}
                                            onChange={(e) => setClaimForm({...claimForm, description: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
                                                loading 
                                                    ? 'bg-gray-400 cursor-not-allowed' 
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                        >
                                            {loading ? 'Submitting...' : 'Submit Claim'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        {/* Coverage Info Sidebar */}
                        <div className="space-y-6">
                            {claimForm.insurance_type && claimForm.insurance_category && (
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage Details</h3>
                                    {(() => {
                                        const category = insuranceConfig[claimForm.insurance_type]?.categories[claimForm.insurance_category];
                                        if (!category) return null;
                                        
                                        return (
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Plan:</span>
                                                    <span className="font-medium">{category.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Coverage:</span>
                                                    <span className="font-medium text-green-600">{category.coverage_percentage}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Max Claim:</span>
                                                    <span className="font-medium">{formatCurrency(category.max_claim_amount)}</span>
                                                </div>
                                                <div className="pt-2 border-t">
                                                    <p className="text-xs text-gray-500">{category.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                            
                            {userSummary && (
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Claims Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total Claims:</span>
                                            <span className="font-medium">{userSummary.total_claims || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total Claimed:</span>
                                            <span className="font-medium">{formatCurrency(userSummary.total_claimed || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total Approved:</span>
                                            <span className="font-medium text-green-600">{formatCurrency(userSummary.total_approved || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* My Claims Tab */}
                {activeTab === 'claims' && (
                    <div>
                        {/* Search and Filter Bar */}
                        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search claims by number, type, or description..."
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <select
                                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="processing">Processing</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        {/* Claims List */}
                        <div className="space-y-4">
                            {filteredClaims.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Claims Found</h3>
                                    <p className="text-gray-500 mb-4">
                                        {claims.length === 0 
                                            ? "You haven't submitted any claims yet." 
                                            : "No claims match your search criteria."
                                        }
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('submit')}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Submit Your First Claim
                                    </button>
                                </div>
                            ) : (
                                filteredClaims.map(claim => (
                                    <div key={claim.id} className="bg-white rounded-lg shadow-sm border p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4 mb-3">
                                                    <h3 className="text-lg font-semibold text-gray-900">{claim.claim_number}</h3>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                                                        {claim.status?.toUpperCase() || 'UNKNOWN'}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(claim.priority)}`}>
                                                        {claim.priority?.toUpperCase() || 'MEDIUM'}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Type:</span>
                                                        <p className="font-medium capitalize">{claim.insurance_type} - {claim.insurance_category}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Claim Type:</span>
                                                        <p className="font-medium capitalize">{claim.claim_type?.replace('_', ' ')}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Amount:</span>
                                                        <p className="font-medium">{formatCurrency(claim.claim_amount)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Est. Payout:</span>
                                                        <p className="font-medium text-green-600">{formatCurrency(claim.estimated_payout || 0)}</p>
                                                    </div>
                                                </div>
                                                
                                                {claim.description && (
                                                    <div className="mt-3">
                                                        <span className="text-gray-500 text-sm">Description:</span>
                                                        <p className="text-gray-700 text-sm mt-1">{claim.description}</p>
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                                                    <span>Risk Level: <span className={`font-medium ${getRiskLevelColor(claim.risk_level).split(' ')[0]}`}>{claim.risk_level}</span></span>
                                                    <span>Fraud Score: {claim.fraud_score}/100</span>
                                                    <span>Submitted: {new Date(claim.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex space-x-2 ml-4">
                                                <button
                                                    onClick={() => fetchClaimDetails(claim.id)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                {claim.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancelClaim(claim.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Cancel Claim"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Coverage Calculator Tab */}
                {activeTab === 'calculator' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Coverage Calculator</h2>
                            
                            <form onSubmit={handleCalculateQuote} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Insurance Type
                                    </label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={quoteForm.insurance_type}
                                        onChange={(e) => setQuoteForm({...quoteForm, insurance_type: e.target.value, insurance_category: ''})}
                                    >
                                        <option value="">Select insurance type</option>
                                        {Object.keys(insuranceConfig).map(type => (
                                            <option key={type} value={type}>
                                                {insuranceConfig[type]?.name || type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Coverage Category
                                    </label>
                                    <select
                                        required
                                        disabled={!quoteForm.insurance_type}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                        value={quoteForm.insurance_category}
                                        onChange={(e) => setQuoteForm({...quoteForm, insurance_category: e.target.value})}
                                    >
                                        <option value="">Select category</option>
                                        {quoteForm.insurance_type && insuranceConfig[quoteForm.insurance_type]?.categories && 
                                            Object.keys(insuranceConfig[quoteForm.insurance_type].categories).map(category => (
                                                <option key={category} value={category}>
                                                    {insuranceConfig[quoteForm.insurance_type].categories[category].name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Claim Amount (RWF)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter potential claim amount"
                                        value={quoteForm.claim_amount}
                                        onChange={(e) => setQuoteForm({...quoteForm, claim_amount: e.target.value})}
                                    />
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                                        loading 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                >
                                    {loading ? 'Calculating...' : 'Calculate Coverage'}
                                </button>
                            </form>
                        </div>
                        
                        {/* Quote Results */}
                        {quoteResult && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Coverage Calculation</h3>
                                
                                <div className="space-y-4">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Claimed Amount:</span>
                                            <span className="font-semibold text-lg">{formatCurrency(quoteResult.claimed_amount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Eligible Amount:</span>
                                            <span className="font-medium">{formatCurrency(quoteResult.eligible_amount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Coverage Percentage:</span>
                                            <span className="font-medium text-blue-600">{quoteResult.coverage_percentage}%</span>
                                        </div>
                                        <hr className="my-3" />
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-700 font-medium">You'll Receive:</span>
                                            <span className="font-bold text-xl text-green-600">{formatCurrency(quoteResult.covered_amount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700">Your Liability:</span>
                                            <span className="font-medium text-red-600">{formatCurrency(quoteResult.customer_liability)}</span>
                                        </div>
                                        
                                        {quoteResult.exceeded_limit && (
                                            <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                    <span className="text-sm text-yellow-800">
                                                        Claim amount exceeds policy maximum. Only eligible amount will be considered.
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Claim Details Modal */}
            {selectedClaim && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Claim Details</h3>
                                <button
                                    onClick={() => setSelectedClaim(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Claim Number</label>
                                    <p className="font-mono text-sm">{selectedClaim.claim_number}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Policy Number</label>
                                    <p>{selectedClaim.policy_number}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Insurance Type</label>
                                    <p className="capitalize">{selectedClaim.insurance_type} - {selectedClaim.insurance_category}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Claim Type</label>
                                    <p className="capitalize">{selectedClaim.claim_type?.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Incident Date</label>
                                    <p>{selectedClaim.incident_date ? new Date(selectedClaim.incident_date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Claim Amount</label>
                                    <p className="font-semibold">{formatCurrency(selectedClaim.claim_amount)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Estimated Payout</label>
                                    <p className="font-semibold text-green-600">{formatCurrency(selectedClaim.estimated_payout || 0)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Coverage Percentage</label>
                                    <p>{selectedClaim.coverage_percentage}%</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Risk Assessment</label>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(selectedClaim.risk_level)}`}>
                                            {selectedClaim.risk_level}
                                        </span>
                                        <span className="text-xs text-gray-500">({selectedClaim.fraud_score}/100)</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Submitted</label>
                                    <p>{new Date(selectedClaim.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                            
                            {selectedClaim.description && (
                                <div className="mt-4">
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedClaim.description}</p>
                                </div>
                            )}
                            
                            <div className="mt-6 flex justify-end space-x-3">
                                {selectedClaim.status === 'pending' && (
                                    <button
                                        onClick={() => {
                                            handleCancelClaim(selectedClaim.id);
                                            setSelectedClaim(null);
                                        }}
                                        className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        Cancel Claim
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedClaim(null)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Toast */}
            {message.visible && (
                <div className={`fixed bottom-4 right-4 z-50 rounded-lg shadow-xl max-w-sm overflow-hidden ${
                    message.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'
                } transition-all duration-300`}>
                    <div className="flex items-center px-4 py-3">
                        {message.type === 'error' ? (
                            <AlertCircle className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                        ) : (
                            <Check className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                        )}
                        <p className="text-white text-sm">{message.text}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsuranceClientPage;
                                                