# TOEIC Learning Assistant

A full-stack web application for TOEIC exam preparation featuring an AI-powered assistant that generates practice questions using RAG (Retrieval-Augmented Generation) to ground responses in actual TOEIC content from the database.

**Live Demo:** [https://toeic-learning-assistant-frontend-a.vercel.app/](https://toeic-learning-assistant-frontend-a.vercel.app/)

> **Note:** The frontend is deployed on Vercel. The backend API runs separately on Render for full functionality.

## Overview

This project was built to solve a real problem: most TOEIC study apps use generic AI responses that don't match the actual exam format. This application uses RAG to retrieve relevant context from official TOEIC questions and flashcards stored in the database, then generates practice questions that match the format, vocabulary, and style of the real exam.

### Key Features

- **AI Assistant with RAG Integration** - Generates Part 5, 6, and 7 practice questions grounded in real TOEIC content from the database. Maintains full conversation history like ChatGPT with smart token management.
- **Flashcards System** - Study vocabulary with interactive cards, track progress, and automatically generate "Needs Review" sets based on incorrect answers.
- **TOEIC Quizzes** - Sample TOEIC-style quizzes (Part 5, 6, 7) plus ability to create custom quizzes with timed sessions.
- **Progress Dashboard** - Comprehensive tracking including:
  - Study streaks with persistence across day changes
  - XP-based leveling system (beginner → intermediate → advanced → expert)
  - Daily goals with customizable targets
  - Accuracy metrics and study time tracking
  - Cards mastered (unique flashcards marked correct)
- **Study Sessions** - Automatically tracks flashcard and quiz sessions with correct/incorrect counts and duration.
- **User Authentication** - JWT-based auth with "Remember me" (30 days) and password reset functionality.
- **Cross-Device Sync** - All progress saved to database, accessible from any device.

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zustand** for state management with persistence
- **React Testing Library** for component testing

### Backend
- **Express.js** with TypeScript
- **Prisma ORM** with PostgreSQL
- **JWT** authentication with 30-day token expiration
- **Groq API** (llama-3.1-8b-instant) for AI inference
- **Custom RAG Implementation** that searches flashcards, quizzes, and questions from the database
- **Jest** for unit and integration testing

### Deployment
- **Frontend:** Vercel (automatic deploys from main branch)
- **Backend:** Render (automatic deploys from main branch)
- **Database:** PostgreSQL on Supabase

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- GROQ API key (free tier available at [console.groq.com](https://console.groq.com))

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Hiroki0127/ToeicLearningAssistant.git
cd ToeicLearningAssistant
```

2. **Install dependencies:**
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install
```

3. **Set up environment variables**

Create `backend/.env`:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/toeic_db"
JWT_SECRET="your-jwt-secret-key-min-32-chars"
GROQ_API_KEY="your-groq-api-key"
PORT=5000
FRONTEND_URL="http://localhost:3000"
BCRYPT_ROUNDS=12
```

Create `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

4. **Set up the database:**
```bash
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

5. **Start the development servers:**
```bash
# Terminal 1 - Backend (from backend directory)
npm run dev

# Terminal 2 - Frontend (from frontend directory)
npm run dev
```

The app will be available at `http://localhost:3000`. The backend API runs on `http://localhost:5000`.

## Project Structure

```
ToeicLearningAssistant/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── services/        # Business logic (AI, RAG, leveling)
│   │   ├── routes/          # Express route definitions
│   │   ├── middleware/      # Auth and validation middleware
│   │   ├── utils/           # Helper functions
│   │   └── __tests__/       # Backend test suite
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── migrations/      # Database migrations
│   │   └── seed.ts          # Database seeding script
│   └── scripts/             # Utility scripts
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages (App Router)
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API clients and utilities
│   │   ├── types/           # TypeScript type definitions
│   │   └── __tests__/       # Frontend test suite
│   └── public/              # Static assets
└── docs/
    ├── API.md               # API documentation
    └── screenshots/         # Project screenshots
```

## API Documentation

Comprehensive API documentation with request/response examples is available in [docs/API.md](docs/API.md).

The API provides endpoints for:
- **Authentication** - Register, login, profile management, password reset
- **Quizzes** - CRUD operations, quiz attempts, history tracking
- **Flashcards** - CRUD operations, review tracking, "Needs Review" sets
- **Study Sessions** - Session creation, duration tracking, statistics
- **Dashboard** - Statistics, progress tracking, leveling system
- **AI Services** - Question generation, vocabulary/grammar explanations with RAG, general chat
- **Notifications** - User notifications (backend only, not exposed in frontend UI)
- **Knowledge Graph** - Vocabulary relationship queries (backend only, not exposed in frontend UI)
- **Smart Recommendations** - Personalized flashcard recommendations (backend only, not exposed in frontend UI)

## How RAG Works

The RAG (Retrieval-Augmented Generation) system enhances AI responses by grounding them in actual TOEIC content:

1. **Initialization** - On server startup, loads all flashcards, quizzes, and questions from the database into memory
2. **Query Processing** - When a user requests a practice question or vocabulary explanation:
   - Searches through the loaded content to find relevant examples
   - Filters by TOEIC part type (Part 5, 6, or 7) when applicable
   - Selects the most relevant flashcards and questions
3. **Context Building** - Constructs a context string from retrieved items including:
   - Relevant vocabulary with definitions
   - Sample questions matching the requested format
   - Business context examples
4. **AI Generation** - Passes the context to Groq API along with TOEIC-specific prompts that enforce:
   - Correct question format (4 questions for Part 6, proper numbering)
   - Realistic business document templates
   - Appropriate difficulty levels
5. **Response** - Returns AI-generated content that matches official TOEIC patterns

This ensures the AI generates questions that match the actual exam format, vocabulary, and style rather than generic English questions.

## Testing

The project includes comprehensive test coverage with proper mocking to prevent real API calls and database connections during testing.

### Test Results

- **Backend:** 49/49 tests passing (100%)
- **Frontend:** 19/25 tests passing (76%)
- **Overall:** 68/74 tests passing (88%)

### Test Structure

**Backend Tests:**
- Unit tests for services (AI, RAG, leveling calculations)
- Integration tests for controllers (auth, dashboard, flashcards)
- Proper mocking of Prisma, Groq API, and external dependencies

**Frontend Tests:**
- Component tests using React Testing Library
- Hook tests for custom React hooks
- Proper mocking of Zustand store, API calls, and Next.js router

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Watch mode
cd backend && npm test -- --watch
cd frontend && npm test -- --watch
```

## Development

### TypeScript Checks

```bash
cd backend && npx tsc --noEmit
cd ../frontend && npx tsc --noEmit
```

### Database Management

```bash
cd backend
npx prisma generate        # Generate Prisma client
npx prisma migrate dev     # Create and apply migrations
npx prisma db seed         # Seed database with sample data
npx prisma studio          # Open database GUI
```

### Code Quality

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Jest for testing with proper mocking strategies

## Deployment

### Backend (Render)

1. Connect GitHub repository to Render
2. Set environment variables in Render dashboard
3. Enable auto-deploy from main branch
4. Database migrations run automatically on deployment

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Enable auto-deploy from main branch

### Environment Variables

**Backend (Render):**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `GROQ_API_KEY` - API key from Groq console
- `FRONTEND_URL` - Frontend deployment URL
- `BCRYPT_ROUNDS` - Password hashing rounds (default: 12)

**Frontend (Vercel):**
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Challenges & Solutions

### Challenge 1: RAG Implementation
**Problem:** Ensuring AI-generated questions match actual TOEIC format and style.

**Solution:** Implemented a custom RAG system that retrieves relevant context from the database and uses structured prompts that enforce correct formatting (e.g., Part 6 must have 4 questions numbered 1-4, realistic business documents).

### Challenge 2: Test Mocking
**Problem:** Tests were making real API calls and database connections, causing failures and costs.

**Solution:** Implemented comprehensive mocking:
- Prisma client mocking with proper hoisting
- Groq SDK mocking to prevent real API calls
- Zustand store mocking for frontend tests
- All external dependencies properly isolated

### Challenge 3: Leveling System
**Problem:** Creating a fair XP-based leveling system that rewards various study activities.

**Solution:** Designed a multi-factor XP system:
- Flashcards studied: 10 XP per card
- Correct answers: 5 XP each
- Quiz attempts: 50 XP base + score-based bonus
- Study streaks: 20 XP per day
- Study time: 1 XP per minute

### Challenge 4: Study Session Tracking
**Problem:** Accurately tracking study time and preventing inflated totals from bad data.

**Solution:** 
- Track actual start/end times for sessions
- Filter out invalid durations (zero or negative) in calculations
- Provide scripts to analyze and fix historical data

### Challenge 5: Conversation History
**Problem:** Maintaining full conversation context like ChatGPT while staying within token limits.

**Solution:** Implemented token-aware trimming:
- Estimate tokens (~4 chars per token)
- Keep system prompt and most recent 20 messages
- Trim oldest messages if approaching limit
- Maintains context while preventing token overflow

## Backend-Only Features

The following features are implemented in the backend API but not yet exposed in the frontend UI:

- **Notifications System** - Backend endpoints exist for creating, retrieving, and managing user notifications (reminders, achievements, streaks, system messages)
- **Knowledge Graph** - Backend service for querying vocabulary relationships, learning paths, and related concepts
- **Smart Recommendations** - Backend service for generating personalized flashcard recommendations based on weak areas, spaced repetition, and knowledge graph connections

These can be integrated into the frontend in future updates.

## Future Enhancements

Potential improvements for future development:
- Frontend integration for notifications, knowledge graph, and smart recommendations
- Knowledge graph visualization for vocabulary relationships
- Listening practice (Part 1-4)
- Spaced repetition algorithm for flashcards
- Social features (leaderboards, study groups)
- Mobile app (React Native)

## License

MIT License

## Contact

For questions or contributions, please open an issue on GitHub.
