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

  // Initialize vector database with existing flashcards
  static async initializeVectorDB() {
    try {
      const flashcards = await prisma.flashcard.findMany({
        select: {
          id: true,
          word: true,
          definition: true,
          example: true,
          partOfSpeech: true,
        },
      });

      if (flashcards.length === 0) {
        console.log('No flashcards found for RAG initialization');
        return;
      }

      // Generate embeddings for all flashcards
      await this.generateEmbeddings(
        flashcards.map((card: { word: string; definition: string; example: string }) => `${card.word}: ${card.definition} ${card.example}`)
      );

      // Skip FAISS for now - use simple text matching instead
      console.log('Using simple text matching instead of FAISS');
      this.flashcardData = flashcards;

      console.log(`RAG initialized with ${flashcards.length} flashcards`);
    } catch (error) {
      console.error('Error initializing RAG:', error);
    }
  }

  // Generate embeddings using simple hash-based method (Groq doesn't have embeddings)
  private static async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      // Use simple hash-based embedding since Groq doesn't have embedding models
      embeddings.push(this.simpleEmbedding(text));
    }
    
    return embeddings;
  }

  // Simple fallback embedding (hash-based)
  private static simpleEmbedding(text: string): number[] {
    const hash = this.simpleHash(text);
    const embedding = new Array(384).fill(0);
    for (let i = 0; i < Math.min(hash.length, 384); i++) {
      embedding[i] = (hash.charCodeAt(i) - 128) / 128;
    }
    return embedding;
  }

  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  // Retrieve relevant flashcards for a query using simple text matching
  static async retrieveRelevantContext(query: string, topK: number = 3): Promise<any[]> {
    if (this.flashcardData.length === 0) {
      await this.initializeVectorDB();
    }

    try {
      // Simple text matching - find flashcards with similar words
      const queryLower = query.toLowerCase();
      const relevantCards = this.flashcardData.filter(card => 
        card.word.toLowerCase().includes(queryLower) ||
        card.definition.toLowerCase().includes(queryLower) ||
        queryLower.includes(card.word.toLowerCase())
      );

      // If no matches found, return first few flashcards
      if (relevantCards.length === 0) {
        console.log('No matching flashcards found, returning first few as context');
        return this.flashcardData.slice(0, topK);
      }

      console.log(`Found ${relevantCards.length} relevant flashcards for query: ${query}`);
      return relevantCards.slice(0, topK);
    } catch (error) {
      console.error('Error retrieving context:', error);
      // Fallback: return first few flashcards
      return this.flashcardData.slice(0, topK);
    }
  }

  // Enhanced vocabulary explanation with RAG
  static async explainVocabularyWithRAG(word: string): Promise<string> {
    try {
      // Retrieve relevant context
      const relevantCards = await this.retrieveRelevantContext(word, 3);
      
      // Build context string
      let context = '';
      if (relevantCards.length > 0) {
        context = '\n\nRelevant flashcards from your collection:\n';
        relevantCards.forEach((card, index) => {
          context += `${index + 1}. ${card.word}: ${card.definition}\n`;
          if (card.example) context += `   Example: ${card.example}\n`;
        });
      }

      const prompt = `Provide a TOEIC-focused explanation for the word "${word}":
      - Definition (use the exact definition from the flashcards if available)
      - Part of speech
      - Example sentence in business context (use the exact example from the flashcards if available)
      - Common TOEIC usage
      - Related words
      
      IMPORTANT: If flashcards are provided below, use their exact definitions and examples in your response.
      ${context}`;

      const groq = getGroqClient();
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      });

      return completion.choices[0]?.message?.content || 'Sorry, I could not process your request.';
    } catch (error) {
      console.error('Error in RAG vocabulary explanation:', error);
      throw new Error('Failed to generate vocabulary explanation');
    }
  }
}
