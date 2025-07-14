-- Test the trigger by updating a venue hour record
UPDATE venue_hours 
SET updated_at = now() 
WHERE venue_id = '103c30c7-87fa-4373-9094-75c47ab21a45' 
AND day_of_week = 0 
LIMIT 1;