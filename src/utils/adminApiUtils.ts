
import { supabase } from '@/integrations/supabase/client';

// Helper function to validate JSON response
export const validateJsonResponse = async (response: Response) => {
  // Check if the response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    console.error('Non-JSON response received:', await response.text());
    throw new Error('Invalid response format from server');
  }
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }
  
  return response.json();
};

// Helper function to get the full Supabase URL for edge functions
export const getSupabaseFunctionUrl = (functionName: string) => {
  return `https://hvpylervaaklqwiafuag.supabase.co/functions/v1/${functionName}`;
};

// Helper function to get authenticated session token
export const getAuthToken = async () => {
  const sessionResult = await supabase.auth.getSession();
  const token = sessionResult.data.session?.access_token;
  
  if (!token) {
    throw new Error('No authenticated session');
  }
  
  return token;
};

// Common function to make authorized API calls to edge functions
export const callEdgeFunction = async (
  functionName: string, 
  payload?: any
) => {
  const token = await getAuthToken();
  
  const response = await fetch(getSupabaseFunctionUrl(functionName), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: payload ? JSON.stringify(payload) : undefined
  });
  
  return validateJsonResponse(response);
};
