
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';

const Compliance = () => {
  return (
    <PageLayout title="Compliance" description="Review and manage compliance requirements">
      <div className="p-6">
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Compliance Dashboard</h2>
          <p className="text-muted-foreground">Compliance monitoring and management content will appear here.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Compliance;
