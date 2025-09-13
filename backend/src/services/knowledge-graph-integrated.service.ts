import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class KnowledgeGraphIntegrated {
  
  /**
   * CORE QUERY 1: Find Related Concepts
   * Enhanced version with flashcard integration
   */
  static async findRelatedConcepts(word: string, options: {
    maxDepth?: number;
    limit?: number;
    includeFlashcards?: boolean;
  } = {}) {
    const { maxDepth = 1, limit = 10, includeFlashcards = true } = options;
    
    console.log(`🔍 Finding related concepts for: "${word}"`);
    
    // Find the starting concept
    const startNode = await prisma.knowledgeNode.findFirst({
      where: {
        OR: [
          { title: { contains: word } },
          { description: { contains: word } },
        ],
      },
    });

    if (!startNode) {
      console.log(`❌ Concept "${word}" not found in knowledge graph`);
      return { concepts: [], flashcards: [] };
    }

    const visited = new Set<string>();
    const concepts: any[] = [];
    
    const traverse = async (nodeId: string, currentDepth: number) => {
      if (currentDepth > maxDepth || visited.has(nodeId)) return;
      
      visited.add(nodeId);
      
      const relationships = await prisma.knowledgeRelationship.findMany({
        where: {
          OR: [
            { sourceId: nodeId },
            { targetId: nodeId },
          ],
        },
        include: {
          source: true,
          target: true,
        },
        orderBy: { strength: 'desc' },
      });

      for (const rel of relationships) {
        const relatedNode = rel.sourceId === nodeId ? rel.target : rel.source;
        const direction = rel.sourceId === nodeId ? 'outgoing' : 'incoming';
        
        if (!visited.has(relatedNode.id)) {
          concepts.push({
            id: relatedNode.id,
            title: relatedNode.title,
            description: relatedNode.description,
            relationshipType: rel.type,
            strength: rel.strength,
            direction: direction,
            depth: currentDepth,
          });
          
          if (currentDepth < maxDepth) {
            await traverse(relatedNode.id, currentDepth + 1);
          }
        }
      }
    };

    await traverse(startNode.id, 0);
    
    const sortedConcepts = concepts
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit);

    // Find related flashcards if requested
    let relatedFlashcards: any[] = [];
    if (includeFlashcards && sortedConcepts.length > 0) {
      const conceptTitles = sortedConcepts.map(c => c.title);
      relatedFlashcards = await prisma.flashcard.findMany({
        where: {
          OR: [
            { word: { in: conceptTitles } },
            { definition: { contains: word } },
            { tags: { contains: word } },
          ],
        },
        take: 10,
      });
    }
    
    return {
      concepts: sortedConcepts,
      flashcards: relatedFlashcards,
      totalFound: concepts.length,
    };
  }

  /**
   * CORE QUERY 2: Find Learning Paths
   * Enhanced with difficulty progression
   */
  static async findLearningPaths(startWord: string, endWord?: string, options: {
    maxLength?: number;
    minStrength?: number;
    includeDifficulty?: boolean;
  } = {}) {
    const { maxLength = 5, minStrength = 0.5, includeDifficulty = true } = options;
    
    console.log(`🛤️ Finding learning paths from: "${startWord}" to: "${endWord || 'any'}"`);
    
    const startNode = await prisma.knowledgeNode.findFirst({
      where: {
        OR: [
          { title: { contains: startWord } },
          { description: { contains: startWord } },
        ],
      },
    });

    if (!startNode) {
      console.log(`❌ Start concept "${startWord}" not found`);
      return [];
    }

    let endNode = null;
    if (endWord) {
      endNode = await prisma.knowledgeNode.findFirst({
        where: {
          OR: [
            { title: { contains: endWord } },
            { description: { contains: endWord } },
          ],
        },
      });
    }

    const paths: any[] = [];
    const visited = new Set<string>();
    
    const findPaths = async (currentNodeId: string, path: any[], currentLength: number) => {
      if (currentLength >= maxLength) return;
      
      if (endNode && currentNodeId === endNode.id) {
        const totalStrength = path.reduce((sum, step) => sum + step.strength, 0);
        const avgStrength = totalStrength / path.length;
        
        paths.push({
          path: [...path],
          length: currentLength,
          totalStrength: totalStrength,
          avgStrength: avgStrength,
          difficulty: this.calculatePathDifficulty(path),
        });
        return;
      }
      
      if (!endNode && currentLength >= 2) {
        const totalStrength = path.reduce((sum, step) => sum + step.strength, 0);
        const avgStrength = totalStrength / path.length;
        
        paths.push({
          path: [...path],
          length: currentLength,
          totalStrength: totalStrength,
          avgStrength: avgStrength,
          difficulty: this.calculatePathDifficulty(path),
        });
      }

      visited.add(currentNodeId);
      
      const relationships = await prisma.knowledgeRelationship.findMany({
        where: { 
          sourceId: currentNodeId,
          strength: { gte: minStrength },
        },
        include: { target: true },
        orderBy: { strength: 'desc' },
      });

      for (const rel of relationships) {
        if (!visited.has(rel.targetId)) {
          const nextStep = {
            concept: rel.target.title,
            description: rel.target.description,
            relationshipType: rel.type,
            strength: rel.strength,
          };
          
          await findPaths(rel.targetId, [...path, nextStep], currentLength + 1);
        }
      }
      
      visited.delete(currentNodeId);
    };

    await findPaths(startNode.id, [], 0);
    
    // Sort by average strength and length
    const sortedPaths = paths
      .sort((a, b) => {
        const scoreA = a.avgStrength / a.length;
        const scoreB = b.avgStrength / b.length;
        return scoreB - scoreA;
      })
      .slice(0, 5);
    
    return sortedPaths;
  }

  /**
   * CORE QUERY 3: Find Similar Concepts
   * Enhanced with contextual similarity
   */
  static async findSimilarConcepts(word: string, options: {
    limit?: number;
    minSimilarity?: number;
    includeContext?: boolean;
  } = {}) {
    const { limit = 10, minSimilarity = 0.5, includeContext = true } = options;
    
    console.log(`🔍 Finding similar concepts to: "${word}"`);
    
    const targetNode = await prisma.knowledgeNode.findFirst({
      where: {
        OR: [
          { title: { contains: word } },
          { description: { contains: word } },
        ],
      },
    });

    if (!targetNode) {
      console.log(`❌ Concept "${word}" not found`);
      return [];
    }

    const targetRelationships = await prisma.knowledgeRelationship.findMany({
      where: {
        OR: [
          { sourceId: targetNode.id },
          { targetId: targetNode.id },
        ],
      },
    });

    const similarConcepts = new Map<string, any>();
    
    for (const targetRel of targetRelationships) {
      const similarRels = await prisma.knowledgeRelationship.findMany({
        where: {
          type: targetRel.type,
          strength: {
            gte: targetRel.strength - 0.2,
            lte: targetRel.strength + 0.2,
          },
        },
        include: {
          source: true,
          target: true,
        },
      });

      for (const similarRel of similarRels) {
        const similarNode = similarRel.sourceId === targetNode.id ? similarRel.target : similarRel.source;
        
        if (similarNode.id !== targetNode.id) {
          const existing = similarConcepts.get(similarNode.id);
          const similarityScore = existing ? existing.similarityScore + 1 : 1;
          
          similarConcepts.set(similarNode.id, {
            id: similarNode.id,
            concept: similarNode.title,
            description: similarNode.description,
            sharedRelationshipType: similarRel.type,
            similarityScore: similarityScore,
            strength: similarRel.strength,
            context: includeContext ? await this.getConceptContext(similarNode.id) : null,
          });
        }
      }
    }

    const results = Array.from(similarConcepts.values())
      .filter(concept => concept.similarityScore >= minSimilarity)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
    
    return results;
  }

  /**
   * UTILITY: Calculate path difficulty
   */
  private static calculatePathDifficulty(path: any[]): string {
    const avgStrength = path.reduce((sum, step) => sum + step.strength, 0) / path.length;
    const length = path.length;
    
    if (avgStrength >= 0.8 && length <= 2) return 'easy';
    if (avgStrength >= 0.6 && length <= 3) return 'medium';
    return 'hard';
  }

  /**
   * UTILITY: Get concept context (related concepts)
   */
  private static async getConceptContext(nodeId: string): Promise<any[]> {
    const relationships = await prisma.knowledgeRelationship.findMany({
      where: {
        OR: [
          { sourceId: nodeId },
          { targetId: nodeId },
        ],
      },
      include: {
        source: true,
        target: true,
      },
      take: 3,
    });

    return relationships.map(rel => {
      const relatedNode = rel.sourceId === nodeId ? rel.target : rel.source;
      return {
        concept: relatedNode.title,
        relationship: rel.type,
        strength: rel.strength,
      };
    });
  }

  /**
   * INTEGRATION: Enhanced RAG with Knowledge Graph
   */
  static async enhanceRAGWithKnowledgeGraph(query: string): Promise<any> {
    console.log(`🧠 Enhancing RAG with knowledge graph for: "${query}"`);
    
    // Find related concepts
    const relatedData = await this.findRelatedConcepts(query, {
      maxDepth: 2,
      limit: 5,
      includeFlashcards: true,
    });

    // Find learning paths
    const learningPaths = await this.findLearningPaths(query, undefined, {
      maxLength: 3,
      minStrength: 0.6,
    });

    // Find similar concepts
    const similarConcepts = await this.findSimilarConcepts(query, {
      limit: 5,
      minSimilarity: 0.5,
      includeContext: true,
    });

    return {
      query: query,
      relatedConcepts: relatedData.concepts,
      relatedFlashcards: relatedData.flashcards,
      learningPaths: learningPaths,
      similarConcepts: similarConcepts,
      enhancedContext: this.buildEnhancedContext(relatedData.concepts, relatedData.flashcards),
    };
  }

  /**
   * UTILITY: Build enhanced context for AI
   */
  private static buildEnhancedContext(concepts: any[], flashcards: any[]): string {
    let context = '\n\nEnhanced Knowledge Graph Context:\n';
    
    if (concepts.length > 0) {
      context += 'Related Concepts:\n';
      concepts.forEach((concept, index) => {
        context += `${index + 1}. ${concept.title}: ${concept.description} (${concept.relationshipType}, strength: ${concept.strength})\n`;
      });
    }
    
    if (flashcards.length > 0) {
      context += '\nRelated Flashcards:\n';
      flashcards.forEach((card, index) => {
        context += `${index + 1}. ${card.word}: ${card.definition}\n`;
        if (card.example) context += `   Example: ${card.example}\n`;
      });
    }
    
    return context;
  }
}
