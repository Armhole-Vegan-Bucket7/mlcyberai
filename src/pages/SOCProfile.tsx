import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { socProfileData, getUpdatedLogTraffic } from '@/data/socProfileData';
import { RegionCountry } from '@/types/socProfile';
import { RegionCard } from '@/components/soc-profile/RegionCard';
import GlobalMap from '@/components/soc-profile/GlobalMap';
import { Globe, Activity, Server, Plus, Minus, Info } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import { Button } from '@/components/ui/button';
import TechnologySection from '@/components/soc-profile/TechnologySection';
import GlobalDeliveryCenter from '@/components/soc-profile/GlobalDeliveryCenter';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

const generateLogTraffic = (connectors: number): number => {
  if (connectors <= 0) return 0;
  return Math.round(connectors * (Math.random() * 90 + 10)); // Random value between 10 and 100 per connector
};

const SOCProfile = () => {
  const [selectedCountry, setSelectedCountry] = useState<RegionCountry | null>(null);
  const selectedRegionId = selectedCountry ? 
    socProfileData.regions.find(r => r.countries.some(c => c.id === selectedCountry.id))?.id : null;
  
  const [monitoredRegions, setMonitoredRegions] = useState<number>(socProfileData.regions.length);
  
  const [regionData, setRegionData] = useState<{
    id: string;
    name: string;
    connectors: number;
    logTraffic: number;
  }[]>(socProfileData.regions.map(region => ({
    id: region.id,
    name: region.name,
    connectors: 0,
    logTraffic: 0
  })));
  
  const totalConnectors = regionData.reduce((sum, region) => sum + region.connectors, 0);
  const totalLogTraffic = regionData.reduce((sum, region) => sum + region.logTraffic, 0);
  
  useEffect(() => {
    if (totalConnectors === 0 && socProfileData.regions.length > 0) {
      const initialData = [...regionData];
      if (initialData.length >= 1) initialData[0].connectors = 1;
      if (initialData.length >= 2) initialData[1].connectors = 1;
      
      initialData.forEach(region => {
        if (region.connectors > 0) {
          region.logTraffic = generateLogTraffic(region.connectors);
        }
      });
      
      setRegionData(initialData);
      
      updateSocProfileData(initialData);
    }
  }, []);
  
  const updateSocProfileData = (data: typeof regionData) => {
    socProfileData.regions = socProfileData.regions.map(region => {
      const updatedRegion = data.find(r => r.id === region.id);
      if (!updatedRegion) return region;
      
      return {
        ...region,
        totalConnectors: updatedRegion.connectors,
        totalLogTraffic: updatedRegion.logTraffic
      };
    });
  };
  
  const addConnectorToRegion = (regionId: string) => {
    const updatedData = regionData.map(region => {
      if (region.id === regionId) {
        const newConnectors = region.connectors + 1;
        return {
          ...region,
          connectors: newConnectors,
          logTraffic: generateLogTraffic(newConnectors)
        };
      }
      return region;
    });
    
    setRegionData(updatedData);
    updateSocProfileData(updatedData);
  };
  
  const removeConnectorFromRegion = (regionId: string) => {
    const updatedData = regionData.map(region => {
      if (region.id === regionId) {
        const newConnectors = Math.max(0, region.connectors - 1);
        return {
          ...region,
          connectors: newConnectors,
          logTraffic: generateLogTraffic(newConnectors)
        };
      }
      return region;
    });
    
    setRegionData(updatedData);
    updateSocProfileData(updatedData);
  };

  const handleCountrySelect = (country: RegionCountry | null) => {
    setSelectedCountry(country);
  };

  const incrementMonitoredRegions = () => {
    setMonitoredRegions(prev => prev + 1);
  };

  const decrementMonitoredRegions = () => {
    if (monitoredRegions <= 1) return;
    setMonitoredRegions(prev => prev - 1);
  };

  return (
    <PageLayout title="Customer Profile" description="Global Security Operations Center Profile">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 relative">
            <MetricCard
              title="Total Monitored Regions"
              value={monitoredRegions.toLocaleString()}
              icon={<Globe size={24} />}
              className="pr-16"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={incrementMonitoredRegions}
              >
                <Plus size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={decrementMonitoredRegions}
                disabled={monitoredRegions <= 1}
              >
                <Minus size={16} />
              </Button>
            </div>
          </div>
          
          <div className="col-span-1 relative">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <MetricCard
                      title="Total Security Connectors"
                      value={totalConnectors.toLocaleString()}
                      icon={<Server size={24} />}
                      className="pr-16"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-80 p-3">
                  <p>Sum of all connectors across all regions. Add or remove connectors from each region to change this total.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="col-span-1 relative">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <MetricCard
                      title="Global Log Traffic"
                      value={`${totalLogTraffic.toLocaleString()} GB/day`}
                      icon={<Activity size={24} />}
                      className="pr-16"
                      change={{
                        value: "8.5%",
                        type: "increase"
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-80 p-3">
                  <p>Aggregate log traffic (GB/day) from all regions. Each region with connectors generates between 10-100 GB/day per connector. Regions with no connectors generate no log traffic.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Regional Log Data Pipe</h2>
            {regionData.map((region) => {
              const socRegion = socProfileData.regions.find(r => r.id === region.id);
              if (!socRegion) return null;
              
              return (
                <div key={region.id} className="glass rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <span style={{ color: socRegion.color }}>●</span>
                      <span className="ml-2">{region.name}</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeConnectorFromRegion(region.id)}
                        disabled={region.connectors <= 0}
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="font-medium">{region.connectors}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addConnectorToRegion(region.id)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-cyber-gray-500">Connectors</span>
                      <span className="text-base font-medium">{region.connectors}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-cyber-gray-500">Log Traffic</span>
                      <span className="text-base font-medium animate-pulse">
                        {region.logTraffic.toLocaleString()} GB/day
                      </span>
                    </div>
                  </div>
                  
                  <RegionCard 
                    key={socRegion.id}
                    region={socRegion}
                    onCountrySelect={handleCountrySelect}
                    isSelected={socRegion.id === selectedRegionId}
                  />
                </div>
              );
            })}
          </div>
          
          <div className="lg:col-span-2 glass rounded-lg p-4 h-[600px]">
            <h2 className="text-xl font-semibold mb-4">Global Command Center Connectivity</h2>
            <div className="h-[550px] w-full">
              <GlobalMap 
                data={socProfileData}
                selectedCountry={selectedCountry}
              />
            </div>
          </div>
        </div>
        
        <Card className="glass rounded-lg">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-4">Command Center Details</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Parameter</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Name</TableCell>
                  <TableCell>Microland Bengaluru SOC</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Description</TableCell>
                  <TableCell>Central Security Operations Facility monitoring global traffic 24/7/365</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Location</TableCell>
                  <TableCell>Bengaluru, India</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Operational Since</TableCell>
                  <TableCell>2015</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Staff</TableCell>
                  <TableCell>120+ Security Analysts</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Coverage</TableCell>
                  <TableCell>24/7/365</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="glass rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Global Delivery Center - View</h2>
          <GlobalDeliveryCenter />
        </div>
      </div>
    </PageLayout>
  );
};

export default SOCProfile;
