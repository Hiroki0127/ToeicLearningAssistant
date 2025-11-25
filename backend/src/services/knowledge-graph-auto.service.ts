import { PrismaClient } from '@prisma/client';
import { KnowledgeGraphService } from './knowledge-graph.service';

const prisma = new PrismaClient();

export class KnowledgeGraphAutoService {
  /**
   * Auto-create or update a Knowledge Graph node from a flashcard
   */
  static async createNodeFromFlashcard(flashcard: {
    word: string;
    definition: string;
    example: string;
    partOfSpeech: string;
  }) {
    try {
      const wordLower = flashcard.word.toLowerCase().trim();
      
      // Check if node already exists
      let node = await prisma.knowledgeNode.findFirst({
        where: {
          title: { equals: wordLower, mode: 'insensitive' },
        },
      });

      if (!node) {
        // Create new node
        node = await KnowledgeGraphService.createNode({
          type: 'vocabulary',
          title: wordLower,
          description: flashcard.definition,
          content: flashcard.example || flashcard.definition,
        });
        console.log(`✅ Created KG node for: ${wordLower}`);
      } else {
        // Update existing node if definition is more detailed
        if (flashcard.definition.length > (node.description?.length || 0)) {
          await prisma.knowledgeNode.update({
            where: { id: node.id },
            data: {
              description: flashcard.definition,
              content: flashcard.example || flashcard.definition,
            },
          });
          console.log(`📝 Updated KG node for: ${wordLower}`);
        }
      }

      return node;
    } catch (error) {
      console.error(`Error creating KG node from flashcard:`, error);
      return null;
    }
  }

  /**
   * Create relationships based on co-study patterns
   * When users study words together in the same session, create relationships
   */
  static async createRelationshipsFromStudyPattern(
    userId: string,
    flashcardId: string,
    timeWindowMinutes: number = 30
  ) {
    try {
      const flashcard = await prisma.flashcard.findUnique({
        where: { id: flashcardId },
      });

      if (!flashcard) return;

      // Find other flashcards studied by the same user within the time window
      const recentReviews = await prisma.flashcardReview.findMany({
        where: {
          userId,
          reviewedAt: {
            gte: new Date(Date.now() - timeWindowMinutes * 60 * 1000),
          },
          flashcardId: { not: flashcardId },
        },
        include: {
          flashcard: true,
        },
        orderBy: { reviewedAt: 'desc' },
        take: 5, // Limit to recent 5 cards
      });

      if (recentReviews.length === 0) return;

      // Get or create node for current flashcard
      const currentNode = await this.createNodeFromFlashcard(flashcard);
      if (!currentNode) return;

      // Create relationships with recently studied words
      for (const review of recentReviews) {
        const relatedFlashcard = review.flashcard;
        const relatedNode = await this.createNodeFromFlashcard(relatedFlashcard);
        
        if (!relatedNode || currentNode.id === relatedNode.id) continue;

        // Check if relationship already exists
        const existingRel = await prisma.knowledgeRelationship.findFirst({
          where: {
            OR: [
              {
                sourceId: currentNode.id,
                targetId: relatedNode.id,
              },
              {
                sourceId: relatedNode.id,
                targetId: currentNode.id,
              },
            ],
          },
        });

        if (!existingRel) {
          // Determine relationship type based on similarity
          const relationshipType = this.determineRelationshipType(
            flashcard,
            relatedFlashcard
          );
          
          // Calculate strength based on how close in time they were studied
          const timeDiff = Math.abs(
            new Date().getTime() - review.reviewedAt.getTime()
          );
          const strength = Math.max(0.3, 1 - timeDiff / (timeWindowMinutes * 60 * 1000));

          try {
            await KnowledgeGraphService.createRelationship({
              sourceId: currentNode.id,
              targetId: relatedNode.id,
              type: relationshipType,
              strength: strength,
              metadata: JSON.stringify({
                source: 'co_study',
                userId,
                createdAt: new Date().toISOString(),
              }),
            });
            console.log(`🔗 Created KG relationship: ${flashcard.word} → ${relatedFlashcard.word} (${relationshipType})`);
          } catch (relError: any) {
            // Ignore duplicate relationship errors
            if (!relError.message?.includes('Unique constraint')) {
              console.error('Error creating relationship:', relError);
            }
          }
        } else {
          // Strengthen existing relationship if studied together again
          const newStrength = Math.min(1.0, existingRel.strength + 0.1);
          await prisma.knowledgeRelationship.update({
            where: { id: existingRel.id },
            data: { strength: newStrength },
          });
        }
      }
    } catch (error) {
      console.error('Error creating relationships from study pattern:', error);
    }
  }

