
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import MetricCard from '@/components/dashboard/MetricCard';
import StatusCard from '@/components/dashboard/StatusCard';
import ChartCard from '@/components/dashboard/ChartCard';
import ThreatActivityTable from '@/components/dashboard/ThreatActivityTable';
import MetricsSearch from '@/components/dashboard/MetricsSearch';
import { Shield, AlertCircle, Bug, Clock, Users, Server } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for dashboard
const alertsChartData = [
  { name: 'Mon', alerts: 12, incidents: 3 },
  { name: 'Tue', alerts: 19, incidents: 5 },
  { name: 'Wed', alerts: 10, incidents: 2 },
  { name: 'Thu', alerts: 22, incidents: 7 },
  { name: 'Fri', alerts: 18, incidents: 6 },
  { name: 'Sat', alerts: 7, incidents: 1 },
  { name: 'Sun', alerts: 5, incidents: 0 },
];

const vulnerabilitiesData = [
  { name: 'Critical', value: 23 },
  { name: 'High', value: 45 },
  { name: 'Medium', value: 78 },
  { name: 'Low', value: 134 },
];

const threatData = [
  { name: 'Malware', value: 42 },
  { name: 'Phishing', value: 28 },
  { name: 'Network', value: 17 },
  { name: 'Identity', value: 13 },
];

// Fixed the threatEvents data to use the correct type for eventType
const threatEvents = [
  {
    id: '1',
    timestamp: '2023-12-01 15:32:47',
    eventType: 'incident' as const,
    severity: 'critical' as const,
    source: 'Sentinel',
    details: 'Multiple failed login attempts detected from suspicious IP address'
  },
  {
    id: '2',
    timestamp: '2023-12-01 14:21:18',
    eventType: 'alert' as const,
    severity: 'high' as const,
    source: 'Crowdstrike',
    details: 'Potential data exfiltration activity detected on endpoint WKSTN-284'
  },
  {
    id: '3',
    timestamp: '2023-12-01 13:45:33',
    eventType: 'detection' as const,
    severity: 'medium' as const,
    source: 'Defender',
    details: 'Suspicious PowerShell command execution on server SRV-DB01'
  },
  {
    id: '4',
    timestamp: '2023-12-01 11:29:05',
    eventType: 'alert' as const,
    severity: 'medium' as const,
    source: 'Sentinel',
    details: 'Unusual access pattern to sensitive resources from user admin@company.com'
  },
  {
    id: '5',
    timestamp: '2023-12-01 09:53:22',
    eventType: 'detection' as const,
    severity: 'low' as const,
    source: 'Defender',
    details: 'New application installed on endpoint WKSTN-134'
  },
];

const Index = () => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  
  useEffect(() => {
    // Function to update the current date and time
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(format(now, 'MMMM d, yyyy HH:mm') + ' UTC');
    };
    
    // Update immediately on mount
    updateDateTime();
    
    // Then update every minute
    const interval = setInterval(updateDateTime, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="page-transition flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">CyberPosture</h1>
            <p className="text-cyber-gray-500 mt-1">
              Overview of your security posture across all systems
            </p>
          </div>
        </div>
        
        <div className="glass rounded-full text-sm px-4 py-2 animate-slide-down">
          Last updated: <span className="font-medium">{currentDateTime}</span>
        </div>
      </div>
      
      <div className="mb-6">
        <MetricsSearch />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Active Incidents"
          value={8}
          icon={<AlertCircle className="w-5 h-5" />}
          change={{ value: '2 new today', type: 'increase' }}
          tooltip="Total number of active security incidents currently being investigated"
        />
        
        <MetricCard
          title="Total Alerts"
          value={127}
          icon={<Shield className="w-5 h-5" />}
          change={{ value: '15% from yesterday', type: 'increase' }}
          tooltip="Total number of security alerts raised in the last 24 hours"
        />
        
        <MetricCard
          title="Open Vulnerabilities"
          value={280}
          icon={<Bug className="w-5 h-5" />}
          change={{ value: '5% from last week', type: 'decrease' }}
          tooltip="Total number of unpatched vulnerabilities across all assets"
        />
        
        <MetricCard
          title="Average MTTR"
          value="3.2 days"
          icon={<Clock className="w-5 h-5" />}
          change={{ value: '0.5 days improvement', type: 'decrease' }}
          tooltip="Mean Time To Remediate security incidents"
          footer="For high severity incidents"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard
          title="Alert & Incident Trend (Last 7 Days)"
          type="area"
          data={alertsChartData}
          className="lg:col-span-2"
          height={240}
        />
        
        <StatusCard
          title="Security Status"
          status="critical"
          statusText="Critical Issues Detected"
          details={
            <div className="space-y-3 mt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Endpoint Protection</span>
                  <span className="text-cyber-orange font-medium">Warning</span>
                </div>
                <div className="w-full bg-cyber-gray-200 dark:bg-cyber-gray-700 rounded-full h-1.5">
                  <div className="bg-cyber-orange h-1.5 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Network Security</span>
                  <span className="text-cyber-red font-medium">Critical</span>
                </div>
                <div className="w-full bg-cyber-gray-200 dark:bg-cyber-gray-700 rounded-full h-1.5">
                  <div className="bg-cyber-red h-1.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Cloud Security</span>
                  <span className="text-cyber-green font-medium">Good</span>
                </div>
                <div className="w-full bg-cyber-gray-200 dark:bg-cyber-gray-700 rounded-full h-1.5">
                  <div className="bg-cyber-green h-1.5 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>
          }
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard
          title="Vulnerability Distribution"
          type="pie"
          data={vulnerabilitiesData}
          height={240}
          colors={['#FF3B30', '#FF9500', '#FFCC00', '#5AC8FA']}
        />
        
        <ChartCard
          title="Threat Categories"
          type="pie"
          data={threatData}
          height={240}
          colors={['#FF2D55', '#FF9500', '#5856D6', '#0076FF']}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <ThreatActivityTable events={threatEvents} />
      </div>
    </PageLayout>
  );
};

export default Index;
