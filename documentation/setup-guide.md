# 🚀 Setup Guide

This guide will help you set up the Deepread development environment.

## Prerequisites

Ensure you have the following installed:
- Node.js ≥ 18.0.0
- Yarn ≥ 1.22.0
- Expo CLI (`npm install -g expo-cli`)
- Supabase CLI
- iOS Simulator (Mac only) or Android Emulator

## Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/papigupta/deepread.git
   cd deepread
   ```

2. **Install Dependencies**
   ```bash
   # Install root dependencies
   yarn install

   # Install mobile app dependencies
   cd apps/mobile
   yarn install

   # Install backend dependencies
   cd ../../deepread-backend
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy example env files
   cp .env.example .env
   cd apps/mobile && cp .env.example .env
   cd ../../deepread-backend && cp .env.example .env
   ```

   Configure the following in each `.env` file:
   ```bash
   # Supabase Configuration
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key

   # OpenAI Configuration
   OPENAI_API_KEY=your_api_key

   # Open Library API
   OPEN_LIBRARY_API_URL=https://openlibrary.org/api/
   ```

## Database Setup

1. **Install Supabase CLI**
   ```bash
   brew install supabase/tap/supabase
   ```

2. **Initialize Supabase**
   ```bash
   cd supabase
   supabase init
   ```

3. **Start Local Supabase**
   ```bash
   supabase start
   ```

4. **Apply Migrations**
   ```bash
   supabase db reset
   ```

## Running the Application

1. **Start the Backend Server**
   ```bash
   cd deepread-backend
   npm run dev
   ```

2. **Start the Mobile App**
   ```bash
   cd apps/mobile
   expo start
   ```

   Options:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

## Development Tools

1. **TypeScript Checking**
   ```bash
   # Run TypeScript compiler
   yarn tsc

   # Watch mode
   yarn tsc --watch
   ```

2. **Linting**
   ```bash
   # Run ESLint
   yarn lint

   # Fix auto-fixable issues
   yarn lint --fix
   ```

3. **Testing**
   ```bash
   # Run all tests
   yarn test

   # Watch mode
   yarn test --watch
   ```

## Common Issues & Solutions

### Mobile App

1. **Metro Bundler Issues**
   ```bash
   # Clear Metro cache
   expo start -c
   ```

2. **iOS Simulator Issues**
   ```bash
   # Reset iOS Simulator
   xcrun simctl erase all
   ```

3. **Android Emulator Issues**
   ```bash
   # Clear Android build
   cd android && ./gradlew clean
   ```

### Backend

1. **Database Connection Issues**
   - Check Supabase connection URL
   - Verify database is running (`supabase status`)
   - Reset database if needed (`supabase db reset`)

2. **API Key Issues**
   - Verify all keys in `.env` files
   - Check key permissions in Supabase dashboard
   - Regenerate keys if needed

## Deployment

1. **Backend Deployment**
   - Follow Supabase deployment guide
   - Update production environment variables

2. **Mobile App Deployment**
   ```bash
   # Build for iOS
   eas build --platform ios

   # Build for Android
   eas build --platform android
   ```

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.io/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [OpenAI API Documentation](https://platform.openai.com/docs/) 