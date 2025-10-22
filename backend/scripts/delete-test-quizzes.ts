import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteTestQuizzes() {
  try {
    // Quiz IDs to delete
    const quizIdsToDelete = [
      'cmh2j8ygw00011bsxdz23y6d3', // Test Quiz
      'cmh2j36h800001bsxydv0oxtb', // efef
      'cmh2fukqx00005kwuurzzl318'  // Console Test Quiz
    ];

    console.log('Deleting test quizzes...');

    for (const quizId of quizIdsToDelete) {
      try {
        // First check if quiz exists
        const quiz = await prisma.quiz.findUnique({
          where: { id: quizId },
          select: { id: true, title: true }
        });

        if (quiz) {
          // Delete the quiz (this will cascade delete related records)
          await prisma.quiz.delete({
            where: { id: quizId }
          });
          console.log(`✅ Deleted quiz: ${quiz.title} (${quizId})`);
        } else {
          console.log(`⚠️  Quiz not found: ${quizId}`);
        }
      } catch (error) {
        console.error(`❌ Error deleting quiz ${quizId}:`, error);
      }
    }

    console.log('✅ Test quiz deletion completed!');
  } catch (error) {
    console.error('❌ Error in deleteTestQuizzes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestQuizzes();
