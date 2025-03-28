
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';

const ThreatInformedDefense = () => {
  return (
    <PageLayout title="Threat Informed Defense" description="Track security maturity metrics">
      <div className="p-6">
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Threat Informed Defense Score</h2>
          <p className="text-muted-foreground">Security maturity assessment and benchmarking content will appear here.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default ThreatInformedDefense;
