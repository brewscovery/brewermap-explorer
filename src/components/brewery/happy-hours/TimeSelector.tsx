
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimeSelectorProps {
  label: string;
  id: string;
  value: string | null;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

const TimeSelector = ({ 
  label, 
  id, 
  value, 
  onChange, 
  options, 
  className = "w-full"
}: TimeSelectorProps) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Select
        value={value || ''}
        onValueChange={onChange}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-[200px]" onWheel={(e) => e.stopPropagation()}>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeSelector;
