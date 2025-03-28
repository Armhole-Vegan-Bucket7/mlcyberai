
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ComplianceDashboard from '@/components/compliance/ComplianceDashboard';
import { ComplianceAgentProvider } from '@/components/compliance/ComplianceAgentContext';

const Compliance = () => {
  return (
    <PageLayout title="Compliance Intelligence Dashboard" description="Interactive AI agents for compliance frameworks">
      <ComplianceAgentProvider>
        <ComplianceDashboard />
      </ComplianceAgentProvider>
    </PageLayout>
  );
};

export default Compliance;
