# TOEIC Learning Assistant

A comprehensive web application designed to help users prepare for the TOEIC exam through interactive quizzes, flashcards, and AI-powered learning assistance.

![TOEIC Learning Assistant](https://img.shields.io/badge/TOEIC-Learning%20Assistant-blue?style=for-the-badge&logo=book)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-purple?style=for-the-badge&logo=prisma)

## 🌐 Live Demo

**Try the app now:** [https://toeic-learning-assistant-frontend-a.vercel.app/](https://toeic-learning-assistant-frontend-a.vercel.app/)

> **Note:** The frontend is deployed on Vercel. The backend API needs to be running separately for full functionality.

## Features

### **Smart Learning System**
- **Interactive Quizzes**: 9+ sample TOEIC-style quizzes with multiple difficulty levels
- **Custom Quiz Creator**: Create your own quizzes with personalized questions
- **Flashcard System**: Spaced repetition learning with progress tracking
- **AI-Powered Assistance**: Get explanations and recommendations using advanced AI

### **Progress Tracking**
- **Real-time Analytics**: Track your performance with detailed statistics
- **Experience Points**: Gamified learning with XP and leveling system
- **Study Streaks**: Maintain daily learning habits with streak tracking
- **Performance Insights**: Identify strengths and areas for improvement

### **Gamification**
- **Achievement System**: Unlock badges and rewards for milestones
- **Leaderboards**: Compare progress with other learners
- **Daily Goals**: Set and track personal learning objectives
- **Rewards**: Earn points and unlock special features

### **AI Integration**
- **Smart Recommendations**: AI suggests quizzes based on your performance
- **Vocabulary Assistant**: Get detailed explanations for difficult words
- **Question Generation**: AI creates new TOEIC-style questions
- **Personalized Learning**: Adaptive content based on your learning patterns

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- GROQ API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/toeic-learning-assistant.git
   cd toeic-learning-assistant
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Environment Setup**
   
   Create `.env` files in the backend directory:
   ```bash
   # backend/.env
   DATABASE_URL="postgresql://username:password@localhost:5432/toeic_db"
   JWT_SECRET="your-super-secret-jwt-key"
   GROQ_API_KEY="your-groq-api-key"
   PORT=5000
   ```

4. **Database Setup**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the application**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database Studio: http://localhost:5555 (run `npx prisma studio`)

## Project Structure

```
TOEicLearningAssistant/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication & validation
│   │   └── utils/           # Helper functions
│   ├── prisma/              # Database schema & migrations
│   └── scripts/             # Database seeding & utilities
├── frontend/                # Next.js React application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API clients & utilities
│   │   └── types/           # TypeScript type definitions
└── docs/                    # Documentation
```

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Custom Components** - Reusable UI components

### Backend
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server-side code
- **Prisma** - Modern database ORM
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **GROQ** - AI/LLM integration

### AI & Machine Learning
- **GROQ API** - Fast LLM inference
- **RAG (Retrieval-Augmented Generation)** - Enhanced AI responses
- **Knowledge Graph** - Concept relationships
- **Smart Recommendations** - Personalized learning paths

## API Documentation

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Quiz Endpoints
- `GET /quiz` - Get all quizzes
- `GET /quiz/:id` - Get specific quiz
- `POST /quiz/submit` - Submit quiz results
- `GET /quiz/history` - Get user's quiz history
- `GET /quiz/stats` - Get user's quiz statistics

### Flashcard Endpoints
- `GET /flashcards` - Get user's flashcards
- `POST /flashcards` - Create new flashcard
- `PUT /flashcards/:id` - Update flashcard
- `DELETE /flashcards/:id` - Delete flashcard

### AI Endpoints
- `POST /ai/generate-question` - Generate TOEIC questions
- `POST /ai/explain-vocabulary` - Get vocabulary explanations
- `GET /ai/recommendations` - Get learning recommendations

## Usage Guide

### Getting Started
1. **Register** for a new account or **login** with existing credentials
2. **Explore** the dashboard to see your learning progress
3. **Take quizzes** from the sample collection or create your own
4. **Study flashcards** to build vocabulary
5. **Use AI assistant** for explanations and recommendations

### Creating Custom Quizzes
1. Navigate to the Quiz page
2. Click "Create Quiz" button
3. Fill in quiz details (title, description, difficulty)
4. Add questions with multiple choice answers
5. Set correct answers and explanations
6. Save and share your quiz

### Tracking Progress
- View your **Dashboard** for overall progress
- Check **Quiz Analytics** for detailed performance metrics
- Monitor **Study Streaks** to maintain consistency
- Unlock **Achievements** as you reach milestones

## Development

### Running in Development Mode
```bash
# Backend
cd backend
npm run dev

# Frontend  
cd frontend
npm run dev
```

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Open database studio
npx prisma studio
```

### Code Quality
```bash
# Run TypeScript checks
npm run type-check

# Run linting
npm run lint

# Format code
npm run format
```

## Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy to your preferred platform (Railway, Heroku, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Configure environment variables for API endpoints

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **TOEIC** - For providing the exam format and content guidelines
- **GROQ** - For providing fast AI inference capabilities
- **Prisma** - For excellent database tooling
- **Next.js** - For the amazing React framework
- **Tailwind CSS** - For beautiful utility-first styling

## Support

If you encounter any issues or have questions:

- Email: support@toeicassistant.com
- Issues: [GitHub Issues](https://github.com/yourusername/toeic-learning-assistant/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/toeic-learning-assistant/discussions)
