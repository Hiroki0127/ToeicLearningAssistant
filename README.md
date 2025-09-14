# TOEIC Learning Assistant

An AI-powered study app with vocab flashcards, daily reminders, and progress tracking. Enhanced learning through Retrieval-Augmented Generation (RAG) for grammar/vocab questions and knowledge graphs to link related concepts for comprehensive understanding.

## 🚀 Features

### Core (MVP) Features
- ✅ Vocab flashcards (add, edit, review words)
- ✅ Daily reminder/notifications (study streaks, push/local notifications)
- ✅ Progress reports (track correct/incorrect answers, study time, streaks)
- ✅ Quizzes/tests (multiple choice, fill-in-the-blank, timed practice)
- ✅ User authentication (optional: login, profiles, track progress per user)

### Advanced AI Features (Coming Soon)
- 🔄 RAG (Retrieval-Augmented Generation)
- 🔄 Knowledge Graphs
- 🔄 Smart Recommendations (AI-powered suggestions based on learning patterns)

## 🛠️ Tech Stack

- **Frontend**: React + Next.js
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **AI/NLP**: LangChain, Groq API
- **Vector Database**: FAISS/Weaviate
- **Knowledge Graph**: Neo4j
- **Hosting**: Vercel (Frontend), Railway (Backend)

## 📁 Project Structure

```
ToeicLearningAssistant/
├── frontend/          # Next.js React app
├── backend/           # Express.js API server
├── shared/            # Shared types and utilities
├── docs/              # Documentation
└── scripts/           # Build and deployment scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ToeicLearningAssistant
```

2. Install dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables
```bash
# Copy environment files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

4. Start development servers
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

## 📝 Development Roadmap

- [x] Project setup and structure
- [ ] Frontend: Basic UI components
- [ ] Backend: Express server setup
- [ ] Database: PostgreSQL schema
- [ ] Authentication system
- [ ] Flashcard CRUD operations
- [ ] Progress tracking
- [ ] Quiz system
- [ ] AI integration (RAG)
- [ ] Knowledge graph implementation
- [ ] Smart recommendations system

## 🤝 Contributing

This is a personal project for learning and development purposes.

## 📄 License

MIT License
