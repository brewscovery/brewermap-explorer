
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface AboutTextAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  charCount: number;
  maxChars: number;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

const AboutTextArea: React.FC<AboutTextAreaProps> = ({
  value,
  onChange,
  charCount,
  maxChars,
  isSaving,
  onCancel,
  onSave
}) => {
  return (
    <div className="space-y-2">
      <Textarea 
        value={value} 
        onChange={onChange} 
        placeholder="Describe your brewery in up to 1000 characters..."
        className="min-h-[150px]"
      />
      <div className="flex justify-between items-center text-sm">
        <span className={charCount > maxChars * 0.9 ? "text-orange-500" : "text-muted-foreground"}>
          {charCount}/{maxChars} characters
        </span>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutTextArea;
