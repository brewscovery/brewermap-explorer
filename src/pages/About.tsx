import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">About Brewscovery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-gray max-w-none">
            <p className="text-muted-foreground">
              Content coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;