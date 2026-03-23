import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = publicAnonKey;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Server API base URL
export const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-c6687586`;

// Helper function to make authenticated requests to the server
export async function serverFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${serverUrl}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseKey}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server request failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Server fetch error:', error);
    throw error;
  }
}

// Test server connection
export async function testServerConnection() {
  try {
    const result = await serverFetch('/health');
    console.log('✅ Server connected:', result);
    return true;
  } catch (error) {
    console.error('❌ Server connection failed:', error);
    return false;
  }
}
