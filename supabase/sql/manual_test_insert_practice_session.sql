-- Test script for practice_sessions row-level security
-- If this statement fails with RLS error, create or fix the 'Users can insert their own sessions' policy (`auth.uid() = user_id`).

-- Replace the UUIDs & JSON with real values before you run this
insert into practice_sessions (
  id, user_id, book_id, insight_id,
  submitted_at, response_text, eval_score, llm_feedback
) values (
  gen_random_uuid(), 'REPLACE-USER-UUID', 'REPLACE-BOOK-UUID',
  'REPLACE-INSIGHT-UUID', now(),
  'Test response text',
  0.6,
  '{"debug":"manual insert"}'::jsonb
); 