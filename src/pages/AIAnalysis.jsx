import React, { useState, useEffect } from 'react';
import { 
  Brain, AlertTriangle, TrendingUp, Eye, CheckCircle, XCircle, 
  RefreshCw, FileText, Shield, Zap, Download, User, Phone, Mail, Loader 
} from 'lucide-react';

const AIAnalysisComponent = ({ selectedClaim, onClose, onAnalysisComplete }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  // remove trailing slash to avoid // in requests
  const API_URL = 'http://localhost:5000/api';

  // safe JSON parse helper
  const safeParse = (val) => {
    try {
      if (!val) return null;
      return typeof val === 'string' ? JSON.parse(val) : val;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (selectedClaim) performAIAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClaim]);

  const performAIAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/ai-analysis/${selectedClaim.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perform_full_analysis: true,
          include_recommendations: true,
          include_risk_factors: true
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to perform AI analysis');
      setAnalysisData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Centralize API host
const API_HOST = 'http://localhost:5000';

// Turns any doc-ish object into a backend /view URL
const toViewUrl = (doc) => {
  if (!doc) return '';
  // Prefer ID route if your backend supports it
  if (doc.document_id && String(doc.document_id).match(/^\d+$/)) {
    return `${API_URL}/claims/documents/${doc.document_id}/view`;
  }
  // Otherwise build from filename
  const raw =
    doc.public_url ||
    doc.url ||
    doc.file_url ||
    doc.file_name ||
    doc.filename ||
    doc.original_name ||
    doc.path ||
    '';
  const filename = String(raw).split('/').pop(); // handles 5173/uploads/... too
  return filename ? `${API_URL}/claims/documents/${filename}/view` : '';
};

// Optional: fix any hardcoded 5173 URLs on the fly
const fixUrlString = (s) => {
  if (!s) return '';
  const filename = String(s).split('/').pop();
  return `${API_URL}/claims/documents/${filename}/view`;
};

  const handleRecommendationAction = async (recommendationId, action) => {
    try {
      const res = await fetch(`${API_URL}/ai-analysis/${selectedClaim.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation_id: recommendationId, action, admin_id: 1 })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || 'Failed to perform action');
      performAIAnalysis();
      onAnalysisComplete?.(data);
      alert(`Action completed: ${action}`);
    } catch (e) {
      alert('Network error: ' + e.message);
    }
  };

  const handleExportPDF = () => {
    if (!analysisData) return alert('No analysis data to export');
    const pdfContent = {
      claim: selectedClaim,
      analysis: analysisData,
      timestamp: new Date().toISOString()
    };
    const filename = `AI_Analysis_${selectedClaim.claim_number}_${new Date().toISOString().split('T')[0]}.pdf`;
    const reportContent = generateTextReport(pdfContent);
    downloadTextFile(reportContent, filename.replace('.pdf', '.txt'));
    alert('Analysis report exported as text file (add a PDF lib to export PDF)');
  };

  const generateTextReport = (data) => {
    const amt = Number(data.claim.claim_amount || 0);
    return `
AI CLAIMS ANALYSIS REPORT
========================

Claim Information:
- Claim Number: ${data.claim.claim_number || ''}
- Customer: ${data.claim.user_name || ''}
- Amount: RWF ${amt.toLocaleString()}
- Type: ${data.claim.insurance_type || ''} - ${data.claim.insurance_category || ''}
- Status: ${data.claim.status || ''}
- Date: ${data.claim.created_at ? new Date(data.claim.created_at).toLocaleString() : ''}

AI Analysis Summary:
- Overall Confidence: ${data.analysis?.overall_confidence ?? ''}%
- Fraud Risk Level: ${data.analysis?.fraud_risk_level ?? ''}
- Legitimacy Score: ${((data.analysis?.legitimacy_score ?? 0) * 100).toFixed(1)}%
- Recommended Payout: RWF ${(Number(data.analysis?.recommended_payout || 0)).toLocaleString()}

Key Findings:
${(data.analysis?.key_findings || []).map((f, i) => `${i+1}. ${f.title}\n   ${f.description} (${f.confidence}% confidence)`).join('\n') || 'No key findings'}

Risk Factors:
${(data.analysis?.risk_analysis?.risk_factors || []).map((r, i) => `${i+1}. ${r.factor_name} (${r.severity})\n   ${r.description}`).join('\n') || 'No risk factors identified'}

Pattern Detection:
${(data.analysis?.pattern_detection || []).map((p, i) => `${i+1}. ${p.pattern_type}\n   ${p.description} (${p.confidence}% confidence)`).join('\n') || 'No patterns detected'}

Recommendations:
${(data.analysis?.recommendations || []).map((rec, i) => `${i+1}. ${rec.title} (${rec.action_type})\n   ${rec.description}\n   Priority: ${rec.priority}, Confidence: ${rec.confidence}%`).join('\n') || 'No recommendations'}

Generated: ${new Date(data.timestamp).toLocaleString()}
`;
  };

  const downloadTextFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleViewDocument = async (documentId) => {
    alert(`Viewing document ${documentId} - implement viewer`);
  };

  const getRiskColor = (level) => {
    const colors = {
      CRITICAL: 'bg-red-100 text-red-800 border-red-300',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      LOW: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getConfidenceColor = (confidence) => {
    if ((confidence ?? 0) >= 90) return 'text-green-600';
    if ((confidence ?? 0) >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!selectedClaim) return null;

  const additional = safeParse(selectedClaim.additional_details);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8" />
              <div>
                <h2 className="text-xl font-bold">AI Claims Analysis</h2>
                <p className="text-blue-100 text-sm">Claim: {selectedClaim.claim_number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={performAIAnalysis}
                disabled={loading}
                className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button onClick={onClose} className="text-white hover:text-gray-200">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-6">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'risk', label: 'Risk Analysis', icon: Shield },
              { id: 'patterns', label: 'Pattern Detection', icon: TrendingUp },
              { id: 'recommendations', label: 'AI Recommendations', icon: Zap },
              { id: 'verification', label: 'Document Verification', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === tab.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Performing AI analysis...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
                <p className="text-red-600 font-medium">Analysis Failed</p>
                <p className="text-gray-600 text-sm mt-2">{error}</p>
                <button
                  onClick={performAIAnalysis}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          ) : analysisData ? (
            <div className="space-y-6">
              {/* Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* AI Score */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">AI Analysis Score</h3>
                      <span className={`text-2xl font-bold ${getConfidenceColor(analysisData.overall_confidence)}`}>
                        {analysisData.overall_confidence}%
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(analysisData.fraud_risk_level)}`}>
                          <Shield className="h-4 w-4 mr-1" />
                          {analysisData.fraud_risk_level}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Fraud Risk</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {((analysisData.legitimacy_score ?? 0) * 100).toFixed(1)}%
                        </div>
                        <p className="text-xs text-gray-600">Legitimacy Score</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          RWF {(Number(analysisData.recommended_payout || 0)).toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-600">Recommended Payout</p>
                      </div>
                    </div>
                  </div>

                  {/* Key Findings */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key AI Findings</h3>
                    <div className="space-y-3">
                      {(analysisData.key_findings || []).map((finding, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`p-1 rounded-full ${
                            finding.severity === 'high' ? 'bg-red-100' :
                            finding.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                          }`}>
                            {finding.severity === 'high' ? (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            ) : finding.severity === 'medium' ? (
                              <TrendingUp className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{finding.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Confidence: {finding.confidence}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Claim Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount Claimed:</span>
                          <span className="font-medium">RWF {Number(selectedClaim.claim_amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Insurance Type:</span>
                          <span className="font-medium">{selectedClaim.insurance_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{selectedClaim.insurance_category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date Filed:</span>
                          <span className="font-medium">
                            {selectedClaim.created_at ? new Date(selectedClaim.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Profile</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedClaim.user_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedClaim.user_email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedClaim.user_phone}</span>
                        </div>
                        {analysisData.customer_risk_profile && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-900">Risk Profile</p>
                            <p className="text-sm text-gray-600 mt-1">{analysisData.customer_risk_profile}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Analysis */}
              {activeTab === 'risk' && analysisData.risk_analysis && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors Analysis</h3>
                    <div className="space-y-4">
                      {(analysisData.risk_analysis.risk_factors || []).map((factor, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{factor.factor_name}</h4>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(factor.severity)}`}>
                                {factor.severity}
                              </span>
                              <span className="text-sm text-gray-500">{factor.weight}% impact</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{factor.description}</p>
                          <div className="bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                factor.severity === 'CRITICAL' ? 'bg-red-500' : 
                                factor.severity === 'HIGH' ? 'bg-orange-500' : 
                                factor.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, (factor.score || 0) * 100))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {analysisData.risk_analysis.historical_patterns && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Pattern Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysisData.risk_analysis.historical_patterns.map((pattern, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">{pattern.pattern_type}</h4>
                            <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Occurrences: {pattern.frequency}</span>
                              <span>Confidence: {pattern.confidence}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Patterns */}
              {activeTab === 'patterns' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pattern Detection Results</h3>
                    {(analysisData.pattern_detection || []).length > 0 ? (
                      <div className="space-y-4">
                        {analysisData.pattern_detection.map((pattern, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{pattern.pattern_type}</h4>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  pattern.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                                  pattern.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {pattern.severity || 'LOW'}
                                </span>
                                <span className="text-sm text-gray-500">Confidence: {pattern.confidence}%</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Frequency: {pattern.frequency}</span>
                              {pattern.avg_amount && (
                                <span>Avg Amount: RWF {Number(pattern.avg_amount).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No patterns detected</p>
                      </div>
                    )}
                  </div>

                  {analysisData.risk_analysis?.historical_patterns && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Pattern Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysisData.risk_analysis.historical_patterns.map((pattern, index) => (
                          <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-gray-900 mb-2">{pattern.pattern_type}</h4>
                            <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                              <div>Frequency: {pattern.frequency}</div>
                              <div>Confidence: {pattern.confidence}%</div>
                              <div>Avg Amount: RWF {Number(pattern.avg_amount || 0).toLocaleString()}</div>
                              <div>Avg Fraud: {Number(pattern.avg_fraud_score || 0).toFixed(1)}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {activeTab === 'recommendations' && (analysisData.recommendations || []).length > 0 && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
                    <div className="space-y-4">
                      {analysisData.recommendations.map((rec, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-2">{rec.title}</h4>
                              <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Priority: {rec.priority}</span>
                                <span>Confidence: {rec.confidence}%</span>
                                <span>Impact: {rec.expected_impact}</span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              rec.action_type === 'approve' ? 'bg-green-100 text-green-800' :
                              rec.action_type === 'reject' ? 'bg-red-100 text-red-800' :
                              rec.action_type === 'investigate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {rec.action_type}
                            </span>
                          </div>
                          {rec.supporting_evidence && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Supporting Evidence:</h5>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {rec.supporting_evidence.map((e, i) => (
                                  <li key={i} className="flex items-start space-x-2">
                                    <span className="text-gray-400">•</span>
                                    <span>{e}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRecommendationAction(rec.id, 'accept')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center space-x-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Accept & Execute</span>
                            </button>
                            <button
                              onClick={() => handleRecommendationAction(rec.id, 'review')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Mark for Review</span>
                            </button>
                            <button
                              onClick={() => handleRecommendationAction(rec.id, 'dismiss')}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Document Verification */}
              {activeTab === 'verification' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Verification Results</h3>
                    {(analysisData.document_analysis || []).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analysisData.document_analysis.map((doc, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <FileText className="h-5 w-5 text-gray-400" />
                              <h4 className="font-medium text-gray-900">{doc.document_type}</h4>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Authenticity:</span>
                                <span className={`text-sm font-medium ${
                                  (doc.authenticity_score || 0) > 0.8 ? 'text-green-600' :
                                  (doc.authenticity_score || 0) > 0.6 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {((doc.authenticity_score || 0) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Quality:</span>
                                <span className={`text-sm font-medium ${
                                  (doc.quality_score || 0) > 0.8 ? 'text-green-600' :
                                  (doc.quality_score || 0) > 0.6 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {((doc.quality_score || 0) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Completeness:</span>
                                <span className={`text-sm font-medium ${
                                  (doc.completeness_score || 0) > 0.8 ? 'text-green-600' :
                                  (doc.completeness_score || 0) > 0.6 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {((doc.completeness_score || 0) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            {doc.issues?.length > 0 && (
                              <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                                <h5 className="text-xs font-medium text-red-800 mb-1">Issues Found:</h5>
                                <ul className="text-xs text-red-600 space-y-1">
                                  {doc.issues.map((issue, i) => <li key={i}>• {issue}</li>)}
                                </ul>
                              </div>
                            )}
                            <div className="mt-3 flex space-x-2">
                             <button
                             onClick={() => window.open(toViewUrl(doc), '_blank')}
                             className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200"
                             >
                         <Eye className="h-3 w-3 mr-1 inline" />
                             View
                             </button>

                              <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded text-xs font-medium hover:bg-gray-200">
                                <Download className="h-3 w-3 mr-1 inline" />
                                Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />

                        {/* Show actual uploaded docs if present */}
                        {additional?.supporting_documents && (
                          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">Available Documents:</h4>
                            {additional?.supporting_documents?.map((doc, index) => {
  const url = toViewUrl(doc); // always resolves to API /view
  return (
    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
      <div className="flex items-center space-x-2">
        <FileText className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-700">{doc.original_name || doc.file_name || 'document'}</span>
      </div>
      <div className="flex space-x-1">
        <button
          onClick={() => window.open(url, '_blank')}
          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
        >
          View
        </button>
      </div>
    </div>
  );
})}

                            <p className="text-xs text-blue-700 mt-2">
                              * AI verification not yet performed on these documents
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Analysis Summary</h3>
                    {(analysisData.document_analysis || []).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {analysisData.document_analysis.length}
                          </div>
                          <p className="text-sm text-gray-600">Documents Analyzed</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {(
                              analysisData.document_analysis.reduce((sum, d) => sum + (d.authenticity_score || 0), 0) /
                              analysisData.document_analysis.length * 100
                            ).toFixed(1)}%
                          </div>
                          <p className="text-sm text-gray-600">Avg Authenticity</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {analysisData.document_analysis.reduce((sum, d) => sum + (d.issues ? d.issues.length : 0), 0)}
                          </div>
                          <p className="text-sm text-gray-600">Total Issues</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500">No document analysis data available</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No analysis data available</p>
                <button
                  onClick={performAIAnalysis}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start AI Analysis
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {analysisData && <span>Analysis completed at {new Date(analysisData.timestamp).toLocaleString()}</span>}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {analysisData && (
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Report</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIAnalysisComponent;
