import { Request, Response } from 'express';
import { KnowledgeGraphIntegrated } from '../services/knowledge-graph-integrated.service';
import { successResponse } from '../utils/response';

export class KnowledgeGraphController {
  
  /**
   * GET /api/knowledge-graph/related-concepts
   * Find related concepts for a given word
   */
  static async getRelatedConcepts(req: Request, res: Response): Promise<void> {
    try {
      const { word, maxDepth = 1, limit = 10, includeFlashcards = true } = req.query;
      
      if (!word || typeof word !== 'string') {
        successResponse(res, null, 'Word parameter is required', 400);
        return;
      }

      const result = await KnowledgeGraphIntegrated.findRelatedConcepts(word, {
        maxDepth: parseInt(maxDepth as string) || 1,
        limit: parseInt(limit as string) || 10,
        includeFlashcards: includeFlashcards === 'true',
      });

      successResponse(res, result, 'Related concepts found');
    } catch (error) {
      console.error('Error getting related concepts:', error);
      successResponse(res, null, 'Internal server error', 500);
    }
  }

  /**
   * GET /api/knowledge-graph/learning-paths
   * Find learning paths between concepts
   */
  static async getLearningPaths(req: Request, res: Response): Promise<void> {
    try {
      const { 
        startWord, 
        endWord, 
        maxLength = 5, 
        minStrength = 0.5,
        includeDifficulty = true 
      } = req.query;
      
      if (!startWord || typeof startWord !== 'string') {
        successResponse(res, null, 'Start word parameter is required', 400);
        return;
      }

      const result = await KnowledgeGraphIntegrated.findLearningPaths(
        startWord, 
        endWord as string, 
        {
          maxLength: parseInt(maxLength as string) || 5,
          minStrength: parseFloat(minStrength as string) || 0.5,
          includeDifficulty: includeDifficulty === 'true',
        }
      );

      successResponse(res, { paths: result }, 'Learning paths found');
    } catch (error) {
      console.error('Error getting learning paths:', error);
      successResponse(res, null, 'Internal server error', 500);
    }
  }

  /**
   * GET /api/knowledge-graph/similar-concepts
   * Find similar concepts based on relationship patterns
   */
  static async getSimilarConcepts(req: Request, res: Response): Promise<void> {
    try {
      const { 
        word, 
        limit = 10, 
        minSimilarity = 0.5,
        includeContext = true 
      } = req.query;
      
      if (!word || typeof word !== 'string') {
        successResponse(res, null, 'Word parameter is required', 400);
        return;
      }

      const result = await KnowledgeGraphIntegrated.findSimilarConcepts(word, {
        limit: parseInt(limit as string) || 10,
        minSimilarity: parseFloat(minSimilarity as string) || 0.5,
        includeContext: includeContext === 'true',
      });

      successResponse(res, { concepts: result }, 'Similar concepts found');
    } catch (error) {
      console.error('Error getting similar concepts:', error);
      successResponse(res, null, 'Internal server error', 500);
    }
  }

  /**
   * POST /api/knowledge-graph/enhance-rag
   * Enhance RAG with knowledge graph context
   */
  static async enhanceRAG(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        successResponse(res, null, 'Query parameter is required', 400);
        return;
      }

      const result = await KnowledgeGraphIntegrated.enhanceRAGWithKnowledgeGraph(query);

      successResponse(res, result, 'RAG enhanced with knowledge graph');
    } catch (error) {
      console.error('Error enhancing RAG:', error);
      successResponse(res, null, 'Internal server error', 500);
    }
  }

  /**
   * GET /api/knowledge-graph/concept/:word
   * Get comprehensive information about a concept
   */
  static async getConceptInfo(req: Request, res: Response): Promise<void> {
    try {
      const { word } = req.params;
      
      if (!word) {
        successResponse(res, null, 'Word parameter is required', 400);
        return;
      }

      // Get all information about the concept
      const [relatedData, learningPaths, similarConcepts] = await Promise.all([
        KnowledgeGraphIntegrated.findRelatedConcepts(word, {
          maxDepth: 2,
          limit: 10,
          includeFlashcards: true,
        }),
        KnowledgeGraphIntegrated.findLearningPaths(word, undefined, {
          maxLength: 4,
          minStrength: 0.5,
        }),
        KnowledgeGraphIntegrated.findSimilarConcepts(word, {
          limit: 10,
          minSimilarity: 0.5,
          includeContext: true,
        }),
      ]);

      const result = {
        concept: word,
        relatedConcepts: relatedData.concepts,
        relatedFlashcards: relatedData.flashcards,
        learningPaths: learningPaths,
        similarConcepts: similarConcepts,
        summary: {
          totalRelated: relatedData.totalFound,
          totalFlashcards: relatedData.flashcards.length,
          totalPaths: learningPaths.length,
          totalSimilar: similarConcepts.length,
        },
      };

      successResponse(res, result, 'Concept information retrieved');
    } catch (error) {
      console.error('Error getting concept info:', error);
      successResponse(res, null, 'Internal server error', 500);
    }
  }

  /**
   * GET /api/knowledge-graph/stats
   * Get knowledge graph statistics
   */
  static async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const [nodeCount, relationshipCount, flashcardCount] = await Promise.all([
        prisma.knowledgeNode.count(),
        prisma.knowledgeRelationship.count(),
        prisma.flashcard.count(),
      ]);

      const stats = {
        totalNodes: nodeCount,
        totalRelationships: relationshipCount,
        totalFlashcards: flashcardCount,
        avgRelationshipsPerNode: relationshipCount / (nodeCount || 1),
        graphDensity: relationshipCount / ((nodeCount * (nodeCount - 1)) / 2 || 1),
      };

      successResponse(res, stats, 'Knowledge graph statistics');
    } catch (error) {
      console.error('Error getting stats:', error);
      successResponse(res, null, 'Internal server error', 500);
    }
  }
}
