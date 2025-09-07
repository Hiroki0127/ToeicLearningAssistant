import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  static async generateTOEICQuestion(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    const prompt = `Generate a TOEIC-style multiple choice question about ${topic} with difficulty level ${difficulty}. 
    Include 4 answer choices (A, B, C, D) with only one correct answer. 
    Format the response as JSON with: question, options (array), correctAnswer, explanation.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
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
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
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
    const prompt = `Provide a TOEIC-focused explanation for the word "${word}":
    - Definition
    - Part of speech
    - Example sentence in business context
    - Common TOEIC usage
    - Related words`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating vocabulary explanation:', error);
      throw new Error('Failed to generate vocabulary explanation');
    }
  }
}
