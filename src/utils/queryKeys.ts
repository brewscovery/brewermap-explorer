
// Standardized query key factories for consistent cache management

export const queryKeys = {
  // Brewery keys
  breweries: {
    all: ['breweries'] as string[],
    bySearch: (searchTerm: string, searchType: string) => ['breweries', searchTerm, searchType] as string[],
    byId: (id: string) => ['brewery', id] as string[],
    stats: (id: string) => ['brewery-stats', id] as string[],
    summary: (id: string) => ['brewery-summary', id] as string[],
    venues: (id: string) => ['breweryVenues', id] as string[],
    claims: {
      all: ['brewery-claims'] as string[],
      byUser: (userId: string) => ['brewery-claims', userId] as string[],
    }
  },

  // Venue keys
  venues: {
    all: ['venues'] as string[],
    byId: (id: string) => ['venue', id] as string[],
    byBrewery: (breweryId: string) => ['breweryVenues', breweryId] as string[],
    hours: (id: string) => ['venueHours', id] as string[],
    happyHours: (id: string) => ['venueHappyHours', id] as string[],
    dailySpecials: (id: string) => ['venueDailySpecials', id] as string[],
    events: (id: string) => ['venueEvents', id] as string[],
    analytics: (id: string) => ['venue-analytics', id] as string[],
    favorites: (venueId: string, userId: string) => ['venueFavorite', venueId, userId] as string[],
    favoritesCount: (venueId: string) => ['venueFavoritesCount', venueId] as string[],
  },

  // User keys
  users: {
    profile: (id: string) => ['profiles', id] as string[],
    notifications: (id: string) => ['notifications', id] as string[],
    checkins: (id: string) => ['checkins', id] as string[],
    todoLists: (id: string) => ['todoListVenues', id] as string[],
    analytics: (id: string) => ['user-analytics', id] as string[],
  },

  // Event keys
  events: {
    all: ['events'] as string[],
    byVenue: (venueId: string) => ['venueEvents', venueId] as string[],
    multiple: (venueIds: string[]) => ['multipleVenueEvents', ...venueIds] as string[],
    interests: (eventId: string, userId: string) => ['event-interests', eventId, userId] as string[],
  },

  // Admin keys
  admin: {
    stats: ['admin', 'stats'] as string[],
    breweries: (searchQuery?: string) => searchQuery ? ['admin', 'breweries', searchQuery] as string[] : ['admin', 'breweries'] as string[],
    users: (searchQuery?: string) => searchQuery ? ['admin', 'users', searchQuery] as string[] : ['admin', 'users'] as string[],
    claims: ['admin', 'brewery-claims'] as string[],
  }
};

// Helper function to create query keys with validation
export function createQueryKey<T extends string[]>(keyFactory: () => T): T {
  const key = keyFactory();
  
  // Validate key structure
  if (!Array.isArray(key) || key.length === 0) {
    throw new Error('Query key must be a non-empty array');
  }
  
  return key;
}
