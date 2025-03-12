
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AboutEditorProps {
  breweryId: string | null;
  initialAbout: string | null;
  onUpdate?: (newAbout: string) => void;
}

const AboutEditor = ({ breweryId, initialAbout, onUpdate }: AboutEditorProps) => {
  const [about, setAbout] = useState(initialAbout || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [charCount, setCharCount] = useState(about?.length || 0);
  const MAX_CHARS = 1000;

  useEffect(() => {
    setCharCount(about.length);
  }, [about]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setAbout(text);
    }
  };

  const handleSave = async () => {
    if (!breweryId) return;
    
    setIsSaving(true);
    try {
      console.log('Updating brewery about section:', { breweryId, about });
      
      const { data, error } = await supabase
        .from('breweries')
        .update({ about: about })
        .eq('id', breweryId)
        .select('about');
      
      if (error) throw error;
      
      console.log('Update response:', data);
      
      if (data && data.length > 0) {
        // Notify parent component about the update if callback is provided
        if (onUpdate) {
          onUpdate(data[0].about || '');
        }
        
        setIsEditing(false);
        toast.success('About section updated successfully');
      } else {
        throw new Error('No data returned from update');
      }
    } catch (error: any) {
      console.error('Error updating about section:', error);
      toast.error('Failed to update about section');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setAbout(initialAbout || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">About Your Brewery</h3>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          <Textarea 
            value={about} 
            onChange={handleChange} 
            placeholder="Describe your brewery in up to 1000 characters..."
            className="min-h-[150px]"
          />
          <div className="flex justify-between items-center text-sm">
            <span className={charCount > MAX_CHARS * 0.9 ? "text-orange-500" : "text-muted-foreground"}>
              {charCount}/{MAX_CHARS} characters
            </span>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-muted/50 p-4 rounded-md">
          {about ? (
            <p className="whitespace-pre-wrap">{about}</p>
          ) : (
            <p className="text-muted-foreground italic">
              No description provided. Click 'Edit' to add information about your brewery.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AboutEditor;
