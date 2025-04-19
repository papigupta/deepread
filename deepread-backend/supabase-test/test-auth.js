const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yenztfeqvzcayniypnlk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllbnp0ZmVxdnpjYXluaXlwbmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzMwMDMsImV4cCI6MjA2MDE0OTAwM30.3E38o0s0gSAzGvoivZMqc1yVO4Y0v8jcvJvZXuQpCSs';

const testEmail = 'prakharranger18@gmail.com'; // replace with your real email

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function signInWithMagicLink() {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: testEmail,
  });

  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Magic link sent!', data);
  }
}

signInWithMagicLink();
