import { AIService } from '../services/ai.service';
import { RAGService } from '../services/rag.service';

// Mock RAGService
jest.mock('../services/rag.service', () => ({
  RAGService: {
    generateTOEICQuestionWithRAG: jest.fn(),
    explainVocabularyWithRAG: jest.fn(),
  }
}));

// Mock fetch for Groq API
global.fetch = jest.fn();

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
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGroqResponse)
      });

      const result = await AIService.generateTOEICQuestion('part 5 vocabulary', 'medium');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.groq.com/openai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer undefined',
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual({
        part: '5',
        question: 'The meeting has been _____ until next week.',
        options: ['A) postponed', 'B) cancelled', 'C) rescheduled', 'D) delayed'],
        correctAnswer: 'A',
        explanation: 'Postponed means to delay or put off to a later time.',
        questionType: 'vocabulary'
      });
    });

    it('should return fallback response when all services fail', async () => {
      (RAGService.generateTOEICQuestionWithRAG as jest.Mock).mockRejectedValue(new Error('RAG failed'));
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Groq API failed'));

      const result = await AIService.generateTOEICQuestion('part 5', 'medium');

      expect(result).toEqual({
        part: '5',
        question: 'The company is planning to _____ its marketing strategy.',
        options: ['A) modify', 'B) expand', 'C) revise', 'D) alter'],
        correctAnswer: 'B',
        explanation: 'This is a fallback question. The AI service is currently unavailable.',
        questionType: 'grammar'
      });
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
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGroqResponse)
      });

      const result = await AIService.generateVocabularyExplanation('allocate');

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBe('The word "allocate" means to distribute or assign resources for a specific purpose.');
    });

    it('should return fallback response when all services fail', async () => {
      (RAGService.explainVocabularyWithRAG as jest.Mock).mockRejectedValue(new Error('RAG failed'));
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Groq API failed'));

      const result = await AIService.generateVocabularyExplanation('allocate');

      expect(result).toContain('I apologize, but I am currently unable to provide vocabulary explanations');
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

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGroqResponse)
      });

      const result = await AIService.explainGrammar('present perfect', 'I have been studying');

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBe('Present perfect tense is used to describe actions that started in the past and continue to the present.');
    });

    it('should return fallback response when Groq API fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API failed'));

      const result = await AIService.explainGrammar('present perfect', 'I have been studying');

      expect(result).toContain('I apologize, but I am currently unable to provide grammar explanations');
    });
  });
});
