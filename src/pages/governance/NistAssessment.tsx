
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import NistAssessmentWizard from '@/components/nist/NistAssessmentWizard';

const NistAssessment = () => {
  return (
    <PageLayout 
      title="NIST CSF Assessment" 
      description="Interactive assessment of your organization's cybersecurity posture based on the NIST Cybersecurity Framework with secure evidence upload capabilities"
      className="bg-gradient-to-br from-cyber-gray-900 to-cyber-gray-800"
    >
      <NistAssessmentWizard />
    </PageLayout>
  );
};

export default NistAssessment;
