
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import DataModal from '@/components/ui/data-modal';

type ChartType = 'area' | 'bar' | 'line' | 'pie';

interface ChartCardProps {
  title: string;
  type: ChartType;
  data: any[];
  className?: string;
  height?: number;
  tooltip?: string;
  colors?: string[];
}

const defaultColors = [
  '#0076FF', // cyber-blue
  '#5856D6', // cyber-indigo
  '#AF52DE', // cyber-purple
  '#FF2D55', // cyber-pink
  '#FF3B30', // cyber-red
  '#FF9500', // cyber-orange
  '#FFCC00', // cyber-yellow
  '#34C759', // cyber-green
  '#5AC8FA', // cyber-teal
];

export function ChartCard({
  title,
  type,
  data,
  className,
  height = 200,
  tooltip,
  colors = defaultColors
}: ChartCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openDataModal = () => {
    setIsModalOpen(true);
  };

  const closeDataModal = () => {
    setIsModalOpen(false);
  };

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                {Object.keys(data[0] || {})
                  .filter(key => key !== 'name')
                  .map((key, index) => (
                    <linearGradient key={`gradient-${key}`} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.5} />
                      <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" strokeOpacity={0.3} />
              <XAxis 
                dataKey="name" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
              />
              <Tooltip contentStyle={{ borderRadius: '8px', background: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', border: 'none' }} />
              {Object.keys(data[0] || {})
                .filter(key => key !== 'name')
                .map((key, index) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[index % colors.length]}
                    fillOpacity={1}
                    fill={`url(#color-${key})`}
                    animationDuration={1000}
                  />
                ))}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" strokeOpacity={0.3} vertical={false} />
              <XAxis 
                dataKey="name" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
              />
              <Tooltip contentStyle={{ borderRadius: '8px', background: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', border: 'none' }} />
              {Object.keys(data[0] || {})
                .filter(key => key !== 'name')
                .map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={colors[index % colors.length]}
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" strokeOpacity={0.3} />
              <XAxis 
                dataKey="name" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
              />
              <Tooltip contentStyle={{ borderRadius: '8px', background: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', border: 'none' }} />
              {Object.keys(data[0] || {})
                .filter(key => key !== 'name')
                .map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: colors[index % colors.length], strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                    animationDuration={1000}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        const pieData = data.map(item => ({
          name: item.name,
          value: Object.values(item).find((val): val is number => typeof val === 'number')
        }));
        
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={height / 4}
                outerRadius={height / 2.5}
                paddingAngle={3}
                dataKey="value"
                animationDuration={1000}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Legend layout="vertical" verticalAlign="middle" align="right" />
              <Tooltip contentStyle={{ borderRadius: '8px', background: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div>Chart type not supported</div>;
    }
  };
  
  return (
    <div className={cn("dashboard-card", className)}>
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
      </div>
      
      <div 
        className="dashboard-card-content cursor-pointer" 
        onDoubleClick={openDataModal}
        title="Double-click to view data"
      >
        {renderChart()}
      </div>

      <DataModal 
        isOpen={isModalOpen} 
        onClose={closeDataModal} 
        title={`${title} - Data`} 
        data={data} 
      />
    </div>
  );
}

export default ChartCard;
