-- Let's test the trigger by manually updating venue hours
-- First, let's see if we have venue hours for the venue in question
SELECT id, venue_id, day_of_week, venue_open_time, venue_close_time 
FROM venue_hours 
WHERE venue_id = '103c30c7-87fa-4373-9094-75c47ab21a45'
LIMIT 5;