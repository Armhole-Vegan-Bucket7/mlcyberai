
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
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs font-medium px-2 py-0.5">
            C1
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs font-medium px-2 py-0.5">
            C2
          </Badge>
        );
      case 'complex':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs font-medium px-2 py-0.5">
            C3
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full h-64 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="relative h-full flex flex-col">
        {/* Connection Status Bar */}
        <div 
          className={cn(
            "h-1 w-full rounded-t-lg",
            connector.connected ? "bg-green-500" : "bg-gray-200"
          )}
        />
        
        {/* Effort Level Badge */}
        <div className="absolute top-3 right-3 z-10">
          {getEffortLevelBadge(connector.effortLevel)}
        </div>
        
        <CardContent className="p-4 flex-1">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              {connector.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-base">{connector.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{connector.description}</p>
              <div className="mt-1.5">
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {getCategoryLabel(connector.category)}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5">
              {connector.connected ? (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                  <span className="text-xs">Not Connected</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1.5">
              <Switch
                checked={connector.enabled}
                onCheckedChange={() => onToggleEnable(connector.id)}
                disabled={!connector.connected && !connector.apiKeyConfigured}
                className="scale-75"
              />
              <span className="text-xs">{connector.enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-4 py-3 bg-gray-50 dark:bg-gray-800 flex justify-between gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetupWizard(connector)}
            className="flex-1 h-8 text-xs"
          >
            Setup Wizard
          </Button>
          
          {connector.connected ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDisconnect(connector.id)}
              className="flex-1 h-8 text-xs"
            >
              Disconnect
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onConnect(connector)}
              className="flex-1 h-8 text-xs flex items-center gap-1"
            >
              <Link className="h-3.5 w-3.5" />
              Connect
            </Button>
          )}
        </CardFooter>
      </div>
    </Card>
  );
};

export default ConnectorTile;
