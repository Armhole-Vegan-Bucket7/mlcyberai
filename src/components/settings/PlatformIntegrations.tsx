
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Database, Monitor, Server, Link, AlertCircle, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Types
type Platform = {
  id: string;
  name: string;
  description: string;
  category: 'edr' | 'siem' | 'vm';
  icon: React.ReactNode;
  enabled: boolean;
  connected: boolean;
  apiKeyConfigured: boolean;
};

export const PlatformIntegrations = () => {
  // Platform data
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: 'defender',
      name: 'Microsoft Defender for Endpoint',
      description: 'Microsoft\'s EDR solution for endpoint protection',
      category: 'edr',
      icon: <Shield className="h-5 w-5 text-blue-500" />,
      enabled: true,
      connected: true,
      apiKeyConfigured: true
    },
    {
      id: 'fireeye',
      name: 'FireEye Endpoint Security',
      description: 'FireEye\'s endpoint protection platform',
      category: 'edr',
      icon: <Shield className="h-5 w-5 text-red-500" />,
      enabled: false,
      connected: false,
      apiKeyConfigured: false
    },
    {
      id: 'sophos',
      name: 'Sophos Intercept X',
      description: 'Sophos\' next-gen endpoint protection',
      category: 'edr',
      icon: <Shield className="h-5 w-5 text-green-500" />,
      enabled: false,
      connected: false,
      apiKeyConfigured: false
    },
    {
      id: 'sentinel',
      name: 'Microsoft Sentinel',
      description: 'Microsoft\'s cloud-native SIEM solution',
      category: 'siem',
      icon: <Monitor className="h-5 w-5 text-blue-500" />,
      enabled: true,
      connected: true,
      apiKeyConfigured: true
    },
    {
      id: 'splunk',
      name: 'Splunk',
      description: 'Data analytics and SIEM platform',
      category: 'siem',
      icon: <Monitor className="h-5 w-5 text-orange-500" />,
      enabled: false,
      connected: false,
      apiKeyConfigured: false
    },
    {
      id: 'qualys',
      name: 'Qualys',
      description: 'Cloud-based vulnerability management',
      category: 'vm',
      icon: <Database className="h-5 w-5 text-purple-500" />,
      enabled: false,
      connected: false,
      apiKeyConfigured: false
    },
    {
      id: 'tenable',
      name: 'Tenable',
      description: 'Vulnerability management solutions',
      category: 'vm',
      icon: <Database className="h-5 w-5 text-teal-500" />,
      enabled: false,
      connected: false,
      apiKeyConfigured: false
    }
  ]);
  
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Handle enable/disable toggle
  const handleToggleEnable = (platformId: string) => {
    setPlatforms(platforms.map(platform => {
      if (platform.id === platformId) {
        // If already connected, just toggle enabled state
        if (platform.connected) {
          return { ...platform, enabled: !platform.enabled };
        } 
        // If not connected, open dialog to configure API key
        else {
          setSelectedPlatform(platform);
          setIsDialogOpen(true);
          return platform;
        }
      }
      return platform;
    }));
  };
  
  // Handle connection setup
  const handleConnect = () => {
    if (!selectedPlatform || !apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }
    
    setIsConnecting(true);
    
    // Simulate API connection
    setTimeout(() => {
      setPlatforms(platforms.map(platform => {
        if (platform.id === selectedPlatform.id) {
          return { 
            ...platform, 
            connected: true, 
            enabled: true,
            apiKeyConfigured: true
          };
        }
        return platform;
      }));
      
      setIsConnecting(false);
      setIsDialogOpen(false);
      setApiKey('');
      
      toast({
        title: "Connection Successful",
        description: `${selectedPlatform.name} has been connected successfully`,
      });
    }, 1500);
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
  
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-medium">Security Platforms Integration</h3>
        <p className="text-sm text-muted-foreground">
          Connect to your security platforms to pull metrics and data into the dashboard
        </p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {platforms.map((platform) => (
            <TableRow key={platform.id}>
              <TableCell>
                {platform.icon}
              </TableCell>
              <TableCell className="font-medium">
                <div>
                  {platform.name}
                  <p className="text-xs text-muted-foreground">{platform.description}</p>
                </div>
              </TableCell>
              <TableCell>
                {platform.category === 'edr' && 'Endpoint Protection'}
                {platform.category === 'siem' && 'SIEM & Analytics'}
                {platform.category === 'vm' && 'Vulnerability Management'}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {platform.connected ? (
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
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={platform.enabled}
                      onCheckedChange={() => handleToggleEnable(platform.id)}
                      disabled={!platform.connected && !platform.apiKeyConfigured}
                    />
                    <span className="text-sm">{platform.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  
                  {platform.connected ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDisconnect(platform.id)}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedPlatform(platform);
                        setIsDialogOpen(true);
                      }}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Connection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect to {selectedPlatform?.name}</DialogTitle>
            <DialogDescription>
              Enter your API key to connect to {selectedPlatform?.name}. 
              This key will be stored securely and used to fetch data from the platform.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input 
                id="api-key" 
                type="password" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key" 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting || !apiKey.trim()}
              className="flex items-center gap-2"
            >
              {isConnecting ? (
                <>Connecting...</>
              ) : (
                <>
                  <Link className="h-4 w-4" />
                  Connect
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformIntegrations;
