-- Check the current structure of venue_hours table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'venue_hours' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any unique constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE' 
    AND tc.table_name='venue_hours' 
    AND tc.table_schema = 'public';