import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { successResponse, badRequestResponse } from '../utils/response';

export const generateQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Generate question request body:', req.body);
    const { topic, difficulty = 'medium' } = req.body;

    if (!topic) {
      console.log('No topic provided');
      badRequestResponse(res, 'Topic is required');
      return;
    }

    console.log('Generating question for topic:', topic, 'difficulty:', difficulty);
    const question = await AIService.generateTOEICQuestion(topic, difficulty);
    console.log('Generated question:', question);
    
    successResponse(res, question, 'Question generated successfully');
  } catch (error) {
    console.error('Generate question error:', error);
    const err = error as Error;
    console.error('Error details:', err.message);
    console.error('Error stack:', err.stack);
    badRequestResponse(res, `Failed to generate question: ${err.message}`);
  }
};

export const explainGrammar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, userAnswer } = req.body;

    if (!question || !userAnswer) {
      badRequestResponse(res, 'Question and user answer are required');
      return;
    }

    const explanation = await AIService.explainGrammar(question, userAnswer);
    successResponse(res, { explanation }, 'Grammar explanation generated successfully');
  } catch (error) {
    console.error('Explain grammar error:', error);
    badRequestResponse(res, 'Failed to explain grammar');
  }
};

export const explainVocabulary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { word } = req.body;

    if (!word) {
      badRequestResponse(res, 'Word is required');
      return;
    }

    const explanation = await AIService.generateVocabularyExplanation(word);
    successResponse(res, { explanation }, 'Vocabulary explanation generated successfully');
  } catch (error) {
    console.error('Explain vocabulary error:', error);
    badRequestResponse(res, 'Failed to explain vocabulary');
  }
};
