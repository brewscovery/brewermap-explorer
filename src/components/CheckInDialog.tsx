
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Brewery } from '@/types/brewery';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CheckInDialogProps {
  brewery: Brewery;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CheckInFormData {
  rating: string;
  comment: string;
}

export function CheckInDialog({ brewery, isOpen, onClose, onSuccess }: CheckInDialogProps) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CheckInFormData>();

  const onSubmit = async (data: CheckInFormData) => {
    try {
      const { error } = await supabase
        .from('checkins')
        .insert({
          brewery_id: brewery.id,
          rating: parseInt(data.rating),
          comment: data.comment,
        });

      if (error) throw error;

      toast.success('Successfully checked in!');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error checking in:', error);
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check in at {brewery.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <Select 
              {...register('rating')}
              onValueChange={(value) => {
                register('rating').onChange({ target: { value } });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a rating" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {rating} {rating === 1 ? 'Star' : 'Stars'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              {...register('comment')}
              placeholder="Share your experience..."
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Checking in...' : 'Check In'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
