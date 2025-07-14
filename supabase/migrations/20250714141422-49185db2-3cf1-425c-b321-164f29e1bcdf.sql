-- Update the venue hours notification function with better error handling and logging
CREATE OR REPLACE FUNCTION public.notify_venue_hours_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  service_role_key TEXT;
  http_response RECORD;
BEGIN
  RAISE NOTICE 'Venue hours trigger started for venue_id: %, operation: %', NEW.venue_id, TG_OP;
  
  -- Fire on INSERT or UPDATE operations with actual changes
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (
    OLD.venue_open_time IS DISTINCT FROM NEW.venue_open_time OR
    OLD.venue_close_time IS DISTINCT FROM NEW.venue_close_time OR
    OLD.kitchen_open_time IS DISTINCT FROM NEW.kitchen_open_time OR
    OLD.kitchen_close_time IS DISTINCT FROM NEW.kitchen_close_time OR
    OLD.is_closed IS DISTINCT FROM NEW.is_closed
  )) THEN
    
    RAISE NOTICE 'Venue hours trigger fired for venue_id: %, operation: %', NEW.venue_id, TG_OP;
    
    -- Get the service role key
    BEGIN
      SELECT public.get_service_role_key() INTO service_role_key;
      RAISE NOTICE 'Service role key retrieved: %', (service_role_key IS NOT NULL);
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error getting service role key: %', SQLERRM;
        service_role_key := NULL;
    END;
    
    IF service_role_key IS NOT NULL THEN
      BEGIN
        RAISE NOTICE 'Making HTTP call to notification service...';
        SELECT * INTO http_response FROM net.http_post(
          url := 'https://hvpylervaaklqwiafuag.supabase.co/functions/v1/create-notifications',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_role_key
          ),
          body := jsonb_build_object(
            'type', 'venue_hours_update',
            'venue_id', NEW.venue_id::text,
            'day_of_week', NEW.day_of_week,
            'operation', TG_OP,
            'old_data', CASE 
              WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
                'venue_open_time', OLD.venue_open_time,
                'venue_close_time', OLD.venue_close_time,
                'kitchen_open_time', OLD.kitchen_open_time,
                'kitchen_close_time', OLD.kitchen_close_time,
                'is_closed', OLD.is_closed
              )
              ELSE NULL
            END,
            'new_data', jsonb_build_object(
              'venue_open_time', NEW.venue_open_time,
              'venue_close_time', NEW.venue_close_time,
              'kitchen_open_time', NEW.kitchen_open_time,
              'kitchen_close_time', NEW.kitchen_close_time,
              'is_closed', NEW.is_closed
            )
          )
        );
        
        RAISE NOTICE 'HTTP response status: %, content: %', http_response.status, http_response.content;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Error making HTTP call: %', SQLERRM;
      END;
    ELSE
      RAISE NOTICE 'No service role key found';
    END IF;
  ELSE
    RAISE NOTICE 'Venue hours trigger skipped - no significant changes detected';
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in notify_venue_hours_update: %', SQLERRM;
    RETURN NEW;
END;
$function$;