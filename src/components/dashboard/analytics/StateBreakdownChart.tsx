
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllCountries } from '@/utils/countryUtils';

interface StateData {
  state: string;
  visitedCount: number;
  totalCount: number;
}

interface StateBreakdownChartProps {
  data: StateData[];
  isLoading?: boolean;
  selectedCountry?: string;
  onCountryChange?: (country: string) => void;
  availableCountries?: string[];
}

export const StateBreakdownChart = ({ 
  data, 
  isLoading, 
  selectedCountry = 'United States',
  onCountryChange,
  availableCountries = []
}: StateBreakdownChartProps) => {
  const countries = getAllCountries();
  
  // Filter countries to only show those that have venues
  const filteredCountries = countries.filter(country => 
    availableCountries.includes(country.value)
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Venues Visited by State</CardTitle>
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
          <div className="flex items-center justify-between">
            <CardTitle>Venues Visited by State</CardTitle>
            {filteredCountries.length > 1 && (
              <Select value={selectedCountry} onValueChange={onCountryChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCountries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No check-ins recorded yet for {selectedCountry}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Venues Visited by State - {selectedCountry}</CardTitle>
          {filteredCountries.length > 1 && (
            <Select value={selectedCountry} onValueChange={onCountryChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {filteredCountries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="state" />
            <YAxis allowDecimals={false} />
            <Tooltip 
              formatter={(value, name) => [
                value, 
                name === 'visitedCount' ? 'Visited' : 'Total'
              ]}
              labelFormatter={(label) => `State: ${label}`}
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
