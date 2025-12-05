import { createClient } from '@supabase/supabase-js';

// Fallback Credentials (Dev / Preview without Env Vars)
const FALLBACK_URL = 'https://npcpijmqwnyahkstnpfd.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wY3Bpam1xd255YWhrc3RucGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzgzODEsImV4cCI6MjA4MDM1NDM4MX0.RDwW7Wlo8_lHVSss73SWbUiyXIs9QJ32wD6TeUVAWEE';

// Use Environment variables from Vite/Vercel if available, otherwise use fallback
const projectUrl = (import.meta as any).env?.VITE_SUPABASE_URL || FALLBACK_URL;
const apiKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

export const supabase = createClient(projectUrl, apiKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});