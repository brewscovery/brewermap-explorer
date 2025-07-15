-- Drop existing trigger and create a simple test trigger
DROP TRIGGER IF EXISTS venue_hours_notification_trigger ON venue_hours;

-- Create a simple logging trigger first to test if triggers work at all
CREATE OR REPLACE FUNCTION public.test_venue_hours_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RAISE NOTICE 'TEST TRIGGER FIRED! venue_id: %, operation: %, updated_at: %', NEW.venue_id, TG_OP, NEW.updated_at;
  RETURN NEW;
END;
$function$;

-- Create the test trigger
CREATE TRIGGER test_venue_hours_trigger
  AFTER INSERT OR UPDATE ON venue_hours
  FOR EACH ROW
  EXECUTE FUNCTION test_venue_hours_trigger();