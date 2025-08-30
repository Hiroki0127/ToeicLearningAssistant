import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Use a singleton pattern to prevent multiple Prisma Client instances
export const prisma = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Database health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Database statistics
export const getDatabaseStats = async () => {
  try {
    const [userCount, flashcardCount, quizCount] = await Promise.all([
      prisma.user.count(),
      prisma.flashcard.count(),
      prisma.quiz.count(),
    ]);

    return {
      users: userCount,
      flashcards: flashcardCount,
      quizzes: quizCount,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return null;
  }
};

export default prisma;
