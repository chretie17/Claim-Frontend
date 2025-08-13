import React from 'react';
import { FileText } from 'lucide-react';
import logoImage from '../assets/logo.jpg'; // Adjust the path based on your project structure

const ProfessionalPDFExporter = ({ 
  reportData, 
  activeReport, 
  reportTypes, 
  filters,
  insuranceTypes,
  statusOptions 
}) => {
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

  // Convert image to base64 with proper format validation
const getLogoBase64 = async () => {
    try {
      // First try to use the imported logo
      if (logoImage) {
        const response = await fetch(logoImage);
        if (response.ok) {
          const blob = await response.blob();
          
          // Validate it's actually an image
          if (blob.type.startsWith('image/')) {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result;
                if (result && result.startsWith('data:image/')) {
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
      // Fallback to public folder approach
      const response = await fetch('./assets/logo.jpg');
      if (response.ok) {
        const blob = await response.blob();
        
        if (blob.type.startsWith('image/')) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result;
              if (result && result.startsWith('data:image/')) {
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
    
    // Final fallback: Create a professional SVG logo
    console.log('Using SVG fallback logo');
    const svgContent = `
      <svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#159FDB;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0EA5E9;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="120" height="40" fill="url(#logoGradient)" rx="8"/>
        <text x="60" y="16" font-family="Arial" font-size="12" font-weight="bold" text-anchor="middle" fill="white">PRIME</text>
        <text x="60" y="30" font-family="Arial" font-size="8" text-anchor="middle" fill="white">INSURANCE</text>
      </svg>
    `;
    
    return 'data:image/svg+xml;base64,' + btoa(svgContent);
  };

 const createHeader = async (reportTitle) => {
  let logoBase64;
  try {
    logoBase64 = await getLogoBase64();
  } catch (error) {
    console.log('All logo loading methods failed, using text-only header:', error.message);
    logoBase64 = null;
  }
  
  const headerColumns = [];
  
  // Add logo if available (smaller size)
  if (logoBase64) {
    headerColumns.push({
      width: 60,
      image: logoBase64,
      width: 50,
      height: 20,
      margin: [0, 2, 0, 0]
    });
  }
  
  // Company info column (more compact)
  headerColumns.push({
    width: '*',
    stack: [
      {
        text: 'PRIME INSURANCE',
        style: 'companyHeaderCompact',
        color: '#159FDB'
      },
      {
        text: 'Professional Insurance Claims Analysis',
        style: 'companySubtitleCompact',
        color: '#6B7280'
      }
    ]
  });
  
  // Date and confidential column (more compact)
  headerColumns.push({
    width: 'auto',
    stack: [
      {
        text: getCurrentDateTime(),
        style: 'headerDateCompact',
        alignment: 'right'
      },
      {
        text: 'Confidential Report',
        style: 'confidentialCompact',
        alignment: 'right',
        color: '#DC2626'
      }
    ]
  });
  
  return [
    // Compact Company Header with Logo
    {
      columns: headerColumns,
      margin: [0, 0, 0, 10] // Reduced margin
    },
    
    // Thinner Decorative Line
    {
      canvas: [
        {
          type: 'line',
          x1: 0, y1: 0,
          x2: 515, y2: 0,
          lineWidth: 2, // Thinner line
          lineColor: '#159FDB'
        }
      ],
      margin: [0, 0, 0, 10] // Reduced margin
    },
    
    // Compact Report Title Section
    {
      text: reportTitle,
      style: 'reportTitleCompact',
      alignment: 'center',
      margin: [0, 5, 0, 15] // Much smaller margins
    }
  ];
};
const createReportMetadata = () => {
  const metadata = [];
  
  // Date Range
  if (reportData?.date_range?.from && reportData?.date_range?.to) {
    metadata.push(`📅 Period: ${formatDate(reportData.date_range.from)} - ${formatDate(reportData.date_range.to)}`);
  }
  
  // Filters
  if (filters.insurance_type !== 'all') {
    const insuranceLabel = insuranceTypes.find(t => t.value === filters.insurance_type)?.label;
    metadata.push(`🏛️ Insurance Type: ${insuranceLabel}`);
  }
  
  if (filters.status !== 'all') {
    const statusLabel = statusOptions.find(s => s.value === filters.status)?.label;
    metadata.push(`📊 Status Filter: ${statusLabel}`);
  }

  if (metadata.length > 0) {
    return [
      {
        table: {
          widths: ['*'],
          body: [[{
            ul: metadata,
            style: 'metadata',
            fillColor: '#FAFAFA',
            margin: [8, 8, 8, 8] // Reduced margins
          }]]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 10] // Reduced margin
      }
    ];
  }
  return [];
};

const createStyledTable = (headers, data, options = {}) => {
  const { 
    headerColor = '#159FDB',
    alternatingRows = true,
    fontSize = 8, // Reduced from 9
    widths = null 
  } = options;

  return {
    table: {
      headerRows: 1,
      widths: widths || Array(headers.length).fill('*'),
      body: [
        headers.map(header => ({
          text: header,
          style: 'tableHeader',
          fillColor: headerColor,
          color: 'white',
          bold: true,
          alignment: 'center'
        })),
        ...data.map((row, index) => 
          row.map(cell => ({
            text: cell,
            style: 'tableCell',
            fillColor: alternatingRows && index % 2 === 0 ? '#F9FAFB' : 'white',
            alignment: typeof cell === 'string' && cell.includes('%') ? 'center' : 
                       cell.toString().match(/^[RWF\d,.\s]+$/) ? 'right' : 'left'
          }))
        )
      ]
    },
    layout: {
      hLineWidth: (i, node) => i === 0 || i === 1 || i === node.table.body.length ? 2 : 1,
      vLineWidth: () => 1,
      hLineColor: (i, node) => i === 0 || i === 1 ? headerColor : '#E5E7EB',
      vLineColor: () => '#E5E7EB',
      paddingLeft: () => 6, // Reduced from 8
      paddingRight: () => 6, // Reduced from 8
      paddingTop: () => 4, // Reduced from 6
      paddingBottom: () => 4 // Reduced from 6
    },
    fontSize: fontSize,
    margin: [0, 5, 0, 15] // Reduced margins
  };
};

  const generateOverviewContent = () => {
    if (!reportData?.summary) return [];

    const { summary } = reportData;
    
    // Key metrics cards
    const keyMetrics = [
      {
        columns: [
          {
            width: '25%',
            table: {
              body: [[{
                text: [
                  { text: summary.total_claims?.toString() || '0', style: 'metricNumber' },
                  { text: '\nTotal Claims', style: 'metricLabel' }
                ],
                alignment: 'center',
                fillColor: '#EFF6FF',
                border: [false, false, false, false]
              }]]
            },
            layout: 'noBorders'
          },
          {
            width: '25%',
            table: {
              body: [[{
                text: [
                  { text: `${summary.approval_rate || 0}%`, style: 'metricNumber' },
                  { text: '\nApproval Rate', style: 'metricLabel' }
                ],
                alignment: 'center',
                fillColor: '#F0FDF4',
                border: [false, false, false, false]
              }]]
            },
            layout: 'noBorders'
          },
          {
            width: '25%',
            table: {
              body: [[{
                text: [
                  { text: formatCurrency(summary.total_payout), style: 'metricNumber', fontSize: 12 },
                  { text: '\nTotal Payout', style: 'metricLabel' }
                ],
                alignment: 'center',
                fillColor: '#FEF3C7',
                border: [false, false, false, false]
              }]]
            },
            layout: 'noBorders'
          },
          {
            width: '25%',
            table: {
              body: [[{
                text: [
                  { text: Math.round(summary.average_fraud_score || 0).toString(), style: 'metricNumber' },
                  { text: '\nAvg Fraud Score', style: 'metricLabel' }
                ],
                alignment: 'center',
                fillColor: '#FEF2F2',
                border: [false, false, false, false]
              }]]
            },
            layout: 'noBorders'
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 30]
      }
    ];

    const detailData = [
      ['Total Claims', summary.total_claims?.toString() || '0', '100%'],
      ['Pending Claims', summary.pending_claims?.toString() || '0', `${Math.round((summary.pending_claims / summary.total_claims) * 100) || 0}%`],
      ['Approved Claims', summary.approved_claims?.toString() || '0', `${summary.approval_rate || 0}%`],
      ['Rejected Claims', summary.rejected_claims?.toString() || '0', `${summary.rejection_rate || 0}%`],
      ['Under Review', summary.under_review_claims?.toString() || '0', `${Math.round((summary.under_review_claims / summary.total_claims) * 100) || 0}%`],
      ['Total Claimed Amount', formatCurrency(summary.total_claimed_amount), '-'],
      ['Average Claim Amount', formatCurrency(summary.average_claim_amount), '-'],
      ['Total Payout', formatCurrency(summary.total_payout), `${summary.payout_ratio || 0}%`],
      ['High Risk Claims', summary.high_risk_claims?.toString() || '0', `${Math.round((summary.high_risk_claims / summary.total_claims) * 100) || 0}%`],
      ['Urgent Claims', summary.urgent_claims?.toString() || '0', `${Math.round((summary.urgent_claims / summary.total_claims) * 100) || 0}%`],
      ['Unique Customers', summary.unique_customers?.toString() || '0', '-']
    ];

    return [
{ text: '📊 Executive Summary', style: 'sectionHeader', margin: [0, 0, 0, 20] },
      ...keyMetrics,
      { text: 'Detailed Breakdown', style: 'subsectionHeader', margin: [0, 10, 0, 10] },
      createStyledTable(
        ['Metric', 'Value', 'Percentage'],
        detailData,
        { widths: ['40%', '30%', '30%'] }
      )
    ];
  };

 const generateClaimsByTypeContent = () => {
    if (!reportData?.data) return [];

    const content = [
      { text: '📈 Claims Analysis by Insurance Type', style: 'sectionHeader', margin: [0, 0, 0, 20] }
    ];

    reportData.data.forEach((typeData, index) => {
      const typeColor = ['#159FDB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5];
      
      // Add insurance type header
      content.push({
        text: `${typeData.insurance_type.charAt(0).toUpperCase() + typeData.insurance_type.slice(1)} Insurance`, 
        style: 'subsectionHeader', 
        color: typeColor,
        margin: [0, 15, 0, 10],
        pageBreak: index > 0 ? 'before' : undefined // Add page break for each insurance type except first
      });

      // Split the table into two parts to fit better on page
      
      // First table: Basic claim counts
      content.push(
        { text: 'Claim Counts & Status', style: 'tableSubheader', margin: [0, 5, 0, 8] },
        createStyledTable(
          ['Category', 'Total', 'Pending', 'Approved', 'Rejected', 'Approval Rate'],
          typeData.categories.map(category => [
            category.category.charAt(0).toUpperCase() + category.category.slice(1),
            category.total_claims?.toString() || '0',
            category.pending_claims?.toString() || '0',
            category.approved_claims?.toString() || '0',
            category.rejected_claims?.toString() || '0',
            `${category.approval_rate || 0}%`
          ]),
          { 
            headerColor: typeColor, 
            fontSize: 9,
            widths: ['25%', '15%', '15%', '15%', '15%', '15%']
          }
        )
      );

      // Second table: Financial amounts
      content.push(
        { text: 'Financial Summary', style: 'tableSubheader', margin: [0, 15, 0, 8] },
        createStyledTable(
          ['Category', 'Total Claimed', 'Average Amount', 'Total Payout'],
          typeData.categories.map(category => [
            category.category.charAt(0).toUpperCase() + category.category.slice(1),
            formatCurrency(category.total_claimed),
            formatCurrency(category.average_amount),
            formatCurrency(category.total_payout)
          ]),
          { 
            headerColor: typeColor, 
            fontSize: 9,
            widths: ['25%', '25%', '25%', '25%']
          }
        )
      );

      // Add spacing between insurance types
      if (index < reportData.data.length - 1) {
        content.push({ text: '', margin: [0, 0, 0, 20] });
      }
    });

    return content;
  };

  const generateFraudAnalysisContent = () => {
    if (!reportData?.risk_analysis) return [];

    const content = [
      { text: '🚨 Fraud Risk Analysis', style: 'sectionHeader', pageBreak: 'before', margin: [0, 0, 0, 20] },
      createStyledTable(
        ['Risk Level', 'Insurance Type', 'Claims', 'Avg Fraud Score', 'Amount at Risk', 'Approved', 'Rejected', 'Total Payout'],
        reportData.risk_analysis.map(risk => [
          risk.risk_level || 'Unknown',
          risk.insurance_type.charAt(0).toUpperCase() + risk.insurance_type.slice(1),
          risk.claim_count?.toString() || '0',
          Math.round(risk.avg_fraud_score || 0).toString(),
          formatCurrency(risk.total_amount_at_risk),
          risk.approved_count?.toString() || '0',
          risk.rejected_count?.toString() || '0',
          formatCurrency(risk.total_payout)
        ]),
        { 
          headerColor: '#DC2626', 
          fontSize: 8,
          widths: ['*', '*', '*', '*', '*', '*', '*', '*']
        }
      )
    ];

    if (reportData.score_distribution) {
      content.push(
        { text: 'Fraud Score Distribution', style: 'subsectionHeader', margin: [0, 20, 0, 15] },
        createStyledTable(
          ['Score Range', 'Count', 'Average Amount', 'Percentage'],
          reportData.score_distribution.map(dist => {
            const totalCount = reportData.score_distribution.reduce((sum, d) => sum + d.count, 0);
            const percentage = Math.round((dist.count / totalCount) * 100);
            return [
              dist.score_range || 'Unknown',
              dist.count?.toString() || '0',
              formatCurrency(dist.avg_amount),
              `${percentage}%`
            ];
          }),
          { 
            headerColor: '#DC2626',
            widths: ['25%', '25%', '25%', '25%']
          }
        )
      );
    }

    return content;
  };

  const generateFinancialContent = () => {
    if (!reportData?.by_insurance_type) return [];

    const content = [
      { text: '💰 Financial Performance Analysis', style: 'sectionHeader', pageBreak: 'before', margin: [0, 0, 0, 20] },
      createStyledTable(
        ['Insurance Type', 'Claims', 'Total Claimed', 'Total Payout', 'Payout Ratio', 'Approval Rate', 'Amount Saved'],
        reportData.by_insurance_type.map(financial => [
          financial.insurance_type.charAt(0).toUpperCase() + financial.insurance_type.slice(1),
          financial.total_claims?.toString() || '0',
          formatCurrency(financial.total_claimed),
          formatCurrency(financial.total_payout),
          `${financial.payout_ratio || 0}%`,
          `${financial.approval_rate || 0}%`,
          formatCurrency(financial.savings_from_rejections)
        ]),
        { 
          headerColor: '#059669',
          fontSize: 9,
          widths: ['*', '*', '*', '*', '*', '*', '*']
        }
      )
    ];

    if (reportData.monthly_breakdown) {
      content.push(
        { text: 'Monthly Financial Trends', style: 'subsectionHeader', margin: [0, 20, 0, 15] },
        createStyledTable(
          ['Period', 'Claims', 'Monthly Claimed', 'Monthly Payout', 'Payout Ratio'],
          reportData.monthly_breakdown.map(month => {
            const payoutRatio = month.monthly_claimed > 0 ? Math.round((month.monthly_payout / month.monthly_claimed) * 100) : 0;
            const period = new Date(month.year, month.month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            return [
              period,
              month.claims_count?.toString() || '0',
              formatCurrency(month.monthly_claimed),
              formatCurrency(month.monthly_payout),
              `${payoutRatio}%`
            ];
          }),
          { 
            headerColor: '#059669',
            widths: ['25%', '15%', '20%', '20%', '20%']
          }
        )
      );
    }

    return content;
  };

  const generatePerformanceContent = () => {
    if (!reportData?.processing_times) return [];

    const content = [
      { text: '⚡ Performance & Efficiency Analysis', style: 'sectionHeader', pageBreak: 'before', margin: [0, 0, 0, 20] },
      { text: 'Processing Time Analysis', style: 'subsectionHeader', margin: [0, 0, 0, 15] },
      createStyledTable(
        ['Priority', 'Status', 'Claims', 'Avg Days', 'Min Days', 'Max Days'],
        reportData.processing_times.map(time => [
          time.priority.charAt(0).toUpperCase() + time.priority.slice(1),
          time.status.replace('_', ' ').charAt(0).toUpperCase() + time.status.replace('_', ' ').slice(1),
          time.claim_count?.toString() || '0',
          time.avg_processing_days ? Math.round(time.avg_processing_days).toString() : 'N/A',
          time.min_processing_days?.toString() || 'N/A',
          time.max_processing_days?.toString() || 'N/A'
        ]),
        { 
          headerColor: '#7C3AED',
          widths: ['*', '*', '*', '*', '*', '*']
        }
      )
    ];

    if (reportData.admin_workload) {
      content.push(
        { text: 'Admin Performance Metrics', style: 'subsectionHeader', margin: [0, 20, 0, 15] },
        createStyledTable(
          ['Admin', 'Assigned', 'Approved', 'Rejected', 'Pending', 'Avg Time', 'Approval Rate'],
          reportData.admin_workload.map(admin => {
            const approvalRate = admin.assigned_claims > 0 ? Math.round((admin.approved_count / admin.assigned_claims) * 100) : 0;
            const avgTime = admin.avg_processing_time ? `${Math.round(admin.avg_processing_time)} days` : 'N/A';
            return [
              admin.admin_name || 'Unknown',
              admin.assigned_claims?.toString() || '0',
              admin.approved_count?.toString() || '0',
              admin.rejected_count?.toString() || '0',
              admin.pending_count?.toString() || '0',
              avgTime,
              `${approvalRate}%`
            ];
          }),
          { 
            headerColor: '#7C3AED',
            fontSize: 8,
            widths: ['*', '*', '*', '*', '*', '*', '*']
          }
        )
      );
    }

    return content;
  };

  const generateCustomerAnalysisContent = () => {
    if (!reportData?.top_customers) return [];

    const content = [
      { text: '👥 Customer Insights & Analysis', style: 'sectionHeader', pageBreak: 'before', margin: [0, 0, 0, 20] },
      { text: 'Top 20 Valued Customers', style: 'subsectionHeader', margin: [0, 0, 0, 15] },
      createStyledTable(
        ['Customer', 'Email', 'Claims', 'Claimed', 'Received', 'Approved', 'Rejected', 'Rate', 'Risk Score'],
        reportData.top_customers.slice(0, 20).map(customer => [
          customer.customer_name || 'Unknown',
          customer.customer_email || 'N/A',
          customer.total_claims?.toString() || '0',
          formatCurrency(customer.total_claimed),
          formatCurrency(customer.total_received),
          customer.approved_claims?.toString() || '0',
          customer.rejected_claims?.toString() || '0',
          `${customer.approval_rate || 0}%`,
          Math.round(customer.avg_fraud_score || 0).toString()
        ]),
        { 
          headerColor: '#D97706',
          fontSize: 7,
          widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*']
        }
      )
    ];

    if (reportData.frequency_analysis) {
      content.push(
        { text: 'Customer Behavior Patterns', style: 'subsectionHeader', margin: [0, 20, 0, 15] },
        createStyledTable(
          ['Frequency Group', 'Customer Count', 'Avg Risk Score', 'Percentage'],
          reportData.frequency_analysis.map(freq => {
            const totalCustomers = reportData.frequency_analysis.reduce((sum, f) => sum + f.customer_count, 0);
            const percentage = Math.round((freq.customer_count / totalCustomers) * 100);
            return [
              freq.frequency_group || 'Unknown',
              freq.customer_count?.toString() || '0',
              Math.round(freq.group_avg_fraud_score || 0).toString(),
              `${percentage}%`
            ];
          }),
          { 
            headerColor: '#D97706',
            widths: ['25%', '25%', '25%', '25%']
          }
        )
      );
    }

    return content;
  };

  const handleExportPDF = async () => {
    try {
      console.log('Starting advanced PDF export...');
      
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
      
      const reportTitle = reportTypes.find(r => r.id === activeReport)?.name || 'Report';
      
      let headerContent;
      try {
        headerContent = await createHeader(reportTitle);
      } catch (headerError) {
        console.log('Header creation failed, using simple header:', headerError.message);
        // Simple header without image
        headerContent = [
          {
            text: 'PRIME INSURANCE',
            style: 'companyHeader',
            color: '#159FDB',
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },
          {
            text: 'Professional Insurance Claims Analysis',
            style: 'companySubtitle',
            color: '#6B7280',
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 0, y1: 0,
                x2: 515, y2: 0,
                lineWidth: 3,
                lineColor: '#159FDB'
              }
            ],
            margin: [0, 0, 0, 20]
          },
          {
            text: reportTitle,
            style: 'reportTitleBox',
            alignment: 'center',
            margin: [0, 0, 0, 15]
          }
        ];
      }
      
      const docDefinition = {
  pageSize: 'A4',
  pageMargins: [40, 60, 40, 50], // Reduced top and bottom margins
  
  header: {
    columns: [
      { text: 'PRIME Insurance - Confidential Report', style: 'headerFooter' },
      { text: getCurrentDateTime(), style: 'headerFooter', alignment: 'right' }
    ],
    margin: [40, 15] // Reduced header margin
  },
  
  footer: (currentPage, pageCount) => ({
    columns: [
      { text: '© 2024 PRIME Insurance. All rights reserved.', style: 'headerFooter' },
      { text: `Page ${currentPage} of ${pageCount}`, style: 'headerFooter', alignment: 'right' }
    ],
    margin: [40, 15] // Reduced footer margin
  }),

  content: [
    ...headerContent,
    ...createReportMetadata(),
    
    ...(activeReport === 'overview' ? generateOverviewContent() :
       activeReport === 'claims-by-type' ? generateClaimsByTypeContent() :
       activeReport === 'fraud-analysis' ? generateFraudAnalysisContent() :
       activeReport === 'financial' ? generateFinancialContent() :
       activeReport === 'performance' ? generatePerformanceContent() :
       activeReport === 'customer-analysis' ? generateCustomerAnalysisContent() :
       [{ text: 'No data available for this report type.', style: 'noData', margin: [0, 20] }])
  ],

  styles: {
    // NEW COMPACT HEADER STYLES - ADD THESE:
    companyHeaderCompact: {
      fontSize: 16, // Reduced from 24
      bold: true,
      margin: [0, 0, 0, 2] // Much smaller margin
    },
    companySubtitleCompact: {
      fontSize: 10, // Reduced from 12
      italics: true,
      margin: [0, 0, 0, 0]
    },
    headerDateCompact: {
      fontSize: 8, // Reduced
      color: '#6B7280'
    },
    confidentialCompact: {
      fontSize: 8, // Reduced
      bold: true,
      margin: [0, 2, 0, 0] // Smaller margin
    },
    reportTitleCompact: {
      fontSize: 14, // Reduced from 18
      bold: true,
      color: '#159FDB',
      margin: [0, 5, 0, 5] // Much smaller margins
    },
    
    // KEEP ALL YOUR EXISTING STYLES AND ADD THESE MODIFICATIONS:
    companyHeader: {
      fontSize: 24,
      bold: true,
      margin: [0, 0, 0, 5]
    },
    companySubtitle: {
      fontSize: 12,
      italics: true,
      margin: [0, 0, 0, 0]
    },
    headerDate: {
      fontSize: 10,
      color: '#6B7280'
    },
    confidential: {
      fontSize: 10,
      bold: true,
      margin: [0, 5, 0, 0]
    },
    reportTitleBox: {
      fontSize: 18,
      bold: true,
      color: '#159FDB',
      alignment: 'center',
      margin: [20, 15, 20, 15]
    },
    metadata: {
      fontSize: 10, // Reduced from 11
      color: '#374151',
      lineHeight: 1.3 // Reduced line height
    },
    sectionHeader: {
      fontSize: 14, // Reduced from 16
      bold: true,
      color: '#159FDB',
      margin: [0, 15, 0, 8] // Reduced margins
    },
    subsectionHeader: {
      fontSize: 12, // Reduced from 13
      bold: true,
      color: '#374151',
      margin: [0, 10, 0, 5] // Reduced margins
    },
    metricNumber: {
      fontSize: 16, // Reduced from 18
      bold: true,
      color: '#159FDB'
    },
    metricLabel: {
      fontSize: 9, // Reduced from 10
      color: '#6B7280'
    },
    tableHeader: {
      fontSize: 8, // Reduced from 9
      bold: true
    },
    tableCell: {
      fontSize: 7, // Reduced from 8
    },
    headerFooter: {
      fontSize: 8,
      color: '#6B7280'
    },
    noData: {
      fontSize: 12, // Reduced from 14
      alignment: 'center',
      color: '#6B7280',
      italics: true
    }
  },

  defaultStyle: {
    fontSize: 9, // Reduced from 10
    lineHeight: 1.1, // Reduced from 1.2
    color: '#374151'
  }
};
      const fileName = `PRIME_Insurance_${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      window.pdfMake.createPdf(docDefinition).download(fileName);
      
      console.log('Professional PDF generated successfully');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      if (confirm('PDF generation failed. Would you like to use the browser print dialog instead?')) {
        window.print();
      }
    }
  };

  return (
    <button
      onClick={handleExportPDF}
      className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      title="Export Professional PDF Report"
    >
      <FileText className="w-4 h-4 mr-2" />
      Export PDF
    </button>
  );
};

export default ProfessionalPDFExporter;