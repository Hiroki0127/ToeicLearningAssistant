import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixStudySessions() {
  try {
    console.log('🔧 Fixing problematic study sessions...\n');

    // Get all sessions
    const allSessions = await prisma.studySession.findMany({
      orderBy: { startTime: 'desc' },
    });

    let fixedCount = 0;
    let deletedCount = 0;

    for (const session of allSessions) {
      if (!session.endTime) {
        // Delete sessions without endTime (incomplete sessions)
        console.log(`Deleting session ${session.id} (missing endTime)`);
        await prisma.studySession.delete({
          where: { id: session.id },
        });
        deletedCount++;
        continue;
      }

      const durationMs = session.endTime.getTime() - session.startTime.getTime();
      const durationMinutes = durationMs / (1000 * 60);

      if (durationMinutes < 0) {
        // Negative duration - delete (invalid data)
        console.log(`Deleting session ${session.id} (negative duration: ${Math.round(durationMinutes)} min)`);
        await prisma.studySession.delete({
          where: { id: session.id },
        });
        deletedCount++;
      } else if (durationMinutes === 0) {
        // Zero duration - delete (likely bad data from before fixes)
        console.log(`Deleting session ${session.id} (zero duration)`);
        await prisma.studySession.delete({
          where: { id: session.id },
        });
        deletedCount++;
      } else if (durationMinutes > 120) {
        // Very long session (> 2 hours) - might be invalid
        // Ask user if they want to delete these
        console.log(`⚠️  Long session found: ${session.id} - ${Math.round(durationMinutes)} minutes (${Math.round(durationMinutes / 60)} hours)`);
        console.log(`   Type: ${session.sessionType}, Date: ${session.startTime.toISOString().split('T')[0]}`);
        // For now, we'll keep these but flag them
        // Uncomment the delete below if you want to remove all sessions > 2 hours
        // await prisma.studySession.delete({ where: { id: session.id } });
        // deletedCount++;
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} sessions`);
    console.log(`🗑️  Deleted ${deletedCount} invalid sessions`);

    // Recalculate total time
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
        if (duration > 0) {
          return total + duration;
        }
      }
      return total;
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    console.log(`\n⏱️  New total study time: ${hours}h ${minutes}m`);
    console.log('✨ Fix complete!');

  } catch (error) {
    console.error('❌ Error fixing study sessions:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixStudySessions();

