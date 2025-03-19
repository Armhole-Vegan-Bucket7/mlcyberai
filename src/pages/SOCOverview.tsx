
import React from 'react';
import { useTenantContext } from '@/contexts/TenantContext';
import { getTenantMetrics } from '@/data/tenantMetrics';
import PageLayout from '@/components/layout/PageLayout';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/dashboard/ChartCard';
import StatusCard from '@/components/dashboard/StatusCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, Calendar, Download, ExternalLink, 
  PieChart, ShieldAlert, Zap
} from 'lucide-react';

const SOCOverview = () => {
  const { selectedTenant } = useTenantContext();
  const {
    socMetrics,
    alertMetrics,
    mttrByPriority,
    securityPostureScore,
    alertTrends
  } = getTenantMetrics(selectedTenant.id);

  // Define colors for charts
  const alertColors = ['#FF3B30', '#FF9500', '#FFCC00', '#5AC8FA', '#34C759'];

  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="page-transition">
          <h1 className="text-3xl font-bold">SOC Overview</h1>
          <p className="text-cyber-gray-500 mt-1">
            Security operations center metrics and status
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
        </div>
      </div>
      
      {/* Security Posture Score Card */}
      <div className="glass p-6 rounded-xl mb-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Security Posture Score</h2>
            <p className="text-cyber-gray-500 text-sm">Overall security health assessment</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold">
              {securityPostureScore}
              <span className="text-sm font-normal text-cyber-gray-500">/100</span>
            </div>
            
            <div className="flex flex-col">
              {securityPostureScore >= 80 ? (
                <Badge variant="outline" className="bg-cyber-green/10 text-cyber-green border-cyber-green/30">
                  Good
                </Badge>
              ) : securityPostureScore >= 70 ? (
                <Badge variant="outline" className="bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/30">
                  Moderate
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-cyber-orange/10 text-cyber-orange border-cyber-orange/30">
                  Needs Attention
                </Badge>
              )}
              <span className="text-xs text-cyber-gray-500 mt-1">Last checked: Today, 10:45 AM</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <Progress 
            value={securityPostureScore} 
            max={100} 
            className={`h-2.5 ${
              securityPostureScore >= 80 
                ? "bg-cyber-green" 
                : securityPostureScore >= 70 
                  ? "bg-cyber-yellow" 
                  : "bg-cyber-orange"
            }`}
          />
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyber-red"></div>
            <span className="text-sm">Critical Issues: 3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyber-yellow"></div>
            <span className="text-sm">Warnings: 8</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyber-green"></div>
            <span className="text-sm">Passed Checks: 42</span>
          </div>
        </div>
      </div>
      
      {/* Key SOC Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {socMetrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={<metric.icon className="w-5 h-5" />}
            change={metric.change}
            tooltip={metric.tooltip}
          />
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Alert Trend (Last 4 Weeks)"
          type="area"
          data={alertTrends}
          height={250}
          tooltip="Weekly trend of alerts and incidents"
        />
        
        <ChartCard
          title="Alert Categories"
          type="pie"
          data={alertMetrics}
          height={250}
          colors={alertColors}
          tooltip="Distribution of alerts by category"
        />
      </div>
      
      {/* MTTR and Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChartCard
          title="MTTR by Priority (Days)"
          type="bar"
          data={mttrByPriority}
          height={240}
          colors={['#FF3B30', '#FF9500', '#FFCC00', '#5AC8FA']}
          tooltip="Mean Time To Remediate by incident priority"
        />
        
        <StatusCard
          title="SOC Team Status"
          status="stable"
          statusText="Fully Operational"
          details={
            <div>
              <div className="mt-3 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>Team Availability</span>
                  <span className="font-medium text-cyber-green">92%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Incident Response</span>
                  <span className="font-medium text-cyber-green">Active</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Monitoring Systems</span>
                  <span className="font-medium text-cyber-green">Online</span>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Schedule Incident Response Exercise</span>
                </Button>
              </div>
            </div>
          }
          className="h-full"
        />
        
        <StatusCard
          title="Security Infrastructure"
          status="warning"
          statusText="Action Needed"
          details={
            <div>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>SIEM Health</span>
                    <span className="text-cyber-green font-medium">Good</span>
                  </div>
                  <div className="w-full bg-cyber-gray-200 dark:bg-cyber-gray-700 rounded-full h-1.5">
                    <div className="bg-cyber-green h-1.5 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>EDR Coverage</span>
                    <span className="text-cyber-orange font-medium">Warning</span>
                  </div>
                  <div className="w-full bg-cyber-gray-200 dark:bg-cyber-gray-700 rounded-full h-1.5">
                    <div className="bg-cyber-orange h-1.5 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Log Collection</span>
                    <span className="text-cyber-green font-medium">Good</span>
                  </div>
                  <div className="w-full bg-cyber-gray-200 dark:bg-cyber-gray-700 rounded-full h-1.5">
                    <div className="bg-cyber-green h-1.5 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Run Infrastructure Health Check</span>
                </Button>
              </div>
            </div>
          }
          className="h-full"
        />
      </div>
      
      {/* Recent SOC Activity Tab Section */}
      <div className="glass rounded-xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent SOC Activity</h2>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span>View All Activity</span>
          </Button>
        </div>
        
        <Tabs defaultValue="alerts">
          <TabsList className="mb-4">
            <TabsTrigger value="alerts" className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              <span>Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="incidents" className="flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Incidents</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1">
              <PieChart className="w-4 h-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="alerts" className="mt-0">
            <div className="rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-cyber-gray-100/50 dark:bg-cyber-gray-800/50">
                    <th className="py-3 px-4 text-left font-medium text-cyber-gray-500 text-sm">Alert ID</th>
                    <th className="py-3 px-4 text-left font-medium text-cyber-gray-500 text-sm">Type</th>
                    <th className="py-3 px-4 text-left font-medium text-cyber-gray-500 text-sm">Severity</th>
                    <th className="py-3 px-4 text-left font-medium text-cyber-gray-500 text-sm">Source</th>
                    <th className="py-3 px-4 text-left font-medium text-cyber-gray-500 text-sm">Time</th>
                    <th className="py-3 px-4 text-right font-medium text-cyber-gray-500 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-cyber-gray-200/50 dark:border-cyber-gray-700/50">
                      <td className="py-3 px-4 text-sm">{`ALT-${1000 + i}`}</td>
                      <td className="py-3 px-4 text-sm">
                        {i % 3 === 0 ? 'Malware Detection' : i % 3 === 1 ? 'Suspicious Login' : 'Data Exfiltration'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Badge variant="outline" className={
                          i % 4 === 0 ? "bg-cyber-red/10 text-cyber-red border-cyber-red/30" :
                          i % 4 === 1 ? "bg-cyber-orange/10 text-cyber-orange border-cyber-orange/30" :
                          i % 4 === 2 ? "bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/30" :
                          "bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30"
                        }>
                          {i % 4 === 0 ? 'Critical' : i % 4 === 1 ? 'High' : i % 4 === 2 ? 'Medium' : 'Low'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {i % 3 === 0 ? 'Crowdstrike' : i % 3 === 1 ? 'Sentinel' : 'Defender'}
                      </td>
                      <td className="py-3 px-4 text-sm text-cyber-gray-500">
                        {`${i+1}h ago`}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        <Button variant="ghost" size="sm">Investigate</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="incidents" className="mt-0">
            <div className="rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-cyber-gray-100/50 dark:bg-cyber-gray-800/50">
                    <th className="py-3 px-4 text-left font-medium text-cyber-gray-500 text-sm">Incident ID</th>
                    <th className="py-3 px-4 text-left font-medium text-cyber-gray-500 text-sm">Title</th>
                    <th className="py-3 px-4 text-left font-medium text-cyber-gray-500 text-sm">Status</th>
                    <th className="py-3 px-4 text-left font-medium text-cyber-gray-500 text-sm">Assigned To</th>
                    <th className="py-3 px-4 text-left font-medium text-cyber-gray-500 text-sm">Time</th>
                    <th className="py-3 px-4 text-right font-medium text-cyber-gray-500 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-cyber-gray-200/50 dark:border-cyber-gray-700/50">
                      <td className="py-3 px-4 text-sm">{`INC-${2000 + i}`}</td>
                      <td className="py-3 px-4 text-sm">
                        {i % 3 === 0 ? 'Suspicious Access Pattern' : i % 3 === 1 ? 'Possible Data Breach' : 'Malicious Activity'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Badge variant="outline" className={
                          i % 4 === 0 ? "bg-cyber-red/10 text-cyber-red border-cyber-red/30" :
                          i % 4 === 1 ? "bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/30" :
                          i % 4 === 2 ? "bg-cyber-green/10 text-cyber-green border-cyber-green/30" :
                          "bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30"
                        }>
                          {i % 4 === 0 ? 'Open' : i % 4 === 1 ? 'Investigating' : i % 4 === 2 ? 'Contained' : 'Resolved'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {i % 3 === 0 ? 'John Smith' : i % 3 === 1 ? 'Emma Clark' : 'Mark Johnson'}
                      </td>
                      <td className="py-3 px-4 text-sm text-cyber-gray-500">
                        {`${i+1} day${i !== 0 ? 's' : ''} ago`}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        <Button variant="ghost" size="sm">View Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="reports" className="mt-0">
            <div className="rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-cyber-gray-100/50 dark:bg-cyber-gray-800/50">
                    <th className="py-3 px-4 text-left font-medium text-cyber-gray-500 text-sm">Report Name</th>
                    <th className="py-3 px-4 text-left font-medium text-cyber-gray-500 text-sm">Type</th>
                    <th className="py-3 px-4 text-left font-medium text-cyber-gray-500 text-sm">Generated By</th>
                    <th className="py-3 px-4 text-left font-medium text-cyber-gray-500 text-sm">Date</th>
                    <th className="py-3 px-4 text-right font-medium text-cyber-gray-500 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-cyber-gray-200/50 dark:border-cyber-gray-700/50">
                    <td className="py-3 px-4 text-sm">Weekly Security Summary</td>
                    <td className="py-3 px-4 text-sm">Automated</td>
                    <td className="py-3 px-4 text-sm">System</td>
                    <td className="py-3 px-4 text-sm text-cyber-gray-500">Yesterday</td>
                    <td className="py-3 px-4 text-sm text-right">
                      <Button variant="ghost" size="sm">Download</Button>
                    </td>
                  </tr>
                  <tr className="border-b border-cyber-gray-200/50 dark:border-cyber-gray-700/50">
                    <td className="py-3 px-4 text-sm">Incident Response Analysis</td>
                    <td className="py-3 px-4 text-sm">Manual</td>
                    <td className="py-3 px-4 text-sm">David Wilson</td>
                    <td className="py-3 px-4 text-sm text-cyber-gray-500">3 days ago</td>
                    <td className="py-3 px-4 text-sm text-right">
                      <Button variant="ghost" size="sm">Download</Button>
                    </td>
                  </tr>
                  <tr className="border-b border-cyber-gray-200/50 dark:border-cyber-gray-700/50">
                    <td className="py-3 px-4 text-sm">Vulnerability Assessment</td>
                    <td className="py-3 px-4 text-sm">Automated</td>
                    <td className="py-3 px-4 text-sm">System</td>
                    <td className="py-3 px-4 text-sm text-cyber-gray-500">5 days ago</td>
                    <td className="py-3 px-4 text-sm text-right">
                      <Button variant="ghost" size="sm">Download</Button>
                    </td>
                  </tr>
                  <tr className="border-b border-cyber-gray-200/50 dark:border-cyber-gray-700/50">
                    <td className="py-3 px-4 text-sm">Monthly Compliance Check</td>
                    <td className="py-3 px-4 text-sm">Automated</td>
                    <td className="py-3 px-4 text-sm">System</td>
                    <td className="py-3 px-4 text-sm text-cyber-gray-500">2 weeks ago</td>
                    <td className="py-3 px-4 text-sm text-right">
                      <Button variant="ghost" size="sm">Download</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default SOCOverview;
