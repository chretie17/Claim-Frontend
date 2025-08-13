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

  // Enhanced logo loading with larger size
  const getLogoBase64 = async () => {
    try {
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
    
    // Enhanced SVG fallback logo - larger and more detailed
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
  const createHeader = async (reportTitle) => {
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
      // Empty space for balance when no logo
      headerColumns.push({
        width: 120,
        text: ''
      });
    }
    
    // Company information in center
    headerColumns.push({
      width: '*',
      stack: [
        {
          text: 'PRIME INSURANCE',
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
          text: 'Website: www.prime.rw',
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
      },
      
      // Report Title
      {
        text: reportTitle,
        style: 'landscapeReportTitle',
        alignment: 'center',
        margin: [0, 10, 0, 20]
      }
    ];
  };

  // Enhanced table creation for landscape format
// Replace your existing createStyledTable function with this enhanced version:

const createStyledTable = (headers, data, options = {}) => {
  const { 
    headerColor = '#159FDB',
    alternatingRows = true,
    fontSize = 10,
    widths = null 
  } = options;

  return [
    // Original table
    {
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
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 6,
        paddingBottom: () => 6
      },
      fontSize: fontSize,
      margin: [0, 8, 0, 10] // Reduced bottom margin
    },
    
    // Generated by section after every table - left aligned and smaller
    {
      stack: [
        {
          text: 'Generated by: Sangwa Roxane',
          fontSize: 8,
          bold: true,
          color: '#6B7280',
          alignment: 'left',
          margin: [0, 5, 0, 1]
        },
        {
          text: getCurrentDateTime(),
          fontSize: 7,
          color: '#9CA3AF',
          italics: true,
          alignment: 'left'
        }
      ],
      margin: [0, 0, 0, 15] // Space after generated by section
    }
  ];
};

  // Generate report metadata for landscape
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
              style: 'landscapeMetadata',
              fillColor: '#F8F9FA',
              margin: [12, 10, 12, 10]
            }]]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#D1D5DB',
            vLineColor: () => '#D1D5DB'
          },
          margin: [0, 0, 0, 15]
        }
      ];
    }
    return [];
  };

  const generateOverviewContent = () => {
    if (!reportData?.summary) return [];

    const { summary } = reportData;

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
    ];

    return [
      ...createReportMetadata(),
      createStyledTable(
        ['Metric', 'Value', 'Percentage'],
        detailData,
        { widths: ['40%', '35%', '25%'] }
      )
    ];
  };

  const generateClaimsByTypeContent = () => {
    if (!reportData?.data) return [];

    const content = [...createReportMetadata()];

    reportData.data.forEach((typeData, index) => {
      const typeColor = ['#159FDB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5];
      
      content.push({
        text: `${typeData.insurance_type.charAt(0).toUpperCase() + typeData.insurance_type.slice(1)} Insurance`, 
        style: 'landscapeSubsectionHeader', 
        color: typeColor,
        margin: [0, 20, 0, 12],
        pageBreak: index > 0 ? 'before' : undefined
      });

      // Combined table for landscape view
      content.push(
        createStyledTable(
          ['Category', 'Total', 'Pending', 'Approved', 'Rejected', 'Rate', 'Total Claimed', 'Avg Amount', 'Total Payout'],
          typeData.categories.map(category => [
            category.category.charAt(0).toUpperCase() + category.category.slice(1),
            category.total_claims?.toString() || '0',
            category.pending_claims?.toString() || '0',
            category.approved_claims?.toString() || '0',
            category.rejected_claims?.toString() || '0',
            `${category.approval_rate || 0}%`,
            formatCurrency(category.total_claimed),
            formatCurrency(category.average_amount),
            formatCurrency(category.total_payout)
          ]),
          { 
            headerColor: typeColor, 
            fontSize: 10,
            widths: ['15%', '10%', '10%', '10%', '10%', '10%', '12%', '12%', '12%']
          }
        )
      );
    });

    return content;
  };

  const generateFraudAnalysisContent = () => {
    if (!reportData?.risk_analysis) return [];

    const content = [
      ...createReportMetadata(),
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
          fontSize: 10,
          widths: ['12%', '15%', '10%', '12%', '15%', '10%', '10%', '16%']
        }
      )
    ];

    if (reportData.score_distribution) {
      content.push(
        { text: 'Fraud Score Distribution', style: 'landscapeSubsectionHeader', margin: [0, 25, 0, 15] },
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
      ...createReportMetadata(),
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
          fontSize: 11,
          widths: ['18%', '12%', '16%', '16%', '12%', '12%', '14%']
        }
      )
    ];

    if (reportData.monthly_breakdown) {
      content.push(
        { text: 'Monthly Financial Trends', style: 'landscapeSubsectionHeader', margin: [0, 25, 0, 15] },
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
            widths: ['25%', '15%', '25%', '25%', '15%']
          }
        )
      );
    }

    return content;
  };

  const generatePerformanceContent = () => {
    if (!reportData?.processing_times) return [];

    const content = [
      ...createReportMetadata(),
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
          widths: ['20%', '20%', '15%', '15%', '15%', '15%']
        }
      )
    ];

    if (reportData.admin_workload) {
      content.push(
        { text: 'Admin Performance Metrics', style: 'landscapeSubsectionHeader', margin: [0, 25, 0, 15] },
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
            fontSize: 10,
            widths: ['20%', '12%', '12%', '12%', '12%', '12%', '12%']
          }
        )
      );
    }

    return content;
  };

  const generateCustomerAnalysisContent = () => {
    if (!reportData?.top_customers) return [];

    const content = [
      ...createReportMetadata(),
      
      { text: 'Top Customers Analysis', style: 'landscapeSubsectionHeader', margin: [0, 5, 0, 12] },
      createStyledTable(
        ['Customer', 'Email', 'Claims', 'Approved', 'Rejected', 'Rate', 'Total Claimed', 'Total Received', 'Risk Score'],
        reportData.top_customers.slice(0, 25).map(customer => [
          customer.customer_name || 'Unknown',
          customer.customer_email || 'N/A',
          customer.total_claims?.toString() || '0',
          customer.approved_claims?.toString() || '0',
          customer.rejected_claims?.toString() || '0',
          `${customer.approval_rate || 0}%`,
          formatCurrency(customer.total_claimed),
          formatCurrency(customer.total_received),
          Math.round(customer.avg_fraud_score || 0).toString()
        ]),
        { 
          headerColor: '#D97706',
          fontSize: 9,
          widths: ['18%', '22%', '8%', '8%', '8%', '8%', '12%', '12%', '8%']
        }
      )
    ];

    if (reportData.frequency_analysis) {
      content.push(
        { text: 'Customer Behavior Patterns', style: 'landscapeSubsectionHeader', margin: [0, 25, 0, 15] },
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
      console.log('Starting landscape PDF export...');
      
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
        headerContent = [
          {
            text: 'PRIME INSURANCE',
            style: 'companyHeader',
            color: '#159FDB',
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },
          {
            text: reportTitle,
            style: 'landscapeReportTitle',
            alignment: 'center',
            margin: [0, 0, 0, 15]
          }
        ];
      }
      
      const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape', // KEY: Set to landscape
        pageMargins: [40, 50, 40, 40], // Adjusted margins for landscape
        
        header: {
          columns: [
            { text: 'PRIME Insurance - Confidential Report', style: 'headerFooter' },
            { text: '', style: 'headerFooter' }, // Spacer
          ],
          margin: [40, 12]
        },
        
      footer: (currentPage, pageCount) => ({
  columns: [
    { text: '© 2025 PRIME Insurance. All rights reserved.', style: 'headerFooter' },
    { text: '', style: 'headerFooter' },
    { text: `Page ${currentPage} of ${pageCount}`, style: 'headerFooter', alignment: 'right' }
  ],
  margin: [40, 12]
}),

        content: [
          ...headerContent,
          
          ...(activeReport === 'overview' ? generateOverviewContent() :
             activeReport === 'claims-by-type' ? generateClaimsByTypeContent() :
             activeReport === 'fraud-analysis' ? generateFraudAnalysisContent() :
             activeReport === 'financial' ? generateFinancialContent() :
             activeReport === 'performance' ? generatePerformanceContent() :
             activeReport === 'customer-analysis' ? generateCustomerAnalysisContent() :
             [{ text: 'No data available for this report type.', style: 'noData', margin: [0, 20] }]),
        ],

        styles: {
          bigCenterHeader: {
            fontSize: 26,
            bold: true,
            color: '#159FDB',
            margin: [0, 0, 0, 2]
          },
          companyAddress: {
            fontSize: 11,
            color: '#6B7280',
            margin: [0, 1, 0, 0]
          },
          companyTagline: {
            fontSize: 10,
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
          landscapeReportTitle: {
            fontSize: 20,
            bold: true,
            color: '#159FDB',
            alignment: 'center'
          },
          landscapeMetadata: {
            fontSize: 11,
            color: '#374151',
            lineHeight: 1.4
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
          headerFooter: {
            fontSize: 8,
            color: '#6B7280'
          },
          noData: {
            fontSize: 14,
            alignment: 'center',
            color: '#6B7280',
            italics: true
          }
        },

        defaultStyle: {
          fontSize: 10,
          lineHeight: 1.2,
          color: '#374151'
        }
      };

      const fileName = `PRIME_Insurance_${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}_Landscape.pdf`;
      window.pdfMake.createPdf(docDefinition).download(fileName);
      
      console.log('Landscape PDF generated successfully');
      
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
      title="Export Professional Landscape PDF Report"
    >
      <FileText className="w-4 h-4 mr-2" />
      Export PDF
    </button>
  );
};

export default ProfessionalPDFExporter;