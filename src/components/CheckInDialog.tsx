
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog-fixed';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

interface CheckInDialogProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CheckInFormData {
  rating: string;
  comment: string;
}

export function CheckInDialog({ venue, isOpen, onClose, onSuccess }: CheckInDialogProps) {
  const { user } = useAuth();
  const { register, handleSubmit, setValue, reset, formState: { isSubmitting } } = useForm<CheckInFormData>();
  const [selectedRating, setSelectedRating] = useState<number>(3);

  const onSubmit = async (data: CheckInFormData) => {
    try {
      // Ensure rating is a valid number between 1 and 5
      const rating = parseInt(data.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        throw new Error('Please select a valid rating between 1 and 5 stars');
      }

      const { error } = await supabase
        .from('checkins')
        .insert({
          venue_id: venue.id,
          user_id: user?.id,
          rating: rating,
          comment: data.comment || null,
          visited_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Successfully checked in!');
      reset();
      onSuccess(); // This calls the success handler passed from MapInteractions
      onClose();
    } catch (error: any) {
      console.error('Error checking in:', error);
      toast.error(error.message);
    }
  };

  // Handle star rating selection
  const handleRatingChange = (value: number) => {
    setSelectedRating(value);
    setValue('rating', value.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Check in at {venue.name}</DialogTitle>
          <DialogDescription>
            Share your experience at this venue
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="flex flex-col items-center focus:outline-none"
                  onClick={() => handleRatingChange(value)}
                >
                  <Star
                    size={24}
                    className={`${value <= selectedRating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'} transition-colors`}
                  />
                </button>
              ))}
            </div>
            <input type="hidden" {...register('rating')} defaultValue="3" />
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
