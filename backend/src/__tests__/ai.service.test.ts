// Mock Groq SDK before importing anything
const mockGroqClient = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

jest.mock('groq-sdk', () => {
  const MockGroq = jest.fn().mockImplementation(() => mockGroqClient);
  return {
    __esModule: true,
    default: MockGroq,
  };
});

// Mock RAGService
jest.mock('../services/rag.service', () => ({
  RAGService: {
    initializeVectorDB: jest.fn(),
    generateTOEICQuestionWithRAG: jest.fn(),
    explainVocabularyWithRAG: jest.fn(),
  }
}));

// Mock the getGroqClient function to return the same mock instance
jest.mock('../utils/groq', () => ({
  getGroqClient: jest.fn(() => mockGroqClient),
}));

// Mock environment variables
process.env.GROQ_API_KEY = 'test-api-key';

import { AIService } from '../services/ai.service';
import { RAGService } from '../services/rag.service';

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTOEICQuestion', () => {
    it('should generate question using RAG when available', async () => {
      const mockRAGResponse = {
        part: '5',
        question: 'The company is planning to _____ its marketing strategy.',
        options: ['A) modify', 'B) expand', 'C) revise', 'D) alter'],
        correctAnswer: 'B',
        explanation: 'Expand means to make something larger or more extensive.',
        questionType: 'grammar'
      };

      (RAGService.generateTOEICQuestionWithRAG as jest.Mock).mockResolvedValue(mockRAGResponse);

      const result = await AIService.generateTOEICQuestion('part 5 grammar', 'medium');

      expect(RAGService.generateTOEICQuestionWithRAG).toHaveBeenCalledWith('part 5 grammar', 'medium');
      expect(result).toEqual(mockRAGResponse);
    });

    it('should fallback to Groq API when RAG fails', async () => {
      const mockGroqResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              part: '5',
              question: 'The meeting has been _____ until next week.',
              options: ['A) postponed', 'B) cancelled', 'C) rescheduled', 'D) delayed'],
              correctAnswer: 'A',
              explanation: 'Postponed means to delay or put off to a later time.',
              questionType: 'vocabulary'
            })
          }
        }]
      };

      (RAGService.generateTOEICQuestionWithRAG as jest.Mock).mockRejectedValue(new Error('RAG failed'));
      mockGroqClient.chat.completions.create.mockResolvedValue(mockGroqResponse);

      const result = await AIService.generateTOEICQuestion('part 5 vocabulary', 'medium');

      expect(RAGService.generateTOEICQuestionWithRAG).toHaveBeenCalledWith('part 5 vocabulary', 'medium');
      expect(mockGroqClient.chat.completions.create).toHaveBeenCalled();
      expect(result).toEqual({
        part: '5',
        question: 'The meeting has been _____ until next week.',
        options: ['A) postponed', 'B) cancelled', 'C) rescheduled', 'D) delayed'],
        correctAnswer: 'A',
        explanation: 'Postponed means to delay or put off to a later time.',
        questionType: 'vocabulary'
      });
    });

    it('should throw error when all services fail', async () => {
      (RAGService.generateTOEICQuestionWithRAG as jest.Mock).mockRejectedValue(new Error('RAG failed'));
      mockGroqClient.chat.completions.create.mockRejectedValue(new Error('Groq API failed'));

      await expect(AIService.generateTOEICQuestion('part 5', 'medium')).rejects.toThrow(
        'Failed to generate TOEIC question'
      );

      expect(RAGService.generateTOEICQuestionWithRAG).toHaveBeenCalledWith('part 5', 'medium');
      expect(mockGroqClient.chat.completions.create).toHaveBeenCalled();
    });
  });

  describe('explainVocabulary', () => {
    it('should explain vocabulary using RAG when available', async () => {
      const mockRAGResponse = 'The word "allocate" means to distribute or assign resources for a specific purpose.';

      (RAGService.explainVocabularyWithRAG as jest.Mock).mockResolvedValue(mockRAGResponse);

      const result = await AIService.generateVocabularyExplanation('allocate');

      expect(RAGService.explainVocabularyWithRAG).toHaveBeenCalledWith('allocate');
      expect(result).toBe(mockRAGResponse);
    });

    it('should fallback to Groq API when RAG fails', async () => {
      const mockGroqResponse = {
        choices: [{
          message: {
            content: 'The word "allocate" means to distribute or assign resources for a specific purpose.'
          }
        }]
      };

      (RAGService.explainVocabularyWithRAG as jest.Mock).mockRejectedValue(new Error('RAG failed'));
      mockGroqClient.chat.completions.create.mockResolvedValue(mockGroqResponse);

      const result = await AIService.generateVocabularyExplanation('allocate');

      expect(RAGService.explainVocabularyWithRAG).toHaveBeenCalledWith('allocate');
      expect(mockGroqClient.chat.completions.create).toHaveBeenCalled();
      expect(result).toBe('The word "allocate" means to distribute or assign resources for a specific purpose.');
    });

    it('should throw error when all services fail', async () => {
      (RAGService.explainVocabularyWithRAG as jest.Mock).mockRejectedValue(new Error('RAG failed'));
      mockGroqClient.chat.completions.create.mockRejectedValue(new Error('Groq API failed'));

      await expect(AIService.generateVocabularyExplanation('allocate')).rejects.toThrow(
        'Failed to generate vocabulary explanation'
      );

      expect(RAGService.explainVocabularyWithRAG).toHaveBeenCalledWith('allocate');
      expect(mockGroqClient.chat.completions.create).toHaveBeenCalled();
    });
  });

  describe('explainGrammar', () => {
    it('should explain grammar using Groq API', async () => {
      const mockGroqResponse = {
        choices: [{
          message: {
            content: 'Present perfect tense is used to describe actions that started in the past and continue to the present.'
          }
        }]
      };

      mockGroqClient.chat.completions.create.mockResolvedValue(mockGroqResponse);

      const result = await AIService.explainGrammar('present perfect', 'I have been studying');

      expect(mockGroqClient.chat.completions.create).toHaveBeenCalled();
      expect(result).toBe('Present perfect tense is used to describe actions that started in the past and continue to the present.');
    });

    it('should throw error when Groq API fails', async () => {
      mockGroqClient.chat.completions.create.mockRejectedValue(new Error('Groq API failed'));

      await expect(AIService.explainGrammar('present perfect', 'I have been studying')).rejects.toThrow(
        'Failed to explain grammar'
      );

      expect(mockGroqClient.chat.completions.create).toHaveBeenCalled();
    });
  });
});
