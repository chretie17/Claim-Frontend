import React, { useState, useEffect } from 'react';
import { AlertCircle, Shield, FileText, Calculator, Check, X, Clock, AlertTriangle, Plus, Search, Filter, Eye, Download, Camera, Building, Heart, User, HeartPulse,ChevronLeft, ChevronRight } from 'lucide-react';
import { DocumentHandler, DocumentUploadComponent, DocumentListComponent } from '../DocumentHandler';
import CoverageCalculator from './CoverageCalculator';
import MyClaimsComponent from './Myclaim';


// 2. Add these imports to the existing ones (if not already present)
import { TrendingUp, BarChart3, PieChart, DollarSign } from 'lucide-react';

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
    // NEW: Identification system state
    const [identificationRequirements, setIdentificationRequirements] = useState({});
    const [currentStep, setCurrentStep] = useState(1); // 1: Insurance Type, 2: Identification, 3: Claim Details
    const [identificationData, setIdentificationData] = useState({});
    const [identificationDocuments, setIdentificationDocuments] = useState({});
        
    // Form states
    const [claimForm, setClaimForm] = useState({
        insurance_type: '',
        insurance_category: '',
        claim_type: '',
        incident_date: '',
        claim_amount: '',
        description: '',
        supporting_documents: []
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
    fetchIdentificationRequirements(); // NEW
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
    // NEW: Fetch identification requirements
const fetchIdentificationRequirements = async () => {
    try {
        const response = await fetch(`${API_URL}/identification-requirements`);
        if (response.ok) {
            const requirements = await response.json();
            setIdentificationRequirements(requirements);
        } else {
            throw new Error('Failed to fetch identification requirements');
        }
    } catch (error) {
        console.error('Error fetching identification requirements:', error);
        showMessage('Failed to load identification requirements', 'error');
    }
};
// NEW: Handle identification data changes
const handleIdentificationChange = (field, value) => {
    setIdentificationData({
        ...identificationData,
        [field]: value
    });
};

// NEW: Handle identification document changes
const handleIdentificationDocumentsChange = (docType, files) => {
    setIdentificationDocuments({
        ...identificationDocuments,
        [docType]: files
    });
};

// NEW: Validate identification step
const validateIdentificationStep = () => {
    const requirements = identificationRequirements[claimForm.insurance_type];
    if (!requirements) return true;

    // Check required fields
    for (const field of requirements.required_fields) {
        if (!identificationData[field]) {
            showMessage(`${requirements.fields[field].label} is required`, 'error');
            return false;
        }
        
        // Validate field format
        const fieldConfig = requirements.fields[field];
        if (fieldConfig.pattern && identificationData[field]) {
            const regex = new RegExp(fieldConfig.pattern);
            if (!regex.test(identificationData[field])) {
                showMessage(`Invalid format for ${fieldConfig.label}`, 'error');
                return false;
            }
        }
    }

    // Check required documents
    for (const docType of requirements.required_documents) {
        if (!identificationDocuments[docType] || identificationDocuments[docType].length === 0) {
            showMessage(`${requirements.documents[docType].label} is required`, 'error');
            return false;
        }
    }

    return true;
};

// NEW: Reset identification data when insurance type changes
const handleInsuranceTypeChange = (insuranceType) => {
    setClaimForm({
        ...claimForm, 
        insurance_type: insuranceType, 
        insurance_category: '', 
        claim_type: ''
    });
    setIdentificationData({});
    setIdentificationDocuments({});
    if (insuranceType) {
        setCurrentStep(2);
    }
};

// NEW: Handle step navigation
const handleNextStep = () => {
    if (currentStep === 2 && !validateIdentificationStep()) {
        return;
    }
    setCurrentStep(currentStep + 1);
};

const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
};

// NEW: Reset all form data
const resetAllFormData = () => {
    setCurrentStep(1);
    setClaimForm({
        insurance_type: '',
        insurance_category: '',
        claim_type: '',
        incident_date: '',
        claim_amount: '',
        description: '',
        supporting_documents: []
    });
    setIdentificationData({});
    setIdentificationDocuments({});
};
    
  const fetchUserClaims = async () => {
    try {
        const response = await fetch(`${API_URL}/user/${user_id}`);
        if (response.ok) {
            const responseData = await response.json();
            // Handle the response structure correctly
            const userClaims = responseData.claims || responseData; // Try claims property first, fallback to responseData
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
            const responseData = await response.json();
            // Handle the new API response structure
            const summary = {
                total_claims: responseData.overall_summary?.total_claims || 0,
                total_claimed: responseData.overall_summary?.total_claimed_amount || 0,
                total_approved: responseData.overall_summary?.total_received || 0,
                approved_claims: responseData.overall_summary?.approved_claims || 0,
                pending_claims: responseData.overall_summary?.pending_claims || 0,
                rejected_claims: responseData.overall_summary?.rejected_claims || 0,
                under_review_claims: responseData.overall_summary?.under_review_claims || 0,
                by_insurance_type: responseData.by_insurance_type || []
            };
            setUserSummary(summary);
        }
    } catch (error) {
        console.error('Error fetching user summary:', error);
    }
};
   const handleDocumentsChange = (newDocuments) => {
    setClaimForm({
        ...claimForm,
        supporting_documents: newDocuments
    });
};

const handleDocumentError = (errorMessage) => {
    showMessage(errorMessage, 'error');
};

// Update your handleSubmitClaim function to handle files
const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!user_id) {
        showMessage('Please log in to submit a claim', 'error');
        return;
    }
    
    // Final validation
    if (!validateIdentificationStep()) {
        return;
    }
    
    setLoading(true);
    try {
        // Create FormData for file uploads
        const formData = new FormData();
        
        // Add all form fields
        formData.append('user_id', user_id);
        formData.append('insurance_type', claimForm.insurance_type);
        formData.append('insurance_category', claimForm.insurance_category);
        formData.append('claim_type', claimForm.claim_type);
        formData.append('incident_date', claimForm.incident_date);
        formData.append('claim_amount', claimForm.claim_amount);
        formData.append('description', claimForm.description);
        
        // NEW: Add identification data
        formData.append('identification_data', JSON.stringify(identificationData));
        
        // Add claim support documents
        claimForm.supporting_documents.forEach((file) => {
            formData.append('supporting_documents', file);
        });
        
        // NEW: Add identification documents
        Object.entries(identificationDocuments).forEach(([docType, files]) => {
            files.forEach(file => {
                formData.append(`identification_${docType}`, file);
            });
        });
        
        const response = await fetch(`${API_URL}/submit`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            showMessage('Claim submitted successfully! Claim ID: ' + result.data.claim_id, 'success');
            resetAllFormData(); // NEW: Reset all form data
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


// Add document handling functions for viewing existing documents
const handleDocumentDownload = async (document) => {
    try {
        const response = await fetch(`${API_URL}/documents/${document.filename}/download`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = document.original_name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    } catch (error) {
        showMessage('Failed to download document', 'error');
    }
};

const handleDocumentView = (document) => {
    // Open document in new tab
    window.open(`${API_URL}/documents/${document.filename}/view`, '_blank');
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
            },
            body: JSON.stringify({
                user_id: user_id,  // Add user_id to request body
                reason: 'Cancelled by user'  // Optional reason
            })
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
    // NEW: Render identification form based on insurance type
const renderIdentificationForm = () => {
    const requirements = identificationRequirements[claimForm.insurance_type];
    if (!requirements) return null;

    const getInsuranceIcon = (type) => {
        switch (type) {
            case 'motor': return <Camera className="h-6 w-6 text-blue-600" />;
            case 'property': return <Building className="h-6 w-6 text-green-600" />;
            case 'health': return <Heart className="h-6 w-6 text-red-600" />;
            case 'life': return <User className="h-6 w-6 text-purple-600" />;
            default: return <Shield className="h-6 w-6 text-gray-600" />;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
                {getInsuranceIcon(claimForm.insurance_type)}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        {claimForm.insurance_type.charAt(0).toUpperCase() + claimForm.insurance_type.slice(1)} Insurance Identification
                    </h2>
                    <p className="text-sm text-gray-500">Please provide the required identification details</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Required Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requirements.required_fields.map(field => {
                        const fieldConfig = requirements.fields[field];
                        
                        if (fieldConfig.type === 'select') {
                            return (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {fieldConfig.label} *
                                    </label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={identificationData[field] || ''}
                                        onChange={(e) => handleIdentificationChange(field, e.target.value)}
                                    >
                                        <option value="">Select {fieldConfig.label}</option>
                                        {fieldConfig.options.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            );
                        }
                        
                        return (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {fieldConfig.label} *
                                </label>
                                <input
                                    type={fieldConfig.type}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={fieldConfig.placeholder}
                                    value={identificationData[field] || ''}
                                    onChange={(e) => handleIdentificationChange(field, e.target.value)}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Required Documents */}
                <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900">Required Documents</h3>
                    {requirements.required_documents.map(docType => {
                        const docConfig = requirements.documents[docType];
                        
                        return (
                            <div key={docType}>
                                <DocumentUploadComponent
                                    documents={identificationDocuments[docType] || []}
                                    onDocumentsChange={(files) => handleIdentificationDocumentsChange(docType, files)}
                                    onError={handleDocumentError}
                                    disabled={loading}
                                    maxFiles={3}
                                    label={docConfig.label}
                                    description={docConfig.description}
                                    accept={docConfig.accept}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                    <button
                        type="button"
                        onClick={handlePreviousStep}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back</span>
                    </button>
                    
                    <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <span>Continue</span>
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// NEW: Render step progress
const renderStepProgress = () => {
    const steps = [
        { number: 1, title: 'Insurance Type', completed: currentStep > 1 },
        { number: 2, title: 'Identification', completed: currentStep > 2 },
        { number: 3, title: 'Claim Details', completed: false }
    ];

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                currentStep === step.number 
                                    ? 'bg-blue-600 text-white' 
                                    : step.completed 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-gray-300 text-gray-600'
                            }`}>
                                {step.completed ? <Check className="h-4 w-4" /> : step.number}
                            </div>
                            <span className={`ml-2 text-sm font-medium ${
                                currentStep === step.number ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                                {step.title}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-4 ${
                                step.completed ? 'bg-green-600' : 'bg-gray-300'
                            }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
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
               {/* Submit Claim Tab */}
{activeTab === 'submit' && (
    <div>
        {renderStepProgress()}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                {/* Step 1: Insurance Type Selection */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Select Insurance Type</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(insuranceConfig).map(([type, config]) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleInsuranceTypeChange(type)}
                                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                                        claimForm.insurance_type === type
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        {type === 'motor' && <Camera className="h-6 w-6 text-blue-600" />}
                                        {type === 'property' && <Building className="h-6 w-6 text-green-600" />}
                                        {type === 'health' && <Heart className="h-6 w-6 text-red-600" />}
                                        {type === 'life' && <User className="h-6 w-6 text-purple-600" />}
                                        <div>
                                            <h3 className="font-medium text-gray-900">{config.name}</h3>
                                            <p className="text-sm text-gray-500">{Object.keys(config.categories).length} plans available</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Identification */}
                {currentStep === 2 && renderIdentificationForm()}

                {/* Step 3: Claim Details */}
                {currentStep === 3 && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Claim Details</h2>
                        
                        <form onSubmit={handleSubmitClaim} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Coverage Category
                                    </label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                            {/* Document Upload Component */}
                            <DocumentUploadComponent
                                documents={claimForm.supporting_documents}
                                onDocumentsChange={handleDocumentsChange}
                                onError={handleDocumentError}
                                disabled={loading}
                                maxFiles={5}
                                label="Supporting Documents"
                                description="Optional - Upload photos, receipts, reports (Max 5 files, 5MB each)"
                            />

                            <div className="flex justify-between pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={handlePreviousStep}
                                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Back</span>
                                </button>
                                
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
                )}
            </div>
            
            {/* Coverage Info Sidebar - same as before */}
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
                                    <div className="pt-2 border-t">
                                        <p className="text-xs text-gray-500">{category.description}</p>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
                
                {/* User Claims Summary */}
                {userSummary && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Claims Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Claims:</span>
                                <span className="font-medium">{userSummary.total_claims}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Claimed:</span>
                                <span className="font-medium">{formatCurrency(userSummary.total_claimed)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Approved:</span>
                                <span className="font-medium text-green-600">{formatCurrency(userSummary.total_approved)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Pending:</span>
                                <span className="font-medium text-yellow-600">{userSummary.pending_claims}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Approved:</span>
                                <span className="font-medium text-green-600">{userSummary.approved_claims}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Rejected:</span>
                                <span className="font-medium text-red-600">{userSummary.rejected_claims}</span>
                            </div>
                        </div>
                        
                        {/* Insurance Type Breakdown */}
                        {userSummary.by_insurance_type && userSummary.by_insurance_type.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">By Insurance Type</h4>
                                {userSummary.by_insurance_type.map((typeData, index) => (
                                    <div key={index} className="text-xs text-gray-600 flex justify-between">
                                        <span className="capitalize">{typeData.insurance_type}:</span>
                                        <span>{typeData.total_claims} claims ({formatCurrency(typeData.total_claimed_amount)})</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
)}

              {/* My Claims Tab */}
{activeTab === 'claims' && (
    <MyClaimsComponent
        claims={claims}
        onRefresh={() => {
            fetchUserClaims();
            fetchUserSummary();
        }}
        onCancelClaim={handleCancelClaim}
        loading={loading}
    />
)}

                {/* Coverage Calculator Tab */}
                {activeTab === 'calculator' && (
    <CoverageCalculator
        insuranceConfig={insuranceConfig}
        onSubmitClaim={(calculatorData) => {
            // Pre-fill the claim form with calculator data
            setClaimForm({
                ...claimForm,
                insurance_type: calculatorData.insurance_type,
                insurance_category: calculatorData.insurance_category,
                claim_amount: calculatorData.claim_amount
            });
            // Switch to submit tab
            setActiveTab('submit');
        }}
        className=""
        showSubmitButton={true}
    />
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
                             {selectedClaim.additional_details?.supporting_documents && (
                                <div className="mt-4">
                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Supporting Documents</label>
                                    <DocumentListComponent
                                        documents={selectedClaim.additional_details.supporting_documents}
                                        onDownload={handleDocumentDownload}
                                        onView={handleDocumentView}
                                        readOnly={true}
                                        showInlineImages={true}
                                        layout="grid"
                                        apiUrl="http://localhost:5000/api/claims"
                                    />
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
                                                