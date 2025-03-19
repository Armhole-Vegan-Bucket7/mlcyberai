
import React from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  className?: string;
  footer?: string;
  tooltip?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  change,
  className,
  footer,
  tooltip
}: MetricCardProps) {
  return (
    <div className={cn("dashboard-card card-transition", className)}>
      <div className="dashboard-card-header">
        <div className="flex items-center">
          <h3 className="dashboard-card-title">{title}</h3>
          {tooltip && (
            <div className="group relative ml-1.5">
              <Info className="w-3.5 h-3.5 text-cyber-gray-400" />
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block w-48 p-2 glass rounded-lg text-xs z-10 animate-fade-in">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-cyber-blue/80">
            {icon}
          </div>
        )}
      </div>
      
      <div className="dashboard-card-value flex items-baseline">
        <span>{value}</span>
        {change && (
          <span className={cn(
            "ml-2 text-xs",
            change.type === 'increase' && "text-cyber-green",
            change.type === 'decrease' && "text-cyber-red",
            change.type === 'neutral' && "text-cyber-gray-500"
          )}>
            {change.type === 'increase' && '↑'}
            {change.type === 'decrease' && '↓'}
            {change.value}
          </span>
        )}
      </div>
      
      {footer && (
        <div className="dashboard-card-footer">
          {footer}
        </div>
      )}
    </div>
  );
}

export default MetricCard;
