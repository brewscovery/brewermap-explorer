
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  venues,
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

  // Setup for edit mode
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

  // If mode is "create" and dialog opens, set date fields if provided
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
    });
  }

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault();
    onCancel();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-2">
      <Input
        placeholder="Event Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="Event Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <div>
        <Label htmlFor="venue-id">Venue</Label>
        <Select value={venueId} onValueChange={setVenueId} disabled={mode === "edit" && !!initialValues?.venue_id}>
          <SelectTrigger id="venue-id">
            <SelectValue placeholder="Select venue" />
          </SelectTrigger>
          <SelectContent>
            {venues.map((venue) => (
              <SelectItem key={venue.id} value={venue.id}>
                {venue.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="event-start-date">Start Date</Label>
        <Input
          id="event-start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mb-1"
        />
        <Label htmlFor="event-start-time">Start Time</Label>
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
        <Label htmlFor="event-end-date">End Date</Label>
        <Input
          id="event-end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mb-1"
        />
        <Label htmlFor="event-end-time">End Time</Label>
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
      <Input
        type="number"
        placeholder="Max Attendees (optional)"
        value={maxAttendees}
        min="0"
        onChange={(e) => setMaxAttendees(e.target.value)}
      />
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
