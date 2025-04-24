import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { useCreateVenueEvent } from "@/hooks/useVenueEvents";
import VenueEventForm, { Venue, VenueEventFormValues } from "./VenueEventForm";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venues: Venue[];
  defaultVenueId: string;
  initialDate?: Date | null;
}

function mergeDateAndTimeToISO(date: string, time: string) {
  if (!date || !time) return "";
  const timeWithSeconds = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${timeWithSeconds}`).toISOString();
}

const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  open,
  onOpenChange,
  venues,
  defaultVenueId,
  initialDate = null,
}) => {
  const [saving, setSaving] = useState(false);

  // For new dialog, pass start_date as initialValues
  const initialValues: Partial<VenueEventFormValues> = initialDate
    ? { start_date: format(initialDate, "yyyy-MM-dd") }
    : {};

  const createEvent = useCreateVenueEvent();

  async function handleSubmit(form: VenueEventFormValues) {
    const {
      title,
      description,
      venue_id,
      start_date,
      start_time,
      end_date,
      end_time,
      max_attendees,
      is_published,
      ticket_price,
      ticket_url,
    } = form;

    if (!title || !venue_id || !start_date || !start_time || !end_date || !end_time) {
      toast.error("Please fill all required fields");
      return;
    }

    const startTimeISO = mergeDateAndTimeToISO(start_date, start_time);
    const endTimeISO = mergeDateAndTimeToISO(end_date, end_time);

    if (!startTimeISO || !endTimeISO) {
      toast.error("Invalid date/time format");
      return;
    }

    setSaving(true);
    try {
      await createEvent.mutateAsync({
        venue_id,
        title,
        description,
        start_time: startTimeISO,
        end_time: endTimeISO,
        max_attendees: max_attendees ? parseInt(String(max_attendees), 10) : null,
        is_published,
        ticket_price: ticket_price ? Number(ticket_price) : null,
        ticket_url: ticket_url || null,
      });
      toast.success("Event created successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <VenueEventForm
          mode="create"
          venues={venues}
          defaultVenueId={defaultVenueId}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          saving={saving}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
