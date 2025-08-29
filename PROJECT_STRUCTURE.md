# Project Structure Documentation

## Overview

The TOEIC Learning Assistant is structured as a monorepo with separate frontend and backend applications, plus shared utilities.

## Directory Structure

```
ToeicLearningAssistant/
├── frontend/                 # Next.js React application
│   ├── components/          # Reusable UI components
│   ├── pages/              # Next.js pages and API routes
│   ├── styles/             # CSS and styling files
│   ├── utils/              # Frontend utilities
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── public/             # Static assets
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── tests/              # Backend tests
│   └── config/             # Configuration files
├── shared/                  # Shared code between frontend/backend
│   ├── types/              # Common TypeScript types
│   ├── constants/          # Shared constants
│   └── utils/              # Shared utilities
├── docs/                    # Documentation
├── scripts/                 # Build and deployment scripts
└── database/               # Database migrations and seeds
```

## Architecture Decisions

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS for rapid UI development
- **State Management**: React Context + Zustand for complex state
- **Type Safety**: TypeScript for better development experience
- **UI Components**: Custom components + shadcn/ui for consistency

### Backend (Express.js)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **API**: RESTful API design
- **Validation**: Zod for request validation

### Database Design
- **Users**: Authentication and profile data
- **Flashcards**: Vocabulary cards with metadata
- **Progress**: User study progress and statistics
- **Quizzes**: Generated quizzes and results
- **Knowledge Graph**: Neo4j for concept relationships

### AI Integration
- **RAG Pipeline**: LangChain + OpenAI for dynamic Q&A
- **Vector Database**: FAISS for semantic search
- **Knowledge Graph**: Neo4j for concept relationships
- **Memory System**: Redis for user learning patterns

## Development Workflow

1. **Local Development**: Both frontend and backend run on localhost
2. **API Communication**: Frontend calls backend API endpoints
3. **Database**: Local PostgreSQL instance for development
4. **Environment**: Separate .env files for each service

## Deployment Strategy

- **Frontend**: Vercel for Next.js hosting
- **Backend**: Railway for Node.js hosting
- **Database**: Supabase for PostgreSQL
- **AI Services**: OpenAI API, Pinecone for vectors
- **Monitoring**: Vercel Analytics + custom logging
