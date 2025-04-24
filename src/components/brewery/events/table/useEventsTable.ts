
import { useState, useMemo } from 'react';
import { VenueEvent } from '@/hooks/useVenueEvents';
import { Venue } from './types';

type SortField = 'title' | 'venue_id' | 'start_time' | 'end_time' | 'is_published' | 'interest';
type SortDirection = 'asc' | 'desc';
type DateFilter = 'upcoming' | 'past' | 'all';

interface UseEventsTableProps {
  events: VenueEvent[];
  venues: Venue[];
}

export const useEventsTable = ({ events, venues }: UseEventsTableProps) => {
  const [sortField, setSortField] = useState<SortField>('start_time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedVenue, setSelectedVenue] = useState<string>('all');
  const [publishedFilter, setPublishedFilter] = useState<boolean | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('upcoming');

  const sortedAndFilteredEvents = useMemo(() => {
    let filteredEvents = [...events];

    // Apply venue filter
    if (selectedVenue && selectedVenue !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.venue_id === selectedVenue);
    }

    // Apply published filter
    if (publishedFilter !== null) {
      filteredEvents = filteredEvents.filter(event => event.is_published === publishedFilter);
    }

    // Apply date filter
    const now = new Date();
    switch (dateFilter) {
      case 'upcoming':
        filteredEvents = filteredEvents.filter(event => new Date(event.start_time) >= now);
        break;
      case 'past':
        filteredEvents = filteredEvents.filter(event => new Date(event.start_time) < now);
        break;
      default:
        break;
    }

    // Apply sorting
    return filteredEvents.sort((a, b) => {
      let compareA = a[sortField];
      let compareB = b[sortField];

      if (sortField === 'venue_id') {
        const venueMap = Object.fromEntries(venues.map(v => [v.id, v.name]));
        compareA = venueMap[a.venue_id] || a.venue_id;
        compareB = venueMap[b.venue_id] || b.venue_id;
      }

      if (sortField === 'start_time' || sortField === 'end_time') {
        compareA = new Date(a[sortField]).getTime();
        compareB = new Date(b[sortField]).getTime();
      }

      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [events, sortField, sortDirection, selectedVenue, publishedFilter, dateFilter, venues]);

  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return {
    sortedAndFilteredEvents,
    sortField,
    sortDirection,
    toggleSort,
    selectedVenue,
    setSelectedVenue,
    publishedFilter,
    setPublishedFilter,
    dateFilter,
    setDateFilter,
  };
};
