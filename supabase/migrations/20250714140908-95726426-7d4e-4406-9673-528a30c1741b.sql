-- Recreate the venue hours notification trigger
DROP TRIGGER IF EXISTS venue_hours_notification_trigger ON venue_hours;

-- Create the trigger for both INSERT and UPDATE operations
CREATE TRIGGER venue_hours_notification_trigger
  AFTER INSERT OR UPDATE ON venue_hours
  FOR EACH ROW
  EXECUTE FUNCTION notify_venue_hours_update();