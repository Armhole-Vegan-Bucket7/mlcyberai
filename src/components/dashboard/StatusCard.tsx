
import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'critical' | 'warning' | 'stable' | 'info';

interface StatusCardProps {
  title: string;
  status: StatusType;
  statusText: string;
  details?: React.ReactNode;
  className?: string;
}

export function StatusCard({
  title,
  status,
  statusText,
  details,
  className
}: StatusCardProps) {
  return (
    <div className={cn("dashboard-card", className)}>
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">{title}</h3>
      </div>
      
      <div className="flex items-center my-2">
        <span className={cn("status-indicator", status)} />
        <span className={cn(
          "font-medium",
          status === 'critical' && "text-cyber-red",
          status === 'warning' && "text-cyber-orange",
          status === 'stable' && "text-cyber-green",
          status === 'info' && "text-cyber-blue"
        )}>
          {statusText}
        </span>
      </div>
      
      {details && (
        <div className="mt-2 text-sm text-cyber-gray-600 dark:text-cyber-gray-400">
          {details}
        </div>
      )}
    </div>
  );
}

export default StatusCard;
