
// Standardized query key factories for consistent cache management

export const queryKeys = {
  // Brewery keys
  breweries: {
    all: ['breweries'] as const,
    bySearch: (searchTerm: string, searchType: string) => ['breweries', searchTerm, searchType] as const,
    byId: (id: string) => ['brewery', id] as const,
    stats: (id: string) => ['brewery-stats', id] as const,
    summary: (id: string) => ['brewery-summary', id] as const,
    venues: (id: string) => ['breweryVenues', id] as const,
    claims: {
      all: ['brewery-claims'] as const,
      byUser: (userId: string) => ['brewery-claims', userId] as const,
    }
  },

  // Venue keys
  venues: {
    all: ['venues'] as const,
    byId: (id: string) => ['venue', id] as const,
    byBrewery: (breweryId: string) => ['breweryVenues', breweryId] as const,
    hours: (id: string) => ['venueHours', id] as const,
    happyHours: (id: string) => ['venueHappyHours', id] as const,
    dailySpecials: (id: string) => ['venueDailySpecials', id] as const,
    events: (id: string) => ['venueEvents', id] as const,
    analytics: (id: string) => ['venue-analytics', id] as const,
    favorites: (venueId: string, userId: string) => ['venueFavorite', venueId, userId] as const,
    favoritesCount: (venueId: string) => ['venueFavoritesCount', venueId] as const,
  },

  // User keys
  users: {
    profile: (id: string) => ['profiles', id] as const,
    notifications: (id: string) => ['notifications', id] as const,
    checkins: (id: string) => ['checkins', id] as const,
    todoLists: (id: string) => ['todoListVenues', id] as const,
    analytics: (id: string) => ['user-analytics', id] as const,
  },

  // Event keys
  events: {
    all: ['events'] as const,
    byVenue: (venueId: string) => ['venueEvents', venueId] as const,
    multiple: (venueIds: string[]) => ['multipleVenueEvents', ...venueIds] as const,
    interests: (eventId: string, userId: string) => ['event-interests', eventId, userId] as const,
  },

  // Admin keys
  admin: {
    stats: ['admin', 'stats'] as const,
    breweries: (searchQuery?: string) => searchQuery ? ['admin', 'breweries', searchQuery] : ['admin', 'breweries'] as const,
    users: (searchQuery?: string) => searchQuery ? ['admin', 'users', searchQuery] : ['admin', 'users'] as const,
    claims: ['admin', 'brewery-claims'] as const,
  }
};

// Helper function to create query keys with validation
export function createQueryKey<T extends readonly unknown[]>(keyFactory: () => T): T {
  const key = keyFactory();
  
  // Validate key structure
  if (!Array.isArray(key) || key.length === 0) {
    throw new Error('Query key must be a non-empty array');
  }
  
  return key;
}
