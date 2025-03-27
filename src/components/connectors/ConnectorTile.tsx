
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Link } from 'lucide-react';

// Types
export type ConnectorEffortLevel = 'easy' | 'medium' | 'complex';

export type ConnectorCategory = 'edr' | 'siem' | 'vm';

export type Connector = {
  id: string;
  name: string;
  description: string;
  category: ConnectorCategory;
  icon: React.ReactNode;
  enabled: boolean;
  connected: boolean;
  apiKeyConfigured: boolean;
  effortLevel: ConnectorEffortLevel;
};

type ConnectorTileProps = {
  connector: Connector;
  onToggleEnable: (connectorId: string) => void;
  onConnect: (connector: Connector) => void;
  onDisconnect: (connectorId: string) => void;
  onSetupWizard: (connector: Connector) => void;
};

const ConnectorTile = ({
  connector,
  onToggleEnable,
  onConnect,
  onDisconnect,
  onSetupWizard
}: ConnectorTileProps) => {
  // Get the category label
  const getCategoryLabel = (category: ConnectorCategory) => {
    switch (category) {
      case 'edr':
        return 'Endpoint Protection';
      case 'siem':
        return 'SIEM & Analytics';
      case 'vm':
        return 'Vulnerability Management';
      default:
        return 'Other';
    }
  };

  // Get the effort level styling
  const getEffortLevelBadge = (level: ConnectorEffortLevel) => {
    switch (level) {
      case 'easy':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Class 1 / Easy
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Class 2 / Medium
          </Badge>
        );
      case 'complex':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Class 3 / Complex
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="relative">
        {/* Effort Level Badge */}
        <div className="absolute top-3 right-3 z-10">
          {getEffortLevelBadge(connector.effortLevel)}
        </div>
        
        {/* Connection Status Bar */}
        <div 
          className={cn(
            "h-1 w-full",
            connector.connected ? "bg-green-500" : "bg-gray-200"
          )}
        />
        
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              {connector.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg">{connector.name}</h3>
              <p className="text-xs text-muted-foreground">{connector.description}</p>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {getCategoryLabel(connector.category)}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {connector.connected ? (
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                  <span className="text-sm">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300"></div>
                  <span className="text-sm">Not Connected</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={connector.enabled}
                onCheckedChange={() => onToggleEnable(connector.id)}
                disabled={!connector.connected && !connector.apiKeyConfigured}
              />
              <span className="text-sm">{connector.enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-800 flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetupWizard(connector)}
            className="flex-1"
          >
            Setup Wizard
          </Button>
          
          {connector.connected ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDisconnect(connector.id)}
              className="flex-1"
            >
              Disconnect
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onConnect(connector)}
              className="flex-1 flex items-center gap-1"
            >
              <Link className="h-4 w-4" />
              Connect
            </Button>
          )}
        </CardFooter>
      </div>
    </Card>
  );
};

export default ConnectorTile;
