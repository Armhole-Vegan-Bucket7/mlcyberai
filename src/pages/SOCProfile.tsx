import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { socProfileData, getUpdatedLogTraffic } from '@/data/socProfileData';
import { RegionCountry } from '@/types/socProfile';
import { RegionCard } from '@/components/soc-profile/RegionCard';
import GlobalMap from '@/components/soc-profile/GlobalMap';
import { Globe, Activity, Server, Plus, Minus } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import { Button } from '@/components/ui/button';
import TechnologySection from '@/components/soc-profile/TechnologySection';
import CommandCenterTable from '@/components/soc-profile/CommandCenterTable';

const SOCProfile = () => {
  const [selectedCountry, setSelectedCountry] = useState<RegionCountry | null>(null);
  const selectedRegionId = selectedCountry ? 
    socProfileData.regions.find(r => r.countries.some(c => c.id === selectedCountry.id))?.id : null;
  
  // Create state for editable metrics
  const [monitoredRegions, setMonitoredRegions] = useState<number>(socProfileData.regions.length);
  const [totalConnectors, setTotalConnectors] = useState<number>(
    socProfileData.regions.reduce((sum, region) => sum + region.totalConnectors, 0)
  );
  const [totalLogTraffic, setTotalLogTraffic] = useState<number>(
    socProfileData.regions.reduce((sum, region) => sum + region.totalLogTraffic, 0)
  );

  const handleCountrySelect = (country: RegionCountry | null) => {
    setSelectedCountry(country);
  };

  // Handlers for incrementing and decrementing metrics
  const incrementMetric = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    setter(value + 1);
  };

  const decrementMetric = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    if (value > 0) {
      setter(value - 1);
    }
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
                onClick={() => incrementMetric(setMonitoredRegions, monitoredRegions)}
              >
                <Plus size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => decrementMetric(setMonitoredRegions, monitoredRegions)}
                disabled={monitoredRegions <= 0}
              >
                <Minus size={16} />
              </Button>
            </div>
          </div>
          
          <div className="col-span-1 relative">
            <MetricCard
              title="Total Security Connectors"
              value={totalConnectors.toLocaleString()}
              icon={<Server size={24} />}
              className="pr-16"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => incrementMetric(setTotalConnectors, totalConnectors)}
              >
                <Plus size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => decrementMetric(setTotalConnectors, totalConnectors)}
                disabled={totalConnectors <= 0}
              >
                <Minus size={16} />
              </Button>
            </div>
          </div>
          
          <div className="col-span-1 relative">
            <MetricCard
              title="Global Log Traffic"
              value={`${totalLogTraffic.toLocaleString()} KB/s`}
              icon={<Activity size={24} />}
              className="pr-16"
              change={{
                value: "8.5%",
                type: "increase"
              }}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => incrementMetric(setTotalLogTraffic, totalLogTraffic)}
              >
                <Plus size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => decrementMetric(setTotalLogTraffic, totalLogTraffic)}
                disabled={totalLogTraffic <= 0}
              >
                <Minus size={16} />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Regional Security Posture</h2>
            {socProfileData.regions.map((region) => (
              <RegionCard 
                key={region.id}
                region={region}
                onCountrySelect={handleCountrySelect}
                isSelected={region.id === selectedRegionId}
              />
            ))}
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
        
        <div className="glass rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Command Center Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Microland Bengaluru SOC</h3>
              <p className="text-cyber-gray-400 mb-4">
                Central Security Operations Facility monitoring global traffic 24/7/365
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-40 text-cyber-gray-500">Location:</span>
                  <span>Bengaluru, India</span>
                </li>
                <li className="flex items-center">
                  <span className="w-40 text-cyber-gray-500">Operational Since:</span>
                  <span>2015</span>
                </li>
                <li className="flex items-center">
                  <span className="w-40 text-cyber-gray-500">Staff:</span>
                  <span>120+ Security Analysts</span>
                </li>
                <li className="flex items-center">
                  <span className="w-40 text-cyber-gray-500">Coverage:</span>
                  <span>24/7/365</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Technologies</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-40 text-cyber-gray-500">SIEM:</span>
                  <span>Advanced Correlation Engine</span>
                </li>
                <li className="flex items-center">
                  <span className="w-40 text-cyber-gray-500">EDR:</span>
                  <span>Next-Gen Endpoint Detection</span>
                </li>
                <li className="flex items-center">
                  <span className="w-40 text-cyber-gray-500">SOAR:</span>
                  <span>Automated Response Platform</span>
                </li>
                <li className="flex items-center">
                  <span className="w-40 text-cyber-gray-500">XDR:</span>
                  <span>Extended Detection & Response</span>
                </li>
                <li className="flex items-center">
                  <span className="w-40 text-cyber-gray-500">AI/ML:</span>
                  <span>Advanced Threat Prediction</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="glass rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Security Technology Stack</h2>
          <TechnologySection />
        </div>

        <div className="glass rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Command Center – SOC Tradecraft Table</h2>
          <CommandCenterTable />
        </div>
      </div>
    </PageLayout>
  );
};

export default SOCProfile;
