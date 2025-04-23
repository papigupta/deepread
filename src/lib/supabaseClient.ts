// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yenztfeqvzcayniypnlk.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllbnp0ZmVxdnpjYXluaXlwbmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzMwMDMsImV4cCI6MjA2MDE0OTAwM30.3E38o0s0gSAzGvoivZMqc1yVO4Y0v8jcvJvZXuQpCSs';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: 'implicit',
      detectSessionInUrl: true,
      autoRefreshToken: true,
      persistSession: true
    }
  }
);

// Debug logs to verify Supabase client health and version
console.log("🔍 Supabase client instance →", supabase);
console.log("🧪 Supabase URL:", SUPABASE_URL);
