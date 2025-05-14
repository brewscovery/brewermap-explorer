
-- This function will be used to search for cities that have venues
create or replace function search_cities_with_venues(search_term text)
returns table (
  city text,
  state text,
  country text,
  venue_count bigint
) language sql as $$
  SELECT 
    city,
    state,
    country,
    COUNT(id) as venue_count
  FROM 
    venues
  WHERE 
    LOWER(city) LIKE '%' || LOWER(search_term) || '%'
  GROUP BY 
    city, state, country
  ORDER BY 
    venue_count DESC,
    city ASC
  LIMIT 10;
$$;
