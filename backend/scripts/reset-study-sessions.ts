import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetStudySessions() {
  try {
    console.log('🔄 Resetting study sessions...');

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count sessions before deletion
    const totalBefore = await prisma.studySession.count();
    const todayCount = await prisma.studySession.count({
      where: {
        startTime: {
          gte: today,
        },
      },
    });

    console.log(`📊 Found ${totalBefore} total sessions`);
    console.log(`📅 Found ${todayCount} sessions from today`);

    // Delete all sessions older than today
    const result = await prisma.studySession.deleteMany({
      where: {
        startTime: {
          lt: today,
        },
      },
    });

    console.log(`✅ Deleted ${result.count} old sessions`);
    console.log(`📊 Remaining sessions: ${todayCount}`);

    // Calculate remaining total time
    const remainingSessions = await prisma.studySession.findMany({
      where: {
        endTime: {
          not: null,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    const totalMinutes = remainingSessions.reduce((total, session) => {
      if (session.endTime) {
        const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
        return total + duration;
      }
      return total;
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    console.log(`⏱️  Total study time remaining: ${hours}h ${minutes}m`);
    console.log('✨ Reset complete!');

  } catch (error) {
    console.error('❌ Error resetting study sessions:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetStudySessions();