  /**
   * Determine relationship type based on flashcard similarity
   */
  private static determineRelationshipType(
    card1: { word: string; definition: string; partOfSpeech: string },
    card2: { word: string; definition: string; partOfSpeech: string }
  ): string {
    const def1 = card1.definition.toLowerCase();
    const def2 = card2.definition.toLowerCase();
    const word1 = card1.word.toLowerCase();
    const word2 = card2.word.toLowerCase();

    // Check for synonyms (definitions contain similar words)
    const def1Words = def1.split(/\s+/);
    const def2Words = def2.split(/\s+/);
    const commonWords = def1Words.filter(w => w.length > 3 && def2Words.includes(w));
    
    if (commonWords.length >= 2) {
      return 'synonym';
    }

    // Check if one definition mentions the other word
    if (def1.includes(word2) || def2.includes(word1)) {
      return 'related_to';
    }

    // Check for same part of speech
    if (card1.partOfSpeech === card2.partOfSpeech) {
      return 'same_category';
    }

    // Default: co_studied
    return 'co_studied';
  }

  /**
   * Create relationships based on definition similarity
   * When flashcards have similar definitions, create relationships
   */
  static async createRelationshipsFromSimilarity(flashcardId: string) {
    try {
      const flashcard = await prisma.flashcard.findUnique({
        where: { id: flashcardId },
      });

      if (!flashcard) return;

      const currentNode = await this.createNodeFromFlashcard(flashcard);
      if (!currentNode) return;

      // Find flashcards with similar definitions (simple keyword matching)
      const definitionWords = flashcard.definition
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3); // Only meaningful words

      if (definitionWords.length === 0) return;

      // Find flashcards that share keywords in definition
      const similarFlashcards = await prisma.flashcard.findMany({
        where: {
          id: { not: flashcardId },
          definition: {
            contains: definitionWords[0], // Use first meaningful word
            mode: 'insensitive',
          },
        },
        take: 3,
      });

      for (const similarCard of similarFlashcards) {
        const similarNode = await this.createNodeFromFlashcard(similarCard);
        if (!similarNode || currentNode.id === similarNode.id) continue;

        // Check if relationship exists
        const existingRel = await prisma.knowledgeRelationship.findFirst({
          where: {
            OR: [
              {
                sourceId: currentNode.id,
                targetId: similarNode.id,
              },
              {
                sourceId: similarNode.id,
                targetId: currentNode.id,
              },
            ],
          },
        });

        if (!existingRel) {
          const relationshipType = this.determineRelationshipType(flashcard, similarCard);
          
          try {
            await KnowledgeGraphService.createRelationship({
              sourceId: currentNode.id,
              targetId: similarNode.id,
              type: relationshipType,
              strength: 0.5, // Medium strength for similarity-based relationships
              metadata: JSON.stringify({
                source: 'definition_similarity',
                createdAt: new Date().toISOString(),
              }),
            });
            console.log(`🔗 Created similarity relationship: ${flashcard.word} → ${similarCard.word}`);
          } catch (relError: any) {
            if (!relError.message?.includes('Unique constraint')) {
              console.error('Error creating similarity relationship:', relError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error creating relationships from similarity:', error);
    }
  }
}

