import { PrismaClient } from '@prisma/client';
import { Groq } from 'groq-sdk';
import * as faiss from 'faiss-node';

const prisma = new PrismaClient();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export class RAGService {
  private static index: any = null;
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
          category: true,
          tags: true,
        },
      });

      if (flashcards.length === 0) {
        console.log('No flashcards found for RAG initialization');
        return;
      }

      // Generate embeddings for all flashcards
      const embeddings = await this.generateEmbeddings(
        flashcards.map(card => `${card.word}: ${card.definition} ${card.example}`)
      );

      // Create FAISS index
      this.index = new faiss.IndexFlatL2(embeddings[0].length);
      this.index.add(embeddings);
      this.flashcardData = flashcards;

      console.log(`RAG initialized with ${flashcards.length} flashcards`);
    } catch (error) {
      console.error('Error initializing RAG:', error);
    }
  }

  // Generate embeddings using Groq
  private static async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      try {
        const response = await groq.embeddings.create({
          model: "text-embedding-3-small",
          input: text,
        });
        embeddings.push(response.data[0].embedding);
      } catch (error) {
        console.error('Error generating embedding:', error);
        // Fallback to simple hash-based embedding
        embeddings.push(this.simpleEmbedding(text));
      }
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

  // Retrieve relevant flashcards for a query
  static async retrieveRelevantContext(query: string, topK: number = 3): Promise<any[]> {
    if (!this.index || this.flashcardData.length === 0) {
      await this.initializeVectorDB();
    }

    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbeddings([query]);
      
      // Search for similar flashcards
      const { distances, labels } = this.index.search(queryEmbedding[0], topK);
      
      // Return relevant flashcards
      return labels.map((label: number) => this.flashcardData[label]);
    } catch (error) {
      console.error('Error retrieving context:', error);
      return [];
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
      - Definition
      - Part of speech
      - Example sentence in business context
      - Common TOEIC usage
      - Related words
      ${context}`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      });

      return completion.choices[0].message.content || 'Sorry, I could not process your request.';
    } catch (error) {
      console.error('Error in RAG vocabulary explanation:', error);
      throw new Error('Failed to generate vocabulary explanation');
    }
  }
}
