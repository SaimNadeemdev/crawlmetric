import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client with hardcoded credentials for client-side use
const supabaseUrl = 'https://nzxgnnpthtefahosnolm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eGdubnB0aHRlZmFob3Nub2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg1MTUwMzYsImV4cCI6MjAxNDA5MTAzNn0.YjQ-9RFI1S9MUS-7rRxNCN5hhkGY4Bq2nNOmgWrFUEE';

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseKey);
};
