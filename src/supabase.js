import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with direct values from .env
const supabaseUrl = 'https://yenztfeqvzcayniypnlk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllbnp0ZmVxdnpjYXluaXlwbmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzMwMDMsImV4cCI6MjA2MDE0OTAwM30.3E38o0s0gSAzGvoivZMqc1yVO4Y0v8jcvJvZXuQpCSs';

console.log("Supabase initialization:");
console.log("- URL defined:", !!supabaseUrl);
console.log("- Key defined:", !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
  // Providing clear error that will show in the logs
  throw new Error("Supabase environment variables are missing. Check your .env file.");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Changed to false since we're manually handling tokens
    },
  }
);

console.log("Supabase client created successfully"); 