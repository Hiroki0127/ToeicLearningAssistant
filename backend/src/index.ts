import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes';
import flashcardRoutes from './routes/flashcard.routes';
import quizRoutes from './routes/quiz.routes';
import notificationRoutes from './routes/notification.routes';
import aiRoutes from './routes/ai.routes';
import knowledgeGraphRoutes from './routes/knowledge-graph.routes';
import smartRecommendationsRoutes from './routes/smart-recommendations.routes';
import dashboardRoutes from './routes/dashboard.routes';
import studySessionRoutes from './routes/study-session.routes';

// Import database utilities
import { checkDatabaseConnection, getDatabaseStats } from './utils/database';

// Import RAG service for initialization
import { RAGService } from './services/rag.service';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] ? parseInt(process.env['PORT']) : 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: [
    process.env['FRONTEND_URL'] || 'https://toeic-learning-assistant-frontend-a.vercel.app',
    'http://172.20.10.2:3000',
    'http://172.20.10.2:3006',
    'http://localhost:3006',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (_req, res) => {
  const dbConnected = await checkDatabaseConnection();
  
  res.json({
    status: dbConnected ? 'OK' : 'WARNING',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development',
    database: {
      connected: dbConnected,
    },
  });
});

// Database stats endpoint
app.get('/api/stats', async (_req, res) => {
  const stats = await getDatabaseStats();
  
  if (stats) {
    res.json({
      success: true,
      data: stats,
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve database statistics',
    });
  }
});

// Cleanup endpoint to delete test quizzes
app.get('/api/cleanup-test-quizzes', async (_req, res) => {
  try {
    const { prisma } = await import('./utils/database');
    
    const quizIdsToDelete = [
      'cmh2j8ygw00011bsxdz23y6d3', // Test Quiz
      'cmh2j36h800001bsxydv0oxtb', // efef
      'cmh2fukqx00005kwuurzzl318'  // Console Test Quiz
    ];

    const deletedQuizzes = [];

    for (const quizId of quizIdsToDelete) {
      try {
        const quiz = await prisma.quiz.findUnique({
          where: { id: quizId },
          select: { id: true, title: true }
        });

        if (quiz) {
          await prisma.quiz.delete({
            where: { id: quizId }
          });
          deletedQuizzes.push(quiz.title);
          console.log(`✅ Deleted: ${quiz.title} (${quizId})`);
        }
      } catch (error) {
        console.error(`Error deleting quiz ${quizId}:`, error);
      }
    }

    res.json({
      success: true,
      data: { deletedQuizzes },
      message: `Successfully deleted ${deletedQuizzes.length} test quizzes`
    });
  } catch (error) {
    console.error('Error in cleanup endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete test quizzes'
    });
  }
});

// One-time cleanup endpoint (different path)
app.get('/cleanup-now', async (_req, res) => {
  try {
    const { prisma } = await import('./utils/database');
    
    const quizIdsToDelete = [
      'cmh2j8ygw00011bsxdz23y6d3', // Test Quiz
      'cmh2j36h800001bsxydv0oxtb', // efef
      'cmh2fukqx00005kwuurzzl318'  // Console Test Quiz
    ];

    const deletedQuizzes = [];

    for (const quizId of quizIdsToDelete) {
      try {
        const quiz = await prisma.quiz.findUnique({
          where: { id: quizId },
          select: { id: true, title: true }
        });

        if (quiz) {
          await prisma.quiz.delete({
            where: { id: quizId }
          });
          deletedQuizzes.push(quiz.title);
          console.log(`✅ Deleted: ${quiz.title} (${quizId})`);
        }
      } catch (error) {
        console.error(`Error deleting quiz ${quizId}:`, error);
      }
    }

    res.json({
      success: true,
      data: { deletedQuizzes },
      message: `Successfully deleted ${deletedQuizzes.length} test quizzes`
    });
  } catch (error) {
    console.error('Error in cleanup endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete test quizzes'
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/knowledge-graph', knowledgeGraphRoutes);
app.use('/api/recommendations', smartRecommendationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/study-sessions', studySessionRoutes);

// API info endpoint
app.get('/api', (_req, res) => {
  res.json({
    message: 'TOEIC Learning Assistant API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      flashcards: '/api/flashcards',
      quiz: '/api/quiz',
      notifications: '/api/notifications',
      ai: '/api/ai',
      knowledgeGraph: '/api/knowledge-graph',
      recommendations: '/api/recommendations',
      progress: '/api/progress',
    },
  });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env['NODE_ENV'] === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Initialize RAG service with TOEIC knowledge base
async function initializeServices() {
  try {
    console.log('🧠 Initializing RAG service with TOEIC knowledge base...');
    await RAGService.initializeVectorDB();
    console.log('✅ RAG service initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize RAG service:', error);
    console.log('⚠️  AI responses will use fallback mode');
  }
}

// Add endpoint to check database content
app.get('/api/debug/quiz-count', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const quizCount = await prisma.quiz.count();
    const quizzes = await prisma.quiz.findMany({
      select: { title: true, type: true }
    });
    
    res.json({
      success: true,
      data: {
        totalQuizzes: quizCount,
        quizzes: quizzes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API docs: http://localhost:${PORT}/api`);
  console.log(`🌐 Network access: http://172.20.10.2:${PORT}`);
  
  // Initialize services after server starts
  await initializeServices();
});

export default app;
