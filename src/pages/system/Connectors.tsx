
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Database, Monitor, Server } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ConnectorTile, { Connector, ConnectorEffortLevel, ConnectorCategory } from '@/components/connectors/ConnectorTile';
import ConnectorSetupWizard from '@/components/connectors/ConnectorSetupWizard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FilterOption = 'all' | ConnectorEffortLevel | ConnectorCategory | 'connected' | 'disconnected';

const Connectors = () => {
  // Platform data with added effort levels
  const [platforms, setPlatforms] = useState<Connector[]>([
    {
      id: 'defender',
      name: 'Microsoft Defender for Endpoint',
      description: 'Microsoft\'s EDR solution for endpoint protection',
      category: 'edr',
      icon: <Shield className="h-5 w-5 text-blue-500" />,
      enabled: true,
      connected: true,
      apiKeyConfigured: true,
      effortLevel: 'easy'
    },
    {
      id: 'fireeye',
      name: 'FireEye Endpoint Security',
      description: 'FireEye\'s endpoint protection platform',
      category: 'edr',
      icon: <Shield className="h-5 w-5 text-red-500" />,
      enabled: false,
      connected: false,
      apiKeyConfigured: false,
      effortLevel: 'medium'
    },
    {
      id: 'sophos',
      name: 'Sophos Intercept X',
      description: 'Sophos\' next-gen endpoint protection',
      category: 'edr',
      icon: <Shield className="h-5 w-5 text-green-500" />,
      enabled: false,
      connected: false,
      apiKeyConfigured: false,
      effortLevel: 'easy'
    },
    {
      id: 'sentinel',
      name: 'Microsoft Sentinel',
      description: 'Microsoft\'s cloud-native SIEM solution',
      category: 'siem',
      icon: <Monitor className="h-5 w-5 text-blue-500" />,
      enabled: true,
      connected: true,
      apiKeyConfigured: true,
      effortLevel: 'complex'
    },
    {
      id: 'splunk',
      name: 'Splunk',
      description: 'Data analytics and SIEM platform',
      category: 'siem',
      icon: <Monitor className="h-5 w-5 text-orange-500" />,
      enabled: false,
      connected: false,
      apiKeyConfigured: false,
      effortLevel: 'complex'
    },
    {
      id: 'qualys',
      name: 'Qualys',
      description: 'Cloud-based vulnerability management',
      category: 'vm',
      icon: <Database className="h-5 w-5 text-purple-500" />,
      enabled: false,
      connected: false,
      apiKeyConfigured: false,
      effortLevel: 'medium'
    },
    {
      id: 'tenable',
      name: 'Tenable',
      description: 'Vulnerability management solutions',
      category: 'vm',
      icon: <Database className="h-5 w-5 text-teal-500" />,
      enabled: false,
      connected: false,
      apiKeyConfigured: false,
      effortLevel: 'medium'
    },
    {
      id: 'crowdstrike',
      name: 'CrowdStrike Falcon',
      description: 'Cloud-delivered endpoint protection',
      category: 'edr',
      icon: <Shield className="h-5 w-5 text-red-600" />,
      enabled: false,
      connected: false,
      apiKeyConfigured: false,
      effortLevel: 'complex'
    }
  ]);
  
  const [selectedPlatform, setSelectedPlatform] = useState<Connector | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  
  // Handle enable/disable toggle
  const handleToggleEnable = (platformId: string) => {
    setPlatforms(platforms.map(platform => {
      if (platform.id === platformId) {
        // If already connected, just toggle enabled state
        if (platform.connected) {
          return { ...platform, enabled: !platform.enabled };
        } 
        // If not connected, open wizard to configure
        else {
          const platform = platforms.find(p => p.id === platformId);
          if (platform) {
            handleOpenWizard(platform);
          }
          return platform;
        }
      }
      return platform;
    }));
  };
  
  // Handle connection setup
  const handleConnect = (platform: Connector) => {
    handleOpenWizard(platform);
  };
  
  // Handle disconnect
  const handleDisconnect = (platformId: string) => {
    setPlatforms(platforms.map(platform => {
      if (platform.id === platformId) {
        return { 
          ...platform, 
          connected: false, 
          enabled: false,
          apiKeyConfigured: false
        };
      }
      return platform;
    }));
    
    toast({
      title: "Disconnected",
      description: `Platform has been disconnected`,
    });
  };
  
  // Open the setup wizard
  const handleOpenWizard = (platform: Connector) => {
    setSelectedPlatform(platform);
    setIsWizardOpen(true);
  };
  
  // Complete the wizard setup
  const handleCompleteWizard = (platform: Connector) => {
    setPlatforms(platforms.map(p => {
      if (p.id === platform.id) {
        return platform;
      }
      return p;
    }));
  };
  
  // Filter connectors based on the active filter
  const filteredPlatforms = platforms.filter(platform => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'connected') return platform.connected;
    if (activeFilter === 'disconnected') return !platform.connected;
    if (['easy', 'medium', 'complex'].includes(activeFilter)) return platform.effortLevel === activeFilter;
    if (['edr', 'siem', 'vm'].includes(activeFilter)) return platform.category === activeFilter;
    return true;
  });
  
  return (
    <PageLayout>
      <div className="page-transition">
        <h1 className="text-2xl font-bold">Platform Connectors</h1>
        <p className="text-sm text-cyber-gray-500 mt-1">
          Manage connections to security platforms and data sources
        </p>
      </div>
      
      {/* Filters */}
      <div className="mt-6 mb-4 flex flex-wrap gap-2 items-center">
        <div className="mr-2 text-sm font-medium">Filter by:</div>
        
        <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter connectors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Connectors</SelectItem>
            <SelectItem value="connected">Connected</SelectItem>
            <SelectItem value="disconnected">Not Connected</SelectItem>
            <SelectItem value="easy">Class 1 / Easy</SelectItem>
            <SelectItem value="medium">Class 2 / Medium</SelectItem>
            <SelectItem value="complex">Class 3 / Complex</SelectItem>
            <SelectItem value="edr">Endpoint Protection</SelectItem>
            <SelectItem value="siem">SIEM & Analytics</SelectItem>
            <SelectItem value="vm">Vulnerability Management</SelectItem>
          </SelectContent>
        </Select>
        
        {activeFilter !== 'all' && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveFilter('all')}
            className="text-xs"
          >
            Clear filter
          </Button>
        )}
      </div>
      
      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredPlatforms.map((platform) => (
          <ConnectorTile
            key={platform.id}
            connector={platform}
            onToggleEnable={handleToggleEnable}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onSetupWizard={handleOpenWizard}
          />
        ))}
      </div>
      
      {filteredPlatforms.length === 0 && (
        <Card className="mt-4">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <Server className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No connectors found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              There are no connectors matching your current filter criteria.
            </p>
            <Button 
              onClick={() => setActiveFilter('all')} 
              variant="outline" 
              className="mt-4"
            >
              View all connectors
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Setup Wizard */}
      <ConnectorSetupWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        connector={selectedPlatform}
        onComplete={handleCompleteWizard}
      />
    </PageLayout>
  );
};

export default Connectors;
