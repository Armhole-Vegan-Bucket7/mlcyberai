
import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenantContext } from '@/contexts/TenantContext';

export const TENANTS = [
  { id: '1', name: 'Microland MSSP' },
  { id: '2', name: 'RSM' },
  { id: '3', name: 'Indorama' },
];

export function TenantSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedTenant, setSelectedTenant } = useTenantContext();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const selectTenant = (tenant: typeof TENANTS[0]) => {
    setSelectedTenant(tenant);
    setIsOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
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
        <div 
          className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-lg shadow-lg py-1 z-50"
        >
          {TENANTS.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => selectTenant(tenant)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-left text-sm",
                "hover:bg-accent hover:text-accent-foreground transition-colors"
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
