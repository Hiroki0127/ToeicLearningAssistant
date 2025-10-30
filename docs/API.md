# API Documentation

Base URL: `https://toeic-learning-assistant-backend.onrender.com/api`

All endpoints return JSON responses. Protected routes require a JWT token in the Authorization header: `Bearer <token>`

## Authentication

### Register

Creates a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt-token"
  }
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number

### Login

Authenticates a user and returns a JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt-token"
  }
}
```

### Get Profile

Returns the authenticated user's profile information.

**Endpoint:** `GET /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Profile

Updates the authenticated user's profile.

**Endpoint:** `PUT /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "preferences": {
    "dailyGoal": 20,
    "difficulty": "intermediate"
  }
}
```

### Change Password

Changes the authenticated user's password.

**Endpoint:** `PUT /auth/change-password`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

## Quizzes

### Get Quizzes

Returns a list of quizzes. Supports optional authentication to filter user-specific quizzes.

**Endpoint:** `GET /quiz?userOnly=true`

**Query Parameters:**
- `userOnly` (optional): If `true`, returns only quizzes created by the authenticated user

**Headers:** `Authorization: Bearer <token>` (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "TOEIC Part 5 Practice",
      "description": "Grammar and vocabulary questions",
      "type": "grammar",
      "difficulty": "medium",
      "timeLimit": 600,
      "questions": [...],
      "createdBy": "uuid"
    }
  ]
}
```

### Get Quiz by ID

Returns a specific quiz by its ID.

**Endpoint:** `GET /quiz/:id`

**Headers:** `Authorization: Bearer <token>`

### Create Quiz

Creates a new quiz.

**Endpoint:** `POST /quiz`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "My Custom Quiz",
  "description": "A quiz I created",
  "type": "vocabulary",
  "difficulty": "easy",
  "timeLimit": 300,
  "questions": [
    {
      "type": "multiple-choice",
      "question": "What does 'allocate' mean?",
      "options": ["To assign", "To delete", "To ignore", "To forget"],
      "correctAnswer": "To assign",
      "explanation": "Allocate means to assign or distribute resources",
      "points": 10
    }
  ]
}
```

### Update Quiz

Updates an existing quiz (must be the creator).

**Endpoint:** `PUT /quiz/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Same as Create Quiz

### Delete Quiz

Deletes a quiz (must be the creator).

**Endpoint:** `DELETE /quiz/:id`

**Headers:** `Authorization: Bearer <token>`

### Submit Quiz Result

Records a quiz attempt and calculates score.

**Endpoint:** `POST /quiz/submit`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quizId": "uuid",
  "score": 85,
  "totalQuestions": 10,
  "correctAnswers": 8,
  "timeSpent": 450,
  "answers": {
    "question-id-1": "A",
    "question-id-2": "B"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "quizId": "uuid",
    "score": 85,
    "completedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Quiz History

Returns the authenticated user's quiz attempt history.

**Endpoint:** `GET /quiz/history`

**Headers:** `Authorization: Bearer <token>`

### Get Quiz Stats

Returns statistics about the authenticated user's quiz performance.

**Endpoint:** `GET /quiz/stats`

**Headers:** `Authorization: Bearer <token>`

## Flashcards

### Get Flashcards

Returns a list of flashcards. Public endpoint, but returns user-specific cards if authenticated.

**Endpoint:** `GET /flashcards`

**Headers:** `Authorization: Bearer <token>` (optional)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term
- `difficulty` (optional): Filter by difficulty (easy, medium, hard)

### Get Flashcard by ID

Returns a specific flashcard.

**Endpoint:** `GET /flashcards/:id`

### Create Flashcard

Creates a new flashcard for the authenticated user.

**Endpoint:** `POST /flashcards`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "word": "allocate",
  "definition": "To assign or distribute resources",
  "example": "We need to allocate more budget to marketing",
  "partOfSpeech": "verb",
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "word": "allocate",
    "definition": "To assign or distribute resources",
    "example": "We need to allocate more budget to marketing",
    "partOfSpeech": "verb",
    "difficulty": "medium",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Flashcard

Updates an existing flashcard (must be the owner).

**Endpoint:** `PUT /flashcards/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Same fields as Create Flashcard (all optional)

