import { RAGService } from './rag.service';

// Initialize Groq client only if API key is available
const getGroqClient = () => {
  const apiKey = process.env['GROQ_API_KEY'];
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }
  // Dynamic import to avoid loading Groq SDK at module load time
  const { default: Groq } = require('groq-sdk');
  return new Groq({ apiKey });
};

export class AIService {

  static async generateTOEICQuestion(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    try {
      // Use enhanced RAG to generate questions based on real TOEIC patterns
      return await RAGService.generateTOEICQuestionWithRAG(topic, difficulty);
    } catch (error) {
      console.error('Error generating TOEIC question with RAG:', error);
      
      // Fallback to original method if RAG fails
      try {
        const prompt = `Generate a unique TOEIC Reading question specifically about "${topic}" at ${difficulty} difficulty level.

AUTOMATIC PART SELECTION:
- If topic is about GRAMMAR/VOCABULARY (prepositions, verb tenses, adjectives, etc.) → Generate Part 5 (Incomplete Sentences)
- If topic is about BUSINESS COMMUNICATION (emails, memos, letters, documents) → Generate Part 6 (Text Completion) 
- If topic is about BUSINESS CONTENT (company news, services, procedures, advertisements) → Generate Part 7 (Reading Comprehension)

Based on the topic "${topic}", determine the most appropriate part and generate accordingly:

FOR PART 5 (Grammar/Vocabulary topics):
Return ONLY this exact JSON format:
{
  "part": "5",
  "question": "The marketing team has been working _____ to launch the new product by next month.",
  "options": ["diligent", "diligently", "diligence", "diligentness"],
  "correctAnswer": "B",
  "explanation": "The blank requires an adverb to modify 'working'. 'Diligently' is the correct adverb form.",
  "questionType": "grammar"
}

FOR PART 6 (Business Communication topics):
Generate a realistic business document (email, memo, letter) with 4 blanks to fill in. Use this format:

{
  "part": "6",
  "passage": "BUSINESS DOCUMENT HEADER\\n\\n[Realistic business content with 4 strategic blanks placed throughout the text. Use authentic business language, proper formatting, and realistic scenarios like office announcements, project updates, customer communications, or policy changes.]",
  "questions": [
    {
      "number": 1,
      "question": "First blank question with context from the passage",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correctAnswer": "A"
    },
    {
      "number": 2,
      "question": "Second blank question with context from the passage", 
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correctAnswer": "B"
    },
    {
      "number": 3,
      "question": "Third blank question with context from the passage",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correctAnswer": "C"
    },
    {
      "number": 4,
      "question": "Fourth blank question with context from the passage",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correctAnswer": "D"
    }
  ],
  "explanation": "Complete the blanks in the business document above.",
  "questionType": "text completion"
}

IMPORTANT: Create realistic business documents like:
- Company memos about policy changes
- Emails about meetings or projects  
- Letters to customers or suppliers
- Office announcements
- Training notifications
- Product updates

Use authentic business language and proper document formatting!

CRITICAL: Always use question numbers 1, 2, 3, 4 for each Part 6 set - start fresh for each new passage!

FOR PART 7 (Business Content topics):
Return ONLY this exact JSON format:
{
  "part": "7",
  "passage": "Are you setting up a small business? Worried about the costs of renting office space?\\n\\nRebus Virtual Office World can help you. With our Basic Office Deal, we can set up a virtual office for you practically overnight.",
  "questions": [
    {
      "number": 161,
      "question": "Where is the text from?",
      "options": ["A message from a business to a current client", "An advertisement for a new business service", "An email from one business worker to another", "A newspaper article about a new business's success"],
      "correctAnswer": "B"
    },
    {
      "number": 162,
      "question": "What does the service provide?",
      "options": ["Off-site staff to perform general office duties", "A site where several businesses can locate their offices", "Advice on how to make your business more professional", "Temporary staff for local businesses"],
      "correctAnswer": "A"
    }
  ],
  "explanation": "Part 7 tests reading comprehension of business texts.",
  "questionType": "reading comprehension"
}

CRITICAL: Use ONLY the exact JSON format shown above. Do not add extra fields or nested objects.`;

      const groq = getGroqClient();
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, // Increased for more creativity and variety
        max_tokens: 800, // Increased to allow for more detailed questions
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      console.log('AI Response:', responseText);

      // Simple JSON extnext saction
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd <= jsonStart) {
        throw new Error('No valid JSON found in response');
      }
      
      const jsonString = responseText.substring(jsonStart, jsonEnd);
      const questionObj = JSON.parse(jsonString);
      
      // Validate and ensure answer consistency
      if (questionObj.options && questionObj.correctAnswer && questionObj.explanation) {
        const correctIndex = ['A', 'B', 'C', 'D'].indexOf(questionObj.correctAnswer);
        
        // Basic validation - ensure the correct answer index is valid
        if (correctIndex >= 0 && correctIndex < questionObj.options.length) {
          const currentAnswer = questionObj.options[correctIndex];
          console.log('Answer validation passed:', questionObj.correctAnswer, 'for option:', currentAnswer);
        } else {
          console.warn('Invalid correct answer index, defaulting to A');
          questionObj.correctAnswer = 'A';
        }
        
        // Ensure we have the required fields
        if (!questionObj.question || !questionObj.options || !questionObj.explanation) {
          throw new Error('Generated question is missing required fields');
        }
        
        console.log('Generated unique question for topic:', topic);
      }
      
        console.log('Successfully generated question:', questionObj);
        return questionObj;
      } catch (fallbackError) {
        console.error('Error in fallback question generation:', fallbackError);
        const errorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        throw new Error(`Failed to generate TOEIC question: ${errorMessage}`);
      }
    }
  }


  static async explainGrammar(question: string, userAnswer: string) {
    const prompt = `Explain the grammar rule for this TOEIC question: "${question}"
    User answered: "${userAnswer}"
    Provide a clear explanation of the correct grammar rule and why the answer is right or wrong.`;

    try {
      const groq = getGroqClient();
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      return completion.choices[0]?.message?.content || 'Unable to explain grammar';
    } catch (error) {
      console.error('Error explaining grammar:', error);
      throw new Error('Failed to explain grammar');
    }
  }

  static async generateTOEICPart6(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    try {
      console.log(`Generating TOEIC Part 6 question for topic: ${topic}, difficulty: ${difficulty}`);
      
      const prompt = `Generate a unique TOEIC Part 6 Text Completion question specifically about "${topic}" at ${difficulty} difficulty level.

TOEIC Part 6 Format: Read the text that follows. A word, phrase, or sentence is missing in parts of the text. Four answer choices for each question are given below the text.

Create an authentic TOEIC-style business email or document with 2-4 blanks that test "${topic}". Examples:
- Business emails with missing words/phrases
- Company memos with text completion
- Professional letters with missing transitions or details

Requirements:
- Business email, memo, or document format
- 2-4 blanks in the text (using _____)
- Focused on "${topic}" knowledge
- ${difficulty} difficulty level
- Realistic business context with proper names and scenarios
- Multiple questions with 4 plausible options each

Return ONLY this exact JSON format:
{
  "part": "6",
  "passage": "To: All Staff\\nFrom: Sarah Chen\\nSubject: Office Renovation\\n\\nDear Team,\\n\\nWe are pleased to announce that our office renovation will begin _____ next month. The construction team has assured us that the work will be completed _____ six weeks.",
  "questions": [
    {
      "number": 1,
      "question": "The renovation will begin _____ next month.",
      "options": ["in", "on", "at", "by"],
      "correctAnswer": "A"
    },
    {
      "number": 2,
      "question": "The work will be completed _____ six weeks.",
      "options": ["within", "during", "while", "since"],
      "correctAnswer": "A"
    }
  ],
  "explanation": "Part 6 tests text completion in business documents.",
  "questionType": "text completion"
}

CRITICAL RULES:
1. Create realistic business email/memo/document format
2. Include 2-4 blanks (_____) in the passage
3. Each question must have 4 plausible options
4. correctAnswer must match the position of the correct option
5. Focus specifically on "${topic}" knowledge
6. Use authentic business contexts and professional tone`;

      const groq = getGroqClient();
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      console.log('AI Response:', responseText);

      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd <= jsonStart) {
        throw new Error('No valid JSON found in response');
      }
      
      const jsonString = responseText.substring(jsonStart, jsonEnd);
      const questionObj = JSON.parse(jsonString);
      
      console.log('Successfully generated Part 6 question:', questionObj);
      return questionObj;

    } catch (error) {
      console.error('Error generating TOEIC Part 6 question:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate TOEIC Part 6 question: ${errorMessage}`);
    }
  }

  static async generateTOEICPart7(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    try {
      console.log(`Generating TOEIC Part 7 question for topic: ${topic}, difficulty: ${difficulty}`);
      
      const prompt = `Generate a unique TOEIC Part 7 Reading Comprehension question specifically about "${topic}" at ${difficulty} difficulty level.

TOEIC Part 7 Format: Read a selection of texts (advertisements, emails, articles, notices). Each text is followed by several questions. Select the best answer for each question.

Create an authentic TOEIC-style reading passage that relates to "${topic}". Examples:
- Product/service advertisements
- Business emails
- Company notices
- News articles
- Event announcements
- Business service promotions
- Office rental advertisements

Requirements:
- Realistic business/professional text format (can be longer, detailed explanations)
- 2-4 comprehension questions about the text
- Focused on "${topic}" context
- ${difficulty} difficulty level
- Authentic business scenarios and vocabulary
- Include specific details like timeframes, processes, conditions, and step-by-step information
- Questions that test reading comprehension, inference, detail recognition, and sequence understanding

Return ONLY this exact JSON format:
{
  "part": "7",
  "passage": "Are you setting up a small business? Worried about the costs of renting office space?\\n\\nRebus Virtual Office World can help you. With our Basic Office Deal, we can set up a virtual office for you practically overnight.",
  "questions": [
    {
      "number": 161,
      "question": "Where is the text from?",
      "options": ["A message from a business to a current client", "An advertisement for a new business service", "An email from one business worker to another", "A newspaper article about a new business's success"],
      "correctAnswer": "B"
    },
    {
      "number": 162,
      "question": "What does the service provide?",
      "options": ["Off-site staff to perform general office duties", "A site where several businesses can locate their offices", "Advice on how to make your business more professional", "Temporary staff for local businesses"],
      "correctAnswer": "A"
    }
  ],
  "explanation": "Part 7 tests reading comprehension of business texts.",
  "questionType": "reading comprehension"
}

CRITICAL RULES:
1. Create realistic business text (advertisement, email, notice, article)
2. Include 2-4 comprehension questions with varied types:
   - Text type identification ("Where is the text from?" / "What type of document is this?")
   - Main purpose/feature questions ("What does the service provide?" / "What is the main purpose?" / "What is the purpose of...?")
   - Detail recognition questions ("What is indicated about...")
   - Negative detail questions ("What is NOT included?" / "Which of the following is NOT stated?" / "do NOT need to")
   - Inference questions ("What is suggested about..." / "What can be inferred from the passage?")
   - Sequence/timing questions ("Once... they will soon receive" / "What happens after...")
   - Sentence insertion questions ("In which position does this sentence best belong?")
3. Each question must have 4 plausible options
4. correctAnswer must match the position of the correct option
5. Focus specifically on "${topic}" context
6. Use authentic business scenarios and professional vocabulary
7. Include numbered positions [1], [2], [3], [4] in passage for sentence insertion questions`;

      const groq = getGroqClient();
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1200,
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      console.log('AI Response:', responseText);

      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd <= jsonStart) {
        throw new Error('No valid JSON found in response');
      }
      
      const jsonString = responseText.substring(jsonStart, jsonEnd);
      const questionObj = JSON.parse(jsonString);
      
      console.log('Successfully generated Part 7 question:', questionObj);
      return questionObj;

    } catch (error) {
      console.error('Error generating TOEIC Part 7 question:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate TOEIC Part 7 question: ${errorMessage}`);
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
      const prompt = `Provide a concise TOEIC-focused explanation for the word "${word}" in 2-3 sentences:
      - Brief definition
      - Part of speech
      - One example sentence in business context`;

      try {
        console.log('Sending fallback request to Groq for word:', word);
        const groq = getGroqClient();
        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 150, // Limit response length for conciseness
        });

        console.log('Groq fallback response received');
        return completion.choices[0]?.message?.content || 'Unable to generate vocabulary explanation';
      } catch (fallbackError) {
        console.error('Detailed Groq error:', fallbackError);
        const errorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        const errorStatus = (fallbackError as any)?.status || 'unknown';
        console.error('Error message:', errorMessage);
        console.error('Error status:', errorStatus);
        throw new Error('Failed to generate vocabulary explanation');
      }
    }
  }
}