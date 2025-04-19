# 🧪 Testing Guide

## Overview

Deepread uses a comprehensive testing strategy across all layers of the application:
- Unit Tests
- Integration Tests
- End-to-End Tests
- LLM Response Tests
- Performance Tests

## Test Structure

```
apps/mobile/
├── __tests__/
│   ├── components/
│   ├── screens/
│   └── utils/
└── e2e/

deepread-backend/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
```

## Running Tests

### Mobile App Tests

```bash
# Run all tests
cd apps/mobile
yarn test

# Run specific test file
yarn test components/BookCard.test.tsx

# Watch mode
yarn test --watch

# Coverage report
yarn test --coverage
```

### Backend Tests

```bash
# Run all tests
cd deepread-backend
npm test

# Run specific test suite
npm test tests/unit/evaluation.test.js

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Writing Tests

### Component Tests

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import BookCard from '../components/BookCard';

describe('BookCard', () => {
  it('renders book details correctly', () => {
    const book = {
      title: 'Test Book',
      author: 'Test Author',
      cover_url: 'https://example.com/cover.jpg'
    };
    
    const { getByText } = render(<BookCard book={book} />);
    expect(getByText('Test Book')).toBeTruthy();
    expect(getByText('Test Author')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <BookCard book={{}} onPress={onPress} />
    );
    
    fireEvent.press(getByTestId('book-card'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### API Tests

```typescript
import request from 'supertest';
import app from '../server';

describe('Books API', () => {
  it('GET /api/books returns user books', async () => {
    const response = await request(app)
      .get('/api/books')
      .set('Authorization', `Bearer ${testToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.books).toBeDefined();
  });
});
```

### LLM Response Tests

```typescript
describe('Evaluation System', () => {
  it('evaluates responses correctly', async () => {
    const response = await evaluateInsight({
      insight_id: 'test-id',
      response_text: 'test response',
      depth_level: 1
    });
    
    expect(response.eval_score).toBeGreaterThanOrEqual(0);
    expect(response.eval_score).toBeLessThanOrEqual(1);
    expect(response.factors).toHaveProperty('accuracy');
  });
});
```

## Test Mocks

### API Mocks

```typescript
// __mocks__/supabase.ts
export const supabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
};
```

### LLM Mocks

```typescript
// __mocks__/openai.ts
export const openai = {
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: 'Mocked LLM response'
          }
        }]
      })
    }
  }
};
```

## E2E Testing

Using Detox for React Native E2E tests:

```typescript
describe('Book Reading Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should add and read a book', async () => {
    await element(by.id('add-book-button')).tap();
    await element(by.id('book-title')).typeText('Test Book');
    await element(by.id('submit-button')).tap();
    
    await expect(element(by.text('Test Book'))).toBeVisible();
  });
});
```

## Performance Testing

```typescript
describe('Performance Tests', () => {
  it('loads book list within 2 seconds', async () => {
    const startTime = Date.now();
    
    await request(app)
      .get('/api/books')
      .set('Authorization', `Bearer ${testToken}`);
    
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(2000);
  });
});
```

## Test Coverage Requirements

- Components: 80% coverage
- Utils: 90% coverage
- API Routes: 85% coverage
- Database Operations: 85% coverage
- LLM Operations: 75% coverage

## Continuous Integration

Tests are run automatically on:
- Pull Requests
- Merges to main
- Release tags

### CI Pipeline

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Dependencies
        run: yarn install
      - name: Run Tests
        run: yarn test
      - name: Upload Coverage
        uses: codecov/codecov-action@v2
```

## Best Practices

1. **Test Organization**
   - Group related tests
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Mock Data**
   - Use factories for test data
   - Keep mocks simple
   - Reset mocks between tests

3. **Async Testing**
   - Always await async operations
   - Use proper error handling
   - Set reasonable timeouts

4. **Coverage**
   - Track coverage trends
   - Focus on critical paths
   - Don't sacrifice quality for coverage

5. **Maintenance**
   - Keep tests up to date
   - Remove obsolete tests
   - Refactor when needed 