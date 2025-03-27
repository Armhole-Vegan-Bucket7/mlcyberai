
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface DataPoint {
  name: string;
  value: number;
}

interface BreachTrendChartProps {
  data: DataPoint[];
  loading: boolean;
}

const CHART_CONFIG = {
  breach: {
    label: 'Breach Volume',
    theme: {
      light: 'rgba(246, 109, 155, 1)',
      dark: 'rgba(246, 109, 155, 1)',
    },
  },
  breach_area: {
    label: 'Breach Area',
    theme: {
      light: 'rgba(246, 109, 155, 0.2)',
      dark: 'rgba(246, 109, 155, 0.2)',
    },
  },
};

const BreachTrendChart: React.FC<BreachTrendChartProps> = ({ data, loading }) => {
  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd');
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-cyber-indigo" />
          Breach Volume Trend (7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-36 flex items-center justify-center text-muted-foreground">
            Loading trend data...
          </div>
        ) : (
          <div className="h-36">
            <ChartContainer config={CHART_CONFIG}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{
                    top: 5,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="breach_gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-breach)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-breach)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={formatDate}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={24}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent 
                        labelFormatter={(value) => `Date: ${formatDate(value as string)}`}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="breach"
                    stroke="var(--color-breach)"
                    fill="url(#breach_gradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BreachTrendChart;
