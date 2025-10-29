import { AIService } from '../services/ai.service';

// Mock RAGService
jest.mock('../services/rag.service', () => ({
  RAGService: {
    initializeVectorDB: jest.fn(),
    generateTOEICQuestionWithRAG: jest.fn(),
    explainVocabularyWithRAG: jest.fn(),
  },
}));

// Mock the getGroqClient function
jest.mock('../utils/groq', () => ({
  getGroqClient: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

// Mock environment variables
process.env.GROQ_API_KEY = 'test-api-key';

describe('AI Service - Simple Tests', () => {
  let mockGroqClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    const { getGroqClient } = require('../utils/groq');
    mockGroqClient = getGroqClient();
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

      const { RAGService } = require('../services/rag.service');
      RAGService.generateTOEICQuestionWithRAG.mockResolvedValue(mockRAGResponse);

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
              question: 'The company is planning to _____ its marketing strategy.',
              options: ['A) modify', 'B) expand', 'C) revise', 'D) alter'],
              correctAnswer: 'B',
              explanation: 'Expand means to make something larger or more extensive.',
              questionType: 'vocabulary'
            })
          }
        }]
      };

      const { RAGService } = require('../services/rag.service');
      RAGService.generateTOEICQuestionWithRAG.mockRejectedValue(new Error('RAG failed'));
      mockGroqClient.chat.completions.create.mockResolvedValue(mockGroqResponse);

      const result = await AIService.generateTOEICQuestion('part 5 vocabulary', 'medium');

      expect(RAGService.generateTOEICQuestionWithRAG).toHaveBeenCalledWith('part 5 vocabulary', 'medium');
      expect(mockGroqClient.chat.completions.create).toHaveBeenCalled();
      expect(result).toEqual(JSON.parse(mockGroqResponse.choices[0].message.content));
    });

    it('should return fallback response when all services fail', async () => {
      const { RAGService } = require('../services/rag.service');
      RAGService.generateTOEICQuestionWithRAG.mockRejectedValue(new Error('RAG failed'));
      mockGroqClient.chat.completions.create.mockRejectedValue(new Error('Groq API failed'));

      const result = await AIService.generateTOEICQuestion('part 5', 'medium');

      expect(result).toEqual({
        part: '5',
        question: 'The company is planning to _____ its marketing strategy.',
        options: ['A) modify', 'B) expand', 'C) revise', 'D) alter'],
        correctAnswer: 'B',
        explanation: 'This is a fallback explanation due to an error in generating the question.',
        questionType: 'unknown'
      });
    });
  });

  describe('generateVocabularyExplanation', () => {
    it('should explain vocabulary using RAG when available', async () => {
      const mockRAGResponse = 'RAG explanation for allocate';
      const { RAGService } = require('../services/rag.service');
      RAGService.explainVocabularyWithRAG.mockResolvedValue(mockRAGResponse);

      const result = await AIService.generateVocabularyExplanation('allocate');

      expect(RAGService.explainVocabularyWithRAG).toHaveBeenCalledWith('allocate');
      expect(result).toBe(mockRAGResponse);
    });

    it('should fallback to Groq API when RAG fails', async () => {
      const mockGroqResponse = {
        choices: [{
          message: {
            content: 'Groq explanation for allocate'
          }
        }]
      };

      const { RAGService } = require('../services/rag.service');
      RAGService.explainVocabularyWithRAG.mockRejectedValue(new Error('RAG failed'));
      mockGroqClient.chat.completions.create.mockResolvedValue(mockGroqResponse);

      const result = await AIService.generateVocabularyExplanation('allocate');

      expect(RAGService.explainVocabularyWithRAG).toHaveBeenCalledWith('allocate');
      expect(mockGroqClient.chat.completions.create).toHaveBeenCalled();
      expect(result).toBe('Groq explanation for allocate');
    });

    it('should return fallback response when all services fail', async () => {
      const { RAGService } = require('../services/rag.service');
      RAGService.explainVocabularyWithRAG.mockRejectedValue(new Error('RAG failed'));
      mockGroqClient.chat.completions.create.mockRejectedValue(new Error('Groq API failed'));

      const result = await AIService.generateVocabularyExplanation('allocate');

      expect(result).toBe('Unable to generate vocabulary explanation');
    });
  });

  describe('explainGrammar', () => {
    it('should explain grammar using Groq API', async () => {
      const mockGroqResponse = {
        choices: [{
          message: {
            content: 'Groq explanation for present perfect'
          }
        }]
      };

      mockGroqClient.chat.completions.create.mockResolvedValue(mockGroqResponse);

      const result = await AIService.explainGrammar('present perfect', 'I have been studying');

      expect(mockGroqClient.chat.completions.create).toHaveBeenCalled();
      expect(result).toBe('Groq explanation for present perfect');
    });

    it('should return fallback response when Groq API fails', async () => {
      mockGroqClient.chat.completions.create.mockRejectedValue(new Error('Groq API failed'));

      const result = await AIService.explainGrammar('present perfect', 'I have been studying');

      expect(result).toBe('Unable to explain grammar');
    });
  });
});
