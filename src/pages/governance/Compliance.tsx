
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ComplianceDashboard from '@/components/compliance/ComplianceDashboard';
import { ComplianceAgentProvider } from '@/components/compliance/ComplianceAgentContext';

const Compliance = () => {
  return (
    <PageLayout 
      title="Compliance Mini Center" 
      description="Interactive AI agents tailored to each compliance framework"
    >
      <ComplianceAgentProvider>
        <ComplianceDashboard />
      </ComplianceAgentProvider>
    </PageLayout>
  );
};

export default Compliance;
