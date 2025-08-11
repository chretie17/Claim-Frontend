import React, { useState } from 'react';
import { 
    Search, Filter, Eye, X, Download, ExternalLink,
    FileText, Calendar, DollarSign, Clock, CheckCircle, XCircle,
    AlertCircle, Camera, Building, Heart, User, Shield, Image,
    FileImage, File, ZoomIn, ZoomOut, RotateCw
} from 'lucide-react';

const MyClaimsComponent = ({ 
    claims = [], 
    onRefresh, 
    onCancelClaim, 
    loading = false,
    apiUrl = 'http://localhost:5000/api/claims'
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [viewingDocument, setViewingDocument] = useState(null);
    const [imageZoom, setImageZoom] = useState(1);
    const [imageRotation, setImageRotation] = useState(0);

    // Helper functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'text-green-700 bg-green-100';
            case 'rejected': return 'text-red-700 bg-red-100';
            case 'pending': return 'text-yellow-700 bg-yellow-100';
            case 'processing': return 'text-blue-700 bg-blue-100';
            case 'cancelled': return 'text-gray-700 bg-gray-100';
            default: return 'text-gray-700 bg-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return <CheckCircle className="h-4 w-4" />;
            case 'rejected': return <XCircle className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'processing': return <AlertCircle className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getInsuranceIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'motor': return <Camera className="h-5 w-5 text-blue-600" />;
            case 'property': return <Building className="h-5 w-5 text-green-600" />;
            case 'health': return <Heart className="h-5 w-5 text-red-600" />;
            case 'life': return <User className="h-5 w-5 text-purple-600" />;
            default: return <Shield className="h-5 w-5 text-gray-600" />;
        }
    };

    // Get document type icon
    const getDocumentIcon = (filename, mimetype) => {
        if (mimetype?.startsWith('image/')) {
            return <FileImage className="h-4 w-4" />;
        } else if (mimetype === 'application/pdf') {
            return <FileText className="h-4 w-4" />;
        } else {
            return <File className="h-4 w-4" />;
        }
    };

    // Get document preview URL
    const getDocumentPreviewUrl = (filename) => {
        return `${apiUrl}/documents/${filename}/view`;
    };

    // Handle document viewing
    const handleViewDocument = (document, docType = 'support') => {
        setViewingDocument({ 
            ...document, 
            docType,
            previewUrl: getDocumentPreviewUrl(document.filename)
        });
        setImageZoom(1);
        setImageRotation(0);
    };

    // Document viewer component
    const DocumentViewer = ({ document, onClose }) => {
        const isImage = document.mimetype?.startsWith('image/');
        const isPdf = document.mimetype === 'application/pdf';

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center space-x-3">
                            {getDocumentIcon(document.filename, document.mimetype)}
                            <div>
                                <h3 className="font-medium text-gray-900">{document.original_name}</h3>
                                <p className="text-sm text-gray-500 capitalize">
                                    {document.docType} Document • {document.mimetype}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            {isImage && (
                                <>
                                    <button
                                        onClick={() => setImageZoom(prev => Math.max(0.25, prev - 0.25))}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                        title="Zoom Out"
                                    >
                                        <ZoomOut className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm text-gray-600">{Math.round(imageZoom * 100)}%</span>
                                    <button
                                        onClick={() => setImageZoom(prev => Math.min(3, prev + 0.25))}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                        title="Zoom In"
                                    >
                                        <ZoomIn className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setImageRotation(prev => (prev + 90) % 360)}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                        title="Rotate"
                                    >
                                        <RotateCw className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => window.open(document.previewUrl, '_blank')}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="Open in New Tab"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-4 bg-gray-50">
                        {isImage ? (
                            <div className="flex justify-center items-center min-h-full">
                                <img
                                    src={document.previewUrl}
                                    alt={document.original_name}
                                    className="max-w-full max-h-full object-contain shadow-lg"
                                    style={{ 
                                        transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                                        transformOrigin: 'center'
                                    }}
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZmFmYiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjdiODQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
                                    }}
                                />
                            </div>
                        ) : isPdf ? (
                            <iframe
                                src={document.previewUrl}
                                className="w-full h-full min-h-96 border-0 rounded"
                                title={document.original_name}
                                onError={() => {
                                    console.log('PDF preview failed');
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-96 text-gray-500">
                                <File className="h-16 w-16 mb-4" />
                                <p className="text-lg font-medium mb-2">Preview not available</p>
                                <p className="text-sm mb-4">This file type cannot be previewed in the browser.</p>
                                <button
                                    onClick={() => window.open(document.previewUrl, '_blank')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Open in New Tab
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Filter claims
    const filteredClaims = claims.filter(claim => {
        const matchesSearch = searchTerm === '' || 
            claim.claim_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.claim_type?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterStatus === '' || claim.status === filterStatus;
        
        return matchesSearch && matchesFilter;
    });

    // Calculate quick stats
    const stats = {
        total: claims.length,
        approved: claims.filter(c => c.status === 'approved').length,
        pending: claims.filter(c => c.status === 'pending').length,
        totalClaimed: claims.reduce((sum, c) => sum + parseFloat(c.claim_amount || 0), 0),
        totalApproved: claims.reduce((sum, c) => sum + parseFloat(c.estimated_payout || 0), 0)
    };

    return (
        <div className="space-y-6">
            {/* Header with Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">My Claims</h2>
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            disabled={loading}
                            className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Refresh'}
                        </button>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-sm text-gray-600">Total Claims</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                        <p className="text-sm text-gray-600">Approved</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalClaimed)}</p>
                        <p className="text-sm text-gray-600">Total Claimed</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">{formatCurrency(stats.totalApproved)}</p>
                        <p className="text-sm text-gray-600">Total Approved</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search claims..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
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
                        <p className="text-gray-500">
                            {claims.length === 0 ? "You haven't submitted any claims yet." : "No claims match your search criteria."}
                        </p>
                    </div>
                ) : (
                    filteredClaims.map(claim => (
                        <div key={claim.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        {getInsuranceIcon(claim.insurance_type)}
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="text-lg font-semibold text-gray-900">{claim.claim_number}</h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                                                    {getStatusIcon(claim.status)}
                                                    <span className="ml-1">{claim.status?.toUpperCase()}</span>
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {claim.insurance_type?.toUpperCase()} - {claim.insurance_category}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setSelectedClaim(claim)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        
                                        {claim.status === 'pending' && onCancelClaim && (
                                            <button
                                                onClick={() => onCancelClaim(claim.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Cancel Claim"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Claim Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                    <div className="flex items-center space-x-2">
                                        <DollarSign className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Claim Amount</p>
                                            <p className="font-semibold">{formatCurrency(claim.claim_amount)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Est. Payout</p>
                                            <p className="font-semibold text-green-600">{formatCurrency(claim.estimated_payout || 0)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Submitted</p>
                                            <p className="font-medium">{new Date(claim.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Type</p>
                                            <p className="font-medium capitalize">{claim.claim_type?.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {claim.description && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-700">{claim.description}</p>
                                    </div>
                                )}

                                {/* Document Summary */}
                                <div className="mt-4 flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center space-x-4">
                                        {claim.additional_details?.supporting_documents?.length > 0 && (
                                            <span className="flex items-center space-x-1">
                                                <FileText className="h-3 w-3 text-green-600" />
                                                <span>{claim.additional_details.supporting_documents.length} Support Docs</span>
                                            </span>
                                        )}
                                        {claim.identification_documents?.length > 0 && (
                                            <span className="flex items-center space-x-1">
                                                <Shield className="h-3 w-3 text-blue-600" />
                                                <span>{claim.identification_documents.length} ID Docs</span>
                                            </span>
                                        )}
                                        {claim.identification_data && Object.keys(claim.identification_data).length > 0 && (
                                            <span className="flex items-center space-x-1">
                                                <User className="h-3 w-3 text-purple-600" />
                                                <span>ID Info Provided</span>
                                            </span>
                                        )}
                                        {claim.risk_level && (
                                            <span>Risk: <span className="font-medium">{claim.risk_level}</span></span>
                                        )}
                                    </div>
                                    <span>Updated: {new Date(claim.updated_at || claim.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Claim Details Modal */}
            {selectedClaim && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Claim Details</h3>
                                <button
                                    onClick={() => setSelectedClaim(null)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Claim Number</label>
                                        <p className="font-mono text-sm mt-1">{selectedClaim.claim_number}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Status</label>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedClaim.status)}`}>
                                                {getStatusIcon(selectedClaim.status)}
                                                <span className="ml-2">{selectedClaim.status?.toUpperCase()}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Insurance Type</label>
                                        <p className="capitalize mt-1">{selectedClaim.insurance_type} - {selectedClaim.insurance_category}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Claim Type</label>
                                        <p className="capitalize mt-1">{selectedClaim.claim_type?.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Claim Amount</label>
                                        <p className="font-semibold text-lg mt-1">{formatCurrency(selectedClaim.claim_amount)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Estimated Payout</label>
                                        <p className="font-semibold text-lg text-green-600 mt-1">{formatCurrency(selectedClaim.estimated_payout || 0)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Incident Date</label>
                                        <p className="mt-1">{selectedClaim.incident_date ? new Date(selectedClaim.incident_date).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Submitted</label>
                                        <p className="mt-1">{new Date(selectedClaim.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                {selectedClaim.description && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Description</label>
                                        <p className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-700">{selectedClaim.description}</p>
                                    </div>
                                )}

                                {/* Identification Data */}
                                {selectedClaim.identification_data && Object.keys(selectedClaim.identification_data).length > 0 && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 mb-3 block">Identification Information</label>
                                        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                                            {Object.entries(selectedClaim.identification_data).map(([key, value]) => (
                                                <div key={key} className="flex justify-between">
                                                    <span className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                                                    <span className="text-sm font-medium text-gray-900">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* All Documents */}
                                {(selectedClaim.additional_details?.supporting_documents?.length > 0 || 
                                  selectedClaim.identification_documents?.length > 0) && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 mb-3 block">All Documents</label>
                                        
                                        {/* Supporting Documents */}
                                        {selectedClaim.additional_details?.supporting_documents?.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Supporting Documents</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {selectedClaim.additional_details.supporting_documents.map((doc, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                                            <div className="flex items-center space-x-2">
                                                                {getDocumentIcon(doc.filename, doc.mimetype)}
                                                                <div>
                                                                    <span className="text-sm text-gray-700 truncate block">{doc.original_name}</span>
                                                                    <span className="text-xs text-gray-500">Support Doc • {doc.mimetype}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <button
                                                                    onClick={() => handleViewDocument(doc, 'support')}
                                                                    className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded"
                                                                    title="View Document"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => window.open(getDocumentPreviewUrl(doc.filename), '_blank')}
                                                                    className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded"
                                                                    title="Open in New Tab"
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Identification Documents */}
                                        {selectedClaim.identification_documents?.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Identification Documents</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {selectedClaim.identification_documents.map((doc, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                            <div className="flex items-center space-x-2">
                                                                {getDocumentIcon(doc.filename, doc.mimetype)}
                                                                <div>
                                                                    <span className="text-sm text-gray-700 truncate block">{doc.original_name}</span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {doc.document_type?.replace('_', ' ').toUpperCase() || 'ID Doc'} • {doc.mimetype}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <button
                                                                    onClick={() => handleViewDocument(doc, 'identification')}
                                                                    className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded"
                                                                    title="View Document"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => window.open(getDocumentPreviewUrl(doc.filename), '_blank')}
                                                                    className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded"
                                                                    title="Open in New Tab"
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Policy Documents (if any) */}
                                        {selectedClaim.additional_details?.policy_documents?.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Policy Documents</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {selectedClaim.additional_details.policy_documents.map((doc, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                            <div className="flex items-center space-x-2">
                                                                {getDocumentIcon(doc.filename, doc.mimetype)}
                                                                <div>
                                                                    <span className="text-sm text-gray-700 truncate block">{doc.original_name}</span>
                                                                    <span className="text-xs text-gray-500">Policy Doc • {doc.mimetype}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <button
                                                                    onClick={() => handleViewDocument(doc, 'policy')}
                                                                    className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded"
                                                                    title="View Document"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => window.open(getDocumentPreviewUrl(doc.filename), '_blank')}
                                                                    className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded"
                                                                    title="Open in New Tab"
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex justify-end space-x-3 pt-6 border-t">
                                {selectedClaim.status === 'pending' && onCancelClaim && (
                                    <button
                                        onClick={() => {
                                            onCancelClaim(selectedClaim.id);
                                            setSelectedClaim(null);
                                        }}
                                        className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        Cancel Claim
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedClaim(null)}
                                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Viewer Modal */}
            {viewingDocument && (
                <DocumentViewer
                    document={viewingDocument}
                    onClose={() => setViewingDocument(null)}
                />
            )}
        </div>
    );
};

export default MyClaimsComponent;