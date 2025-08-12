import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle,
  Shield,
  Brain,
 Loader 
} from 'lucide-react';
import IdentityVerificationComponent from './IdentityVerification'; // Adjust path as needed

import AIAnalysisComponent from './AIAnalysis'; // Adjust path as needed

const API_URL = 'http://localhost:5000/api/claims';

const AdminClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [statistics, setStatistics] = useState({});
  const [error, setError] = useState(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
const [showIdentityVerification, setShowIdentityVerification] = useState(false);
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    risk_level: '',
    insurance_type: '',
    insurance_category: '',
    assigned_to: '',
    date_from: '',
    date_to: '',
    query: ''
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_records: 0,
    per_page: 10
  });

  // Modal states
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);

  useEffect(() => {
    loadClaims();
    loadStatistics();
  }, [filters, pagination.current_page]);


  const handleAIAnalysis = async (claim) => {
  setSelectedClaim(claim);
  setShowAIAnalysis(true);
};
const getFilteredClaims = () => {
  if (!filters.query) return claims;
  
  const query = filters.query.toLowerCase();
  return claims.filter(claim => 
    claim.claim_number?.toLowerCase().includes(query) ||
    claim.user_name?.toLowerCase().includes(query) ||
    claim.user_email?.toLowerCase().includes(query) ||
    claim.insurance_type?.toLowerCase().includes(query) ||
    claim.status?.toLowerCase().includes(query)
  );
};
const handleBatchAIAnalysis = async () => {
  if (selectedClaims.length === 0) {
    alert('Please select claims to analyze');
    return;
  }

  setAiAnalysisLoading(true);
  try {
    const response = await fetch(`${API_URL}/ai-analysis/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        claim_ids: selectedClaims,
        analysis_options: {
          perform_full_analysis: true,
          include_recommendations: true,
          include_risk_factors: true
        }
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      loadClaims(); // Refresh claims list
      setSelectedClaims([]);
      alert(`Batch AI analysis completed: ${data.successful_analyses} successful, ${data.failed_analyses} failed`);
    } else {
      alert(data.error || 'Failed to perform batch AI analysis');
    }
  } catch (err) {
    alert('Network error: ' + err.message);
  } finally {
    setAiAnalysisLoading(false);
  }
};
  const loadClaims = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.current_page,
        limit: pagination.per_page,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await fetch(`${API_URL}/admin/all?${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        setClaims(data.claims);
        setPagination(data.pagination);
        setError(null);
      } else {
        setError(data.error || 'Failed to load claims');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const queryParams = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      );
      
      const response = await fetch(`${API_URL}/admin/analytics/statistics?${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        setStatistics(data);
      }
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const handleProcessClaim = async (claimId, processData) => {
    try {
      const response = await fetch(`${API_URL}/admin/${claimId}/process`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processData)
      });

      const data = await response.json();
      
      if (response.ok) {
        loadClaims();
        setShowProcessModal(false);
        alert(`Claim ${processData.status} successfully`);
      } else {
        alert(data.error || 'Failed to process claim');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  const handleAssignClaim = async (claimId, assignData) => {
    try {
      const response = await fetch(`${API_URL}/admin/${claimId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignData)
      });

      const data = await response.json();
      
      if (response.ok) {
        loadClaims();
        setShowAssignModal(false);
        alert('Claim assigned successfully');
      } else {
        alert(data.error || 'Failed to assign claim');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  const handleUpdatePriority = async (claimId, priority, reason) => {
    try {
      const response = await fetch(`${API_URL}/admin/${claimId}/priority`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority, reason })
      });

      const data = await response.json();
      
      if (response.ok) {
        loadClaims();
        alert('Priority updated successfully');
      } else {
        alert(data.error || 'Failed to update priority');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  const handleBulkUpdate = async (updates) => {
    if (selectedClaims.length === 0) {
      alert('Please select claims to update');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/bulk-update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claim_ids: selectedClaims,
          updates
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        loadClaims();
        setSelectedClaims([]);
        setShowBulkActions(false);
        alert(`${data.updated_count} claims updated successfully`);
      } else {
        alert(data.error || 'Failed to update claims');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const toggleClaimSelection = (claimId) => {
    setSelectedClaims(prev => 
      prev.includes(claimId) 
        ? prev.filter(id => id !== claimId)
        : [...prev, claimId]
    );
  };

 const selectAllClaims = () => {
  const filteredClaims = getFilteredClaims();
  if (selectedClaims.length === filteredClaims.length) {
    setSelectedClaims([]);
  } else {
    setSelectedClaims(filteredClaims.map(claim => claim.id));
  }
};

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      under_review: 'bg-blue-100 text-blue-800',
      deleted: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      CRITICAL: 'bg-red-100 text-red-800',
      HIGH: 'bg-orange-100 text-orange-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800'
    };
    return colors[riskLevel] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('rw-RW', { 
      style: 'currency', 
      currency: 'RWF' 
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Claims Management</h1>
          <p className="mt-2 text-gray-600">Manage and process insurance claims</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Claims</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total_claims || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.approved_claims || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payout</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(statistics.total_payout || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.high_risk_claims || 0}</p>
              </div>
            </div>
          </div>
        </div>
       

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search claims..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>

              
              {selectedClaims.length > 0 && (
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Bulk Actions ({selectedClaims.length})
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="under_review">Under Review</option>
              </select>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={filters.risk_level}
                onChange={(e) => handleFilterChange('risk_level', e.target.value)}
              >
                <option value="">All Risk Levels</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={filters.insurance_type}
                onChange={(e) => handleFilterChange('insurance_type', e.target.value)}
              >
                <option value="">All Insurance Types</option>
                <option value="Health">Health</option>
                <option value="Auto">Auto</option>
                <option value="Life">Life</option>
                <option value="Property">Property</option>
              </select>
            </div>
          )}

          {/* Bulk Actions */}
          {showBulkActions && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-3">
                Bulk Actions for {selectedClaims.length} selected claims:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkUpdate({ status: 'under_review' })}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Mark Under Review
                </button>
                <button
                  onClick={() => handleBulkUpdate({ priority: 'high' })}
                  className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                >
                  Set High Priority
                </button>
               
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Claims Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
checked={selectedClaims.length === getFilteredClaims().length && getFilteredClaims().length > 0}                      onChange={selectAllClaims}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      Loading claims...
                    </td>
                  </tr>
                ) : getFilteredClaims().length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      No claims found
                    </td>
                  </tr>
                ) : (
                  getFilteredClaims().map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedClaims.includes(claim.id)}
                          onChange={() => toggleClaimSelection(claim.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {claim.claim_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {claim.insurance_type} - {claim.insurance_category}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(claim.created_at)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {claim.user_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {claim.user_email}
                          </div>
                          <div className="text-xs text-gray-400">
                            {claim.user_phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(claim.claim_amount)}
                          </div>
                          {claim.payout_amount && (
                            <div className="text-sm text-green-600">
                              Payout: {formatCurrency(claim.payout_amount)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(claim.priority)}`}>
                          {claim.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(claim.risk_level)}`}>
                            {claim.risk_level}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            Score: {(claim.fraud_score * 100).toFixed(1)}%
                          </div>
                        </div>
                      </td>
                     
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                                          <button 
                        onClick={() => {
                          setSelectedClaim(claim);
                          setShowIdentityVerification(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Verify Identity"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleAIAnalysis(claim)}
                        className="text-purple-600 hover:text-purple-900"
                        title="AI Analysis"
                      >
                        <Brain className="h-4 w-4" />
                      </button>
                        <button 
                          onClick={() => {
                            setSelectedClaim(claim);
                            setShowProcessModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Process Claim"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>

                      </div>
                    </td>
                    
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {(pagination.current_page - 1) * pagination.per_page + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total_records)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.total_records}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      const page = i + Math.max(1, pagination.current_page - 2);
                      return page <= pagination.total_pages ? (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.current_page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ) : null;
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.total_pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Process Claim Modal */}
        {showProcessModal && selectedClaim && (
          <ProcessClaimModal
            claim={selectedClaim}
            onClose={() => setShowProcessModal(false)}
            onProcess={handleProcessClaim}
          />
        )}

        {/* Assign Claim Modal */}
        {showAssignModal && selectedClaim && (
          <AssignClaimModal
            claim={selectedClaim}
            onClose={() => setShowAssignModal(false)}
            onAssign={handleAssignClaim}
          />
        )}
      </div>
      {showAIAnalysis && selectedClaim && (
  <AIAnalysisComponent
    selectedClaim={selectedClaim}
    onClose={() => {
      setShowAIAnalysis(false);
      setSelectedClaim(null);
    }}
    onAnalysisComplete={(result) => {
      console.log('AI Analysis completed:', result);
      loadClaims(); // Refresh claims list
      // Optionally show success message
      if (result.recommendations && result.recommendations.length > 0) {
        alert(`AI Analysis completed with ${result.recommendations.length} recommendations`);
      }
    }}
  />
)}
{showIdentityVerification && selectedClaim && (
        <IdentityVerificationComponent
          selectedClaim={selectedClaim}
          onClose={() => {
            setShowIdentityVerification(false);
            setSelectedClaim(null);
          }}
          onVerificationComplete={(result) => {
            console.log('Identity verification completed:', result);
            loadClaims();
            alert(`Identity ${result.status} successfully`);
          }}
        />
      )}
    </div>
  );
};


// Process Claim Modal Component
const ProcessClaimModal = ({ claim, onClose, onProcess }) => {
  const [formData, setFormData] = useState({
    status: '',
    decision_reason: '',
    payout_amount: '',
    admin_notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onProcess(claim.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Process Claim</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Claim:</strong> {claim.claim_number}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Amount:</strong> {new Intl.NumberFormat('rw-RW', { 
              style: 'currency', 
              currency: 'RWF' 
            }).format(claim.claim_amount)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decision
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Decision</option>
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
                <option value="under_review">Under Review</option>
              </select>
            </div>

            {formData.status === 'approved' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payout Amount
                </label>
                <input
                  type="number"
                  value={formData.payout_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, payout_amount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter payout amount"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decision Reason
              </label>
              <textarea
                value={formData.decision_reason}
                onChange={(e) => setFormData(prev => ({ ...prev, decision_reason: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Explain the decision..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Notes
              </label>
              <textarea
                value={formData.admin_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Process Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Assign Claim Modal Component
const AssignClaimModal = ({ claim, onClose, onAssign }) => {
  const [formData, setFormData] = useState({
    assigned_to: '',
    reason: ''
  });

  // Mock admin users - replace with actual API call
  const adminUsers = [
    { id: 1, name: 'John Admin', role: 'Senior Adjuster' },
    { id: 2, name: 'Jane Manager', role: 'Claims Manager' },
    { id: 3, name: 'Bob Reviewer', role: 'Claims Reviewer' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onAssign(claim.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Assign Claim</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Claim:</strong> {claim.claim_number}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Customer:</strong> {claim.user_name}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To
              </label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Admin</option>
                {adminUsers.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name} - {admin.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignment Reason
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Why are you assigning this claim?"
              />
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Assign Claim
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
};

export default AdminClaimsPage;