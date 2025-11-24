import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeStudySessions() {
  try {
    console.log('📊 Analyzing study sessions...\n');

    // Get all sessions
    const allSessions = await prisma.studySession.findMany({
      orderBy: { startTime: 'desc' },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        sessionType: true,
        cardsStudied: true,
        createdAt: true,
      },
    });

    console.log(`Total sessions: ${allSessions.length}\n`);

    // Calculate total time
    let totalMinutes = 0;
    const problematicSessions: Array<{
      id: string;
      type: string;
      duration: number;
      date: Date;
      issue: string;
    }> = [];

    for (const session of allSessions) {
      if (!session.endTime) {
        problematicSessions.push({
          id: session.id,
          type: session.sessionType,
          duration: 0,
          date: session.startTime,
          issue: 'Missing endTime',
        });
        continue;
      }

      const durationMs = session.endTime.getTime() - session.startTime.getTime();
      const durationMinutes = durationMs / (1000 * 60);

      // Flag problematic sessions
      if (durationMinutes < 0) {
        problematicSessions.push({
          id: session.id,
          type: session.sessionType,
          duration: durationMinutes,
          date: session.startTime,
          issue: 'Negative duration (endTime before startTime)',
        });
      } else if (durationMinutes === 0) {
        problematicSessions.push({
          id: session.id,
          type: session.sessionType,
          duration: 0,
          date: session.startTime,
          issue: 'Zero duration (same startTime and endTime)',
        });
      } else if (durationMinutes > 120) {
        // More than 2 hours seems suspicious
        problematicSessions.push({
          id: session.id,
          type: session.sessionType,
          duration: durationMinutes,
          date: session.startTime,
          issue: `Very long duration (${Math.round(durationMinutes)} minutes = ${Math.round(durationMinutes / 60)} hours)`,
        });
      }

      if (durationMinutes > 0) {
        totalMinutes += durationMinutes;
      }
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    console.log(`⏱️  Total Study Time: ${hours}h ${minutes}m (${Math.round(totalMinutes)} minutes)\n`);

    // Group by type
    const byType = allSessions.reduce((acc, session) => {
      const type = session.sessionType;
      if (!acc[type]) {
        acc[type] = { count: 0, totalMinutes: 0 };
      }
      acc[type].count++;
      if (session.endTime) {
        const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
        if (duration > 0) {
          acc[type].totalMinutes += duration;
        }
      }
      return acc;
    }, {} as Record<string, { count: number; totalMinutes: number }>);

    console.log('📈 Breakdown by type:');
    for (const [type, stats] of Object.entries(byType)) {
      const h = Math.floor(stats.totalMinutes / 60);
      const m = Math.round(stats.totalMinutes % 60);
      console.log(`  ${type}: ${stats.count} sessions, ${h}h ${m}m`);
    }

    // Show problematic sessions
    if (problematicSessions.length > 0) {
      console.log(`\n⚠️  Found ${problematicSessions.length} problematic sessions:\n`);
      
      // Group by issue type
      const byIssue = problematicSessions.reduce((acc, session) => {
        if (!acc[session.issue]) {
          acc[session.issue] = [];
        }
        acc[session.issue].push(session);
        return acc;
      }, {} as Record<string, typeof problematicSessions>);

      for (const [issue, sessions] of Object.entries(byIssue)) {
        console.log(`  ${issue}: ${sessions.length} sessions`);
        if (sessions.length <= 10) {
          sessions.forEach(s => {
            const date = s.date.toISOString().split('T')[0];
            console.log(`    - ${s.type} on ${date} (${Math.round(s.duration)} min)`);
          });
        }
      }

      // Calculate how much time these problematic sessions add
      const problematicMinutes = problematicSessions
        .filter(s => s.duration > 0)
        .reduce((sum, s) => sum + s.duration, 0);
      
      if (problematicMinutes > 0) {
        const problematicHours = Math.floor(problematicMinutes / 60);
        const problematicMins = Math.round(problematicMinutes % 60);
        console.log(`\n  Total time from problematic sessions: ${problematicHours}h ${problematicMins}m`);
      }
    } else {
      console.log('\n✅ No problematic sessions found!');
    }

    // Show recent sessions
    console.log('\n📅 Recent sessions (last 10):');
    const recent = allSessions.slice(0, 10);
    for (const session of recent) {
      const date = session.startTime.toISOString().split('T')[0];
      const time = session.startTime.toISOString().split('T')[1].split('.')[0];
      if (session.endTime) {
        const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
        console.log(`  ${date} ${time} - ${session.sessionType}: ${Math.round(duration)} min`);
      } else {
        console.log(`  ${date} ${time} - ${session.sessionType}: No endTime`);
      }
    }

  } catch (error) {
    console.error('❌ Error analyzing study sessions:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
analyzeStudySessions();

