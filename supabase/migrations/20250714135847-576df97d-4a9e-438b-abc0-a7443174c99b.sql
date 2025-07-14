-- Insert test venue hours if they don't exist
INSERT INTO venue_hours (venue_id, day_of_week, venue_open_time, venue_close_time, is_closed)
VALUES ('103c30c7-87fa-4373-9094-75c47ab21a45', 0, '10:00:00', '22:00:00', false)
ON CONFLICT (venue_id, day_of_week) DO NOTHING;

-- Now try to update them to trigger the notification
UPDATE venue_hours 
SET venue_open_time = '11:00:00'
WHERE venue_id = '103c30c7-87fa-4373-9094-75c47ab21a45' 
AND day_of_week = 0;