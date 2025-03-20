
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';

const CustomerQBR = () => {
  return (
    <PageLayout title="Customer QBR & NPS" description="Review customer quarterly business reviews and NPS scores">
      <div className="p-6">
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Customer QBR & NPS Dashboard</h2>
          <p className="text-muted-foreground">Customer quarterly business reviews and Net Promoter Score content will appear here.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default CustomerQBR;
