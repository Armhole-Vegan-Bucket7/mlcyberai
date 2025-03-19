
import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Maximize2, Shield } from 'lucide-react';

interface ThreatEvent {
  id: string;
  timestamp: string;
  eventType: 'alert' | 'incident' | 'detection';
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  details: string;
}

interface ThreatActivityTableProps {
  events: ThreatEvent[];
  className?: string;
}

export function ThreatActivityTable({ events, className }: ThreatActivityTableProps) {
  const renderEventIcon = (eventType: ThreatEvent['eventType']) => {
    switch (eventType) {
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-cyber-orange" />;
      case 'incident':
        return <AlertCircle className="w-4 h-4 text-cyber-red" />;
      case 'detection':
        return <Shield className="w-4 h-4 text-cyber-blue" />;
    }
  };
  
  const getSeverityColor = (severity: ThreatEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-cyber-red';
      case 'high':
        return 'text-cyber-orange';
      case 'medium':
        return 'text-cyber-yellow';
      case 'low':
        return 'text-cyber-blue';
    }
  };
  
  return (
    <div className={cn("dashboard-card", className)}>
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">Recent Threat Activity</h3>
        <button className="text-cyber-gray-400 hover:text-cyber-gray-600 transition-colors">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-cyber-gray-500 border-b border-cyber-gray-200/50 dark:border-cyber-gray-700/50">
              <th className="text-left py-2 font-medium">Time</th>
              <th className="text-left py-2 font-medium">Type</th>
              <th className="text-left py-2 font-medium">Severity</th>
              <th className="text-left py-2 font-medium">Source</th>
              <th className="text-left py-2 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr 
                key={event.id}
                className="hover:bg-cyber-gray-50/50 dark:hover:bg-cyber-gray-800/30 transition-colors text-sm"
              >
                <td className="py-2.5 text-cyber-gray-500 whitespace-nowrap">
                  {event.timestamp}
                </td>
                <td className="py-2.5">
                  <div className="flex items-center">
                    {renderEventIcon(event.eventType)}
                    <span className="ml-2 capitalize">{event.eventType}</span>
                  </div>
                </td>
                <td className="py-2.5">
                  <span className={cn("capitalize font-medium", getSeverityColor(event.severity))}>
                    {event.severity}
                  </span>
                </td>
                <td className="py-2.5">{event.source}</td>
                <td className="py-2.5 max-w-sm truncate">{event.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="dashboard-card-footer flex justify-between items-center">
        <span>Showing {events.length} of {events.length} events</span>
        <button className="text-cyber-blue text-xs font-medium hover:underline">
          View All Events
        </button>
      </div>
    </div>
  );
}

export default ThreatActivityTable;
