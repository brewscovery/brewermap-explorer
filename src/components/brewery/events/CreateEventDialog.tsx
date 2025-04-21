
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateVenueEvent, VenueEvent } from "@/hooks/useVenueEvents";
import { toast } from "sonner";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venues: { id: string; name: string }[];
  defaultVenueId: string;
}

const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  open,
  onOpenChange,
  venues,
  defaultVenueId,
}) => {
  const [form, setForm] = useState<Partial<Omit<VenueEvent, "id" | "created_at" | "updated_at">>>({
    venue_id: defaultVenueId,
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    max_attendees: undefined,
    is_published: false,
  });

  const createEvent = useCreateVenueEvent();
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({
      venue_id: defaultVenueId,
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      max_attendees: undefined,
      is_published: false,
    });
  };

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
          <Input
            type="datetime-local"
            placeholder="Start Time"
            value={form.start_time ? form.start_time.slice(0, 16) : ""}
            onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
          />
          <Input
            type="datetime-local"
            placeholder="End Time"
            value={form.end_time ? form.end_time.slice(0, 16) : ""}
            onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
          />
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
