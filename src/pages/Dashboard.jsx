import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { 
  Shield, 
  DollarSign, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  FileText,
  UserCheck,
  AlertCircle,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Eye,
  Zap,
  RefreshCw
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/dashboard';

const ClaimsAdminDashboard = () => {
  const [dashboardOverview, setDashboardOverview] = useState(null);
  const [quickStats, setQuickStats] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [claimsByStatus, setClaimsByStatus] = useState([]);
  const [claimsByInsurance, setClaimsByInsurance] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [adminPerformance, setAdminPerformance] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchDashboardOverview(),
        fetchQuickStats(),
        fetchSystemHealth(),
        fetchChartData(),
        fetchPerformanceData()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardOverview = async () => {
    try {
      const params = new URLSearchParams(dateRange).toString();
      const response = await fetch(`${API_BASE}/overview?${params}`);
      if (!response.ok) throw new Error('Failed to fetch overview');
      const data = await response.json();
      setDashboardOverview(data);
    } catch (err) {
      console.error('Error fetching overview:', err);
      throw err;
    }
  };

  const fetchQuickStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/quick-stats`);
      if (!response.ok) throw new Error('Failed to fetch quick stats');
      const data = await response.json();
      setQuickStats(data);
    } catch (err) {
      console.error('Error fetching quick stats:', err);
      throw err;
    }
  };
const formatCompactCurrency = (amount) => {
  if (!amount || isNaN(amount)) return 'RWF 0';
  
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 1e9) {
    return `${sign}RWF ${(absAmount / 1e9).toFixed(1)}B`;
  } else if (absAmount >= 1e6) {
    return `${sign}RWF ${(absAmount / 1e6).toFixed(1)}M`;
  } else if (absAmount >= 1e3) {
    return `${sign}RWF ${(absAmount / 1e3).toFixed(1)}K`;
  } else {
    return `${sign}RWF ${absAmount.toFixed(0)}`;
  }
};
  const fetchSystemHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/system-health`);
      if (!response.ok) throw new Error('Failed to fetch system health');
      const data = await response.json();
      setSystemHealth(data);
    } catch (err) {
      console.error('Error fetching system health:', err);
      throw err;
    }
  };

  const fetchChartData = async () => {
    try {
      const [statusRes, insuranceRes, dailyRes, monthlyRes, riskRes] = await Promise.all([
        fetch(`${API_BASE}/charts/status`),
        fetch(`${API_BASE}/charts/insurance-type`),
        fetch(`${API_BASE}/charts/daily-trend?days=30`),
        fetch(`${API_BASE}/charts/monthly-summary?months=12`),
        fetch(`${API_BASE}/charts/risk-distribution`)
      ]);

      if (!statusRes.ok || !insuranceRes.ok || !dailyRes.ok || !monthlyRes.ok || !riskRes.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const [status, insurance, daily, monthly, risk] = await Promise.all([
        statusRes.json(),
        insuranceRes.json(),
        dailyRes.json(),
        monthlyRes.json(),
        riskRes.json()
      ]);

      setClaimsByStatus(status);
      setClaimsByInsurance(insurance);
      setDailyTrend(daily);
      setMonthlySummary(monthly);
      setRiskDistribution(risk);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      throw err;
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const [performanceRes, activityRes] = await Promise.all([
        fetch(`${API_BASE}/admin-performance?limit=10`),
        fetch(`${API_BASE}/recent-activity?limit=20`)
      ]);

      if (!performanceRes.ok || !activityRes.ok) {
        throw new Error('Failed to fetch performance data');
      }

      const [performance, activity] = await Promise.all([
        performanceRes.json(),
        activityRes.json()
      ]);

      setAdminPerformance(performance);
      setRecentActivity(activity);
    } catch (err) {
      console.error('Error fetching performance data:', err);
      throw err;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
      under_review: 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
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

  const getHealthStatusColor = (status) => {
    const colors = {
      good: 'text-green-600',
      warning: 'text-yellow-600',
      critical: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.dataKey.includes('amount') || entry.dataKey.includes('payout') ? formatCurrency(entry.value) : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const COLORS = ['#0d9488', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#84cc16'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-teal-600 font-medium">Loading Claims Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchAllData}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-green-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Claims Management Dashboard
                </h1>
                <p className="text-gray-600">Administrative Overview & Analytics</p>
              </div>
            </div>
            
            {/* System Health Indicator */}
            {systemHealth && (
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-full bg-gray-50 ${getHealthStatusColor(systemHealth.status)}`}>
                  <div className={`w-2 h-2 rounded-full ${systemHealth.status === 'good' ? 'bg-green-500' : systemHealth.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
                  <span className="text-sm font-medium capitalize">{systemHealth.status}</span>
                </div>
                <button 
                  onClick={fetchAllData}
                  className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="From Date"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="To Date"
            />
            <button
              onClick={() => setDateRange({ from: '', to: '' })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-8">
        
        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="New Claims Today" 
            value={quickStats?.today?.new_claims || 0} 
            icon={FileText} 
            color="bg-gradient-to-r from-teal-600 to-teal-700" 
          />
          <StatCard 
            title="Approved Today" 
            value={quickStats?.today?.approved || 0} 
            icon={CheckCircle} 
            color="bg-gradient-to-r from-green-600 to-green-700" 
          />
          <StatCard 
            title="Urgent Pending" 
            value={quickStats?.urgent_pending || 0} 
            icon={AlertTriangle} 
            color="bg-gradient-to-r from-red-600 to-red-700" 
          />
          <StatCard 
            title="Avg Processing Time" 
            value={`${quickStats?.avg_processing_hours || 0}h`}
            icon={Clock} 
            color="bg-gradient-to-r from-purple-600 to-purple-700" 
          />
        </div>

        {/* Overview Stats */}
        {dashboardOverview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard 
              title="Total Claims" 
              value={dashboardOverview.overview?.total_claims || 0} 
              icon={FileText} 
              color="bg-gradient-to-r from-blue-600 to-blue-700" 
            />
            <StatCard 
              title="Pending Claims" 
              value={dashboardOverview.overview?.pending_claims || 0} 
              icon={Clock} 
              color="bg-gradient-to-r from-amber-600 to-amber-700" 
            />
           <StatCard 
  title="Total Claim Amount" 
  value={formatCompactCurrency(dashboardOverview.financial?.total_claim_amount)} 
  icon={DollarSign} 
  color="bg-gradient-to-r from-emerald-600 to-emerald-700" 
/>
<StatCard 
  title="Total Payouts" 
  value={formatCompactCurrency(dashboardOverview.financial?.total_payout)} 
  icon={TrendingUp} 
  color="bg-gradient-to-r from-indigo-600 to-indigo-700" 
/>
<StatCard 
  title="Savings" 
  value={formatCompactCurrency(dashboardOverview.financial?.savings)} 
  icon={Shield} 
  color="bg-gradient-to-r from-pink-600 to-pink-700" 
/>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'performance', label: 'Performance', icon: TrendingUp },
                { id: 'activity', label: 'Recent Activity', icon: Eye }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Claims by Status - Pie Chart */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2 text-teal-600" />
                Claims by Status
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={claimsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percentage }) => `${status} (${percentage}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {claimsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Risk Distribution */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Risk Level Distribution
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={riskDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="risk_level" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="url(#riskGradient)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Daily Trend */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Daily Claims Trend (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={dailyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total_claims" stroke="#0d9488" fillOpacity={1} fill="url(#totalGradient)" />
                  <Area type="monotone" dataKey="approved" stroke="#10b981" fillOpacity={1} fill="url(#approvedGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Insurance Type Breakdown */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                Claims by Insurance Type
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={claimsByInsurance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="insurance_type" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total_claims" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Summary */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                Monthly Summary
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlySummary} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month_name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="total_claims" stroke="#0d9488" strokeWidth={3} dot={{ fill: '#0d9488', strokeWidth: 2, r: 6 }} />
                  <Line type="monotone" dataKey="total_amount" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-8">
            {/* Admin Performance Leaderboard */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Admin Performance Leaderboard
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Admin</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Processed</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Approved</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rejected</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Avg Processing Time</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Payouts</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {adminPerformance.map((admin, index) => (
                      <tr key={admin.admin_email} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-green-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{admin.admin_name}</div>
                              <div className="text-sm text-gray-500">{admin.admin_email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-900">{admin.total_processed}</td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm text-green-600 font-medium">{admin.approved}</td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm text-red-600 font-medium">{admin.rejected}</td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">{admin.avg_processing_hours?.toFixed(1)}h</td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(admin.total_payouts)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {adminPerformance.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No performance data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* System Health Details */}
            {systemHealth && (
              <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-600" />
                  System Health Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{systemHealth.total_active_claims}</div>
                    <div className="text-sm text-gray-600">Active Claims</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{systemHealth.unassigned_claims}</div>
                    <div className="text-sm text-gray-600">Unassigned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{systemHealth.urgent_backlog}</div>
                    <div className="text-sm text-gray-600">Urgent Backlog</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{systemHealth.overdue_claims}</div>
                    <div className="text-sm text-gray-600">Overdue Claims</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{systemHealth.identity_pending}</div>
                    <div className="text-sm text-gray-600">Identity Pending</div>
                  </div>
                </div>
                
                {systemHealth.issues && systemHealth.issues.length > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      System Issues
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {systemHealth.issues.map((issue, index) => (
                        <li key={index}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Priority Breakdown */}
            {dashboardOverview?.priority_breakdown && (
              <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  Priority Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="text-3xl font-bold text-red-600">{dashboardOverview.priority_breakdown.urgent}</div>
                    <div className="text-sm text-red-700 font-medium">Urgent</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="text-3xl font-bold text-orange-600">{dashboardOverview.priority_breakdown.high}</div>
                    <div className="text-sm text-orange-700 font-medium">High</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-600">{dashboardOverview.priority_breakdown.medium}</div>
                    <div className="text-sm text-yellow-700 font-medium">Medium</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-3xl font-bold text-green-600">{dashboardOverview.priority_breakdown.low}</div>
                    <div className="text-sm text-green-700 font-medium">Low</div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Overview */}
            {dashboardOverview?.financial && (
              <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Financial Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(dashboardOverview.financial.total_claim_amount)}</div>
                    <div className="text-sm text-blue-700 font-medium">Total Claims</div>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(dashboardOverview.financial.total_payout)}</div>
                    <div className="text-sm text-green-700 font-medium">Total Payouts</div>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                    <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(dashboardOverview.financial.avg_claim_amount)}</div>
                    <div className="text-sm text-purple-700 font-medium">Avg Claim Amount</div>
                  </div>
                  <div className="text-center p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                    <Shield className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-emerald-600">{formatCurrency(dashboardOverview.financial.savings)}</div>
                    <div className="text-sm text-emerald-700 font-medium">Savings</div>
                  </div>
                </div>
              </div>
            )}

            {/* Approval/Rejection Rates */}
            {dashboardOverview?.rates && (
              <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                  Processing Rates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-4xl font-bold text-green-600">{dashboardOverview.rates.approval_rate}%</div>
                    <div className="text-sm text-green-700 font-medium">Approval Rate</div>
                  </div>
                  <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
                    <div className="text-4xl font-bold text-red-600">{dashboardOverview.rates.rejection_rate}%</div>
                    <div className="text-sm text-red-700 font-medium">Rejection Rate</div>
                  </div>
                  <div className="text-center p-6 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="text-4xl font-bold text-amber-600">{dashboardOverview.rates.pending_rate}%</div>
                    <div className="text-sm text-amber-700 font-medium">Pending Rate</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-teal-600" />
                Recent Activity
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Claim #</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Admin</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Activity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {recentActivity.map((activity) => (
                    <tr key={activity.claim_id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-medium text-teal-600">#{activity.claim_number}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                        {activity.user_name}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(activity.claim_amount)}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(activity.priority)}`}>
                          {activity.priority}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600">
                        {activity.admin_name || 'Unassigned'}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600">
                        {formatDateTime(activity.updated_at)}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          activity.activity_type === 'processed' ? 'bg-green-100 text-green-800' :
                          activity.activity_type === 'assigned' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.activity_type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentActivity.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Risk Analysis Section */}
        {dashboardOverview?.risk_analysis && (
          <div className="mt-8 bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Risk Analysis Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">{dashboardOverview.risk_analysis.critical_risk_claims}</div>
                <div className="text-sm text-red-700 font-medium">Critical Risk Claims</div>
              </div>
              <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-200">
                <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{dashboardOverview.risk_analysis.high_risk_claims}</div>
                <div className="text-sm text-orange-700 font-medium">High Risk Claims</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{dashboardOverview.risk_analysis.avg_fraud_score}</div>
                <div className="text-sm text-purple-700 font-medium">Avg Fraud Score</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-200 text-left group">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-teal-600">Process Claims</h4>
                <p className="text-sm text-gray-600">Review pending claims</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400 group-hover:text-teal-600" />
            </div>
          </button>
          
          <button className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-200 text-left group">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">Manage Users</h4>
                <p className="text-sm text-gray-600">User administration</p>
              </div>
              <Users className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
            </div>
          </button>
          
          <button className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-200 text-left group">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-purple-600">Reports</h4>
                <p className="text-sm text-gray-600">Generate reports</p>
              </div>
              <BarChart3 className="w-8 h-8 text-gray-400 group-hover:text-purple-600" />
            </div>
          </button>
          
          <button className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-200 text-left group">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-green-600">Settings</h4>
                <p className="text-sm text-gray-600">System configuration</p>
              </div>
              <Activity className="w-8 h-8 text-gray-400 group-hover:text-green-600" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimsAdminDashboard;