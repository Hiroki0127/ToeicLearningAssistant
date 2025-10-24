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
app.get('/api/debug/quiz-count', async (_req, res) => {
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
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Add endpoint to seed official TOEIC questions
app.post('/api/admin/seed-toeic-questions', async (_req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🌱 Seeding official TOEIC questions...');
    
    // Check if TOEIC questions already exist
    const existingToeicQuizzes = await prisma.quiz.findMany({
      where: {
        OR: [
          { title: { contains: 'TOEIC Part 5' } },
          { title: { contains: 'TOEIC Part 6' } },
          { title: { contains: 'TOEIC Part 7' } }
        ]
      }
    });
    
    if (existingToeicQuizzes.length > 0) {
      return res.json({
        success: true,
        message: 'Official TOEIC questions already exist in database',
        data: { existingCount: existingToeicQuizzes.length }
      });
    }
    
    // Create official TOEIC Part 5 questions
    const toeicPart5Quiz = await prisma.quiz.create({
      data: {
        title: 'TOEIC Part 5 - Official Sample Questions',
        description: 'Authentic TOEIC Part 5 questions from official sample test',
        type: 'part5',
        difficulty: 'medium',
        timeLimit: 600,
        questions: JSON.stringify([
          {
            id: 'toeic-101',
            question: 'Customer reviews indicate that many modern mobile devices are often unnecessarily ------- .',
            options: ['complication', 'complicates', 'complicate', 'complicated'],
            correctAnswer: 'complicated',
            explanation: 'The sentence needs an adjective to describe \'mobile devices\'. \'Complicated\' is the correct adjective form.',
            points: 10
          },
          {
            id: 'toeic-102',
            question: 'Jamal Nawzad has received top performance reviews ------- he joined the sales department two years ago.',
            options: ['despite', 'except', 'since', 'during'],
            correctAnswer: 'since',
            explanation: '\'Since\' is used with present perfect tense to indicate a point in time when an action started that continues to the present.',
            points: 10
          },
          {
            id: 'toeic-103',
            question: 'Gyeon Corporation\'s continuing education policy states that ------- learning new skills enhances creativity and focus.',
            options: ['regular', 'regularity', 'regulate', 'regularly'],
            correctAnswer: 'regularly',
            explanation: 'The sentence needs an adverb to modify the verb \'learning\'. \'Regularly\' is the correct adverb form.',
            points: 10
          },
          {
            id: 'toeic-104',
            question: 'Among ------- recognized at the company awards ceremony were senior business analyst Natalie Obi and sales associate Peter Comeau.',
            options: ['who', 'whose', 'they', 'those'],
            correctAnswer: 'those',
            explanation: '\'Those\' is used as a pronoun to refer to people who were recognized at the ceremony.',
            points: 10
          },
          {
            id: 'toeic-105',
            question: 'All clothing sold in Develyn\'s Boutique is made from natural materials and contains no ------- dyes.',
            options: ['immediate', 'synthetic', 'reasonable', 'assumed'],
            correctAnswer: 'synthetic',
            explanation: 'The context indicates the boutique uses only natural materials, so \'synthetic\' (artificial/man-made) is the opposite of what they use.',
            points: 10
          }
        ]),
      },
    });
    
    // Create official TOEIC Part 6 questions
    const toeicPart6Quiz = await prisma.quiz.create({
      data: {
        title: 'TOEIC Part 6 - Official Text Completion',
        description: 'Authentic TOEIC Part 6 text completion questions from official sample test',
        type: 'part6',
        difficulty: 'medium',
        timeLimit: 600,
        questions: JSON.stringify([
          {
            id: 'toeic-part6-email',
            passage: `To: Project Leads
From: James Pak
Subject: Training Courses

To all Pak Designs project leaders:

In the coming weeks, we will be organizing several training sessions for ------- employees. At Pak Designs, we believe that with the proper help and support from our senior project leaders, less experienced staff can quickly ------- a deep understanding of the design process. ------- , they can improve their ability to communicate effectively across divisions. When employees at all experience levels interact, every employee's competency level rises and the business overall benefits. For that reason, we are urging experienced project leaders to attend each one of the interactive seminars that will be held throughout the coming month. -------.

Thank you for your support.
James Pak
Pak Designs`,
            questions: [
              {
                number: 131,
                question: 'In the coming weeks, we will be organizing several training sessions for ------- employees.',
                options: ['interest', 'interests', 'interested', 'interesting'],
                correctAnswer: 'interested',
                explanation: 'The blank needs an adjective to describe \'employees\'. \'Interested\' is the correct adjective form meaning \'having an interest in\'.',
                points: 10
              },
              {
                number: 132,
                question: 'Less experienced staff can quickly ------- a deep understanding of the design process.',
                options: ['develop', 'raise', 'open', 'complete'],
                correctAnswer: 'develop',
                explanation: '\'Develop\' means \'to acquire or build up\' and is commonly used with \'understanding\' in business contexts.',
                points: 10
              },
              {
                number: 133,
                question: '------- , they can improve their ability to communicate effectively across divisions.',
                options: ['After all', 'For', 'Even so', 'At the same time'],
                correctAnswer: 'At the same time',
                explanation: '\'At the same time\' is used to introduce an additional point or benefit, showing that this is another positive outcome.',
                points: 10
              },
              {
                number: 134,
                question: '-------.',
                options: [
                  'Let me explain our plans for on-site staff training.',
                  'We hope that you will strongly consider joining us.',
                  'Today\'s training session will be postponed until Monday.',
                  'This is the first in a series of such lectures.'
                ],
                correctAnswer: 'We hope that you will strongly consider joining us.',
                explanation: 'This sentence appropriately concludes the email by encouraging participation in the training sessions mentioned throughout the message.',
                points: 10
              }
            ]
          }
        ]),
      },
    });
    
    // Create official TOEIC Part 7 questions
    const toeicPart7Quiz = await prisma.quiz.create({
      data: {
        title: 'TOEIC Part 7 - Official Reading Comprehension',
        description: 'Authentic TOEIC Part 7 reading comprehension questions from official sample test',
        type: 'part7',
        difficulty: 'medium',
        timeLimit: 600,
        questions: JSON.stringify([
          {
            id: 'toeic-part7-car-ad',
            passage: `Used Car For Sale

Six-year old Carlisle Custom. Only one owner. Low Mileage. Car used to commute short distances to town. Brakes and tires replaced six months ago. Struts replaced two weeks ago. Air conditioning works well, but heater takes a while to warm up. Brand new spare tire included. Priced to sell. Owner going overseas at the end of this month and must sell the car.

Call Giroozeh Ghorbani at 848-555-0231.`,
            questions: [
              {
                number: 147,
                question: 'What is suggested about the car?',
                options: [
                  'It was recently repaired.',
                  'It has had more than one owner.',
                  'It is very fuel efficient.',
                  'It has been on sale for six months.'
                ],
                correctAnswer: 'It was recently repaired.',
                explanation: 'The advertisement mentions that \'Struts replaced two weeks ago\' and \'Brakes and tires replaced six months ago\', indicating recent repairs.',
                points: 10
              },
              {
                number: 148,
                question: 'According to the advertisement, why is Ms. Ghorbani selling her car?',
                options: [
                  'She cannot repair the car\'s temperature control.',
                  'She finds it difficult to maintain.',
                  'She would like to have a newer model.',
                  'She is leaving for another country.'
                ],
                correctAnswer: 'She is leaving for another country.',
                explanation: 'The advertisement states \'Owner going overseas at the end of this month and must sell the car.\'',
                points: 10
              }
            ]
          }
        ]),
      },
    });
    
    await prisma.$disconnect();
    
    return res.json({
      success: true,
      message: 'Official TOEIC questions added successfully!',
      data: {
        part5Quiz: toeicPart5Quiz.title,
        part6Quiz: toeicPart6Quiz.title,
        part7Quiz: toeicPart7Quiz.title
      }
    });
    
  } catch (error) {
    console.error('Error seeding TOEIC questions:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
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