### Delete Flashcard

Deletes a flashcard (must be the owner).

**Endpoint:** `DELETE /flashcards/:id`

**Headers:** `Authorization: Bearer <token>`

### Get User's Flashcards

Returns all flashcards belonging to the authenticated user.

**Endpoint:** `GET /flashcards/user/me`

**Headers:** `Authorization: Bearer <token>`

### Review Flashcard

Records a flashcard review (correct/incorrect).

**Endpoint:** `POST /flashcards/review`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "flashcardId": "uuid",
  "isCorrect": true,
  "responseTime": 2.5
}
```

## Study Sessions

### Create Study Session

Creates a new study session to track flashcard study progress.

**Endpoint:** `POST /study-sessions`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "flashcard",
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T10:15:00Z",
  "correctCount": 15,
  "incorrectCount": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "flashcard",
    "startTime": "2024-01-01T10:00:00Z",
    "endTime": "2024-01-01T10:15:00Z",
    "correctCount": 15,
    "incorrectCount": 5,
    "createdAt": "2024-01-01T10:15:00Z"
  }
}
```

### Get Study Sessions

Returns the authenticated user's study sessions with pagination.

**Endpoint:** `GET /study-sessions?page=1&limit=10`

**Headers:** `Authorization: Bearer <token>`

### Get Study Session by ID

Returns a specific study session.

**Endpoint:** `GET /study-sessions/:id`

**Headers:** `Authorization: Bearer <token>`

## Dashboard

### Get Dashboard Stats

Returns comprehensive dashboard statistics including progress, level, streaks, and recent activity.

**Endpoint:** `GET /dashboard/stats`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "progress": {
      "totalCards": 150,
      "cardsStudiedToday": 20,
      "currentStreak": 5,
      "accuracy": 85,
      "level": "intermediate",
      "experience": 2500,
      "nextLevel": "advanced",
      "nextLevelXP": 5000,
      "levelProgress": 50
    },
    "dailyGoal": 20,
    "quickStats": {
      "totalFlashcards": 150,
      "quizzesTaken": 12,
      "averageQuizScore": 78
    },
    "recentActivity": [
      {
        "id": "uuid",
        "type": "quiz",
        "title": "TOEIC Part 5 Practice",
        "score": 85,
        "date": "2024-01-01",
        "timeOnly": "10:30 AM"
      },
      {
        "id": "uuid",
        "type": "flashcard",
        "title": "TOEIC Vocabulary Set",
        "correctCount": 15,
        "incorrectCount": 5,
        "date": "2024-01-01",
        "timeOnly": "9:15 AM"
      }
    ]
  }
}
```

## AI Endpoints

### Generate Question

Generates a TOEIC practice question using AI with RAG to ground responses in database content.

**Endpoint:** `POST /ai/generate-question`

**Request Body:**
```json
{
  "topic": "TOEIC Part 6 practice",
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "part": "6",
    "passage": "MEMORANDUM\n\nTO: All Staff...",
    "questions": [
      {
        "number": 1,
        "question": "Fill in the blank...",
        "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
        "correctAnswer": "A"
      }
    ],
    "explanation": "Complete the blanks in the business document above.",
    "questionType": "text completion"
  }
}
```

The AI automatically determines the Part (5, 6, or 7) based on the topic. For Part 6, it generates a business document with 4 questions.

### Explain Vocabulary

Provides a detailed vocabulary explanation using RAG to retrieve relevant context from flashcards.

**Endpoint:** `POST /ai/explain-vocabulary`

**Request Body:**
```json
{
  "word": "allocate"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "word": "allocate",
    "explanation": "Detailed explanation with TOEIC context..."
  }
}
```

### Explain Grammar

Provides grammar explanations for TOEIC grammar questions.

**Endpoint:** `POST /ai/explain-grammar`

**Request Body:**
```json
{
  "question": "The marketing team has been working _____ to launch the product.",
  "userAnswer": "diligently"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "explanation": "Grammar explanation with why 'diligently' is correct..."
  }
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained from the `/auth/login` or `/auth/register` endpoints and should be stored securely on the client side.

