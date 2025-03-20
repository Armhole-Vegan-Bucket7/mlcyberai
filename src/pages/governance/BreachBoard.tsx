
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';

const BreachBoard = () => {
  return (
    <PageLayout title="Breach Board" description="Monitor and respond to security breaches">
      <div className="p-6">
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Breach Monitoring Dashboard</h2>
          <p className="text-muted-foreground">Security breach tracking and response content will appear here.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default BreachBoard;
