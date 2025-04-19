# 🛠️ Technology Stack

## Core Technologies

| Layer               | Tool/API                                | Version    | Status      |
| ------------------- | --------------------------------------- | ---------- | ----------- |
| Frontend            | React Native (Expo)                     | 52.0.46    | ✅ Active   |
| UI Framework        | Tamagui                                 | 1.126.1    | ✅ Active   |
| State Mgmt          | Zustand                                 | Latest     | 🚧 Pending  |
| Backend/Auth        | Supabase                                | 2.49.4     | ✅ Active   |
| Book Search         | Open Library API                        | -          | ✅ Active   |
| Voice Input         | Expo Speech / React Native Voice        | Latest     | ✅ Active   |
| Deployment          | Expo EAS                                | Latest     | ✅ Active   |
| Practice Engine     | OpenAI API (GPT-3.5 or GPT-4 Turbo)    | Latest     | ✅ Active   |

## Development Tools

| Tool               | Purpose                    | Version   |
|--------------------|----------------------------|-----------|
| TypeScript         | Type Safety                | 5.1.3     |
| ESLint            | Code Linting               | 8.45.0    |
| Prettier          | Code Formatting            | 3.0.0     |
| Jest              | Testing                    | 29.2.1    |
| React Native Testing Library | Component Testing| 12.1.2    |

## Key Dependencies

### Frontend (React Native)
```json
{
  "expo": "~49.0.0",
  "react": "18.2.0",
  "react-native": "0.72.3",
  "tamagui": "^1.74.8",
  "native-base": "^3.4.0",
  "zustand": "^4.4.1",
  "@react-navigation/native": "^6.1.7",
  "@react-navigation/native-stack": "^6.9.13",
  "expo-speech": "~11.3.0",
  "@react-native-voice/voice": "^3.2.4"
}
```

### Backend (Node.js)
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "express": "^4.18.2",
  "openai": "^4.0.0",
  "node-fetch": "^2.6.7",
  "dotenv": "^16.0.3"
}
```

## API Integrations

### OpenAI API
- Models: GPT-3.5-turbo, GPT-4
- Used for: Insight generation, question generation, response evaluation
- Rate limits: Configured per endpoint

### Open Library API
- Endpoints: `/search`, `/books`, `/authors`
- Used for: Book metadata, cover images
- Rate limits: 100 requests/minute

### Supabase
- Services: Auth, Database, Edge Functions
- Database: PostgreSQL
- Real-time subscriptions: Enabled for practice sessions

## Development Environment

### Required Tools
- Node.js ≥ 18.0.0
- Yarn ≥ 1.22.0
- Expo CLI
- Supabase CLI
- iOS Simulator / Android Emulator

### Environment Variables
```bash
# Supabase
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# OpenAI
OPENAI_API_KEY=your_api_key

# Open Library
OPEN_LIBRARY_API_URL=https://openlibrary.org/api/
```

## Performance Considerations

- LLM API calls are cached
- Image assets are optimized
- Database queries are indexed
- API responses are compressed

## Security Measures

- Environment variables are secured
- API keys are rotated regularly
- User data is encrypted
- Auth tokens expire in 24h 

## API Endpoints

1. `/auth/magic-link` - Sends magic link email
2. `/auth/verify` - Verifies magic link token
3. `/books` - CRUD operations for books
4. `/insights` - CRUD operations for insights
5. `/practice` - Records practice sessions
6. `/extract-concepts` - Extracts key concepts from a book
7. `/assign-depth-targets` - Assigns depth targets to concepts
8. `/generate-questions` - Generates practice questions

## Features In Progress

- User authentication with magic links
- Offline data persistence
- Cross-device sync
- Response caching for generated questions
- Persisting user answers
- Retrieving related concepts
- Spaced repetition scheduling
- Analytics dashboard 