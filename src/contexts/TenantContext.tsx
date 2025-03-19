
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { TENANTS } from '@/components/dashboard/TenantSelector';

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
