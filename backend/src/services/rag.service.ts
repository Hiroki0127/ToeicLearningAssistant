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
               queryLower.includes('part 5') && (question.quizType === 'grammar' || question.quizType === 'vocabulary' || question.quizType === 'part5') ||
               queryLower.includes('part 6') && (question.quizType === 'reading' || question.quizType === 'part6') ||
               queryLower.includes('part 7') && (question.quizType === 'reading' || question.quizType === 'part7') ||
               queryLower.includes('vocabulary') && question.quizType === 'vocabulary' ||
               queryLower.includes('grammar') && question.quizType === 'grammar' ||
               queryLower.includes('reading') && question.quizType === 'reading';
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

      const prompt = `You are a TOEIC expert with 10+ years of experience teaching TOEIC preparation. Provide a comprehensive explanation for the word "${word}" based on the official TOEIC database below.

**TOEIC Exam Context:**
- TOEIC Reading: 100 questions, 75 minutes, Parts 5-7
- Part 5: 30 questions, incomplete sentences, grammar/vocabulary focus
- Business English emphasis throughout all sections
- Scoring: 5-495 points per section, 10-990 total

**Requirements:**
- Use EXACT definitions and examples from the official TOEIC database when available
- Focus on business/workplace contexts typical in TOEIC exams
- Include part of speech, difficulty level, and common TOEIC usage patterns
- Reference specific TOEIC question patterns where this word appears
- Provide TOEIC-specific memory tips and test-taking strategies
- Mention which TOEIC parts commonly test this word

**Official TOEIC Database Context:**
${contextString}

**Format your response as:**
**Word: [WORD]**
**TOEIC Definition:** [business-focused definition from database]
**Part of Speech:** [noun/verb/adjective/etc]
**TOEIC Context:** [how it appears in official TOEIC exams]
**Business Usage:** [workplace examples from database]
**TOEIC Tips:** [specific advice for TOEIC test-takers]
**Related TOEIC Vocabulary:** [other business words tested together]`;

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
      // Convert topic to lowercase for matching
      const queryLower = topic.toLowerCase();
      
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

      // Determine the part based on the topic
      let targetPart = "5";
      if (queryLower.includes('part 6') || queryLower.includes('text completion')) {
        targetPart = "6";
      } else if (queryLower.includes('part 7') || queryLower.includes('reading comprehension')) {
        targetPart = "7";
      } else if (queryLower.includes('part 5') || queryLower.includes('grammar') || queryLower.includes('vocabulary')) {
        targetPart = "5";
      }

      const prompt = `You are a TOEIC test expert with access to official TOEIC sample questions. Generate a practice question for TOEIC Part ${targetPart} based on the topic "${topic}" at ${difficulty} difficulty.

**Official TOEIC Exam Structure:**
- Part 5: 30 questions, incomplete sentences, grammar/vocabulary (15 minutes recommended)
- Part 6: 16 questions, text completion, business documents (10 minutes recommended)  
- Part 7: 54 questions, reading comprehension, business texts (50 minutes recommended)
- Total Reading: 100 questions, 75 minutes
- Business English focus throughout all sections

**Requirements:**
- Generate a question specifically for TOEIC Part ${targetPart}
- Follow the EXACT format and style of official TOEIC questions
- Use authentic business/TOEIC vocabulary and contexts
- Match the difficulty level (${difficulty})
- Include proper TOEIC-style explanations
- Reference official TOEIC question patterns when available
- For Part 6: Always use question numbers 1, 2, 3, 4 for each individual set

**Official TOEIC Question Patterns:**
${contextString}

**Generate a TOEIC Part ${targetPart} question. Return as JSON:**

${targetPart === "5" ? `{
  "part": "5",
  "question": "Complete the sentence with the best option",
  "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
  "correctAnswer": "A",
  "explanation": "Detailed explanation following TOEIC style",
  "questionType": "grammar"
}` : targetPart === "6" ? `{
  "part": "6",
  "passage": "To: All Department Heads\\nFrom: HR Manager\\nSubject: New Employee Orientation\\n\\nDear Team,\\n\\nWe are pleased to announce that our new employee orientation program will begin _____ next Monday. All new hires will participate in a comprehensive training session that covers company policies, procedures, and culture. The program is designed to help new employees _____ quickly into their roles and understand our expectations. _____ , we will provide them with mentors from their respective departments to ensure a smooth transition. We encourage all department heads to _____ their new team members during this important period.\\n\\nThank you for your cooperation.\\n\\nBest regards,\\nHR Team",
  "questions": [
    {
      "number": 1,
      "question": "The new employee orientation program will begin _____ next Monday.",
      "options": ["A) in", "B) on", "C) at", "D) by"],
      "correctAnswer": "B"
    },
    {
      "number": 2,
      "question": "The program is designed to help new employees _____ quickly into their roles.",
      "options": ["A) settle", "B) move", "C) work", "D) start"],
      "correctAnswer": "A"
    },
    {
      "number": 3,
      "question": "_____ , we will provide them with mentors from their respective departments.",
      "options": ["A) However", "B) Additionally", "C) Therefore", "D) Instead"],
      "correctAnswer": "B"
    },
    {
      "number": 4,
      "question": "We encourage all department heads to _____ their new team members.",
      "options": ["A) support", "B) manage", "C) train", "D) evaluate"],
      "correctAnswer": "A"
    }
  ],
  "explanation": "Part 6 tests text completion in business documents with 4 questions based on a single passage. Each Part 6 set uses questions 1-4.",
  "questionType": "text completion"
}` : `{
  "part": "7",
  "passage": "Business reading passage (email, article, advertisement)",
  "questions": [
    {
      "number": 153,
      "question": "What is the main purpose of this passage?",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correctAnswer": "A"
    }
  ],
  "explanation": "Part 7 tests reading comprehension of business texts",
  "questionType": "reading comprehension"
}`}`;

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

      // Fallback: return structured response based on target part
      if (targetPart === "6") {
        return {
          part: "6",
          passage: "MEMORANDUM\\n\\nTO: All Staff\\nFROM: Management\\nSUBJECT: Office Policy Update\\n\\nDear Team,\\n\\nWe are writing to inform you about important changes to our office policies that will take effect _____ next month. These updates are designed to improve workplace efficiency and ensure better communication across all departments.\\n\\nThe new policies include updated guidelines for remote work, revised meeting protocols, and enhanced security measures. All employees are required to _____ the new policy handbook by the end of this week. _____ , we will be conducting training sessions to help everyone understand these changes.\\n\\nPlease direct any questions to your immediate supervisor or the HR department. We appreciate your cooperation as we implement these improvements.\\n\\nBest regards,\\nManagement Team",
          questions: [
            {
              number: 131,
              question: "These updates will take effect _____ next month.",
              options: ["A) in", "B) on", "C) at", "D) by"],
              correctAnswer: "A"
            },
            {
              number: 132,
              question: "All employees are required to _____ the new policy handbook.",
              options: ["A) read", "B) write", "C) sign", "D) copy"],
              correctAnswer: "A"
            },
            {
              number: 133,
              question: "_____ , we will be conducting training sessions.",
              options: ["A) However", "B) Additionally", "C) Therefore", "D) Instead"],
              correctAnswer: "B"
            },
            {
              number: 134,
              question: "Please direct any questions to your immediate supervisor or the HR department.",
              options: ["A) send", "B) give", "C) ask", "D) tell"],
              correctAnswer: "A"
            }
          ],
          explanation: "Part 6 tests text completion in business documents with 4 questions based on a single passage. Each Part 6 set uses questions 1-4.",
          questionType: "text completion"
        };
      } else if (targetPart === "7") {
        return {
          part: "7",
          passage: "Business reading passage for comprehension",
          questions: [{
            number: 153,
            question: "What is the main purpose of this passage?",
            options: ["A) Option A", "B) Option B", "C) Option C", "D) Option D"],
            correctAnswer: "A"
          }],
          explanation: "Part 7 tests reading comprehension of business texts",
          questionType: "reading comprehension"
        };
      } else {
        return {
          part: "5",
          question: response,
          options: ["A) Option A", "B) Option B", "C) Option C", "D) Option D"],
          correctAnswer: "A",
          explanation: "Based on TOEIC patterns from the database",
          questionType: "grammar"
        };
      }
    } catch (error) {
      console.error('Error in RAG question generation:', error);
      throw new Error('Failed to generate TOEIC question');
    }
  }
}
