import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://emhyyzqavqijgumbnpzo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtaHl5enFhdnFpamd1bWJucHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTM2OTUsImV4cCI6MjA1ODU4OTY5NX0.FwrMjA5E-LQWru3mwGfb1BtfcCu9m_25EgsZzSniv0Y';

// Create Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

// Define types for Supabase tables
export interface RecentSearch {
  id: number;
  query: string;
  timestamp: string;
  user_id?: string;
}

// Helper function to store a search query
export async function storeSearchQuery(query: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('recent_searches')
      .insert([
        { 
          query, 
          timestamp: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error storing search query:', error);
    }
  } catch (error) {
    console.error('Failed to store search query:', error);
  }
}

// Helper function to get recent searches
export async function getRecentSearches(limit: number = 6): Promise<RecentSearch[]> {
  try {
    const { data, error } = await supabase
      .from('recent_searches')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent searches:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch recent searches:', error);
    return [];
  }
} 