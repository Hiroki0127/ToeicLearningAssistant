# TOEIC Learning Assistant

A web application for TOEIC exam preparation with quizzes, flashcards, and an AI assistant that generates practice questions using RAG (Retrieval-Augmented Generation) to ground responses in actual TOEIC content.

Live demo: [https://toeic-learning-assistant-frontend-a.vercel.app/](https://toeic-learning-assistant-frontend-a.vercel.app/)

Note: The frontend is deployed on Vercel. The backend API runs separately on Render for full functionality.

## What it does

The main goal was to build a TOEIC study tool that actually uses AI to help students practice, rather than just generic chatbot responses. The AI assistant uses RAG to retrieve relevant context from official TOEIC questions and flashcards stored in the database, then generates practice questions that match the format and style of the real exam.

Key features:

- AI Assistant with RAG integration - Generates Part 5, 6, and 7 practice questions grounded in real TOEIC content from the database
- Flashcards - Study vocabulary with one-by-one cards or manage them in a list view. Progress syncs across devices
- Quizzes - Sample TOEIC-style quizzes plus ability to create custom quizzes
- Dashboard - Tracks progress, study streaks, accuracy, and a leveling system based on XP from various activities
- Study Sessions - Automatically tracks flashcard study sessions with correct/incorrect counts

The app doesn't use local storage - everything is saved to the database so users can access their progress from any device.

## Tech Stack

Frontend:
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- React hooks for state management

Backend:
- Express.js with TypeScript
- Prisma ORM with PostgreSQL
- JWT authentication
- Groq API for AI inference
- Custom RAG implementation that searches flashcards, quizzes, and questions from the database

Testing:
- Jest for backend unit and integration tests
- React Testing Library for frontend component tests

Deployment:
- Frontend on Vercel
- Backend on Render
- PostgreSQL database on Render

## Getting Started

You'll need Node.js 18+, PostgreSQL, and a GROQ API key for AI features.

1. Clone the repository:
```bash
git clone https://github.com/yourusername/toeic-learning-assistant.git
cd toeic-learning-assistant
```

2. Install dependencies:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

3. Set up environment variables

Create `backend/.env`:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/toeic_db"
JWT_SECRET="your-jwt-secret-key"
GROQ_API_KEY="your-groq-api-key"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

4. Set up the database:
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. Start the servers:
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory, in a new terminal)
npm run dev
```

The app should be available at http://localhost:3000. The backend API runs on http://localhost:5000.

## Project Structure

```
TOEicLearningAssistant/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── services/        # Business logic (AI, RAG, leveling)
│   │   ├── routes/          # Express routes
│   │   ├── middleware/      # Auth and validation
│   │   └── utils/           # Helpers
│   ├── prisma/              # Schema and migrations
│   └── scripts/             # Database seeding scripts
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # API clients
│   │   └── types/           # TypeScript types
└── docs/                    # Documentation
```

## API Endpoints

Authentication:
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login
- POST /api/auth/logout - Logout

Quizzes:
- GET /api/quiz - Get quizzes (supports ?userOnly=true filter)
- GET /api/quiz/:id - Get specific quiz
- POST /api/quiz - Create quiz
- PUT /api/quiz/:id - Update quiz
- DELETE /api/quiz/:id - Delete quiz
- POST /api/quiz/submit - Submit quiz attempt

Flashcards:
- GET /api/flashcards - Get user's flashcards
- POST /api/flashcards - Create flashcard
- PUT /api/flashcards/:id - Update flashcard
- DELETE /api/flashcards/:id - Delete flashcard

Study Sessions:
- POST /api/study-sessions - Create study session
- GET /api/study-sessions - Get user's study sessions

Dashboard:
- GET /api/dashboard/stats - Get dashboard statistics

AI:
- POST /api/ai/generate-question - Generate TOEIC practice question
- POST /api/ai/explain-vocabulary - Get vocabulary explanation
- POST /api/ai/explain-grammar - Get grammar explanation

## Development

Run TypeScript checks:
```bash
cd backend && npx tsc
cd ../frontend && npx tsc
```

Run tests:
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

Database management:
```bash
cd backend
npx prisma generate        # Generate Prisma client
npx prisma migrate dev     # Create and apply migrations
npx prisma db seed         # Seed database with sample data
npx prisma studio          # Open database GUI
```

## How RAG Works

The RAG (Retrieval-Augmented Generation) system enhances AI responses by:

1. Loading flashcards, quizzes, and questions from the database on startup
2. When a user asks for a practice question or vocabulary explanation, searching through this content to find relevant examples
3. Building a context string from the retrieved items
4. Passing this context to the Groq API along with a TOEIC-specific prompt
5. The AI generates responses grounded in actual TOEIC patterns and vocabulary from the database

This ensures the AI doesn't just generate generic English questions, but creates questions that match the format, vocabulary, and style of official TOEIC exams.

## Deployment

The backend is deployed on Render with automatic deploys from the main branch. The frontend is on Vercel with similar auto-deploy setup. Environment variables are configured in each platform's dashboard.

Database migrations run automatically on Render during deployment. Make sure to run `prisma generate` and `prisma migrate deploy` in production.

## Testing

The project includes Jest tests for the backend (service layer, controllers) and React Testing Library tests for frontend components. Test files are excluded from the main TypeScript build using `tsconfig.test.json` for test-specific compilation.

## License

MIT License
