import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import authRoutes from '@/routes/auth.routes';
import flashcardRoutes from '@/routes/flashcard.routes';

// Import database utilities
import { checkDatabaseConnection, getDatabaseStats } from '@/utils/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
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
app.get('/api/stats', async (req, res) => {
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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/flashcards', flashcardRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'TOEIC Learning Assistant API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      flashcards: '/api/flashcards',
      quiz: '/api/quiz',
      progress: '/api/progress',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API docs: http://localhost:${PORT}/api`);
});

export default app;
