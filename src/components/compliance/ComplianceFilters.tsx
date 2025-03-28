
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
    <Card className="p-2">
      <CardContent className="p-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter Categories:</span>
          </div>
          
          <ToggleGroup type="multiple" variant="outline" className="flex flex-wrap gap-1">
            {(['Data Privacy', 'Regulatory', 'Security Frameworks'] as AgentCategory[]).map(category => (
              <ToggleGroupItem 
                key={category} 
                value={category}
                pressed={visibleCategories.includes(category)}
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-1 text-xs"
              >
                {visibleCategories.includes(category) ? 
                  <Eye className="h-3 w-3" /> : 
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
              <Label htmlFor="focus-mode" className="flex items-center gap-1 text-sm">
                <Focus className="h-3 w-3" />
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
