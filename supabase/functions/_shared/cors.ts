
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Set the service role key for database triggers
// This needs to be set at the database level for the triggers to work
export const setServiceRoleKey = async () => {
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (serviceRoleKey) {
    // This would typically be set at the database session level
    // The triggers will use this to authenticate with the edge function
    console.log('Service role key is available for triggers');
  }
};
