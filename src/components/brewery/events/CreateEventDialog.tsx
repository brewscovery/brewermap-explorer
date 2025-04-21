
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateVenueEvent } from "@/hooks/useVenueEvents";
import { toast } from "sonner";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Venue {
  id: string;
  name: string;
}

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venues: Venue[];
  defaultVenueId: string;
  initialDate?: Date | null;
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

function mergeDateAndTimeToISO(date: string, time: string) {
  if (!date || !time) return "";
  const timeWithSeconds = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${timeWithSeconds}`).toISOString();
}

const TIME_OPTIONS = getNextHalfHourOptions();

const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  open,
  onOpenChange,
  venues,
  defaultVenueId,
  initialDate = null,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venueId, setVenueId] = useState(defaultVenueId);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Set initial date when the dialog opens
  useEffect(() => {
    if (open && initialDate) {
      const formattedDate = format(initialDate, "yyyy-MM-dd");
      setStartDate(formattedDate);
      setEndDate(formattedDate);
      
      // Set a default start time (10:00 AM)
      setStartTime("10:00");
      setEndTime("12:00");
    }
  }, [open, initialDate]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setVenueId(defaultVenueId);
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      setMaxAttendees("");
      setIsPublished(false);
    }
  }, [open, defaultVenueId]);

  const createEvent = useCreateVenueEvent();
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (
      !title ||
      !venueId ||
      !startDate ||
      !startTime ||
      !endDate ||
      !endTime
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const startTimeISO = mergeDateAndTimeToISO(startDate, startTime);
    const endTimeISO = mergeDateAndTimeToISO(endDate, endTime);

    if (!startTimeISO || !endTimeISO) {
      toast.error("Invalid date/time format");
      return;
    }

    setSaving(true);
    try {
      await createEvent.mutateAsync({
        venue_id: venueId,
        title,
        description,
        start_time: startTimeISO,
        end_time: endTimeISO,
        max_attendees: maxAttendees ? parseInt(maxAttendees, 10) : null,
        is_published: isPublished,
      });
      toast.success("Event created successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <Input
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Event Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div>
            <Label htmlFor="venue-id">Venue</Label>
            <Select
              value={venueId}
              onValueChange={setVenueId}
            >
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
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? "Creating..." : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
