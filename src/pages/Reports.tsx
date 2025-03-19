
import React, { useState } from 'react';
import { useTenantContext } from '@/contexts/TenantContext';
import PageLayout from '@/components/layout/PageLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Download,
  FileBarChart,
  FileText,
  Globe,
  Layers,
  Mail,
  Printer,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Report, ReportStatus, ReportCategory } from '@/types/report';
import { downloadReport } from '@/utils/ReportUtils';
import GenerateReportDialog from '@/components/reports/GenerateReportDialog';
import MicrolandLogo from '@/components/reports/MicrolandLogo';
import { toast } from '@/hooks/use-toast';

const Reports = () => {
  const { selectedTenant } = useTenantContext();
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [reports, setReports] = useState<Report[]>(() => generateReports());
  
  // Generate tenant-specific reports
  function generateReports(): Report[] {
    const baseReports: Report[] = [
      {
        id: `${selectedTenant.id}-REP-001`,
        name: "Monthly Security Summary",
        description: "Overview of security incidents, alerts, and metrics for the past month",
        category: "security",
        status: "ready",
        lastGenerated: "2023-11-30T09:15:00Z",
        nextScheduled: "2023-12-31T09:00:00Z",
        format: "PDF"
      },
      {
        id: `${selectedTenant.id}-REP-002`,
        name: "Vulnerability Scan Results",
        description: "Comprehensive vulnerability assessment results with remediation recommendations",
        category: "vulnerability",
        status: "ready",
        lastGenerated: "2023-12-01T14:30:00Z",
        format: "PDF"
      },
      {
        id: `${selectedTenant.id}-REP-003`,
        name: "Compliance Dashboard",
        description: "Compliance status against industry standards and regulations",
        category: "compliance",
        status: "scheduled",
        nextScheduled: "2023-12-15T08:00:00Z",
        format: "PDF"
      },
      {
        id: `${selectedTenant.id}-REP-004`,
        name: "Incident Response Summary",
        description: "Detailed analysis of security incidents and response metrics",
        category: "incident",
        status: "generating",
        format: "PDF"
      },
      {
        id: `${selectedTenant.id}-REP-005`,
        name: "User Access Audit",
        description: "Audit of user permissions and access control changes",
        category: "audit",
        status: "ready",
        lastGenerated: "2023-11-25T11:20:00Z",
        format: "XLSX"
      },
      {
        id: `${selectedTenant.id}-REP-006`,
        name: "Executive Security Brief",
        description: "Executive summary of security posture and key metrics",
        category: "security",
        status: "scheduled",
        nextScheduled: "2023-12-05T15:00:00Z",
        format: "PDF"
      },
      {
        id: `${selectedTenant.id}-REP-007`,
        name: "Security Awareness Metrics",
        description: "Employee security training compliance and phishing test results",
        category: "compliance",
        status: "ready",
        lastGenerated: "2023-11-28T16:45:00Z",
        format: "PDF"
      },
      {
        id: `${selectedTenant.id}-REP-008`,
        name: "Network Security Assessment",
        description: "Analysis of network security controls and identified gaps",
        category: "security",
        status: "ready",
        lastGenerated: "2023-11-20T10:30:00Z",
        format: "PDF"
      }
    ];
    
    // Add tenant-specific customization
    if (selectedTenant.id === '1') { // Microland
      baseReports.push({
        id: "ML-REP-009",
        name: "MSSP Client Security Overview",
        description: "Aggregated security metrics across all managed clients",
        category: "security",
        status: "ready",
        lastGenerated: "2023-12-01T08:15:00Z",
        format: "PDF"
      });
    } else if (selectedTenant.id === '2') { // RSM
      baseReports.push({
        id: "RSM-REP-009",
        name: "Financial Services Compliance",
        description: "Industry-specific compliance report for financial regulations",
        category: "compliance",
        status: "ready",
        lastGenerated: "2023-11-30T14:20:00Z",
        format: "PDF"
      });
    } else if (selectedTenant.id === '3') { // Indorama
      baseReports.push({
        id: "IND-REP-009",
        name: "OT Security Assessment",
        description: "Security assessment of operational technology environments",
        category: "security",
        status: "ready",
        lastGenerated: "2023-11-29T11:30:00Z",
        format: "PDF"
      });
    }
    
    return baseReports;
  };
  
  // Handle report download
  const handleDownloadReport = (report: Report) => {
    downloadReport(report);
  };
  
  // Handle email reports
  const handleEmailReports = () => {
    toast({
      title: "Reports Emailed",
      description: "Selected reports have been emailed successfully.",
      variant: "default",
    });
  };
  
  // Handle print list
  const handlePrintList = () => {
    window.print();
    toast({
      title: "Print Requested",
      description: "Report list sent to printer.",
      variant: "default",
    });
  };
  
  // Handle new report generation
  const handleReportGenerated = (newReport: Report) => {
    setReports(prevReports => [newReport, ...prevReports]);
  };
  
  // View report
  const handleViewReport = (report: Report) => {
    toast({
      title: "Viewing Report",
      description: `Opening ${report.name} for viewing.`,
      variant: "default",
    });
  };
  
  // Utilities for rendering
  const getCategoryIcon = (category: ReportCategory) => {
    switch (category) {
      case 'security':
        return <ShieldCheck className="w-4 h-4" />;
      case 'compliance':
        return <FileText className="w-4 h-4" />;
      case 'vulnerability':
        return <Layers className="w-4 h-4" />;
      case 'incident':
        return <Globe className="w-4 h-4" />;
      case 'audit':
        return <Users className="w-4 h-4" />;
    }
  };
  
  const getCategoryBadgeClasses = (category: ReportCategory) => {
    switch (category) {
      case 'security':
        return "bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30";
      case 'compliance':
        return "bg-cyber-purple/10 text-cyber-purple border-cyber-purple/30";
      case 'vulnerability':
        return "bg-cyber-orange/10 text-cyber-orange border-cyber-orange/30";
      case 'incident':
        return "bg-cyber-red/10 text-cyber-red border-cyber-red/30";
      case 'audit':
        return "bg-cyber-green/10 text-cyber-green border-cyber-green/30";
    }
  };
  
  const getStatusBadgeClasses = (status: ReportStatus) => {
    switch (status) {
      case 'ready':
        return "bg-cyber-green/10 text-cyber-green border-cyber-green/30";
      case 'scheduled':
        return "bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30";
      case 'generating':
        return "bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/30";
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="page-transition">
          <div className="flex items-center gap-3">
            <MicrolandLogo />
            <h1 className="text-3xl font-bold">Security Reports</h1>
          </div>
          <p className="text-cyber-gray-500 mt-1">
            Access and manage your security reports and analytics
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="glass rounded-full text-sm px-4 py-2 flex items-center gap-2 animate-slide-down">
            <Calendar className="w-4 h-4 text-cyber-blue" />
            <span>Last 90 days</span>
          </div>
          
          <Button 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setShowGenerateDialog(true)}
          >
            <FileBarChart className="w-4 h-4" />
            <span>Generate New Report</span>
          </Button>
        </div>
      </div>
      
      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="glass p-4 rounded-xl animate-fade-in">
          <div className="flex items-center gap-2 mb-2 text-cyber-blue">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-semibold">Security</h3>
            <MicrolandLogo className="h-4 ml-auto" />
          </div>
          <p className="text-sm text-cyber-gray-500">General security posture and metrics</p>
          <div className="mt-3 text-2xl font-bold">
            {reports.filter(r => r.category === 'security').length}
          </div>
        </div>
        
        <div className="glass p-4 rounded-xl animate-fade-in">
          <div className="flex items-center gap-2 mb-2 text-cyber-purple">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold">Compliance</h3>
            <MicrolandLogo className="h-4 ml-auto" />
          </div>
          <p className="text-sm text-cyber-gray-500">Regulatory and policy compliance</p>
          <div className="mt-3 text-2xl font-bold">
            {reports.filter(r => r.category === 'compliance').length}
          </div>
        </div>
        
        <div className="glass p-4 rounded-xl animate-fade-in">
          <div className="flex items-center gap-2 mb-2 text-cyber-orange">
            <Layers className="w-5 h-5" />
            <h3 className="font-semibold">Vulnerabilities</h3>
            <MicrolandLogo className="h-4 ml-auto" />
          </div>
          <p className="text-sm text-cyber-gray-500">Vulnerability assessments and scans</p>
          <div className="mt-3 text-2xl font-bold">
            {reports.filter(r => r.category === 'vulnerability').length}
          </div>
        </div>
        
        <div className="glass p-4 rounded-xl animate-fade-in">
          <div className="flex items-center gap-2 mb-2 text-cyber-red">
            <Globe className="w-5 h-5" />
            <h3 className="font-semibold">Incidents</h3>
            <MicrolandLogo className="h-4 ml-auto" />
          </div>
          <p className="text-sm text-cyber-gray-500">Security incident analysis</p>
          <div className="mt-3 text-2xl font-bold">
            {reports.filter(r => r.category === 'incident').length}
          </div>
        </div>
        
        <div className="glass p-4 rounded-xl animate-fade-in">
          <div className="flex items-center gap-2 mb-2 text-cyber-green">
            <Users className="w-5 h-5" />
            <h3 className="font-semibold">Audits</h3>
            <MicrolandLogo className="h-4 ml-auto" />
          </div>
          <p className="text-sm text-cyber-gray-500">Access and activity audits</p>
          <div className="mt-3 text-2xl font-bold">
            {reports.filter(r => r.category === 'audit').length}
          </div>
        </div>
      </div>
      
      {/* Reports Table */}
      <div className="glass rounded-xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Available Reports</h2>
            <MicrolandLogo className="h-5" />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handlePrintList}
            >
              <Printer className="w-4 h-4" />
              <span>Print List</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleEmailReports}
            >
              <Mail className="w-4 h-4" />
              <span>Email Reports</span>
            </Button>
          </div>
        </div>
        
        <div className="rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Report Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Generated</TableHead>
                <TableHead>Next Scheduled</TableHead>
                <TableHead>Format</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-xs text-cyber-gray-500 mt-1 line-clamp-1">{report.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryBadgeClasses(report.category)}>
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(report.category)}
                        <span>{report.category.charAt(0).toUpperCase() + report.category.slice(1)}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeClasses(report.status)}>
                      {report.status === 'ready' ? 'Ready' : 
                       report.status === 'scheduled' ? 'Scheduled' : 'Generating'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {report.lastGenerated ? (
                      <div className="flex items-center text-sm text-cyber-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(report.lastGenerated)}
                      </div>
                    ) : (
                      <span className="text-cyber-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {report.nextScheduled ? (
                      <div className="flex items-center text-sm text-cyber-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(report.nextScheduled)}
                      </div>
                    ) : (
                      <span className="text-cyber-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{report.format}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {report.status === 'ready' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => handleDownloadReport(report)}
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewReport(report)}
                      >
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination (simplified) */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-cyber-gray-500">
            Showing {reports.length} reports
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
      
      {/* Generate Report Dialog */}
      <GenerateReportDialog 
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onReportGenerated={handleReportGenerated}
      />
    </PageLayout>
  );
};

export default Reports;
