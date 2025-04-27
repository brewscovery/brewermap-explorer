import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequiredFieldLabel } from "@/components/ui/required-field-label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export interface Venue {
  id: string;
  name: string;
}

export type VenueEventFormMode = "create" | "edit";

export interface VenueEventFormValues {
  venue_id: string;
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  max_attendees?: string | number | null;
  is_published: boolean;
  ticket_price?: string | number | null;
  ticket_url?: string | null;
}

interface VenueEventFormProps {
  mode: VenueEventFormMode;
  venues: Venue[];
  defaultVenueId?: string;
  initialValues?: Partial<VenueEventFormValues>;
  onSubmit: (values: VenueEventFormValues) => void;
  onCancel: () => void;
  saving: boolean;
}

const getNextHalfHourOptions = () => {
  const options = [];
  for (let hour = 6; hour < 24; hour++) {
    options.push(
      `${hour.toString().padStart(2, "0")}:00`,
      `${hour.toString().padStart(2, "0")}:30`
    );
  }
  return options;
};

const TIME_OPTIONS = getNextHalfHourOptions();

export const VenueEventForm: React.FC<VenueEventFormProps> = ({
  mode,
  venues = [],
  defaultVenueId,
  initialValues,
  onSubmit,
  onCancel,
  saving,
}) => {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [venueId, setVenueId] = useState(initialValues?.venue_id || defaultVenueId || "");
  const [startDate, setStartDate] = useState(initialValues?.start_date || "");
  const [startTime, setStartTime] = useState(initialValues?.start_time || "");
  const [endDate, setEndDate] = useState(initialValues?.end_date || "");
  const [endTime, setEndTime] = useState(initialValues?.end_time || "");
  const [maxAttendees, setMaxAttendees] = useState(
    initialValues?.max_attendees !== undefined && initialValues?.max_attendees !== null
      ? String(initialValues.max_attendees) : ""
  );
  const [isPublished, setIsPublished] = useState(!!initialValues?.is_published);
  const [ticketPrice, setTicketPrice] = useState(
    initialValues?.ticket_price !== undefined ? String(initialValues.ticket_price) : ""
  );
  const [ticketUrl, setTicketUrl] = useState(initialValues?.ticket_url || "");

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setTitle(initialValues.title || "");
      setDescription(initialValues.description || "");
      setVenueId(initialValues.venue_id || defaultVenueId || "");
      setStartDate(initialValues.start_date || "");
      setStartTime(initialValues.start_time || "");
      setEndDate(initialValues.end_date || "");
      setEndTime(initialValues.end_time || "");
      setMaxAttendees(initialValues.max_attendees !== undefined && initialValues.max_attendees !== null
        ? String(initialValues.max_attendees) : "");
      setIsPublished(!!initialValues.is_published);
    }
  }, [mode, initialValues, defaultVenueId]);

  useEffect(() => {
    if (mode === "create" && initialValues?.start_date) {
      setStartDate(initialValues.start_date);
      setEndDate(initialValues.start_date);
      if (!startTime) setStartTime("10:00");
      if (!endTime) setEndTime("12:00");
    }
    if (mode === "create" && defaultVenueId) {
      setVenueId(defaultVenueId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, defaultVenueId, initialValues?.start_date]);

  React.useEffect(() => {
    if (startDate && endDate !== startDate) {
      setEndDate(startDate);
    }
  }, [startDate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      venue_id: venueId,
      title,
      description,
      start_date: startDate,
      start_time: startTime,
      end_date: endDate,
      end_time: endTime,
      max_attendees: maxAttendees,
      is_published: isPublished,
      ticket_price: ticketPrice ? Number(ticketPrice) : null,
      ticket_url: ticketUrl || null,
    });
  }

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault();
    onCancel();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-2">
      <div className="space-y-2">
        <RequiredFieldLabel htmlFor="event-title" required>Event Title</RequiredFieldLabel>
        <Input
          id="event-title"
          placeholder="Event Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <RequiredFieldLabel htmlFor="event-description" required>Event Description</RequiredFieldLabel>
        <Textarea
          id="event-description"
          placeholder="Event Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <RequiredFieldLabel htmlFor="venue-id" required>Venue</RequiredFieldLabel>
        <Select value={venueId} onValueChange={setVenueId}>
          <SelectTrigger id="venue-id">
            <SelectValue placeholder="Select venue" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(venues) && venues.map((venue) => (
              <SelectItem key={venue.id} value={venue.id}>
                {venue.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <RequiredFieldLabel htmlFor="event-start-date" required>Start Date</RequiredFieldLabel>
        <Input
          id="event-start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mb-1"
        />
        <RequiredFieldLabel htmlFor="event-start-time" required>Start Time</RequiredFieldLabel>
        <Select value={startTime} onValueChange={setStartTime}>
          <SelectTrigger id="event-start-time">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]" onWheel={(e) => e.stopPropagation()}>
              {TIME_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      <div>
        <RequiredFieldLabel htmlFor="event-end-date" required>End Date</RequiredFieldLabel>
        <Input
          id="event-end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mb-1"
        />
        <RequiredFieldLabel htmlFor="event-end-time" required>End Time</RequiredFieldLabel>
        <Select value={endTime} onValueChange={setEndTime}>
          <SelectTrigger id="event-end-time">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]" onWheel={(e) => e.stopPropagation()}>
              {TIME_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <RequiredFieldLabel htmlFor="max-attendees">Max Attendees (optional)</RequiredFieldLabel>
        <Input
          type="number"
          placeholder="Max Attendees (optional)"
          value={maxAttendees}
          min="0"
          onChange={(e) => setMaxAttendees(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <RequiredFieldLabel htmlFor="ticket-price">Ticket Price (optional)</RequiredFieldLabel>
        <Input
          id="ticket-price"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter ticket price"
          value={ticketPrice}
          onChange={(e) => setTicketPrice(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <RequiredFieldLabel htmlFor="ticket-url">Ticket Purchase URL (optional)</RequiredFieldLabel>
        <Input
          id="ticket-url"
          type="url"
          placeholder="https://..."
          value={ticketUrl}
          onChange={(e) => setTicketUrl(e.target.value)}
        />
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
        />
        Published
      </label>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" type="button" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (mode === "create" ? "Creating..." : "Saving...") : (mode === "create" ? "Create Event" : "Save")}
        </Button>
      </div>
    </form>
  );
};

export default VenueEventForm;
