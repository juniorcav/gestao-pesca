import { createClient } from '@supabase/supabase-js';

// Credentials provided for the new project
const SUPABASE_URL = 'https://npcpijmqwnyahkstnpfd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wY3Bpam1xd255YWhrc3RucGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzgzODEsImV4cCI6MjA4MDM1NDM4MX0.RDwW7Wlo8_lHVSss73SWbUiyXIs9QJ32wD6TeUVAWEE';

// Helper to get env vars safely in Vite/Vercel environment
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  return undefined;
};

// Use Environment variables if available (Production), otherwise fallback to provided keys (Dev/Preview)
const projectUrl = getEnv('VITE_SUPABASE_URL') || SUPABASE_URL;
const apiKey = getEnv('VITE_SUPABASE_ANON_KEY') || SUPABASE_ANON_KEY;

export const supabase = createClient(projectUrl, apiKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});