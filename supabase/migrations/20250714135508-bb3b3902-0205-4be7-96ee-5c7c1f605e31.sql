-- Check if the trigger exists and test it
SELECT trigger_name, event_manipulation, action_statement, action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'venue_hours_notification_trigger';

-- Let's also check if the function exists
SELECT proname FROM pg_proc WHERE proname = 'notify_venue_hours_update';