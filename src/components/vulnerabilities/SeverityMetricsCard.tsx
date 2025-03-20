
import React from 'react';
import { Progress } from '@/components/ui/progress';
import type { SeverityLevel } from '@/data/tenantMetrics';

interface SeverityMetric {
  severity: SeverityLevel;
  count: number;
  total: number;
  color: string;
}

interface SeverityMetricsCardProps {
  metrics: SeverityMetric[];
  totalVulnerabilities: number;
}

const SeverityMetricsCard = ({ metrics, totalVulnerabilities }: SeverityMetricsCardProps) => {
  return (
    <div className="glass p-6 rounded-xl animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">Vulnerability Risk</h3>
      
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.severity}>
            <div className="flex justify-between mb-1">
              <div className="text-sm font-medium">
                {metric.severity.charAt(0).toUpperCase() + metric.severity.slice(1)}
              </div>
              <div className="text-sm font-semibold">{metric.count}</div>
            </div>
            <Progress 
              value={(metric.count / totalVulnerabilities) * 100} 
              className="h-2" 
              indicatorClassName={metric.color} 
            />
          </div>
        ))}
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
  );
};

export default SeverityMetricsCard;
