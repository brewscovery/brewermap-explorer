
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useVenueEvents, useCreateVenueEvent, useUpdateVenueEvent, useDeleteVenueEvent, VenueEvent } from '@/hooks/useVenueEvents';
import type { Venue } from '@/types/venue';
import { toast } from 'sonner';
import { formatDateTime } from '@/utils/dateTimeUtils';

interface VenueEventsManagerProps {
  venue: Venue;
}

function emptyEvent(venueId: string): Omit<VenueEvent, 'id' | 'created_at' | 'updated_at'> {
  return {
    venue_id: venueId,
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    max_attendees: null,
    is_published: false,
    ticket_price: null,
    ticket_url: null,
  };
}

const VenueEventsManager: React.FC<VenueEventsManagerProps> = ({ venue }) => {
  const { data: events = [], isLoading } = useVenueEvents(venue.id);

  const createEvent = useCreateVenueEvent();
  const updateEvent = useUpdateVenueEvent();
  const deleteEvent = useDeleteVenueEvent();

  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Omit<VenueEvent, 'id' | 'created_at' | 'updated_at'> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleOpen = (event?: VenueEvent) => {
    if (event) {
      setEditing({
        venue_id: event.venue_id,
        title: event.title,
        description: event.description ?? '',
        start_time: event.start_time,
        end_time: event.end_time,
        max_attendees: event.max_attendees,
        is_published: event.is_published,
        ticket_price: event.ticket_price,
        ticket_url: event.ticket_url,
      });
      setEditingId(event.id);
    } else {
      setEditing(emptyEvent(venue.id));
      setEditingId(null);
    }
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
    setEditing(null);
    setEditingId(null);
  };

  const handleChange = (field: keyof Omit<VenueEvent, 'id' | 'created_at' | 'updated_at'>, value: any) => {
    setEditing((e) => e ? { ...e, [field]: value } : e);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title || !editing.start_time || !editing.end_time) {
      toast.error('Title, start time, and end time are required.');
      return;
    }
    try {
      if (editingId) {
        await updateEvent.mutateAsync({ id: editingId, ...editing });
        toast.success('Event updated.');
      } else {
        await createEvent.mutateAsync(editing);
        toast.success('Event created.');
      }
      handleClose();
    } catch (e) {
      toast.error('Failed to save event.');
    }
  };

  const handleDelete = async (event: VenueEvent) => {
    if (window.confirm('Delete this event?')) {
      try {
        await deleteEvent.mutateAsync({ id: event.id, venue_id: venue.id });
        toast.success('Event deleted.');
      } catch (e) {
        toast.error('Failed to delete event.');
      }
    }
  };

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Venue Events</h3>
        <Button size="sm" onClick={() => handleOpen()}>Add Event</Button>
      </div>
      {isLoading ? (
        <div>Loading events...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.length === 0 ? (
            <div className="text-muted-foreground">No events found for this venue.</div>
          ) : (
            events.map(ev => (
              <div key={ev.id} className="border rounded p-3 relative bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{ev.title}</div>
                    <div className="text-sm text-muted-foreground">{ev.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(new Date(ev.start_time))} - {formatDateTime(new Date(ev.end_time))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ev.is_published ? "Published" : "Unpublished"} &nbsp;
                      {ev.max_attendees && <>| Max Attendees: {ev.max_attendees}</>}
                      {ev.ticket_price && <>| Price: ${ev.ticket_price}</>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleOpen(ev)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(ev)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Event' : 'Add Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input
              placeholder="Event Title"
              value={editing?.title ?? ''}
              onChange={e => handleChange('title', e.target.value)}
            />
            <Textarea
              placeholder="Event Description"
              value={editing?.description ?? ''}
              onChange={e => handleChange('description', e.target.value)}
            />
            <Input
              type="datetime-local"
              placeholder="Start Time"
              value={editing?.start_time ? editing.start_time.slice(0, 16) : ''}
              onChange={e => handleChange('start_time', e.target.value)}
            />
            <Input
              type="datetime-local"
              placeholder="End Time"
              value={editing?.end_time ? editing.end_time.slice(0, 16) : ''}
              onChange={e => handleChange('end_time', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max Attendees (optional)"
              value={editing?.max_attendees ?? ''}
              onChange={e => handleChange('max_attendees', Number(e.target.value))}
              min={0}
            />
            <Input
              type="number"
              placeholder="Ticket Price (optional)"
              value={editing?.ticket_price ?? ''}
              onChange={e => handleChange('ticket_price', e.target.value ? Number(e.target.value) : null)}
              min={0}
              step="0.01"
            />
            <Input
              type="url"
              placeholder="Ticket URL (optional)"
              value={editing?.ticket_url ?? ''}
              onChange={e => handleChange('ticket_url', e.target.value || null)}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing?.is_published ?? false}
                onChange={e => handleChange('is_published', e.target.checked)}
              />
              Published
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!editing?.title || !editing?.start_time || !editing?.end_time}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VenueEventsManager;
