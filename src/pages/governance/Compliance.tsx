
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ComplianceDashboard from '@/components/compliance/ComplianceDashboard';
import { ComplianceAgentProvider } from '@/components/compliance/ComplianceAgentContext';

const Compliance = () => {
  return (
    <PageLayout 
      title="Compliance Mini Center" 
      description="Interactive AI agents tailored to each compliance framework"
      className="bg-gradient-to-br from-cyber-gray-900 to-cyber-gray-800"
    >
      <ComplianceAgentProvider>
        <ComplianceDashboard />
      </ComplianceAgentProvider>
    </PageLayout>
  );
};

export default Compliance;
