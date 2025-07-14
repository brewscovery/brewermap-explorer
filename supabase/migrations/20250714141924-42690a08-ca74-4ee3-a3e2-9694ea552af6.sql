-- Drop the test trigger and restore the original notification trigger
DROP TRIGGER IF EXISTS test_venue_hours_trigger ON venue_hours;

-- Recreate the notification trigger with even more basic logging
CREATE OR REPLACE FUNCTION public.notify_venue_hours_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Force a log entry by inserting into a simple log table first
  RAISE LOG 'VENUE HOURS TRIGGER STARTING: venue_id=%, operation=%', NEW.venue_id, TG_OP;
  
  -- Always return NEW to ensure trigger completes
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'VENUE HOURS TRIGGER ERROR: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create the trigger
CREATE TRIGGER venue_hours_notification_trigger
  AFTER INSERT OR UPDATE ON venue_hours
  FOR EACH ROW
  EXECUTE FUNCTION notify_venue_hours_update();