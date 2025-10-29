// Simple AI service tests that don't require external API calls
describe('Simple AI Service Tests', () => {
  it('should have AIService class available', () => {
    const { AIService } = require('../services/ai.service');
    expect(AIService).toBeDefined();
    expect(typeof AIService).toBe('function');
  });

  it('should have static methods available', () => {
    const { AIService } = require('../services/ai.service');
    expect(typeof AIService.generateTOEICQuestion).toBe('function');
    expect(typeof AIService.explainGrammar).toBe('function');
    expect(typeof AIService.generateVocabularyExplanation).toBe('function');
  });

  it('should handle missing GROQ_API_KEY gracefully', async () => {
    // Mock environment to not have GROQ_API_KEY
    const originalEnv = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;

    const { AIService } = require('../services/ai.service');
    
    // This should not throw an error even without API key
    expect(() => {
      AIService.generateTOEICQuestion('test', 'medium');
    }).not.toThrow();

    // Restore environment
    if (originalEnv) {
      process.env.GROQ_API_KEY = originalEnv;
    }
  });
});
