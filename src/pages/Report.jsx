import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import ProfessionalPDFExporter from './ReportPdf'; 

const API_URL = 'http://localhost:5000/api/reports';

const InsuranceReportsDashboard = () => {
  const [activeReport, setActiveReport] = useState('overview');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    insurance_type: 'all',
    status: 'all'
  });

  const reportTypes = [
    { id: 'overview', name: 'Overview' },
    { id: 'claims-by-type', name: 'Claims by Type' },
    { id: 'fraud-analysis', name: 'Fraud Analysis' },
    { id: 'financial', name: 'Financial' },
    { id: 'performance', name: 'Performance' },
    { id: 'customer-analysis', name: 'Customer Analysis' }
  ];

  const insuranceTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'motor', label: 'Motor Insurance' },
    { value: 'health', label: 'Health Insurance' },
    { value: 'home', label: 'Home Insurance' },
    { value: 'travel', label: 'Travel Insurance' },
    { value: 'life', label: 'Life Insurance' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'under_review', label: 'Under Review' }
  ];

  const fetchReport = async (reportType, queryFilters = filters) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      Object.entries(queryFilters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_URL}/${reportType}?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch report data');
      
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeReport);
  }, [activeReport]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchReport(activeReport, filters);
  };

  const handleExportCSV = async () => {
    try {
      const queryParams = new URLSearchParams({ 
        report_type: activeReport,
        ...filters 
      });
      const response = await fetch(`${API_URL}/export?${queryParams}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeReport}_report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const renderOverviewReport = () => {
    if (!reportData?.summary) return null;
    const { summary } = reportData;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-blue-300">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Metric</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Value</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Percentage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500">
            <tr><td className="px-4 py-3">Total Claims</td><td className="px-4 py-3">{summary.total_claims}</td><td className="px-4 py-3">100%</td></tr>
            <tr><td className="px-4 py-3">Pending Claims</td><td className="px-4 py-3">{summary.pending_claims}</td><td className="px-4 py-3">{Math.round((summary.pending_claims / summary.total_claims) * 100)}%</td></tr>
            <tr><td className="px-4 py-3">Approved Claims</td><td className="px-4 py-3">{summary.approved_claims}</td><td className="px-4 py-3">{summary.approval_rate}%</td></tr>
            <tr><td className="px-4 py-3">Rejected Claims</td><td className="px-4 py-3">{summary.rejected_claims}</td><td className="px-4 py-3">{summary.rejection_rate}%</td></tr>
            <tr><td className="px-4 py-3">Under Review</td><td className="px-4 py-3">{summary.under_review_claims}</td><td className="px-4 py-3">{Math.round((summary.under_review_claims / summary.total_claims) * 100)}%</td></tr>
            <tr><td className="px-4 py-3">Total Claimed Amount</td><td className="px-4 py-3">{formatCurrency(summary.total_claimed_amount)}</td><td className="px-4 py-3">-</td></tr>
            <tr><td className="px-4 py-3">Average Claim Amount</td><td className="px-4 py-3">{formatCurrency(summary.average_claim_amount)}</td><td className="px-4 py-3">-</td></tr>
            <tr><td className="px-4 py-3">Total Payout</td><td className="px-4 py-3">{formatCurrency(summary.total_payout)}</td><td className="px-4 py-3">{summary.payout_ratio}%</td></tr>
            <tr><td className="px-4 py-3">High Risk Claims</td><td className="px-4 py-3">{summary.high_risk_claims}</td><td className="px-4 py-3">{Math.round((summary.high_risk_claims / summary.total_claims) * 100)}%</td></tr>
            <tr><td className="px-4 py-3">Urgent Claims</td><td className="px-4 py-3">{summary.urgent_claims}</td><td className="px-4 py-3">{Math.round((summary.urgent_claims / summary.total_claims) * 100)}%</td></tr>
            <tr><td className="px-4 py-3">Unique Customers</td><td className="px-4 py-3">{summary.unique_customers}</td><td className="px-4 py-3">-</td></tr>
            <tr><td className="px-4 py-3">Average Fraud Score</td><td className="px-4 py-3">{Math.round(summary.average_fraud_score || 0)}</td><td className="px-4 py-3">-</td></tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderClaimsByTypeReport = () => {
    if (!reportData?.data) return null;

    return (
      <div className="space-y-6">
        {reportData.data.map((typeData, index) => (
          <div key={index}>
            <h3 className="text-lg font-semibold text-blue-900 mb-3 capitalize">
              {typeData.insurance_type} Insurance
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-blue-300">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Total Claims</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Pending</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Approved</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Rejected</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Total Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Average Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Payout</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Approval Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500">
                  {typeData.categories.map((category, catIndex) => (
                    <tr key={catIndex}>
                      <td className="px-4 py-3 capitalize">{category.category}</td>
                      <td className="px-4 py-3">{category.total_claims}</td>
                      <td className="px-4 py-3">{category.pending_claims}</td>
                      <td className="px-4 py-3">{category.approved_claims}</td>
                      <td className="px-4 py-3">{category.rejected_claims}</td>
                      <td className="px-4 py-3">{formatCurrency(category.total_claimed)}</td>
                      <td className="px-4 py-3">{formatCurrency(category.average_amount)}</td>
                      <td className="px-4 py-3">{formatCurrency(category.total_payout)}</td>
                      <td className="px-4 py-3">{category.approval_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFraudAnalysisReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-blue-300">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Risk Level</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Insurance Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Claims</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Avg Fraud Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Amount at Risk</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Approved</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Rejected</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Total Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500">
              {reportData.risk_analysis?.map((risk, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">{risk.risk_level}</td>
                  <td className="px-4 py-3 capitalize">{risk.insurance_type}</td>
                  <td className="px-4 py-3">{risk.claim_count}</td>
                  <td className="px-4 py-3">{Math.round(risk.avg_fraud_score)}</td>
                  <td className="px-4 py-3">{formatCurrency(risk.total_amount_at_risk)}</td>
                  <td className="px-4 py-3">{risk.approved_count}</td>
                  <td className="px-4 py-3">{risk.rejected_count}</td>
                  <td className="px-4 py-3">{formatCurrency(risk.total_payout)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reportData.score_distribution && (
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Fraud Score Distribution</h3>
            <table className="min-w-full bg-white border border-blue-300">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Score Range</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Count</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Average Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500">
                {reportData.score_distribution.map((dist, index) => {
                  const totalCount = reportData.score_distribution.reduce((sum, d) => sum + d.count, 0);
                  const percentage = Math.round((dist.count / totalCount) * 100);
                  return (
                    <tr key={index}>
                      <td className="px-4 py-3">{dist.score_range}</td>
                      <td className="px-4 py-3">{dist.count}</td>
                      <td className="px-4 py-3">{formatCurrency(dist.avg_amount)}</td>
                      <td className="px-4 py-3">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderFinancialReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-blue-300">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Insurance Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Claims</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Total Claimed</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Total Payout</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Payout Ratio</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Approval Rate</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Amount Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500">
              {reportData.by_insurance_type?.map((financial, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 capitalize">{financial.insurance_type}</td>
                  <td className="px-4 py-3">{financial.total_claims}</td>
                  <td className="px-4 py-3">{formatCurrency(financial.total_claimed)}</td>
                  <td className="px-4 py-3">{formatCurrency(financial.total_payout)}</td>
                  <td className="px-4 py-3">{financial.payout_ratio}%</td>
                  <td className="px-4 py-3">{financial.approval_rate}%</td>
                  <td className="px-4 py-3">{formatCurrency(financial.savings_from_rejections)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reportData.monthly_breakdown && (
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Monthly Breakdown</h3>
            <table className="min-w-full bg-white border border-blue-300">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Period</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Claims</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Monthly Claimed</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Monthly Payout</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Payout Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500">
                {reportData.monthly_breakdown.map((month, index) => {
                  const payoutRatio = month.monthly_claimed > 0 ? Math.round((month.monthly_payout / month.monthly_claimed) * 100) : 0;
                  return (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        {new Date(month.year, month.month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </td>
                      <td className="px-4 py-3">{month.claims_count}</td>
                      <td className="px-4 py-3">{formatCurrency(month.monthly_claimed)}</td>
                      <td className="px-4 py-3">{formatCurrency(month.monthly_payout)}</td>
                      <td className="px-4 py-3">{payoutRatio}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderPerformanceReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Processing Time Analysis</h3>
          <table className="min-w-full bg-white border border-blue-300">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Claims</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Avg Days</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Min Days</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Max Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500">
              {reportData.processing_times?.map((time, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 capitalize">{time.priority}</td>
                  <td className="px-4 py-3 capitalize">{time.status.replace('_', ' ')}</td>
                  <td className="px-4 py-3">{time.claim_count}</td>
                  <td className="px-4 py-3">{time.avg_processing_days ? Math.round(time.avg_processing_days) : 'N/A'}</td>
                  <td className="px-4 py-3">{time.min_processing_days || 'N/A'}</td>
                  <td className="px-4 py-3">{time.max_processing_days || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Admin Workload</h3>
          <table className="min-w-full bg-white border border-blue-300">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Admin</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Assigned</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Approved</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Rejected</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Pending</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Avg Processing Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Approval Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500">
              {reportData.admin_workload?.map((admin, index) => {
                const approvalRate = admin.assigned_claims > 0 ? Math.round((admin.approved_count / admin.assigned_claims) * 100) : 0;
                return (
                  <tr key={index}>
                    <td className="px-4 py-3">{admin.admin_name}</td>
                    <td className="px-4 py-3">{admin.assigned_claims}</td>
                    <td className="px-4 py-3">{admin.approved_count}</td>
                    <td className="px-4 py-3">{admin.rejected_count}</td>
                    <td className="px-4 py-3">{admin.pending_count}</td>
                    <td className="px-4 py-3">{admin.avg_processing_time ? `${Math.round(admin.avg_processing_time)} days` : 'N/A'}</td>
                    <td className="px-4 py-3">{approvalRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCustomerAnalysisReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Top Customers</h3>
          <table className="min-w-full bg-white border border-blue-300">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Total Claims</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Total Claimed</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Total Received</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Approved</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Rejected</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Approval Rate</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Avg Fraud Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500">
              {reportData.top_customers?.slice(0, 50).map((customer, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">{customer.customer_name}</td>
                  <td className="px-4 py-3">{customer.customer_email}</td>
                  <td className="px-4 py-3">{customer.total_claims}</td>
                  <td className="px-4 py-3">{formatCurrency(customer.total_claimed)}</td>
                  <td className="px-4 py-3">{formatCurrency(customer.total_received)}</td>
                  <td className="px-4 py-3">{customer.approved_claims}</td>
                  <td className="px-4 py-3">{customer.rejected_claims}</td>
                  <td className="px-4 py-3">{customer.approval_rate}%</td>
                  <td className="px-4 py-3">{Math.round(customer.avg_fraud_score)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Customer Frequency Analysis</h3>
          <table className="min-w-full bg-white border border-blue-300">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Frequency Group</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customer Count</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Avg Fraud Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500">
              {reportData.frequency_analysis?.map((freq, index) => {
                const totalCustomers = reportData.frequency_analysis.reduce((sum, f) => sum + f.customer_count, 0);
                const percentage = Math.round((freq.customer_count / totalCustomers) * 100);
                return (
                  <tr key={index}>
                    <td className="px-4 py-3">{freq.frequency_group}</td>
                    <td className="px-4 py-3">{freq.customer_count}</td>
                    <td className="px-4 py-3">{Math.round(freq.group_avg_fraud_score)}</td>
                    <td className="px-4 py-3">{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32 text-blue-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          Loading...
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-600 p-8">
          <p>Error: {error}</p>
          <button
            onClick={() => fetchReport(activeReport)}
            className="mt-4 px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activeReport) {
      case 'overview': return renderOverviewReport();
      case 'claims-by-type': return renderClaimsByTypeReport();
      case 'fraud-analysis': return renderFraudAnalysisReport();
      case 'financial': return renderFinancialReport();
      case 'performance': return renderPerformanceReport();
      case 'customer-analysis': return renderCustomerAnalysisReport();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-blue-100">
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable, .printable * { visibility: visible; }
          .printable { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
      `}</style>

      {/* Header */}
      <div className="bg-blue-900 text-white shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Insurance Claims Reports</h1>
              <p className="text-blue-300 mt-1">Data Analytics Dashboard</p>
            </div>
            <div className="flex space-x-3">
          <ProfessionalPDFExporter
            reportData={reportData}
            activeReport={activeReport}
            reportTypes={reportTypes}
            filters={filters}
            insuranceTypes={insuranceTypes}
            statusOptions={statusOptions}
          />
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-1/4 no-print">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Date From</label>
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Date To</label>
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Insurance Type</label>
                  <select
                    value={filters.insurance_type}
                    onChange={(e) => handleFilterChange('insurance_type', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {insuranceTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={applyFilters}
                  className="w-full bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Report Navigation */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Reports</h3>
              <nav className="space-y-2">
                {reportTypes.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setActiveReport(report.id)}
                    className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors ${
                      activeReport === report.id
                        ? 'bg-blue-900 text-white'
                        : 'text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    {report.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="printable">
              {/* Report Header for Print */}
              <div className="hidden print:block mb-6">
                <h1 className="text-2xl font-bold text-blue-900 mb-2">
                  {reportTypes.find(r => r.id === activeReport)?.name} Report
                </h1>
                {reportData && (
                  <div className="text-sm text-blue-600">
                    <p>Generated on: {formatDate(reportData.generated_at)}</p>
                    {reportData.date_range && reportData.date_range.from && reportData.date_range.to && (
                      <p>Period: {formatDate(reportData.date_range.from)} - {formatDate(reportData.date_range.to)}</p>
                    )}
                    {filters.insurance_type !== 'all' && (
                      <p>Insurance Type: {insuranceTypes.find(t => t.value === filters.insurance_type)?.label}</p>
                    )}
                    {filters.status !== 'all' && (
                      <p>Status: {statusOptions.find(s => s.value === filters.status)?.label}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Report Header for Screen */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 no-print">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-900">
                      {reportTypes.find(r => r.id === activeReport)?.name} Report
                    </h2>
                    {reportData && (
                      <p className="text-blue-600 mt-2">
                        Generated on {formatDate(reportData.generated_at)}
                        {reportData.date_range && reportData.date_range.from && reportData.date_range.to && (
                          <> • {formatDate(reportData.date_range.from)} - {formatDate(reportData.date_range.to)}</>
                        )}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => fetchReport(activeReport)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-500 transition-colors disabled:opacity-50"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {/* Report Content */}
              <div className="bg-white rounded-lg shadow-md p-6">
                {renderReportContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceReportsDashboard;