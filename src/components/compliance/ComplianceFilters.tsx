
import React from 'react';
import { useComplianceAgents, AgentCategory } from './ComplianceAgentContext';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Focus, Filter } from 'lucide-react';

const ComplianceFilters: React.FC = () => {
  const { 
    visibleCategories, 
    toggleCategory, 
    focusMode, 
    toggleFocusMode 
  } = useComplianceAgents();

  return (
    <Card className="p-2 sticky top-0 z-10 backdrop-blur-sm bg-cyber-gray-800/95 shadow-md border-cyber-blue/20">
      <CardContent className="p-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-cyber-blue" />
            <span className="text-sm font-medium text-white">Filter Categories:</span>
          </div>
          
          <ToggleGroup 
            type="multiple" 
            variant="outline" 
            className="flex flex-wrap gap-1 transition-all duration-300"
          >
            {(['Data Privacy', 'Regulatory', 'Security Frameworks'] as AgentCategory[]).map(category => (
              <ToggleGroupItem 
                key={category} 
                value={category}
                aria-pressed={visibleCategories.includes(category)}
                onClick={() => toggleCategory(category)}
                className={`flex items-center gap-1 text-xs transition-colors duration-300 
                  ${visibleCategories.includes(category) 
                    ? 'bg-cyber-blue/20 text-white border-cyber-blue/50 hover:bg-cyber-blue/30' 
                    : 'text-cyber-gray-400 hover:bg-cyber-gray-700/50'}`}
              >
                {visibleCategories.includes(category) ? 
                  <Eye className="h-3 w-3 text-cyber-blue" /> : 
                  <EyeOff className="h-3 w-3" />
                }
                {category}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="focus-mode" 
                checked={focusMode}
                onCheckedChange={toggleFocusMode}
              />
              <Label htmlFor="focus-mode" className="flex items-center gap-1 text-sm text-white">
                <Focus className="h-3 w-3 text-cyber-indigo" />
                Focus Mode
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceFilters;
