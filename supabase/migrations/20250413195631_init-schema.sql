-- Users table
create table users (
  id uuid primary key default gen_random_uuid(),
  pen_name text,
  email text,
  streak_count int default 0,
  last_practice_date date,
  created_at timestamp default now()
);

-- Books table
create table books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text,
  author text,
  cover_url text,
  open_library_id text,
  added_at timestamp default now(),
  understanding_score float,
  application_score float,
  clarity_score float,
  overall_score float
);

-- Insights table
create table insights (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade,
  concept_title text,
  concept_text text,
  chapter_name text,
  source_reference text,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  type text check (type in ('concept', 'framework', 'quote')),
  tags text[]
);

-- PracticeSessions table
create table practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  book_id uuid references books(id) on delete cascade,
  insight_id uuid references insights(id) on delete cascade,
  submitted_at timestamp default now(),
  response_text text,
  llm_feedback jsonb,
  eval_score float,
  user_feedback_score int,
  auto_difficulty_next text check (auto_difficulty_next in ('easier', 'same', 'harder'))
);
