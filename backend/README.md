# TOEIC Learning Assistant - Backend API

Express.js backend API for the TOEIC Learning Assistant with TypeScript, Prisma ORM, and JWT authentication.

## 🚀 Features

- **Authentication**: JWT-based user authentication and authorization
- **Flashcards**: CRUD operations for vocabulary flashcards
- **Progress Tracking**: User study progress and statistics
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Request validation with Zod
- **Security**: Helmet, CORS, and input sanitization
- **TypeScript**: Full type safety and IntelliSense

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt
- **Validation**: Zod schemas
- **Security**: Helmet, CORS
- **Logging**: Morgan

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Update `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/toeic_learning_assistant"

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with sample data
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### GET `/api/auth/profile`
Get user profile (requires authentication).

#### PUT `/api/auth/profile`
Update user profile (requires authentication).

#### PUT `/api/auth/change-password`
Change user password (requires authentication).

### Flashcard Endpoints

#### GET `/api/flashcards`
Get all flashcards with pagination and filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `category`: Filter by category
- `difficulty`: Filter by difficulty
- `sortBy`: Sort field (createdAt, updatedAt, word, difficulty)
- `sortOrder`: Sort order (asc, desc)

#### GET `/api/flashcards/:id`
Get a specific flashcard by ID.

#### POST `/api/flashcards`
Create a new flashcard (requires authentication).

**Request Body:**
```json
{
  "word": "procurement",
  "definition": "The process of obtaining goods or services",
  "example": "The procurement department handles all vendor contracts.",
  "partOfSpeech": "noun",
  "difficulty": "hard",
  "category": "business",
  "tags": ["business", "purchasing", "management"]
}
```

#### PUT `/api/flashcards/:id`
Update a flashcard (requires authentication).

#### DELETE `/api/flashcards/:id`
Delete a flashcard (requires authentication).

#### POST `/api/flashcards/review`
Record a flashcard review (requires authentication).

**Request Body:**
```json
{
  "flashcardId": "flashcard-id",
  "isCorrect": true,
  "responseTime": 2500
}
```

#### GET `/api/flashcards/user/me`
Get user's flashcards (requires authentication).

## 🔧 Development

### Project Structure

```
src/
├── controllers/     # Route controllers
├── routes/          # API routes
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── types/           # TypeScript types
└── index.ts         # Main application file
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server

# Database
npx prisma generate  # Generate Prisma client
npx prisma migrate   # Run database migrations
npx prisma studio    # Open Prisma Studio

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |

### Database Schema

The application uses Prisma with the following main models:

- **User**: User accounts and preferences
- **Flashcard**: Vocabulary cards with metadata
- **FlashcardReview**: User review history
- **Quiz**: Quiz definitions and questions
- **QuizAttempt**: User quiz attempts
- **UserProgress**: User study progress
- **DailyProgress**: Daily study statistics
- **StudySession**: Study session tracking
- **Notification**: User notifications

## 🔒 Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Input Validation**: Zod schema validation
- **CORS Protection**: Configurable cross-origin requests
- **Security Headers**: Helmet middleware
- **Rate Limiting**: Built-in rate limiting (configurable)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Production Build

```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production

Make sure to set these environment variables in production:

- `NODE_ENV=production`
- `DATABASE_URL` (production database)
- `JWT_SECRET` (strong secret)
- `FRONTEND_URL` (production frontend URL)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 📄 License

MIT License
