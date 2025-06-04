
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CountryData {
  country: string;
  visitedCount: number;
  totalCount: number;
}

interface CountryBreakdownChartProps {
  data: CountryData[];
  isLoading?: boolean;
}

export const CountryBreakdownChart = ({ data, isLoading }: CountryBreakdownChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Journey Around the World</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Journey Around the World</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No venues found in any country</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Journey Around the World</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="country" />
            <YAxis allowDecimals={false} />
            <Tooltip 
              formatter={(value, name) => [
                value, 
                name === 'visitedCount' ? 'Visited' : 'Total'
              ]}
              labelFormatter={(label) => `Country: ${label}`}
            />
            <Legend />
            <Bar dataKey="totalCount" fill="#e5e7eb" name="Total" />
            <Bar dataKey="visitedCount" fill="#22c55e" name="Visited" offset={0} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
