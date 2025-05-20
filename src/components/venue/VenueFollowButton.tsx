
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

  // Use primary variant (orange) when favorited for a more distinctive appearance
  const buttonVariant = isFavorited 
    ? 'default'
    : variant === 'primary'
      ? 'default'
      : variant === 'secondary'
        ? 'secondary'
        : 'outline';

  return (
    <Button
      variant={buttonVariant}
      size={size}
      className={cn("gap-1 transition-all hover:scale-105", className)}
      onClick={() => toggleFavorite()}
      disabled={isLoading}
      title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
    >
      <Heart
        size={18}
        className={cn(
          "transition-colors",
          isFavorited ? "fill-current" : ""
        )}
      />
      {showCount && favoritesCount > 0 && (
        <span className="text-xs font-medium">{favoritesCount}</span>
      )}
    </Button>
  );
};

export default VenueFollowButton;
