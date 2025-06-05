
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface CountryData {
  country: string;
  visitedCount: number;
  totalCount: number;
}

interface CountryProgressBarsProps {
  data: CountryData[];
  isLoading?: boolean;
  selectedCountry: string;
  onCountrySelect: (country: string) => void;
}

export const CountryProgressBars = ({ 
  data, 
  isLoading, 
  selectedCountry,
  onCountrySelect 
}: CountryProgressBarsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Country Progress</CardTitle>
          <CardDescription>
            Your progress by country
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
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
          <CardTitle>Country Progress</CardTitle>
          <CardDescription>
            Your progress by country
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No check-ins recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Country Progress</CardTitle>
        <CardDescription>
          Click on a country to view its state breakdown
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((country) => {
          const percentage = country.totalCount > 0 
            ? (country.visitedCount / country.totalCount) * 100 
            : 0;
          
          const isSelected = country.country === selectedCountry;
          
          return (
            <div 
              key={country.country}
              className={`space-y-2 p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                isSelected ? 'bg-muted border-primary' : 'border-border'
              }`}
              onClick={() => onCountrySelect(country.country)}
            >
              <div className="flex justify-between items-center">
                <span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                  {country.country}
                </span>
                <span className="text-sm text-muted-foreground">
                  {country.visitedCount}/{country.totalCount}
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
