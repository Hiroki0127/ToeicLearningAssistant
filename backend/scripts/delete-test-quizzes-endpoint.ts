import { Request, Response } from 'express';
import { prisma } from '../src/utils/database';
import { successResponse, badRequestResponse } from '../src/utils/response';

export const deleteTestQuizzes = async (req: Request, res: Response): Promise<void> => {
  try {
    // Quiz IDs to delete
    const quizIdsToDelete = [
      'cmh2j8ygw00011bsxdz23y6d3', // Test Quiz
      'cmh2j36h800001bsxydv0oxtb', // efef
      'cmh2fukqx00005kwuurzzl318'  // Console Test Quiz
    ];

    console.log('Deleting test quizzes...');
    const deletedQuizzes = [];
    
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
        
        deletedQuizzes.push(deletedQuiz.title);
        console.log(`✅ Deleted quiz: ${deletedQuiz.title} (${quizId})`);
      } catch (error) {
        console.log(`❌ Failed to delete quiz ${quizId}:`, error);
      }
    }
    
    successResponse(res, { 
      message: 'Test quizzes deleted successfully',
      deletedQuizzes 
    });
  } catch (error) {
    console.error('❌ Error deleting test quizzes:', error);
    badRequestResponse(res, 'Failed to delete test quizzes');
  }
};
