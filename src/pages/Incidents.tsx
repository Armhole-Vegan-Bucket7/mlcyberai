
import React, { useState } from 'react';
import { useTenantContext } from '@/contexts/TenantContext';
import { getTenantMetrics, type Incident, type SeverityLevel } from '@/data/tenantMetrics';
import PageLayout from '@/components/layout/PageLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Download, Filter, Search, Shield, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Incidents = () => {
  const { selectedTenant } = useTenantContext();
  const { incidents } = getTenantMetrics(selectedTenant.id);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter incidents based on search query
  const filteredIncidents = incidents.filter(incident => 
    incident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get severity and status badge styling
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

  const getStatusBadgeClasses = (status: Incident['status']) => {
    switch (status) {
      case 'open':
        return "bg-cyber-red/10 text-cyber-red border-cyber-red/30";
      case 'investigating':
        return "bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/30";
      case 'contained':
        return "bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30";
      case 'resolved':
        return "bg-cyber-green/10 text-cyber-green border-cyber-green/30";
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="page-transition">
          <h1 className="text-3xl font-bold">Security Incidents</h1>
          <p className="text-cyber-gray-500 mt-1">
            Track and manage security incidents across your organization
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="glass rounded-full text-sm px-4 py-2 flex items-center gap-2 animate-slide-down">
            <Calendar className="w-4 h-4 text-cyber-blue" />
            <span>Last 30 days</span>
          </div>
          
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          
          <Button size="sm" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Create Incident</span>
          </Button>
        </div>
      </div>
      
      {/* Incident Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass p-4 rounded-xl animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="text-cyber-gray-500 text-sm">Total Incidents</div>
            <Badge variant="outline" className="bg-cyber-gray-100 dark:bg-cyber-gray-800">All Time</Badge>
          </div>
          <div className="mt-2 text-3xl font-bold">{incidents.length}</div>
          <div className="mt-1 text-xs text-cyber-gray-500">Across all systems</div>
        </div>
        
        <div className="glass p-4 rounded-xl animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="text-cyber-gray-500 text-sm">Active Incidents</div>
            <Badge variant="outline" className="bg-cyber-red/10 text-cyber-red border-cyber-red/30">Attention</Badge>
          </div>
          <div className="mt-2 text-3xl font-bold">
            {incidents.filter(i => i.status === 'open' || i.status === 'investigating').length}
          </div>
          <div className="mt-1 text-xs text-cyber-gray-500">Requires investigation</div>
        </div>
        
        <div className="glass p-4 rounded-xl animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="text-cyber-gray-500 text-sm">Critical Severity</div>
            <Badge variant="outline" className="bg-cyber-red/10 text-cyber-red border-cyber-red/30">High Risk</Badge>
          </div>
          <div className="mt-2 text-3xl font-bold">
            {incidents.filter(i => i.severity === 'critical').length}
          </div>
          <div className="mt-1 text-xs text-cyber-gray-500">Immediate action required</div>
        </div>
        
        <div className="glass p-4 rounded-xl animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="text-cyber-gray-500 text-sm">Avg. Resolution Time</div>
            <Badge variant="outline" className="bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30">Metric</Badge>
          </div>
          <div className="mt-2 text-3xl font-bold">3.2d</div>
          <div className="mt-1 text-xs text-cyber-gray-500">For high severity incidents</div>
        </div>
      </div>
      
      {/* Incident Management Interface */}
      <div className="glass rounded-xl p-6 animate-fade-in">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <Tabs defaultValue="all" className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="all">All Incidents</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="investigating">Investigating</TabsTrigger>
              <TabsTrigger value="contained">Contained</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-grow lg:flex-grow-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search incidents..." 
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
        
        {/* Incidents Table */}
        <div className="rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Incident</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Affected Systems</TableHead>
                <TableHead>Detected</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">{incident.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{incident.name}</div>
                        <div className="text-xs text-cyber-gray-500 mt-1 line-clamp-1">{incident.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getSeverityBadgeClasses(incident.severity)}>
                        {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeClasses(incident.status)}>
                        {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {incident.affectedSystems.slice(0, 2).map((system, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                        {incident.affectedSystems.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{incident.affectedSystems.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-cyber-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(incident.detectedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-cyber-gray-200 dark:bg-cyber-gray-700 flex items-center justify-center text-xs mr-2">
                          <User className="w-3 h-3" />
                        </div>
                        {incident.assignedTo}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-cyber-gray-500">
                    No incidents found matching your search
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-cyber-gray-500">
            Showing {filteredIncidents.length} of {incidents.length} incidents
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

export default Incidents;
