
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUpdateVenueEvent, VenueEvent } from "@/hooks/useVenueEvents";
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
  const timeWithSeconds = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${timeWithSeconds}`).toISOString();
}

function splitISOToLocalDateTime(isoString: string | undefined) {
  if (!isoString) return { date: "", time: "" };
  const d = new Date(isoString);
  const date = d.toISOString().slice(0, 10);
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return { date, time: `${hours}:${mins}` };
}

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: VenueEvent | null;
}

const TIME_OPTIONS = getNextHalfHourOptions();

const EditEventDialog: React.FC<EditEventDialogProps> = ({
  open,
  onOpenChange,
  event,
}) => {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  
  const [form, setForm] = useState<Partial<VenueEvent>>({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    max_attendees: undefined,
    is_published: false,
  });
  useEffect(() => {
    if (open && event) {
      setForm({
        id: event.id,
        venue_id: event.venue_id,
        title: event.title,
        description: event.description || "",
        start_time: event.start_time,
        end_time: event.end_time,
        max_attendees: event.max_attendees ?? undefined,
        is_published: event.is_published ?? false,
      });
      const { date: sDate, time: sTime } = splitISOToLocalDateTime(event.start_time);
      setStartDate(sDate);
      setStartTime(sTime);
      const { date: eDate, time: eTime } = splitISOToLocalDateTime(event.end_time);
      setEndDate(eDate);
      setEndTime(eTime);
    }
  }, [open, event]);

  // If startDate changes and endDate is empty or different, update endDate
  useEffect(() => {
    if (startDate && endDate !== startDate) {
      setEndDate(startDate);
    }
  }, [startDate]);
  useEffect(() => {
    setForm(f => ({
      ...f,
      start_time: startDate && startTime ? mergeDateAndTimeToISO(startDate, startTime) : "",
      end_time: endDate && endTime ? mergeDateAndTimeToISO(endDate, endTime) : "",
    }));
  }, [startDate, startTime, endDate, endTime]);

  const updateEvent = useUpdateVenueEvent();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (
      !form.id ||
      !form.title ||
      !form.start_time ||
      !form.end_time
    ) {
      toast.error("Please fill title, start and end time.");
      return;
    }
    setSaving(true);
    try {
      await updateEvent.mutateAsync({
        id: form.id,
        title: form.title,
        description: form.description || "",
        start_time: form.start_time,
        end_time: form.end_time,
        max_attendees: form.max_attendees ?? null,
        is_published: form.is_published ?? false,
      });
      toast.success("Event updated!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
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
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
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

export default EditEventDialog;
