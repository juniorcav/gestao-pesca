
import { createClient } from '@supabase/supabase-js';

// Helper to safely get environment variables in both Vite and standard environments
const getEnv = (key: string) => {
    // Check Vite (import.meta.env)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        // @ts-ignore
        return import.meta.env[key];
    }
    
    // Check Process (Legacy/Node)
    try {
        // @ts-ignore
        return process.env[key];
    } catch {
        return undefined;
    }
};

// Configuration provided by user
const PROJECT_URL = 'https://rrikmrmzjwkeaugybaah.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyaWttcm16andrZWF1Z3liYWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDc0NTQsImV4cCI6MjA4MDI4MzQ1NH0.H6g76EaGTY-1tVrDm-r5_tmIglcaYXhWK_R1EiqUUH4';

// Try to read from environment variables first (best practice), otherwise use hardcoded values
const SUPABASE_URL = getEnv('REACT_APP_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL') || PROJECT_URL;
const SUPABASE_KEY = getEnv('REACT_APP_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY') || ANON_KEY;

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