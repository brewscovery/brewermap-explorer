
-- Create RLS policies for venue_favorites table

-- Allow anyone to read venue favorites (for displaying counts)
CREATE POLICY "Anyone can view venue favorites" ON public.venue_favorites
FOR SELECT 
TO public
USING (true);

-- Allow authenticated users to insert their own favorites
CREATE POLICY "Users can create their own venue favorites" ON public.venue_favorites
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own favorites
CREATE POLICY "Users can delete their own venue favorites" ON public.venue_favorites
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Allow venue owners to view favorites for their venues
CREATE POLICY "Venue owners can view favorites for their venues" ON public.venue_favorites
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM venues v
    JOIN brewery_owners bo ON v.brewery_id = bo.brewery_id
    WHERE v.id = venue_favorites.venue_id 
    AND bo.user_id = auth.uid()
  )
);
