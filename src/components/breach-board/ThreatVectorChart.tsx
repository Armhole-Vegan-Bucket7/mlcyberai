
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Target } from 'lucide-react';

interface ThreatVector {
  name: string;
  value: number;
}

interface ThreatVectorChartProps {
  data: ThreatVector[];
  loading: boolean;
}

const CHART_CONFIG: Record<string, any> = {
  phishing: {
    label: 'Phishing',
    theme: {
      light: '#0076FF',
      dark: '#0076FF',
    },
  },
  malware: {
    label: 'Malware',
    theme: {
      light: '#5856D6',
      dark: '#5856D6',
    },
  },
  rdp: {
    label: 'RDP',
    theme: {
      light: '#FF2D55',
      dark: '#FF2D55',
    },
  },
  exploit: {
    label: 'Exploit',
    theme: {
      light: '#FF9500',
      dark: '#FF9500',
    },
  },
  insider: {
    label: 'Insider',
    theme: {
      light: '#34C759',
      dark: '#34C759',
    },
  },
  other: {
    label: 'Other',
    theme: {
      light: '#5AC8FA',
      dark: '#5AC8FA',
    },
  },
};

const ThreatVectorChart: React.FC<ThreatVectorChartProps> = ({ data, loading }) => {
  // Ensure all threat vectors have entries in our config
  const enrichedData = data.map(item => ({
    ...item,
    nameKey: item.name.toLowerCase().replace(/[^a-z0-9]/g, '') in CHART_CONFIG 
      ? item.name.toLowerCase().replace(/[^a-z0-9]/g, '') 
      : 'other'
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center">
          <Target className="w-4 h-4 mr-2 text-cyber-pink" />
          Threat Vector Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-52 flex items-center justify-center text-muted-foreground">
            Loading vector data...
          </div>
        ) : data.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-muted-foreground">
            No vector data available
          </div>
        ) : (
          <div className="h-52">
            <ChartContainer config={CHART_CONFIG}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enrichedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="nameKey"
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent 
                        nameKey="nameKey"
                      />
                    }
                  />
                  <ChartLegend 
                    content={<ChartLegendContent nameKey="nameKey" />} 
                    verticalAlign="bottom"
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ThreatVectorChart;
