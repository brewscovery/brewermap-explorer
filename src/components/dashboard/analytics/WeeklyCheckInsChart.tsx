
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { WeeklyCheckInsTooltip } from './WeeklyCheckInsTooltip';

interface VenueData {
  venueName: string;
  checkInCount: number;
}

interface WeeklyData {
  week: string;
  checkIns: number;
  weekStart: Date;
  venues: VenueData[];
}

interface WeeklyCheckInsChartProps {
  data: WeeklyData[];
  isLoading?: boolean;
}

const chartConfig = {
  checkIns: {
    label: "Check-ins",
    color: "hsl(var(--chart-1))",
  },
};

export const WeeklyCheckInsChart = ({ data, isLoading }: WeeklyCheckInsChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Check-ins</CardTitle>
          <CardDescription>
            Your check-in activity over the last 13 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Check-ins</CardTitle>
          <CardDescription>
            Your check-in activity over the last 13 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-muted-foreground">No check-ins recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Check-ins</CardTitle>
        <CardDescription>
          Your check-in activity over the last 13 weeks (scroll to see full history)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: '800px', height: '250px' }}>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <XAxis 
                    dataKey="week" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                    domain={[0, 'dataMax']}
                  />
                  <Tooltip content={<WeeklyCheckInsTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="checkIns" 
                    stroke="var(--color-checkIns)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-checkIns)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "var(--color-checkIns)", strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
