# 🏗️ Deepread Architecture

## System Overview

Deepread is built as a modern mobile-first application with a scalable backend:

| Layer          | Technology                           | Status        |
|----------------|--------------------------------------|---------------|
| Frontend       | React Native (Expo)                  | ✅ Active     |
| UI Framework   | Tamagui / NativeBase                 | ✅ Active     |
| State Mgmt     | Zustand                              | ✅ Active     |
| Backend + Auth | Supabase                             | ✅ Active     |
| Voice Input    | Expo Speech / React Native Voice     | 🚧 In Progress|
| Book Data      | Open Library API                     | ✅ Active     |
| LLM Engine     | OpenAI (GPT-3.5/4)                  | ✅ Active     |
| Deployment     | Expo EAS                             | 🚧 In Progress|

## Database Schema

### Users

| Field                | Type      | Description                           |
|---------------------|-----------|---------------------------------------|
| `id`                | UUID      | Primary key                           |
| `pen_name`          | string    | User-facing identity                  |
| `email`             | string    | Optional                              |
| `streak_count`      | int       | Consecutive daily practice            |
| `last_practice_date`| date      | For streak tracking                   |
| `created_at`        | timestamp | Account creation                      |

### Books

| Field                 | Type      | Description                          |
|----------------------|-----------|--------------------------------------|
| `id`                 | UUID      | Primary key                          |
| `user_id`            | UUID      | FK to Users                          |
| `title`              | string    | Book title                           |
| `author`             | string    | Book author                          |
| `cover_url`          | string    | From Open Library API                |
| `open_library_id`    | string    | Optional identifier                  |
| `added_at`           | timestamp | When user added the book             |
| `understanding_score`| float     | Avg score from LLM feedback (0-1)    |
| `application_score`  | float     | Practice application score (0-1)     |
| `clarity_score`      | float     | Expression clarity score (0-1)       |
| `overall_score`      | float     | Weighted combined score (0-1)        |

### Insights

| Field              | Type    | Description                           |
|-------------------|---------|---------------------------------------|
| `id`              | UUID    | Primary key                           |
| `book_id`         | UUID    | FK to Books                           |
| `concept_title`   | string  | Short label/name                      |
| `concept_text`    | text    | Full idea or quote                    |
| `chapter_name`    | string  | Optional grouping                     |
| `source_reference`| string  | Page/section reference                |
| `difficulty`      | enum    | easy, medium, hard                    |
| `type`            | enum    | concept, framework, quote             |
| `tags`            | array   | For clustering/search                 |

### PracticeSessions

| Field                | Type     | Description                          |
|---------------------|----------|--------------------------------------|
| `id`                | UUID     | Primary key                          |
| `user_id`           | UUID     | FK to Users                          |
| `book_id`           | UUID     | FK to Books                          |
| `insight_id`        | UUID     | FK to Insights                       |
| `submitted_at`      | datetime | Session timestamp                    |
| `response_text`     | text     | User's answer                        |
| `llm_feedback`      | JSON     | Structured evaluation                |
| `eval_score`        | float    | Overall score (0-1)                  |
| `user_feedback`     | int      | Optional rating (1-5)                |
| `difficulty_next`   | enum     | easier, same, harder                 |

## API Architecture

### Core Endpoints

1. `/api/books`
   - GET: List user's books
   - POST: Add new book
   - PUT: Update book details

2. `/api/insights`
   - GET: Get insights for a book
   - POST: Add new insight
   - PUT: Update insight

3. `/api/practice`
   - POST: Submit practice response
   - GET: Get practice history

4. `/api/evaluate`
   - POST: Evaluate practice response
   - GET: Get evaluation history

### LLM Integration

The LLM system is integrated at three key points:

1. **Insight Generation**
   - Input: Book/chapter content
   - Output: Key concepts and insights
   - Model: GPT-4 for accuracy

2. **Practice Questions**
   - Input: Insight + depth level
   - Output: Tailored questions
   - Model: GPT-3.5 for speed

3. **Response Evaluation**
   - Input: User response + context
   - Output: Structured feedback
   - Model: GPT-4 for quality

## Security & Performance

- All API routes are authenticated via Supabase
- LLM calls are rate-limited and cached
- Practice responses are stored encrypted
- Evaluation results are cached for 24h 