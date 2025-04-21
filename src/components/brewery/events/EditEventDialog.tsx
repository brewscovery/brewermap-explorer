
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateVenueEvent, VenueEvent } from "@/hooks/useVenueEvents";
import { toast } from "sonner";
import { format } from "date-fns";
import VenueEventForm, { Venue, VenueEventFormValues } from "./VenueEventForm";

function splitISOToLocalDateTime(isoString: string | undefined) {
  if (!isoString) return { date: "", time: "" };
  const d = new Date(isoString);
  const date = d.toISOString().slice(0, 10);
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return { date, time: `${hours}:${mins}` };
}

function mergeDateAndTimeToISO(date: string, time: string) {
  if (!date || !time) return "";
  const timeWithSeconds = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${timeWithSeconds}`).toISOString();
}

// Accepts only for types
interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: VenueEvent | null;
  venues: Venue[];
}

const EditEventDialog: React.FC<EditEventDialogProps> = ({
  open,
  onOpenChange,
  event,
  venues,
}) => {
  const [saving, setSaving] = useState(false);
  const updateEvent = useUpdateVenueEvent();

  let initialValues: Partial<VenueEventFormValues> | undefined = undefined;

  if (event) {
    const { date: startDate, time: startTime } = splitISOToLocalDateTime(event.start_time);
    const { date: endDate, time: endTime } = splitISOToLocalDateTime(event.end_time);
    initialValues = {
      venue_id: event.venue_id,
      title: event.title,
      description: event.description || "",
      start_date: startDate,
      start_time: startTime,
      end_date: endDate,
      end_time: endTime,
      max_attendees: event.max_attendees ?? undefined,
      is_published: event.is_published ?? false,
    };
  }

  async function handleSubmit(form: VenueEventFormValues) {
    if (
      !event?.id ||
      !form.title ||
      !form.start_date ||
      !form.start_time ||
      !form.end_date ||
      !form.end_time
    ) {
      toast.error("Please fill title, start and end time.");
      return;
    }
    setSaving(true);
    try {
      await updateEvent.mutateAsync({
        id: event.id,
        title: form.title,
        description: form.description || "",
        start_time: mergeDateAndTimeToISO(form.start_date, form.start_time),
        end_time: mergeDateAndTimeToISO(form.end_date, form.end_time),
        max_attendees: form.max_attendees ? Number(form.max_attendees) : null,
        is_published: form.is_published,
      });
      toast.success("Event updated!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update event.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        {event && (
          <VenueEventForm
            mode="edit"
            venues={venues}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            saving={saving}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditEventDialog;
