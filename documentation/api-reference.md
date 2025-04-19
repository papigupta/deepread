# 📡 API Reference

## Authentication

All API endpoints require authentication using a Supabase JWT token.

```bash
Authorization: Bearer <supabase_jwt_token>
```

## Endpoints

### Books

#### GET /api/books
List user's books with insights and progress.

**Response**
```json
{
  "books": [
    {
      "id": "uuid",
      "title": "string",
      "author": "string",
      "cover_url": "string",
      "understanding_score": "float",
      "insight_count": "integer",
      "practice_count": "integer"
    }
  ]
}
```

#### POST /api/books
Add a new book.

**Request**
```json
{
  "title": "string",
  "author": "string",
  "open_library_id": "string"
}
```

#### PUT /api/books/:id
Update book details.

**Request**
```json
{
  "title": "string",
  "author": "string",
  "understanding_score": "float"
}
```

### Insights

#### GET /api/insights/:bookId
Get insights for a specific book.

**Response**
```json
{
  "insights": [
    {
      "id": "uuid",
      "concept_title": "string",
      "concept_text": "string",
      "chapter_name": "string",
      "difficulty": "enum",
      "type": "enum",
      "tags": "string[]"
    }
  ]
}
```

#### POST /api/insights
Add a new insight.

**Request**
```json
{
  "book_id": "uuid",
  "concept_title": "string",
  "concept_text": "string",
  "chapter_name": "string",
  "difficulty": "enum",
  "type": "enum",
  "tags": "string[]"
}
```

### Practice

#### POST /api/practice/start
Start a practice session.

**Request**
```json
{
  "insight_id": "uuid",
  "depth_level": "integer"
}
```

**Response**
```json
{
  "session_id": "uuid",
  "questions": [
    {
      "id": "uuid",
      "text": "string",
      "type": "string",
      "depth_level": "integer"
    }
  ]
}
```

#### POST /api/practice/submit
Submit practice response.

**Request**
```json
{
  "session_id": "uuid",
  "question_id": "uuid",
  "response_text": "string"
}
```

**Response**
```json
{
  "evaluation": {
    "score": "float",
    "feedback": "string",
    "factors": {
      "accuracy": "float",
      "clarity": "float",
      "understanding": "float",
      "relevance": "float"
    }
  }
}
```

### Evaluation

#### POST /api/evaluate
Evaluate a practice response.

**Request**
```json
{
  "insight_id": "uuid",
  "response_text": "string",
  "depth_level": "integer"
}
```

**Response**
```json
{
  "eval_score": "float",
  "simplified_score": "integer",
  "factors": {
    "accuracy": "float",
    "clarity": "float",
    "understanding": "float",
    "relevance": "float"
  },
  "explanation": "string"
}
```

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object"
  }
}
```

Common error codes:
- `auth/invalid-token`: Invalid or expired JWT
- `validation/invalid-input`: Invalid request parameters
- `not-found`: Resource not found
- `rate-limit`: Too many requests
- `server/error`: Internal server error

## Rate Limits

- Standard endpoints: 100 requests/minute
- LLM-based endpoints: 20 requests/minute
- Book search: 100 requests/minute

## Caching

- Book metadata: 24 hours
- Evaluation results: 24 hours
- Practice questions: 1 hour

## Webhooks

### Practice Session Updates
```json
{
  "type": "practice_session.updated",
  "data": {
    "session_id": "uuid",
    "status": "string",
    "score": "float",
    "timestamp": "string"
  }
}
```

### Book Progress Updates
```json
{
  "type": "book_progress.updated",
  "data": {
    "book_id": "uuid",
    "understanding_score": "float",
    "practice_count": "integer",
    "timestamp": "string"
  }
}
```

## Development Tools

### Testing Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Test authentication
curl -H "Authorization: Bearer $JWT" http://localhost:3000/api/auth/test

# List books
curl -H "Authorization: Bearer $JWT" http://localhost:3000/api/books
```

### Environment Variables
Required for API functionality:
```bash
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_api_key
``` 