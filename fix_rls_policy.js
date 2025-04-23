const { createClient } = require('@supabase/supabase-js');

// These are the values from src/lib/supabaseClient.ts
const SUPABASE_URL = 'https://yenztfeqvzcayniypnlk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllbnp0ZmVxdnpjYXluaXlwbmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzMwMDMsImV4cCI6MjA2MDE0OTAwM30.3E38o0s0gSAzGvoivZMqc1yVO4Y0v8jcvJvZXuQpCSs';

// In a real application, you would need to use Service Role key for this type of operation
// For testing, we'll try to use the anon key to diagnose the issue
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Main testing function
async function testPracticeSessionInsert() {
  console.log('Testing practice_sessions insert...');
  
  // First create a test insert
  const testRow = {
    user_id: 'test-user-id', // You'll need a real user ID
    book_id: 'test-book-id', // You'll need a real book ID 
    insight_id: 'test-insight-id', // You'll need a real insight ID
    response_text: 'This is a test response',
    llm_feedback: { test: 'feedback' },
    eval_score: 0.8,
    submitted_at: new Date().toISOString()
  };
  
  console.log('Attempting to insert test row...');
  const { data: insertData, error: insertError } = await supabase
    .from('practice_sessions')
    .insert(testRow)
    .select();
  
  if (insertError) {
    console.error('Insert error:', insertError);
    
    // If this is a permissions error, and we're logged in, try to diagnose if it's RLS
    if (insertError.code === 'PGRST301' || 
        insertError.message?.includes('permission denied')) {
      console.log('This appears to be an RLS (Row Level Security) issue.');
      console.log('To fix this, go to the Supabase dashboard:');
      console.log('1. Navigate to: https://app.supabase.com/project/yenztfeqvzcayniypnlk/auth/policies');
      console.log('2. Select the "practice_sessions" table');
      console.log('3. Create a new RLS policy with:');
      console.log(`   CREATE POLICY "Allow insert for own user_id" ON practice_sessions FOR INSERT USING (auth.uid() = user_id);`);
    }
  } else {
    console.log('Insert successful:', insertData);
  }
}

// Run the test
testPracticeSessionInsert().catch(console.error);

// Supabase Practice Sessions RLS Diagnostics
// -------------------------------------------

console.log('Supabase Practice Sessions RLS Diagnostics');
console.log('-------------------------------------------');
console.log('');
console.log('ISSUE:');
console.log('The console shows that insertPracticeSession() function is being called with valid payloads');
console.log('But the rows do not appear in the practice_sessions table in Supabase.');
console.log('');
console.log('DIAGNOSIS:');
console.log('The symptoms indicate a Row Level Security (RLS) issue with the practice_sessions table.');
console.log('When RLS is enabled on a table but no policies exist that allow the operation,');
console.log('the operation silently fails without returning an error by default.');
console.log('');
console.log('The code already logs payload correctly, but there are no rows being saved.');
console.log('The modified insertPracticeSession() function now correctly logs any errors that occur,');
console.log('which will help verify if the issue is related to RLS.');
console.log('');
console.log('SOLUTION:');
console.log('1. Log in to the Supabase dashboard: https://app.supabase.com');
console.log('2. Select your project (yenztfeqvzcayniypnlk)');
console.log('3. Go to "Authentication" -> "Policies" in the left sidebar'); 
console.log('4. Find the "practice_sessions" table and check if RLS is enabled');
console.log('5. If RLS is enabled but no insert policy exists, add this policy:');
console.log('');
console.log('   CREATE POLICY "Allow insert for own user_id"');
console.log('   ON practice_sessions');
console.log('   FOR INSERT');
console.log('   USING (auth.uid() = user_id);');
console.log('');
console.log('6. After adding the policy, your insertPracticeSession function should work.');
console.log('');
console.log('NOTE:');
console.log('The function has been updated to properly handle and log errors in src/lib/practiceSessions.ts');
console.log('If, after adding the RLS policy, you continue to see issues, check the error logs');
console.log('which should now provide more details about what might be going wrong.'); 