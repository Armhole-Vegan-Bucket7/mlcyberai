
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PlatformIntegrations from '@/components/settings/PlatformIntegrations';

const Connectors = () => {
  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="page-transition">
          <h1 className="text-2xl font-bold">Platform Connectors</h1>
          <p className="text-sm text-cyber-gray-500 mt-1">
            Manage connections to security platforms and data sources
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Platform Integrations</CardTitle>
          <CardDescription>
            Connect to your security platforms to pull metrics and data into the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlatformIntegrations />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Connectors;
