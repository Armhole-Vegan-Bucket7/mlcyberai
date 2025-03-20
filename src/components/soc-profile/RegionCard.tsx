
import React, { useState, useEffect } from 'react';
import { Region, RegionCountry } from '@/types/socProfile';
import { getUpdatedLogTraffic } from '@/data/socProfileData';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegionCardProps {
  region: Region;
  onCountrySelect: (country: RegionCountry | null) => void;
  isSelected: boolean;
}

export function RegionCard({ region, onCountrySelect, isSelected }: RegionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logTraffic, setLogTraffic] = useState(region.totalLogTraffic);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLogTraffic(getUpdatedLogTraffic(region.totalLogTraffic));
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [region.totalLogTraffic]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div 
      className={cn(
        "glass rounded-lg overflow-hidden transition-all duration-300 border",
        isSelected ? "shadow-lg border-2" : "shadow border-transparent", 
        isOpen ? "mb-2" : "",
      )}
      style={{ borderColor: isSelected ? region.color : 'transparent' }}
    >
      <div 
        className="p-4 cursor-pointer flex justify-between items-center"
        onClick={toggleOpen}
      >
        <div>
          <h3 className="text-lg font-medium flex items-center">
            <span style={{ color: region.color }}>●</span>
            <span className="ml-2">{region.name}</span>
          </h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-cyber-gray-500">Connectors</div>
            <div className="text-base font-medium">{region.totalConnectors.toLocaleString()}</div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-cyber-gray-500">Log Traffic</div>
            <div className="text-base font-medium animate-pulse">{logTraffic.toLocaleString()} KB/s</div>
          </div>
          
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-2">
          {region.countries.map((country) => (
            <div 
              key={country.id}
              className="flex justify-between items-center p-2 rounded hover:bg-background/50 cursor-pointer"
              onClick={() => onCountrySelect(country)}
            >
              <div className="font-medium">{country.name}</div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline">{country.connectors} Connectors</Badge>
                <Badge variant="outline" className="animate-pulse">{country.logTraffic} KB/s</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RegionCard;
