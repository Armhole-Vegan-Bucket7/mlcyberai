
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Info, AlertTriangle } from 'lucide-react';

interface SectorBadgeProps {
  sector: string;
  threatLevel: 'high' | 'medium' | 'low';
}

const SectorBadge: React.FC<SectorBadgeProps> = ({ sector, threatLevel }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Shield className={`w-5 h-5 mr-2 ${
              threatLevel === 'high' ? 'text-cyber-red' :
              threatLevel === 'medium' ? 'text-cyber-orange' :
              'text-cyber-green'
            }`} />
            <span className="font-semibold">Sector Relevance</span>
          </div>
          <div className="relative group">
            <Info className="w-4 h-4 text-muted-foreground" />
            <div className="absolute z-50 hidden group-hover:block right-0 w-64 p-2 bg-popover text-popover-foreground border rounded shadow-lg text-xs">
              This badge shows the threat level for your sector based on recent breach activity.
            </div>
          </div>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium">Sector: </span>
            <span className="ml-2 font-semibold">{sector}</span>
          </div>
          
          <div className="flex items-center mt-2">
            <span className="text-sm font-medium">Threat Level: </span>
            <div className={`ml-2 px-2 py-0.5 rounded-full flex items-center text-xs font-medium ${
              threatLevel === 'high' ? 'bg-red-500/20 text-red-500' :
              threatLevel === 'medium' ? 'bg-orange-500/20 text-orange-500' :
              'bg-green-500/20 text-green-500'
            }`}>
              {threatLevel === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
              {threatLevel.charAt(0).toUpperCase() + threatLevel.slice(1)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorBadge;
