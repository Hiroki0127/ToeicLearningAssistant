import Groq from 'groq-sdk';
import { RAGService } from './rag.service';

console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Found' : 'Not found');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export class AIService {
  static async generateTOEICQuestion(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    const prompt = `Generate a TOEIC Reading Section question about ${topic} with difficulty level ${difficulty}.

    Choose ONE of these TOEIC Reading question types:

    1. PART 5 - Incomplete Sentences (Grammar/Vocabulary)
       - Single sentence with a blank
       - 4 answer choices (A, B, C, D)
       - Tests grammar, vocabulary, collocations

    2. PART 6 - Text Completion 
       - Short business passage (email, notice, memo) with blank(s)
       - 4 answer choices (A, B, C, D)
       - Tests grammar, vocabulary, reading flow

    3. PART 7 - Reading Comprehension
       - Business passage (notice, email, article, etc.)
       - Multiple choice question about the passage
       - Tests main idea, details, inference, vocabulary in context

    Requirements:
    - Use realistic business/office scenarios
    - Make it appropriate for TOEIC test preparation
    - Focus on practical English usage
    - Include proper business context

    Format the response as JSON with these exact fields:
    {
      "part": "5, 6, or 7",
      "question": "The actual question text or passage",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "explanation": "Brief explanation of why the correct answer is right",
      "questionType": "grammar/vocabulary/text completion/reading comprehension"
    }`;

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content || '{}';
      console.log('AI Response for TOEIC question generation:', response);
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating TOEIC question:', error);
      throw new Error('Failed to generate question');
    }
  }

  static async explainGrammar(question: string, userAnswer: string) {
    const prompt = `Explain the grammar rule for this TOEIC question: "${question}"
    User answered: "${userAnswer}"
    Provide a clear explanation of the correct grammar rule and why the answer is right or wrong.`;

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error explaining grammar:', error);
      throw new Error('Failed to explain grammar');
    }
  }

  static async generateVocabularyExplanation(word: string) {
    try {
      console.log('Using RAG for vocabulary explanation:', word);
      // Use RAG service for enhanced vocabulary explanation
      return await RAGService.explainVocabularyWithRAG(word);
    } catch (error) {
      console.error('RAG vocabulary explanation failed, falling back to basic explanation:', error);
      
      // Fallback to basic explanation if RAG fails
      const prompt = `Provide a TOEIC-focused explanation for the word "${word}":
      - Definition
      - Part of speech
      - Example sentence in business context
      - Common TOEIC usage
      - Related words`;

      try {
        console.log('Sending fallback request to Groq for word:', word);
        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
        });

        console.log('Groq fallback response received');
        return completion.choices[0].message.content;
      } catch (fallbackError) {
        console.error('Detailed Groq error:', fallbackError);
        console.error('Error message:', fallbackError.message);
        console.error('Error status:', fallbackError.status);
        throw new Error('Failed to generate vocabulary explanation');
      }
    }
  }
}