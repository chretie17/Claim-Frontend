import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  X, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  Loader,
  Shield,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  Camera,
  Upload,
  RotateCw,
  Save,
  MessageSquare,
  ZoomIn,
  Clock
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/claims';

const IdentityVerificationComponent = ({ selectedClaim, onClose, onVerificationComplete }) => {
  const [identityData, setIdentityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeDocument, setActiveDocument] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedClaim) {
      loadIdentityData();
    }
  }, [selectedClaim]);

  const loadIdentityData = async () => {
    if (!selectedClaim) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/admin/claims/${selectedClaim.id}/identity`);
      const data = await response.json();
      
      if (response.ok) {
        setIdentityData(data);
      } else {
        setError(data.error || 'Failed to load identity data');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIdentity = async () => {
    if (!verificationStatus) {
      alert('Please select a verification status');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/admin/claims/${selectedClaim.id}/verify-identity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: verificationStatus,
          notes: verificationNotes
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        if (onVerificationComplete) {
          onVerificationComplete(data);
        }
        alert(`Identity ${verificationStatus} successfully`);
        onClose();
      } else {
        alert(data.error || 'Failed to verify identity');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDocumentUrl = (filename) => {
    return `${API_URL}/documents/${filename}/view`;
  };

  const downloadDocument = (filename) => {
    window.open(`${API_URL}/documents/${filename}/download`, '_blank');
  };

  if (!selectedClaim) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold">Identity Verification</h2>
              <p className="text-blue-100">Claim: {selectedClaim.claim_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          
          {/* Left Panel - Customer Info & Documents List */}
          <div className="w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            
            {/* Customer Information & Status */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              
              {/* Verification Status Badge */}
              {identityData && (
                <div className="mb-4 p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Identity Status:</span>
                    <div className="flex flex-col items-end">
                      {identityData.identity_status ? (
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          identityData.identity_status === 'verified' 
                            ? 'bg-green-100 text-green-800' 
                            : identityData.identity_status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {identityData.identity_status === 'verified' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {identityData.identity_status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                          {identityData.identity_status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {identityData.identity_status.toUpperCase()}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Clock className="h-3 w-3 mr-1" />
                          PENDING
                        </span>
                      )}
                      {identityData.identity_verified_at && (
                        <span className="text-xs text-gray-500 mt-1">
                          {formatDate(identityData.identity_verified_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  {identityData.identity_notes && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Notes:</strong> {identityData.identity_notes}
                      </p>
                    </div>
                  )}
                  {identityData.identity_verified_by && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">
                        Verified by: {identityData.identity_verified_by}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedClaim.user_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedClaim.user_email}</p>
                  </div>
                </div>
                {selectedClaim.user_phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedClaim.user_phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Identity Data */}
            {loading ? (
              <div className="p-6 text-center">
                <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-500">Loading identity data...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : identityData ? (
              <>
                {/* Submitted Identity Info */}
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted Identity Info</h3>
                  <div className="space-y-3">
                    {identityData.identification_data && Object.keys(identityData.identification_data).length > 0 ? (
                      Object.entries(identityData.identification_data).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="font-medium">{value}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No identity data submitted</p>
                    )}
                  </div>
                </div>

                {/* Documents List */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Identity Documents</h3>
                  {identityData.identification_documents && identityData.identification_documents.length > 0 ? (
                    <div className="space-y-2">
                      {identityData.identification_documents.map((doc, index) => (
                        <div 
                          key={index}
                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-blue-50 ${
                            activeDocument === doc ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          onClick={() => setActiveDocument(doc)}
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{doc.original_name || doc.filename}</p>
                              <p className="text-sm text-gray-500">{doc.type || 'Identity Document'}</p>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDocument(doc);
                                }}
                                className="p-1 text-gray-400 hover:text-green-600"
                                title="View Document"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(getDocumentUrl(doc.filename), '_blank');
                                }}
                                className="p-1 text-gray-400 hover:text-purple-600"
                                title="Open in New Tab"
                              >
                                <ZoomIn className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadDocument(doc.filename);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No identity documents submitted</p>
                  )}
                </div>
              </>
            ) : null}
          </div>

          {/* Right Panel - Document Viewer & Verification */}
          <div className="flex-1 flex flex-col">
            
            {/* Document Viewer */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center">
              {activeDocument ? (
                <div className="w-full h-full flex flex-col">
                  <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {activeDocument.original_name || activeDocument.filename}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(getDocumentUrl(activeDocument.filename), '_blank')}
                        className="p-2 text-gray-500 hover:text-purple-600 rounded-lg hover:bg-gray-100"
                        title="Open in New Tab"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => downloadDocument(activeDocument.filename)}
                        className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {activeDocument.filename.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={getDocumentUrl(activeDocument.filename)}
                        className="w-full h-full border-0"
                        title="Document Viewer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4">
                        <img
                          src={getDocumentUrl(activeDocument.filename)}
                          alt="Identity Document"
                          className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Select a document to view</p>
                  <p className="text-sm">Choose a document from the list to review its contents</p>
                </div>
              )}
            </div>

            {/* Verification Panel */}
            <div className="bg-white border-t border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Decision</h3>
              
              {/* Show existing verification if already processed */}
              {identityData && identityData.identity_status && identityData.identity_status !== 'pending' ? (
                <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {identityData.identity_status === 'verified' ? (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-600" />
                      )}
                    </div>
                    <p className="font-medium text-gray-900 mb-1">
                      Identity Already {identityData.identity_status === 'verified' ? 'Verified' : 'Rejected'}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {identityData.identity_verified_at && `on ${formatDate(identityData.identity_verified_at)}`}
                      {identityData.identity_verified_by && ` by ${identityData.identity_verified_by}`}
                    </p>
                    {identityData.identity_notes && (
                      <p className="text-sm text-gray-700 italic">
                        "{identityData.identity_notes}"
                      </p>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to override the existing verification?')) {
                          // Allow re-verification
                        }
                      }}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Override Verification
                    </button>
                  </div>
                </div>
              ) : null}
              
              <div className="space-y-4">
                {/* Verification Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Status
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="verification"
                        value="verified"
                        checked={verificationStatus === 'verified'}
                        onChange={(e) => setVerificationStatus(e.target.value)}
                        className="mr-2 text-green-600 focus:ring-green-500"
                        disabled={identityData?.identity_status && identityData.identity_status !== 'pending'}
                      />
                      <CheckCircle className="h-5 w-5 text-green-600 mr-1" />
                      <span className="text-green-700 font-medium">Verify Identity</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="verification"
                        value="rejected"
                        checked={verificationStatus === 'rejected'}
                        onChange={(e) => setVerificationStatus(e.target.value)}
                        className="mr-2 text-red-600 focus:ring-red-500"
                        disabled={identityData?.identity_status && identityData.identity_status !== 'pending'}
                      />
                      <XCircle className="h-5 w-5 text-red-600 mr-1" />
                      <span className="text-red-700 font-medium">Reject Identity</span>
                    </label>
                  </div>
                </div>

                {/* Verification Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Notes
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add notes about the verification decision..."
                    disabled={identityData?.identity_status && identityData.identity_status !== 'pending'}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Close
                  </button>
                  {(!identityData?.identity_status || identityData.identity_status === 'pending') && (
                    <button
                      onClick={handleVerifyIdentity}
                      disabled={!verificationStatus || submitting}
                      className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                        verificationStatus === 'verified'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : verificationStatus === 'rejected'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {submitting ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : verificationStatus === 'verified' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : verificationStatus === 'rejected' ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>
                        {submitting 
                          ? 'Processing...' 
                          : verificationStatus === 'verified' 
                          ? 'Verify Identity' 
                          : verificationStatus === 'rejected'
                          ? 'Reject Identity'
                          : 'Save Decision'
                        }
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityVerificationComponent;