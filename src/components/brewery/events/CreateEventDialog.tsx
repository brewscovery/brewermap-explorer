import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateVenueEvent, VenueEvent } from "@/hooks/useVenueEvents";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

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
  return new Date(`${date}T${time}:00`).toISOString();
}

function splitISOToLocalDateTime(isoString: string | undefined) {
  if (!isoString) return { date: "", time: "" };
  const d = new Date(isoString);
  const date = d.toISOString().slice(0, 10);
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return { date, time: `${hours}:${mins}` };
}

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venues: { id: string; name: string }[];
  defaultVenueId: string;
}

const TIME_OPTIONS = getNextHalfHourOptions();

const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  open,
  onOpenChange,
  venues,
  defaultVenueId,
}) => {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const [form, setForm] = useState<Partial<Omit<VenueEvent, "id" | "created_at" | "updated_at">>>({
    venue_id: defaultVenueId,
    title: "",
    description: "",
    max_attendees: undefined,
    is_published: false,
    start_time: "",
    end_time: "",
  });

  const createEvent = useCreateVenueEvent();
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({
      venue_id: defaultVenueId,
      title: "",
      description: "",
      max_attendees: undefined,
      is_published: false,
      start_time: "",
      end_time: "",
    });
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
  };

  React.useEffect(() => {
    if (open) {
      if (form.start_time) {
        const { date, time } = splitISOToLocalDateTime(form.start_time);
        setStartDate(date);
        setStartTime(time);
      } else {
        setStartDate("");
        setStartTime("");
      }
      if (form.end_time) {
        const { date, time } = splitISOToLocalDateTime(form.end_time);
        setEndDate(date);
        setEndTime(time);
      } else {
        setEndDate("");
        setEndTime("");
      }
    }
  }, [open]);

  React.useEffect(() => {
    setForm((f) => ({
      ...f,
      start_time: startDate && startTime ? mergeDateAndTimeToISO(startDate, startTime) : "",
      end_time: endDate && endTime ? mergeDateAndTimeToISO(endDate, endTime) : "",
    }));
  }, [startDate, startTime, endDate, endTime]);

  const handleSave = async () => {
    if (
      !form.venue_id ||
      !form.title ||
      !form.start_time ||
      !form.end_time
    ) {
      toast.error("Please fill title, select venue, start and end time.");
      return;
    }
    setSaving(true);
    try {
      await createEvent.mutateAsync({
        venue_id: form.venue_id,
        title: form.title,
        description: form.description || "",
        start_time: form.start_time,
        end_time: form.end_time,
        max_attendees: form.max_attendees || null,
        is_published: form.is_published || false,
      });
      toast.success("Event created!");
      onOpenChange(false);
      resetForm();
    } catch {
      toast.error("Failed to create event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <label>
            Venue
            <select
              className="w-full border rounded p-2 bg-white"
              value={form.venue_id || defaultVenueId}
              onChange={e => setForm(f => ({ ...f, venue_id: e.target.value }))}
            >
              {venues.map(v => (
                <option value={v.id} key={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
          <Input
            placeholder="Event Title"
            value={form.title || ""}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <Textarea
            placeholder="Event Description"
            value={form.description || ""}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />

          <div>
            <Label htmlFor="event-start-date" className="block mb-1">Start Date</Label>
            <Input
              id="event-start-date"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="mb-1"
            />
            <Label htmlFor="event-start-time" className="block mb-1">Start Time</Label>
            <select
              id="event-start-time"
              className="border rounded w-full p-2 bg-white"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
            >
              <option value="">Select time</option>
              {TIME_OPTIONS.map(t => (
                <option value={t} key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="event-end-date" className="block mb-1">End Date</Label>
            <Input
              id="event-end-date"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="mb-1"
            />
            <Label htmlFor="event-end-time" className="block mb-1">End Time</Label>
            <select
              id="event-end-time"
              className="border rounded w-full p-2 bg-white"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
            >
              <option value="">Select time</option>
              {TIME_OPTIONS.map(t => (
                <option value={t} key={t}>{t}</option>
              ))}
            </select>
          </div>

          <Input
            type="number"
            placeholder="Max Attendees"
            value={form.max_attendees ?? ""}
            min={0}
            onChange={e => setForm(f => ({ ...f, max_attendees: Number(e.target.value) }))}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_published ?? false}
              onChange={e =>
                setForm(f => ({ ...f, is_published: e.target.checked }))
              }
            />
            Published
          </label>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
