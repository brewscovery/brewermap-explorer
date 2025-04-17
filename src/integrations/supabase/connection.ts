
import { supabase } from './client';

// Function to refresh Supabase connection on window focus
export const refreshSupabaseConnection = async () => {
  try {
    console.log('Refreshing Supabase connection');
    
    // First check the auth session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('Error checking session during refresh:', error);
      return;
    }
    
    if (data.session) {
      console.log('Session exists, refreshing connection');
      try {
        // Force Supabase to reestablish connection
        await supabase.realtime.disconnect();
        await new Promise(resolve => setTimeout(resolve, 300)); // Small delay
        await supabase.realtime.connect();
        console.log('Supabase connection refreshed');
      } catch (connError) {
        console.error('Error refreshing realtime connection:', connError);
      }
    } else {
      console.log('No session found');
    }
  } catch (error) {
    console.error('Error refreshing Supabase connection:', error);
  }
};
