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
        // First, delete any related quiz attempts
        await prisma.quizAttempt.deleteMany({
          where: { quizId }
        });
        
        // Then delete the quiz
        const deletedQuiz = await prisma.quiz.delete({
          where: { id: quizId }
        });
        
        console.log(`✅ Deleted quiz: ${deletedQuiz.title} (${quizId})`);
      } catch (error) {
        console.log(`❌ Failed to delete quiz ${quizId}:`, error);
      }
    }
    
    console.log('✅ Test quiz deletion completed!');
  } catch (error) {
    console.error('❌ Error deleting test quizzes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestQuizzes();
