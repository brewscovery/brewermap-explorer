-- Create a simple test trigger that fires on ANY update to venue_hours  
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

-- Drop existing trigger temporarily and create test trigger
DROP TRIGGER IF EXISTS venue_hours_notification_trigger ON venue_hours;
CREATE TRIGGER test_venue_hours_trigger
  AFTER INSERT OR UPDATE ON venue_hours
  FOR EACH ROW
  EXECUTE FUNCTION test_venue_hours_trigger();