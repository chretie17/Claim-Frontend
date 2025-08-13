import React, { useState, useEffect } from 'react';
import { Search, Download, User, FileText, AlertTriangle } from 'lucide-react';
import logoImage from '../assets/logo.jpg';

const API_URL = 'http://localhost:5000/api/user-reports';

const UserReportsPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userReport, setUserReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Enhanced currency formatting
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Enhanced logo loading with imported logo
  const getLogoBase64 = async () => {
    try {
      // First try the imported logo
      if (logoImage) {
        const response = await fetch(logoImage);
        if (response.ok) {
          const blob = await response.blob();
          
          if (blob.type.startsWith('image/')) {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result;
                if (result && result.startsWith('data:image/')) {
                  console.log('Successfully loaded imported logo');
                  resolve(result);
                } else {
                  reject(new Error('Invalid data URL format'));
                }
              };
              reader.onerror = () => reject(new Error('Failed to read image'));
              reader.readAsDataURL(blob);
            });
          }
        }
      }
    } catch (error) {
      console.log('Imported logo failed, trying public path:', error.message);
    }

    try {
      // Fallback to public path
      const response = await fetch('./assets/logo.jpg');
      if (response.ok) {
        const blob = await response.blob();
        
        if (blob.type.startsWith('image/')) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result;
              if (result && result.startsWith('data:image/')) {
                console.log('Successfully loaded logo from public path');
                resolve(result);
              } else {
                reject(new Error('Invalid data URL format'));
              }
            };
            reader.onerror = () => reject(new Error('Failed to read image'));
            reader.readAsDataURL(blob);
          });
        }
      }
    } catch (error) {
      console.log('Public path logo failed:', error.message);
    }
    
    // Enhanced SVG fallback logo if real logo fails
    console.log('Using enhanced SVG fallback logo');
    const svgContent = `
      <svg width="150" height="60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#159FDB;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0EA5E9;stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        <rect width="150" height="60" fill="url(#logoGradient)" rx="12" filter="url(#shadow)"/>
        <text x="75" y="25" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="white">PRIME</text>
        <text x="75" y="42" font-family="Arial" font-size="10" text-anchor="middle" fill="white">INSURANCE</text>
        <circle cx="25" cy="20" r="8" fill="white" opacity="0.3"/>
        <circle cx="125" cy="40" r="6" fill="white" opacity="0.2"/>
      </svg>
    `;
    
    return 'data:image/svg+xml;base64,' + btoa(svgContent);
  };

  // Enhanced header with company information
  const createHeader = async (userName) => {
    let logoBase64;
    try {
      logoBase64 = await getLogoBase64();
    } catch (error) {
      console.log('Logo loading failed, using text-only header:', error.message);
      logoBase64 = null;
    }
    
    const headerColumns = [];
    
    // Add logo if available (left side) - larger size
    if (logoBase64) {
      headerColumns.push({
        width: 120,
        image: logoBase64,
        fit: [120, 60], // Larger logo dimensions
        margin: [0, 5, 0, 0]
      });
    } else {
      // Fallback company text
      headerColumns.push({
        width: 120,
        stack: [
          {
            text: 'PRIME',
            style: 'companyNameLarge',
            color: '#159FDB'
          },
          {
            text: 'INSURANCE',
            style: 'companyNameSmall',
            color: '#159FDB'
          }
        ]
      });
    }
    
    // Company information in center
    headerColumns.push({
      width: '*',
      stack: [
        {
          text: 'USER CLAIMS COMPREHENSIVE REPORT',
          style: 'bigCenterHeader',
          color: '#159FDB',
          alignment: 'center'
        },
        {
          text: 'P.O Box 1234, Kigali, Rwanda',
          style: 'companyAddress',
          alignment: 'center',
          margin: [0, 2, 0, 0]
        },
        {
          text: 'Website: www.prime.rw | Email: info@prime.rw',
          style: 'companyAddress',
          alignment: 'center',
          margin: [0, 1, 0, 0]
        },
        {
          text: 'Professional Insurance Services',
          style: 'companyTagline',
          alignment: 'center',
          margin: [0, 3, 0, 0]
        }
      ]
    });
    
    // Date and report info on the right
    headerColumns.push({
      width: 120,
      stack: [
        {
          text: 'Generated:',
          style: 'headerInfoLabel',
          alignment: 'right'
        },
        {
          text: getCurrentDateTime(),
          style: 'headerInfoValue',
          alignment: 'right',
          margin: [0, 0, 0, 5]
        },
        {
          text: 'Report for:',
          style: 'headerInfoLabel',
          alignment: 'right'
        },
        {
          text: userName,
          style: 'headerInfoValue',
          alignment: 'right',
          margin: [0, 0, 0, 5]
        },
        {
          text: 'Status:',
          style: 'headerInfoLabel',
          alignment: 'right'
        },
        {
          text: 'CONFIDENTIAL',
          style: 'confidentialStamp',
          alignment: 'right'
        }
      ]
    });
    
    return [
      // Enhanced header with Logo, company info, and metadata
      {
        columns: headerColumns,
        margin: [0, 0, 0, 15]
      },
      
      // Decorative line
      {
        canvas: [
          {
            type: 'line',
            x1: 0, y1: 0,
            x2: 750, y2: 0, // Wider line for landscape
            lineWidth: 3,
            lineColor: '#159FDB'
          }
        ],
        margin: [0, 0, 0, 15]
      }
    ];
  };

  // Enhanced table creation for landscape format
  const createStyledTable = (headers, data, options = {}) => {
    const { 
      headerColor = '#159FDB',
      alternatingRows = true,
      fontSize = 10,
      widths = null,
      title = null
    } = options;

    const content = [];
    
    if (title) {
      content.push({
        text: title,
        style: 'landscapeSubsectionHeader',
        color: headerColor,
        margin: [0, 15, 0, 12]
      });
    }

    content.push({
      table: {
        headerRows: 1,
        widths: widths || Array(headers.length).fill('*'),
        body: [
          headers.map(header => ({
            text: header,
            style: 'landscapeTableHeader',
            fillColor: headerColor,
            color: 'white',
            bold: true,
            alignment: 'center'
          })),
          ...data.map((row, index) => 
            row.map(cell => ({
              text: cell,
              style: 'landscapeTableCell',
              fillColor: alternatingRows && index % 2 === 0 ? '#F9FAFB' : 'white',
              alignment: typeof cell === 'string' && cell.includes('%') ? 'center' : 
                         cell.toString().match(/RWF|,/) ? 'right' : 'left'
            }))
          )
        ]
      },
      layout: {
        hLineWidth: (i, node) => i === 0 || i === 1 || i === node.table.body.length ? 2 : 1,
        vLineWidth: () => 1,
        hLineColor: (i, node) => i === 0 || i === 1 ? headerColor : '#E5E7EB',
        vLineColor: () => '#E5E7EB',
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 6,
        paddingBottom: () => 6
      },
      fontSize: fontSize,
      margin: [0, 8, 0, 20]
    });

    return content;
  };

  // Generate comprehensive user report PDF
  const generateUserReportPDF = async () => {
    if (!userReport || !selectedUser) return;

    try {
      console.log('Starting landscape PDF export for user report...');
      
      // Load pdfMake if not already loaded
      if (typeof window !== 'undefined' && !window.pdfMake) {
        await new Promise((resolve, reject) => {
          const script1 = document.createElement('script');
          script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js';
          script1.onload = () => {
            const script2 = document.createElement('script');
            script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js';
            script2.onload = resolve;
            script2.onerror = reject;
            document.head.appendChild(script2);
          };
          script1.onerror = reject;
          document.head.appendChild(script1);
        });
      }

      if (!window.pdfMake) {
        throw new Error('PDF library failed to load');
      }

      let headerContent;
      try {
        headerContent = await createHeader(selectedUser.name);
      } catch (headerError) {
        console.log('Header creation failed, using simple header:', headerError.message);
        headerContent = [
          {
            text: 'PRIME INSURANCE - USER CLAIMS REPORT',
            style: 'companyHeader',
            color: '#159FDB',
            alignment: 'center',
            margin: [0, 0, 0, 20]
          }
        ];
      }

      // Executive Summary
      const executiveSummary = {
        text: 'Executive Summary',
        style: 'landscapeSubsectionHeader',
        color: '#159FDB',
        margin: [0, 10, 0, 15]
      };

      const summaryCards = {
        columns: [
          {
            width: '33%',
            stack: [
              {
                table: {
                  widths: ['*'],
                  body: [[{
                    stack: [
                      { text: 'Profile Overview', style: 'cardTitle', color: '#1E40AF' },
                      { text: `Customer since: ${formatDate(userReport.user_profile.registration_date)}`, style: 'cardContent' },
                      { text: `Email: ${userReport.user_profile.email}`, style: 'cardContent' },
                      { text: `Phone: ${userReport.user_profile.phone || 'N/A'}`, style: 'cardContent' },
                      { text: `Claims Period: ${formatDate(userReport.user_profile.first_claim_date)} - ${formatDate(userReport.user_profile.last_claim_date)}`, style: 'cardContent' }
                    ],
                    margin: [12, 12, 12, 12]
                  }]]
                },
                layout: {
                  hLineWidth: () => 2,
                  vLineWidth: () => 2,
                  hLineColor: () => '#1E40AF',
                  vLineColor: () => '#1E40AF'
                }
              }
            ]
          },
          {
            width: '33%',
            stack: [
              {
                table: {
                  widths: ['*'],
                  body: [[{
                    stack: [
                      { text: 'Claims Performance', style: 'cardTitle', color: '#059669' },
                      { text: `Total Claims: ${userReport.claims_summary.total_claims}`, style: 'cardContent' },
                      { text: `Approval Rate: ${userReport.claims_summary.approval_rate}%`, style: 'cardContent' },
                      { text: `Approved: ${userReport.claims_summary.approved_claims} | Rejected: ${userReport.claims_summary.rejected_claims}`, style: 'cardContent' },
                      { text: `Pending: ${userReport.claims_summary.pending_claims}`, style: 'cardContent' }
                    ],
                    margin: [12, 12, 12, 12]
                  }]]
                },
                layout: {
                  hLineWidth: () => 2,
                  vLineWidth: () => 2,
                  hLineColor: () => '#059669',
                  vLineColor: () => '#059669'
                }
              }
            ]
          },
          {
            width: '33%',
            stack: [
              {
                table: {
                  widths: ['*'],
                  body: [[{
                    stack: [
                      { text: 'Financial & Risk', style: 'cardTitle', color: '#DC2626' },
                      { text: `Total Claimed: ${formatCurrency(userReport.claims_summary.total_claimed)}`, style: 'cardContent' },
                      { text: `Total Received: ${formatCurrency(userReport.claims_summary.total_received)}`, style: 'cardContent' },
                      { text: `Payout Ratio: ${userReport.claims_summary.payout_ratio}%`, style: 'cardContent' },
                      { text: `Risk Level: ${userReport.claims_summary.risk_level}`, style: 'cardContent', color: userReport.claims_summary.risk_level === 'HIGH' ? '#DC2626' : userReport.claims_summary.risk_level === 'MEDIUM' ? '#D97706' : '#059669' }
                    ],
                    margin: [12, 12, 12, 12]
                  }]]
                },
                layout: {
                  hLineWidth: () => 2,
                  vLineWidth: () => 2,
                  hLineColor: () => '#DC2626',
                  vLineColor: () => '#DC2626'
                }
              }
            ]
          }
        ],
        columnGap: 15,
        margin: [0, 0, 0, 25]
      };

      // User Profile detailed table
      const userProfileData = [
        ['Customer Name', userReport.user_profile.name || 'N/A'],
        ['Email Address', userReport.user_profile.email || 'N/A'],
        ['Phone Number', userReport.user_profile.phone || 'N/A'],
        ['Registration Date', formatDate(userReport.user_profile.registration_date)],
        ['First Claim Date', formatDate(userReport.user_profile.first_claim_date)],
        ['Last Claim Date', formatDate(userReport.user_profile.last_claim_date)],
        ['Customer ID', selectedUser.id?.toString() || 'N/A']
      ];

      // Claims summary detailed table
      const claimsSummaryData = [
        ['Total Claims Submitted', userReport.claims_summary.total_claims?.toString() || '0'],
        ['Approved Claims', userReport.claims_summary.approved_claims?.toString() || '0'],
        ['Rejected Claims', userReport.claims_summary.rejected_claims?.toString() || '0'],
        ['Pending Claims', userReport.claims_summary.pending_claims?.toString() || '0'],
        ['Approval Rate', `${userReport.claims_summary.approval_rate || 0}%`],
        ['Total Claimed Amount', formatCurrency(userReport.claims_summary.total_claimed)],
        ['Total Amount Received', formatCurrency(userReport.claims_summary.total_received)],
        ['Payout Ratio', `${userReport.claims_summary.payout_ratio || 0}%`],
        ['Average Fraud Score', (userReport.claims_summary.average_fraud_score || 0).toString()],
        ['Risk Classification', userReport.claims_summary.risk_level || 'UNKNOWN']
      ];

      // Claims by type data
      const claimsByTypeContent = userReport.claims_by_type && userReport.claims_by_type.length > 0 
        ? createStyledTable(
            ['Insurance Type', 'Claims Count', 'Total Amount', 'Total Payout', 'Payout Rate', 'Avg Fraud Score'],
            userReport.claims_by_type.map(type => [
              type.insurance_type?.charAt(0).toUpperCase() + type.insurance_type?.slice(1) || 'N/A',
              (type.count || 0).toString(),
              formatCurrency(type.total_amount),
              formatCurrency(type.total_payout),
              `${Math.round(((type.total_payout || 0) / (type.total_amount || 1)) * 100)}%`,
              Math.round(type.avg_fraud_score || 0).toString()
            ]),
            { 
              headerColor: '#10B981', 
              fontSize: 11,
              widths: ['25%', '15%', '20%', '20%', '10%', '10%'],
              title: 'Claims Analysis by Insurance Type'
            }
          )
        : [{ text: 'No claims by type data available.', style: 'noData', margin: [0, 20] }];

      // Individual claims data
      const individualClaimsContent = userReport.recent_claims && userReport.recent_claims.length > 0
        ? createStyledTable(
            ['Claim #', 'Date', 'Type', 'Category', 'Amount', 'Status', 'Priority', 'Fraud Score', 'Payout'],
            userReport.recent_claims.map(claim => [
              claim.claim_number || 'N/A',
              formatDate(claim.created_at),
              claim.insurance_type?.charAt(0).toUpperCase() + claim.insurance_type?.slice(1) || 'N/A',
              claim.insurance_category || 'N/A',
              formatCurrency(claim.claim_amount),
              (claim.status || 'UNKNOWN').toUpperCase(),
              (claim.priority || 'NORMAL').toUpperCase(),
              (claim.fraud_score || 0).toString(),
              claim.payout_amount ? formatCurrency(claim.payout_amount) : 'N/A'
            ]),
            { 
              headerColor: '#8B5CF6', 
              fontSize: 9,
              widths: ['12%', '10%', '12%', '10%', '12%', '8%', '8%', '8%', '12%'],
              title: 'Complete Claims History'
            }
          )
        : [{ text: 'No individual claims data available.', style: 'noData', margin: [0, 20] }];

      const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [40, 50, 40, 40],
        
        header: {
          columns: [
            { text: 'PRIME Insurance - User Claims Report', style: 'headerFooter' },
            { text: '', style: 'headerFooter' },
            { text: getCurrentDateTime(), style: 'headerFooter', alignment: 'right' }
          ],
          margin: [40, 12]
        },
        
        footer: (currentPage, pageCount) => ({
          columns: [
            { text: '© 2025 PRIME Insurance. All rights reserved.', style: 'headerFooter' },
            { text: `Report for: ${selectedUser.name}`, style: 'headerFooter', alignment: 'center' },
            { text: `Page ${currentPage} of ${pageCount}`, style: 'headerFooter', alignment: 'right' }
          ],
          margin: [40, 12]
        }),

        content: [
          ...headerContent,
          
          // Executive Summary Section
          executiveSummary,
          summaryCards,
          
          // User Profile Section
          ...createStyledTable(
            ['Profile Field', 'Information'],
            userProfileData,
            { 
              headerColor: '#1E40AF', 
              fontSize: 11,
              widths: ['40%', '60%'],
              title: 'Customer Profile Details'
            }
          ),
          
          // Claims Summary Section
          ...createStyledTable(
            ['Claims Metric', 'Value'],
            claimsSummaryData,
            { 
              headerColor: '#059669', 
              fontSize: 11,
              widths: ['50%', '50%'],
              title: 'Claims Performance Summary'
            }
          ),
          
          // Page break before detailed analysis
          { text: '', pageBreak: 'before' },
          
          // Claims by Type Section
          ...claimsByTypeContent,
          
          // Individual Claims Section
          ...individualClaimsContent,
          
          // Footer note
          {
            text: 'This report contains confidential customer information and should be handled according to company data protection policies.',
            style: 'footerNote',
            alignment: 'center',
            margin: [0, 30, 0, 0]
          }
        ],

        styles: {
          companyNameLarge: {
            fontSize: 20,
            bold: true
          },
          companyNameSmall: {
            fontSize: 12,
            bold: true
          },
          bigCenterHeader: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 2]
          },
          companyAddress: {
            fontSize: 10,
            color: '#6B7280',
            margin: [0, 1, 0, 0]
          },
          companyTagline: {
            fontSize: 9,
            italics: true,
            color: '#9CA3AF'
          },
          headerInfoLabel: {
            fontSize: 9,
            color: '#6B7280',
            bold: true
          },
          headerInfoValue: {
            fontSize: 10,
            color: '#374151'
          },
          confidentialStamp: {
            fontSize: 10,
            bold: true,
            color: '#DC2626'
          },
          landscapeSubsectionHeader: {
            fontSize: 14,
            bold: true,
            color: '#374151'
          },
          landscapeTableHeader: {
            fontSize: 10,
            bold: true
          },
          landscapeTableCell: {
            fontSize: 9
          },
          cardTitle: {
            fontSize: 12,
            bold: true,
            margin: [0, 0, 0, 8]
          },
          cardContent: {
            fontSize: 10,
            margin: [0, 2, 0, 2],
            color: '#374151'
          },
          headerFooter: {
            fontSize: 8,
            color: '#6B7280'
          },
          noData: {
            fontSize: 12,
            alignment: 'center',
            color: '#6B7280',
            italics: true
          },
          footerNote: {
            fontSize: 9,
            color: '#6B7280',
            italics: true
          }
        },

        defaultStyle: {
          fontSize: 10,
          lineHeight: 1.3,
          color: '#374151'
        }
      };

      const fileName = `PRIME_Insurance_${selectedUser.name.replace(/\s+/g, '_')}_Claims_Report_${new Date().toISOString().split('T')[0]}_Landscape.pdf`;
      window.pdfMake.createPdf(docDefinition).download(fileName);
      
      console.log('Enhanced landscape PDF generated successfully');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      if (confirm('PDF generation failed. Would you like to use the browser print dialog instead?')) {
        window.print();
      }
    }
  };

  // Fetch all users
  const fetchUsers = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users?page=${page}&limit=20&search=${search}`);
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  // Fetch user report
  const fetchUserReport = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/user/${userId}`);
      const data = await response.json();
      setUserReport(data);
      setSelectedUser(users.find(u => u.id === userId));
    } catch (error) {
      console.error('Error fetching user report:', error);
    }
    setLoading(false);
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">User Reports Dashboard</h1>
          <p className="text-gray-600">Select a user to view their comprehensive claims report</p>
        </div>

        {/* Search and Users List */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
            
            {/* Search */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Claims</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Financial</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Risk</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{user.email}</p>
                        <p className="text-sm text-gray-500">{user.phone || 'N/A'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p><span className="font-medium">{user.total_claims}</span> total</p>
                          <p className="text-green-600">{user.approved_claims} approved</p>
                          <p className="text-yellow-600">{user.pending_claims} pending</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="font-medium">{(user.total_claimed || 0).toLocaleString()} RWF</p>
                          <p className="text-green-600">{(user.total_received || 0).toLocaleString()} RWF received</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {user.risk_level === 'HIGH' && <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.risk_level === 'HIGH' ? 'bg-red-100 text-red-800' :
                            user.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.risk_level}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{user.approval_rate}% approval</p>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => fetchUserReport(user.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-700">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total_records)} of{' '}
                {pagination.total_records} users
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setCurrentPage(currentPage - 1);
                    fetchUsers(currentPage - 1, searchTerm);
                  }}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded">
                  {pagination.current_page}
                </span>
                <button
                  onClick={() => {
                    setCurrentPage(currentPage + 1);
                    fetchUsers(currentPage + 1, searchTerm);
                  }}
                  disabled={currentPage === pagination.total_pages}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Report Section */}
        {userReport && selectedUser && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Report for {selectedUser.name}
              </h2>
              <button
                onClick={generateUserReportPDF}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Export Professional Landscape PDF Report"
              >
                <Download className="w-5 h-5 mr-2" />
                Export Professional PDF
              </button>
            </div>

            {/* User Profile Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold text-blue-800 mb-2">Profile Info</h3>
                <p><strong>Email:</strong> {userReport.user_profile.email}</p>
                <p><strong>Phone:</strong> {userReport.user_profile.phone || 'N/A'}</p>
                <p><strong>Member Since:</strong> {new Date(userReport.user_profile.registration_date).toLocaleDateString()}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <h3 className="font-semibold text-green-800 mb-2">Claims Activity</h3>
                <p><strong>Total Claims:</strong> {userReport.claims_summary.total_claims}</p>
                <p><strong>Approval Rate:</strong> {userReport.claims_summary.approval_rate}%</p>
                <p><strong>Last Claim:</strong> {userReport.user_profile.last_claim_date ? new Date(userReport.user_profile.last_claim_date).toLocaleDateString() : 'N/A'}</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-semibold text-yellow-800 mb-2">Financial & Risk</h3>
                <p><strong>Total Claimed:</strong> {(userReport.claims_summary.total_claimed || 0).toLocaleString()} RWF</p>
                <p><strong>Total Received:</strong> {(userReport.claims_summary.total_received || 0).toLocaleString()} RWF</p>
                <p><strong>Risk Level:</strong> <span className={`font-medium ${
                  userReport.claims_summary.risk_level === 'HIGH' ? 'text-red-600' :
                  userReport.claims_summary.risk_level === 'MEDIUM' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>{userReport.claims_summary.risk_level}</span></p>
              </div>
            </div>

            {/* Claims by Type Table */}
            {userReport.claims_by_type && userReport.claims_by_type.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Claims by Insurance Type</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left border-b">Insurance Type</th>
                        <th className="px-4 py-2 text-left border-b">Claims Count</th>
                        <th className="px-4 py-2 text-left border-b">Total Amount (RWF)</th>
                        <th className="px-4 py-2 text-left border-b">Total Payout (RWF)</th>
                        <th className="px-4 py-2 text-left border-b">Avg Fraud Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userReport.claims_by_type.map((type, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b font-medium">{type.insurance_type}</td>
                          <td className="px-4 py-2 border-b">{type.count}</td>
                          <td className="px-4 py-2 border-b">{(type.total_amount || 0).toLocaleString()} RWF</td>
                          <td className="px-4 py-2 border-b">{(type.total_payout || 0).toLocaleString()} RWF</td>
                          <td className="px-4 py-2 border-b">{Math.round(type.avg_fraud_score || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* All Claims Table */}
            {userReport.recent_claims && userReport.recent_claims.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">All Claims Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left border-b">Claim Number</th>
                        <th className="px-4 py-2 text-left border-b">Date</th>
                        <th className="px-4 py-2 text-left border-b">Type</th>
                        <th className="px-4 py-2 text-left border-b">Category</th>
                        <th className="px-4 py-2 text-left border-b">Amount (RWF)</th>
                        <th className="px-4 py-2 text-left border-b">Status</th>
                        <th className="px-4 py-2 text-left border-b">Priority</th>
                        <th className="px-4 py-2 text-left border-b">Fraud Score</th>
                        <th className="px-4 py-2 text-left border-b">Payout (RWF)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userReport.recent_claims.map((claim) => (
                        <tr key={claim.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b font-medium text-blue-600">{claim.claim_number}</td>
                          <td className="px-4 py-2 border-b">{new Date(claim.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-2 border-b">{claim.insurance_type}</td>
                          <td className="px-4 py-2 border-b">{claim.insurance_category}</td>
                          <td className="px-4 py-2 border-b">{(claim.claim_amount || 0).toLocaleString()} RWF</td>
                          <td className="px-4 py-2 border-b">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                              claim.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {(claim.status || 'UNKNOWN').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-2 border-b">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              claim.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              claim.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              claim.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {(claim.priority || 'NORMAL').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-2 border-b">
                            <span className={`font-medium ${
                              claim.fraud_score > 70 ? 'text-red-600' :
                              claim.fraud_score > 40 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {claim.fraud_score || 0}
                            </span>
                          </td>
                          <td className="px-4 py-2 border-b">
                            {claim.payout_amount ? `${claim.payout_amount.toLocaleString()} RWF` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(!userReport.recent_claims || userReport.recent_claims.length === 0) && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">This user has no claims yet.</p>
              </div>
            )}
          </div>
        )}

        {!userReport && !loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">Select a User</h3>
            <p className="text-gray-500">Choose a user from the list above to view their comprehensive claims report</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReportsPage;