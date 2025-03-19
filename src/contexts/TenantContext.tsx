
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { TENANTS } from '@/components/dashboard/TenantSelector';

type Tenant = {
  id: string;
  name: string;
};

type TenantContextType = {
  selectedTenant: Tenant;
  setSelectedTenant: (tenant: Tenant) => void;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [selectedTenant, setSelectedTenant] = useState<Tenant>(TENANTS[0]);

  return (
    <TenantContext.Provider value={{ selectedTenant, setSelectedTenant }}>
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
