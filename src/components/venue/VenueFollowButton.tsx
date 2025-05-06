
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVenueFavorite } from '@/hooks/useVenueFavorite';
import { cn } from '@/lib/utils';

interface VenueFollowButtonProps {
  venueId: string;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  size?: 'default' | 'sm' | 'icon';
  showCount?: boolean;
}

export const VenueFollowButton = ({
  venueId,
  variant = 'secondary',
  className,
  size = 'sm',
  showCount = true
}: VenueFollowButtonProps) => {
  const {
    isFavorited,
    favoritesCount,
    isLoading,
    toggleFavorite,
    showFollowButton
  } = useVenueFavorite(venueId);

  if (!showFollowButton) return null;

  const buttonVariant = variant === 'primary'
    ? 'default'
    : variant === 'secondary'
      ? 'secondary'
      : 'outline';

  return (
    <Button
      variant={buttonVariant}
      size={size}
      className={cn("gap-1", className)}
      onClick={() => toggleFavorite()}
      disabled={isLoading}
    >
      <Heart
        size={16}
        className={cn(
          "transition-colors",
          isFavorited ? "fill-current" : ""
        )}
      />
    </Button>
  );
};

export default VenueFollowButton;
