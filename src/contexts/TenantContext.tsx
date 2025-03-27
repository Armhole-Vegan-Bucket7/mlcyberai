
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Move TENANTS array from TenantSelector to here
export const TENANTS = [
  { id: '1', name: 'GlobalRoot' },
  { id: '2', name: 'MLCyber Customer1' },
  { id: '3', name: 'MLCyber Customer2' },
];

type Tenant = {
  id: string;
  name: string;
};

type TenantContextType = {
  selectedTenant: Tenant;
  setSelectedTenant: (tenant: Tenant) => void;
  refreshKey: number; // This will be used to force re-renders when tenant changes
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [selectedTenant, setSelectedTenant] = useState<Tenant>(TENANTS[0]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Force a refresh when tenant changes
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [selectedTenant.id]);

  return (
    <TenantContext.Provider value={{ selectedTenant, setSelectedTenant, refreshKey }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
}
