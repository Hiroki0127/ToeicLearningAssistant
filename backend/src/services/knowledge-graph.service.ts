import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class KnowledgeGraphService {
  /**
   * Create a knowledge node (concept/word)
   */
  static async createNode(data: {
    type: string;
    title: string;
    description: string;
    content: string;
  }) {
    return await prisma.knowledgeNode.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        content: data.content,
      },
    });
  }

  /**
   * Create a relationship between two knowledge nodes
   */
  static async createRelationship(data: {
    sourceId: string;
    targetId: string;
    type: string;
    strength: number;
    metadata?: string;
  }) {
    return await prisma.knowledgeRelationship.create({
      data: {
        sourceId: data.sourceId,
        targetId: data.targetId,
        type: data.type,
        strength: data.strength,
        metadata: data.metadata,
      },
    });
  }

  /**
   * Find related concepts for a given word
   */
  static async getRelatedConcepts(word: string, limit: number = 5) {
    const node = await prisma.knowledgeNode.findFirst({
      where: {
        OR: [
          { title: { contains: word } },
          { description: { contains: word } },
        ],
      },
    });

    if (!node) return [];

    const relationships = await prisma.knowledgeRelationship.findMany({
      where: {
        OR: [
          { sourceId: node.id },
          { targetId: node.id },
        ],
      },
      include: {
        source: true,
        target: true,
      },
      orderBy: { strength: 'desc' },
      take: limit,
    });

    return relationships.map(rel => {
      const relatedNode = rel.sourceId === node.id ? rel.target : rel.source;
      return {
        id: relatedNode.id,
        title: relatedNode.title,
        description: relatedNode.description,
        relationshipType: rel.type,
        strength: rel.strength,
      };
    });
  }

  /**
   * Get learning path recommendations based on knowledge graph
   */
  static async getLearningPath(startingWord: string, depth: number = 2) {
    const startingNode = await prisma.knowledgeNode.findFirst({
      where: {
        OR: [
          { title: { contains: startingWord } },
          { description: { contains: startingWord } },
        ],
      },
    });

    if (!startingNode) return [];

    const path: any[] = [];
    const visited = new Set<string>();

    const traverse = async (nodeId: string, currentDepth: number) => {
      if (currentDepth >= depth || visited.has(nodeId)) return;

      visited.add(nodeId);

      const relationships = await prisma.knowledgeRelationship.findMany({
        where: { sourceId: nodeId },
        include: { target: true },
        orderBy: { strength: 'desc' },
        take: 3,
      });

      for (const rel of relationships) {
        if (!visited.has(rel.targetId)) {
          path.push({
            id: rel.target.id,
            title: rel.target.title,
            description: rel.target.description,
            relationshipType: rel.type,
            strength: rel.strength,
            depth: currentDepth + 1,
          });

          await traverse(rel.targetId, currentDepth + 1);
        }
      }
    };

    await traverse(startingNode.id, 0);
    return path;
  }

  /**
   * Find flashcards related to a concept
   */
  static async getRelatedFlashcards(concept: string) {
    const relatedConcepts = await this.getRelatedConcepts(concept, 10);
    
    if (relatedConcepts.length === 0) return [];

    const conceptTitles = relatedConcepts.map(c => c.title);
    
    return await prisma.flashcard.findMany({
      where: {
        OR: [
          { word: { in: conceptTitles } },
          { definition: { contains: concept } },
        ],
      },
      take: 10,
    });
  }

  /**
   * Initialize knowledge graph with basic TOEIC concepts
   */
  static async initializeBasicConcepts() {
    const basicConcepts = [
      {
        type: 'business_concept',
        title: 'procurement',
        description: 'The process of obtaining goods or services',
        content: 'Procurement involves identifying, evaluating, and selecting suppliers to meet organizational needs.',
      },
      {
        type: 'business_concept',
        title: 'negotiate',
        description: 'To discuss terms to reach an agreement',
        content: 'Negotiation is a key skill in business for reaching mutually beneficial agreements.',
      },
      {
        type: 'business_concept',
        title: 'supplier',
        description: 'A company that provides goods or services',
        content: 'Suppliers are essential partners in the supply chain and procurement process.',
      },
      {
        type: 'business_concept',
        title: 'contract',
        description: 'A legally binding agreement between parties',
        content: 'Contracts define terms, conditions, and obligations for business relationships.',
      },
    ];

    // Create nodes
    const nodes = [];
    for (const concept of basicConcepts) {
      const existingNode = await prisma.knowledgeNode.findFirst({
        where: { title: concept.title },
      });
      
      if (!existingNode) {
        const node = await this.createNode(concept);
        nodes.push(node);
      }
    }

    // Create relationships
    const relationships = [
      { source: 'procurement', target: 'negotiate', type: 'requires', strength: 0.8 },
      { source: 'procurement', target: 'supplier', type: 'involves', strength: 0.9 },
      { source: 'procurement', target: 'contract', type: 'results_in', strength: 0.7 },
      { source: 'negotiate', target: 'contract', type: 'leads_to', strength: 0.8 },
      { source: 'supplier', target: 'contract', type: 'signs', strength: 0.6 },
    ];

    for (const rel of relationships) {
      const sourceNode = await prisma.knowledgeNode.findFirst({
        where: { title: rel.source },
      });
      const targetNode = await prisma.knowledgeNode.findFirst({
        where: { title: rel.target },
      });

      if (sourceNode && targetNode) {
        const existingRel = await prisma.knowledgeRelationship.findFirst({
          where: {
            sourceId: sourceNode.id,
            targetId: targetNode.id,
            type: rel.type,
          },
        });

        if (!existingRel) {
          await this.createRelationship({
            sourceId: sourceNode.id,
            targetId: targetNode.id,
            type: rel.type,
            strength: rel.strength,
          });
        }
      }
    }

    console.log('Knowledge graph initialized with basic concepts');
    return { nodes, relationships };
  }
}
