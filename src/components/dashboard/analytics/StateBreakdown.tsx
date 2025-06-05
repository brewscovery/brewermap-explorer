
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface StateData {
  state: string;
  visitedCount: number;
  totalCount: number;
}

interface StateBreakdownProps {
  data: StateData[];
  isLoading?: boolean;
  selectedCountry?: string;
  onCountryChange?: (country: string) => void;
  availableCountries?: string[];
}

export const StateBreakdown = ({ 
  data, 
  isLoading, 
  selectedCountry = 'United States',
  onCountryChange,
  availableCountries = []
}: StateBreakdownProps) => {
  const hasMultipleCountries = availableCountries.length > 1;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>State Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>State Progress</CardTitle>
            {hasMultipleCountries && (
              <Select value={selectedCountry} onValueChange={onCountryChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {availableCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No check-ins recorded yet for {selectedCountry}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>State Progress - {selectedCountry}</CardTitle>
          {hasMultipleCountries && (
            <Select value={selectedCountry} onValueChange={onCountryChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {availableCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((state) => {
          const percentage = state.totalCount > 0 
            ? (state.visitedCount / state.totalCount) * 100 
            : 0;
          
          return (
            <div 
              key={state.state}
              className="space-y-2 p-3 rounded-lg border border-border"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {state.state}
                </span>
                <span className="text-sm text-muted-foreground">
                  {state.visitedCount}/{state.totalCount}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {percentage.toFixed(1)}% completed
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
