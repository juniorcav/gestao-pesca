
import { createClient } from '@supabase/supabase-js';

// Configuration provided by user
const PROJECT_URL = 'https://vzlbmyvochljfgxnqhpu.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bGJteXZvY2hsamZneG5xaHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3Njg2NTMsImV4cCI6MjA4MDM0NDY1M30.SztR4ki1zYVZj7Bo3j1MUPOTqVApLPh4WfpzL1QFWD8';

// Helper to safely get environment variables
const getEnv = (key: string) => {
    // Check Vite (import.meta.env)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        return import.meta.env[key];
    }
    return undefined;
};

// Try to read from environment variables first (best practice), otherwise use hardcoded values
const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || PROJECT_URL;
const SUPABASE_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper to check if we are using real credentials or placeholders
export const isSupabaseConfigured = () => {
    return (
        SUPABASE_URL && 
        SUPABASE_KEY &&
        SUPABASE_URL.includes('supabase.co') &&
        SUPABASE_KEY.length > 20
    );
};
