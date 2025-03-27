import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenantContext, TENANTS } from '@/contexts/TenantContext';
import { toast } from '@/components/ui/use-toast';

export function TenantSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedTenant, setSelectedTenant } = useTenantContext();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const selectTenant = (tenant: typeof TENANTS[0]) => {
    if (tenant.id !== selectedTenant.id) {
      setSelectedTenant(tenant);
      toast({
        title: `Switched to ${tenant.name}`,
        description: "Dashboard updated with tenant-specific data.",
      });
    }
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
  
  // Handle keyboard accessibility
  const handleKeyDown = (event: React.KeyboardEvent, tenant?: typeof TENANTS[0]) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (tenant) {
          selectTenant(tenant);
        } else {
          toggleDropdown();
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        break;
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg",
          "hover:bg-cyber-gray-100 dark:hover:bg-cyber-gray-800 transition-colors"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
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
          className="absolute top-full right-0 mt-1 w-64 bg-background border border-border rounded-lg shadow-lg py-1 z-50"
          role="menu"
        >
          {TENANTS.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => selectTenant(tenant)}
              onKeyDown={(e) => handleKeyDown(e, tenant)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-left text-sm",
                "hover:bg-accent hover:text-accent-foreground transition-colors",
                "font-normal tracking-wide uppercase text-xs",
                tenant.id === selectedTenant.id && "bg-accent/50"
              )}
              role="menuitem"
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
