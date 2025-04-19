| Layer               | Tool/API                                |
| ------------------- | --------------------------------------- |
| Frontend            | React Native (Expo)                     |
| UI Lib              | Tamagui                                 |
| State Mgmt          | Zustand                                 |
| Backend/Auth        | Supabase                                |
| Book Search         | Open Library API                        |
| Voice Input         | Expo Speech / React Native Voice        |
| Deployment          | Expo EAS                                |
| Practice Engine | OpenAI API (GPT-3.5 or GPT-4 Turbo) |

## API Endpoints

1. `/extract-concepts` - Extracts key concepts from a book
2. `/assign-depth-targets` - Assigns depth targets to concepts
3. `/generate-questions` - Generates practice questions for a concept and depth level

## Features In Progress

- Response caching for generated questions
- Persisting user answers
- Retrieving related concepts for better question context
- User authentication for saving progress
- Spaced repetition scheduling for practice
- Analytics dashboard for tracking learning progress
