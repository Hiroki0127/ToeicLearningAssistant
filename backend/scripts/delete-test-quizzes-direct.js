// Direct database deletion script
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function deleteTestQuizzes() {
  try {
    const quizIdsToDelete = [
      'cmh2j8ygw00011bsxdz23y6d3', // Test Quiz
      'cmh2j36h800001bsxydv0oxtb', // efef
      'cmh2fukqx00005kwuurzzl318'  // Console Test Quiz
    ];

    console.log('Deleting test quizzes...');

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
          console.log(`✅ Deleted: ${quiz.title} (${quizId})`);
        } else {
          console.log(`⚠️  Not found: ${quizId}`);
        }
      } catch (error) {
        console.error(`❌ Error deleting ${quizId}:`, error.message);
      }
    }

    console.log('✅ Cleanup completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestQuizzes();
