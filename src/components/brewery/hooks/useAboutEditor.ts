
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UseAboutEditorProps {
  breweryId: string | null;
  initialAbout: string | null;
  onUpdate?: (newAbout: string) => void;
}

export const useAboutEditor = ({ breweryId, initialAbout, onUpdate }: UseAboutEditorProps) => {
  const [about, setAbout] = useState(initialAbout || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [charCount, setCharCount] = useState(about.length || 0);
  const MAX_CHARS = 1000;
  const { user } = useAuth();

  useEffect(() => {
    setCharCount(about.length);
  }, [about]);

  useEffect(() => {
    if (initialAbout !== null) {
      setAbout(initialAbout);
    }
  }, [initialAbout]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setAbout(text);
    }
  };

  const startEditing = () => setIsEditing(true);
  const cancelEditing = () => {
    setAbout(initialAbout || '');
    setIsEditing(false);
  };

  const saveAbout = async () => {
    if (!breweryId || !user) {
      toast.error('Unable to update: Missing brewery ID or user');
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('Updating brewery about section:', { breweryId, about });
      
      // First, check that the user owns this brewery
      const { data: ownerData, error: ownerError } = await supabase
        .from('brewery_owners')
        .select('brewery_id')
        .eq('brewery_id', breweryId)
        .eq('user_id', user.id)
        .single();
      
      if (ownerError) {
        console.error('Error verifying brewery ownership:', ownerError);
        throw new Error('You do not have permission to update this brewery');
      }
      
      // Debug current brewery data before update
      const { data: beforeData } = await supabase
        .from('breweries')
        .select('about')
        .eq('id', breweryId)
        .single();
      
      console.log('Current brewery data before update:', beforeData);
      
      // Simple update with explicit fields
      const { data: updateData, error: updateError } = await supabase
        .from('breweries')
        .update({ 
          about: about,
          updated_at: new Date().toISOString() 
        })
        .eq('id', breweryId)
        .select();
      
      console.log('Update response:', updateData, 'Error:', updateError);
      
      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }
      
      // If the update succeeded but returned no data, fetch the latest data to verify
      const { data: verifyData, error: verifyError } = await supabase
        .from('breweries')
        .select('about')
        .eq('id', breweryId)
        .single();
      
      if (verifyError) {
        console.error('Error verifying update:', verifyError);
        throw new Error('Failed to verify update');
      }
      
      console.log('Verified data after update:', verifyData);
      
      if (verifyData.about !== about) {
        console.error('Update verification failed: Expected', about, 'but got', verifyData.about);
        
        // Use the RPC function we created as a fallback
        const { error: fallbackError } = await supabase
          .rpc('update_brewery_about', {
            brewery_id: breweryId,
            new_about: about
          });
        
        if (fallbackError) {
          console.error('Fallback update error:', fallbackError);
          throw new Error('All update attempts failed');
        }
        
        // Check one more time after the fallback
        const { data: finalData, error: finalError } = await supabase
          .from('breweries')
          .select('about')
          .eq('id', breweryId)
          .single();
          
        if (finalError) {
          console.error('Final verification error:', finalError);
          throw new Error('Failed to verify final update');
        }
        
        console.log('Final verification data:', finalData);
        
        if (finalData?.about === about) {
          if (onUpdate) onUpdate(about);
          setIsEditing(false);
          toast.success('About section updated successfully');
        } else {
          throw new Error('Unable to update brewery information');
        }
      } else {
        // Update was successful
        if (onUpdate) onUpdate(about);
        setIsEditing(false);
        toast.success('About section updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating about section:', error);
      toast.error('Failed to update about section');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    about,
    isEditing,
    isSaving,
    charCount,
    MAX_CHARS,
    handleChange,
    startEditing,
    cancelEditing,
    saveAbout
  };
};
