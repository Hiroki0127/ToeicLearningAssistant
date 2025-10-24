import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Groq client only if API key is available
const getGroqClient = () => {
  const apiKey = process.env['GROQ_API_KEY'];
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }
  // Dynamic import to avoid loading Groq SDK at module load time
  const { Groq } = require('groq-sdk');
  return new Groq({ apiKey });
};

export class RAGService {
  private static flashcardData: any[] = [];
  private static quizData: any[] = [];
  private static questionData: any[] = [];

  // Initialize vector database with all TOEIC data
  static async initializeVectorDB() {
    try {
      // Get flashcards
      const flashcards = await prisma.flashcard.findMany({
        select: {
          id: true,
          word: true,
          definition: true,
          example: true,
          partOfSpeech: true,
          difficulty: true,
        },
      });

      // Get quizzes and their questions
      const quizzes = await prisma.quiz.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          difficulty: true,
          questions: true,
        },
      });

      // Parse quiz questions
      const allQuestions: any[] = [];
      quizzes.forEach(quiz => {
        try {
          const questions = JSON.parse(quiz.questions);
          questions.forEach((q: any) => {
            allQuestions.push({
              ...q,
              quizTitle: quiz.title,
              quizType: quiz.type,
              quizDifficulty: quiz.difficulty,
            });
          });
        } catch (e) {
          console.log('Error parsing quiz questions:', e);
        }
      });

      if (flashcards.length === 0 && allQuestions.length === 0) {
        console.log('No TOEIC data found for RAG initialization');
        console.log('Flashcards found:', flashcards.length);
        console.log('Questions found:', allQuestions.length);
        return;
      }

      // Store data for retrieval
      this.flashcardData = flashcards;
      this.quizData = quizzes;
      this.questionData = allQuestions;

      console.log(`RAG initialized with:`);
      console.log(`  - ${flashcards.length} flashcards`);
      console.log(`  - ${quizzes.length} quizzes`);
      console.log(`  - ${allQuestions.length} practice questions`);
    } catch (error) {
      console.error('Error initializing RAG:', error);
    }
  }


  // Retrieve relevant TOEIC data for a query using enhanced text matching
  static async retrieveRelevantContext(query: string, topK: number = 5): Promise<{
    flashcards: any[];
    questions: any[];
    quizzes: any[];
  }> {
    if (this.flashcardData.length === 0 && this.questionData.length === 0) {
      await this.initializeVectorDB();
    }

    try {
      const queryLower = query.toLowerCase();
      
      // Find relevant flashcards
      const relevantCards = this.flashcardData.filter(card => 
        card.word.toLowerCase().includes(queryLower) ||
        card.definition.toLowerCase().includes(queryLower) ||
        queryLower.includes(card.word.toLowerCase()) ||
        card.example.toLowerCase().includes(queryLower)
      );

      // Find relevant questions based on content, type, and difficulty
      const relevantQuestions = this.questionData.filter(question => {
        const questionText = question.question?.toLowerCase() || '';
        const explanation = question.explanation?.toLowerCase() || '';
        const correctAnswer = question.correctAnswer?.toLowerCase() || '';
        
        return questionText.includes(queryLower) ||
               explanation.includes(queryLower) ||
               correctAnswer.includes(queryLower) ||
               queryLower.includes('part 5') && question.quizType === 'grammar' ||
               queryLower.includes('part 6') && question.quizType === 'reading' ||
               queryLower.includes('part 7') && question.quizType === 'reading' ||
               queryLower.includes('vocabulary') && question.quizType === 'vocabulary' ||
               queryLower.includes('grammar') && question.quizType === 'grammar';
      });

      // Find relevant quizzes
      const relevantQuizzes = this.quizData.filter(quiz => 
        quiz.title.toLowerCase().includes(queryLower) ||
        quiz.description.toLowerCase().includes(queryLower) ||
        quiz.type.toLowerCase().includes(queryLower)
      );

      console.log(`Found relevant TOEIC data for query: ${query}`);
      console.log(`  - ${relevantCards.length} flashcards`);
      console.log(`  - ${relevantQuestions.length} questions`);
      console.log(`  - ${relevantQuizzes.length} quizzes`);

      return {
        flashcards: relevantCards.slice(0, Math.min(3, topK)),
        questions: relevantQuestions.slice(0, Math.min(3, topK)),
        quizzes: relevantQuizzes.slice(0, Math.min(2, topK))
      };
    } catch (error) {
      console.error('Error retrieving context:', error);
      // Fallback: return first few items
      return {
        flashcards: this.flashcardData.slice(0, 2),
        questions: this.questionData.slice(0, 2),
        quizzes: this.quizData.slice(0, 1)
      };
    }
  }

  // Enhanced vocabulary explanation with comprehensive RAG
  static async explainVocabularyWithRAG(word: string): Promise<string> {
    try {
      console.log(`RAG: Explaining vocabulary for word: ${word}`);
      console.log(`RAG: Flashcard data available: ${this.flashcardData.length}`);
      console.log(`RAG: Question data available: ${this.questionData.length}`);
      
      // Retrieve relevant context from all TOEIC data
      const context = await this.retrieveRelevantContext(word, 5);
      
      console.log(`RAG: Retrieved context - flashcards: ${context.flashcards.length}, questions: ${context.questions.length}`);
      
      // Build comprehensive context string
      let contextString = '';
      
      if (context.flashcards.length > 0) {
        contextString += '\n\n**Relevant Vocabulary from TOEIC Database:**\n';
        context.flashcards.forEach((card, index) => {
          contextString += `${index + 1}. **${card.word}**: ${card.definition}\n`;
          if (card.example) contextString += `   Example: ${card.example}\n`;
          contextString += `   Part of Speech: ${card.partOfSpeech}, Difficulty: ${card.difficulty}\n\n`;
        });
      }

      if (context.questions.length > 0) {
        contextString += '\n**Related TOEIC Practice Questions:**\n';
        context.questions.slice(0, 2).forEach((question, index) => {
          contextString += `${index + 1}. ${question.question}\n`;
          contextString += `   Answer: ${question.correctAnswer}\n`;
          contextString += `   Explanation: ${question.explanation}\n\n`;
        });
      }

      const prompt = `You are a TOEIC expert. Provide a comprehensive explanation for the word "${word}" based on the TOEIC database below.

**Requirements:**
- Use EXACT definitions and examples from the database when available
- Focus on business/TOEIC contexts
- Include part of speech, difficulty level, and common usage patterns
- Reference related practice questions if relevant
- Provide TOEIC-specific tips for remembering the word

**TOEIC Database Context:**
${contextString}

**Format your response as:**
**Word: [WORD]**
**Definition:** [exact definition from database]
**Part of Speech:** [noun/verb/adjective/etc]
**Business Context:** [how it's used in TOEIC/business]
**Example:** [exact example from database]
**TOEIC Tips:** [specific advice for TOEIC test-takers]
**Related Words:** [similar business vocabulary]`;

      const groq = getGroqClient();
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, // Lower temperature for more consistent, factual responses
      });

      return completion.choices[0]?.message?.content || 'Sorry, I could not process your request.';
    } catch (error) {
      console.error('Error in RAG vocabulary explanation:', error);
      throw new Error('Failed to generate vocabulary explanation');
    }
  }

  // Generate TOEIC practice questions using real question patterns
  static async generateTOEICQuestionWithRAG(topic: string, difficulty: string = 'medium'): Promise<any> {
    try {
      // Retrieve relevant questions and patterns
      const context = await this.retrieveRelevantContext(topic, 5);
      
      // Build context with real TOEIC question patterns
      let contextString = '';
      
      if (context.questions.length > 0) {
        contextString += '\n**Real TOEIC Question Patterns from Database:**\n';
        context.questions.forEach((question, index) => {
          contextString += `${index + 1}. **${question.quizType.toUpperCase()}** (${question.quizDifficulty}):\n`;
          contextString += `   Question: ${question.question}\n`;
          contextString += `   Options: ${question.options?.join(', ') || 'N/A'}\n`;
          contextString += `   Answer: ${question.correctAnswer}\n`;
          contextString += `   Explanation: ${question.explanation}\n\n`;
        });
      }

      if (context.quizzes.length > 0) {
        contextString += '\n**Related Quiz Categories:**\n';
        context.quizzes.forEach((quiz, index) => {
          contextString += `${index + 1}. ${quiz.title} (${quiz.type}, ${quiz.difficulty})\n`;
          contextString += `   Description: ${quiz.description}\n\n`;
        });
      }

      const prompt = `You are a TOEIC test expert. Generate a practice question based on the real TOEIC patterns below.

**Topic:** ${topic}
**Difficulty:** ${difficulty}

**Requirements:**
- Follow the EXACT format and style of real TOEIC questions from the database
- Use similar vocabulary and business contexts
- Match the difficulty level and question type patterns
- Include proper explanations like the real questions

**Real TOEIC Question Patterns:**
${contextString}

**Generate a question that follows these patterns. Return as JSON:**
{
  "part": "5",
  "question": "Complete the sentence with the best option",
  "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
  "correctAnswer": "A",
  "explanation": "Detailed explanation following TOEIC style",
  "questionType": "grammar|vocabulary|reading"
}`;

      const groq = getGroqClient();
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Try to parse JSON response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.log('Could not parse JSON, returning structured response');
      }

      // Fallback: return structured response
      return {
        part: "5",
        question: response,
        options: ["A) Option A", "B) Option B", "C) Option C", "D) Option D"],
        correctAnswer: "A",
        explanation: "Based on TOEIC patterns from the database",
        questionType: "grammar"
      };
    } catch (error) {
      console.error('Error in RAG question generation:', error);
      throw new Error('Failed to generate TOEIC question');
    }
  }
}
