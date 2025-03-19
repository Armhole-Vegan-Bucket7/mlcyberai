
import React, { useState } from 'react';
import { Check, ChevronDown, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

const TENANTS = [
  { id: '1', name: 'Microland MSSP' },
  { id: '2', name: 'Acme Corporation' },
  { id: '3', name: 'Globex Industries' },
  { id: '4', name: 'Initech Systems' },
];

export function TenantSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(TENANTS[0]);
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const selectTenant = (tenant: typeof TENANTS[0]) => {
    setSelectedTenant(tenant);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg",
          "hover:bg-cyber-gray-100 dark:hover:bg-cyber-gray-800 transition-colors"
        )}
      >
        <Building className="w-4 h-4 text-cyber-blue" />
        <span className="font-medium">{selectedTenant.name}</span>
        <ChevronDown className={cn(
          "w-4 h-4 text-cyber-gray-400 transition-transform duration-200",
          isOpen && "transform rotate-180"
        )} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 glass rounded-lg shadow-lg py-1 z-20 animate-fade-in">
          {TENANTS.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => selectTenant(tenant)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-left text-sm",
                "hover:bg-cyber-blue/5 transition-colors"
              )}
            >
              <span className="w-5">
                {tenant.id === selectedTenant.id && (
                  <Check className="w-4 h-4 text-cyber-blue" />
                )}
              </span>
              <span>{tenant.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default TenantSelector;
