
import React, { useState, useEffect } from 'react';
import { useTenantContext } from '@/contexts/TenantContext';
import { getTenantMetrics, type Vulnerability, type SeverityLevel } from '@/data/tenantMetrics';
import PageLayout from '@/components/layout/PageLayout';
import ChartCard from '@/components/dashboard/ChartCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, ChevronDown, Clock, Download, ExternalLink, 
  Filter, Search, Shield 
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Vulnerabilities = () => {
  const { selectedTenant } = useTenantContext();
  const { vulnerabilities } = getTenantMetrics(selectedTenant.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | SeverityLevel>('all');
  
  // Calculate vulnerability metrics
  const totalVulnerabilities = vulnerabilities.length;
  const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
  const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
  const mediumCount = vulnerabilities.filter(v => v.severity === 'medium').length;
  const lowCount = vulnerabilities.filter(v => v.severity === 'low').length;
  
  const vulnerabilityByStatus = [
    { name: 'New', value: vulnerabilities.filter(v => v.status === 'new').length },
    { name: 'In Progress', value: vulnerabilities.filter(v => v.status === 'in progress').length },
    { name: 'Resolved', value: vulnerabilities.filter(v => v.status === 'resolved').length },
    { name: 'Accepted', value: vulnerabilities.filter(v => v.status === 'accepted').length },
  ];
  
  const vulnerabilityBySeverity = [
    { name: 'Critical', value: criticalCount },
    { name: 'High', value: highCount },
    { name: 'Medium', value: mediumCount },
    { name: 'Low', value: lowCount },
  ];
  
  // Filter vulnerabilities based on search query and severity filter
  const filteredVulnerabilities = vulnerabilities.filter(vulnerability => {
    // Apply search filter
    const matchesSearch = 
      vulnerability.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vulnerability.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vulnerability.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vulnerability.cve && vulnerability.cve.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply severity filter
    const matchesSeverity = activeFilter === 'all' || vulnerability.severity === activeFilter;
    
    return matchesSearch && matchesSeverity;
  });

  // Handle tab change
  const handleTabChange = (value: string) => {
    if (value === 'all' || value === 'critical' || value === 'high' || value === 'medium' || value === 'low') {
      setActiveFilter(value as 'all' | SeverityLevel);
    }
  };

  // Get severity badge styling
  const getSeverityBadgeClasses = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical':
        return "bg-cyber-red/10 text-cyber-red border-cyber-red/30";
      case 'high':
        return "bg-cyber-orange/10 text-cyber-orange border-cyber-orange/30";
      case 'medium':
        return "bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/30";
      case 'low':
        return "bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30";
    }
  };

  const getStatusBadgeClasses = (status: Vulnerability['status']) => {
    switch (status) {
      case 'new':
        return "bg-cyber-red/10 text-cyber-red border-cyber-red/30";
      case 'in progress':
        return "bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/30";
      case 'resolved':
        return "bg-cyber-green/10 text-cyber-green border-cyber-green/30";
      case 'accepted':
        return "bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30";
    }
  };

  const getCVSSColor = (score: number) => {
    if (score >= 9.0) return "text-cyber-red";
    if (score >= 7.0) return "text-cyber-orange";
    if (score >= 4.0) return "text-cyber-yellow";
    return "text-cyber-blue";
  };

  return (
    
    <PageLayout>
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="page-transition">
          <h1 className="text-3xl font-bold">Vulnerabilities</h1>
          <p className="text-cyber-gray-500 mt-1">
            Track and remediate security vulnerabilities
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="glass rounded-full text-sm px-4 py-2 flex items-center gap-2 animate-slide-down">
            <Calendar className="w-4 h-4 text-cyber-blue" />
            <span>Last 90 days</span>
          </div>
          
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          
          <Button size="sm" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Run New Scan</span>
          </Button>
        </div>
      </div>
      
      {/* Vulnerability Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="glass p-6 rounded-xl col-span-1 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Vulnerability Risk</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <div className="text-sm font-medium">Critical</div>
                <div className="text-sm font-semibold">{criticalCount}</div>
              </div>
              <Progress 
                value={(criticalCount / totalVulnerabilities) * 100} 
                className="h-2" 
                indicatorClassName="bg-cyber-red" 
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <div className="text-sm font-medium">High</div>
                <div className="text-sm font-semibold">{highCount}</div>
              </div>
              <Progress 
                value={(highCount / totalVulnerabilities) * 100} 
                className="h-2" 
                indicatorClassName="bg-cyber-orange" 
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <div className="text-sm font-medium">Medium</div>
                <div className="text-sm font-semibold">{mediumCount}</div>
              </div>
              <Progress 
                value={(mediumCount / totalVulnerabilities) * 100} 
                className="h-2" 
                indicatorClassName="bg-cyber-yellow" 
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <div className="text-sm font-medium">Low</div>
                <div className="text-sm font-semibold">{lowCount}</div>
              </div>
              <Progress 
                value={(lowCount / totalVulnerabilities) * 100} 
                className="h-2" 
                indicatorClassName="bg-cyber-blue" 
              />
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-cyber-gray-500">Total Vulnerabilities</div>
              <div className="text-2xl font-bold mt-1">{totalVulnerabilities}</div>
            </div>
            
            <div>
              <div className="text-sm text-cyber-gray-500">Remediation SLA</div>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold">85%</span>
                <span className="text-xs bg-cyber-green/10 text-cyber-green px-2 py-0.5 rounded ml-2">On Track</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard
            title="Vulnerabilities by Severity"
            type="pie"
            data={vulnerabilityBySeverity}
            height={220}
            colors={['#FF3B30', '#FF9500', '#FFCC00', '#5AC8FA']}
          />
          
          <ChartCard
            title="Vulnerabilities by Status"
            type="pie"
            data={vulnerabilityByStatus}
            height={220}
            colors={['#FF3B30', '#FFCC00', '#34C759', '#5AC8FA']}
          />
        </div>
      </div>
      
      {/* Vulnerability Management Interface */}
      <div className="glass rounded-xl p-6 animate-fade-in">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <Tabs 
            defaultValue="all" 
            value={activeFilter}
            onValueChange={handleTabChange}
            className="w-full max-w-md"
          >
            <TabsList>
              <TabsTrigger value="all">All Vulnerabilities</TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="high">High</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="low">Low</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-grow lg:flex-grow-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search vulnerabilities..." 
                className="pl-9 w-full lg:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Vulnerabilities Table */}
        <div className="rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Vulnerability</TableHead>
                <TableHead>CVE</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>CVSS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Affected Systems</TableHead>
                <TableHead>Discovered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVulnerabilities.length > 0 ? (
                filteredVulnerabilities.map((vulnerability) => (
                  <TableRow key={vulnerability.id}>
                    <TableCell className="font-medium">{vulnerability.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{vulnerability.name}</div>
                        <div className="text-xs text-cyber-gray-500 mt-1 line-clamp-1">{vulnerability.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {vulnerability.cve ? (
                        <a 
                          href={`https://nvd.nist.gov/vuln/detail/${vulnerability.cve}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-cyber-blue hover:underline"
                        >
                          {vulnerability.cve}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-cyber-gray-500">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getSeverityBadgeClasses(vulnerability.severity)}>
                        {vulnerability.severity.charAt(0).toUpperCase() + vulnerability.severity.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getCVSSColor(vulnerability.cvss)}`}>
                        {vulnerability.cvss.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeClasses(vulnerability.status)}>
                        {vulnerability.status.charAt(0).toUpperCase() + vulnerability.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {vulnerability.affectedSystems.slice(0, 2).map((system, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                        {vulnerability.affectedSystems.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{vulnerability.affectedSystems.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-cyber-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(vulnerability.discoveredAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-cyber-gray-500">
                    No vulnerabilities found matching your search
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-cyber-gray-500">
            Showing {filteredVulnerabilities.length} of {vulnerabilities.length} vulnerabilities
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Vulnerabilities;
