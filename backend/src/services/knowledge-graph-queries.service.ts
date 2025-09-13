import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class KnowledgeGraphQueries {
  
  /**
   * PATTERN 1: Find Related Concepts
   * Find concepts directly connected to a given concept
   */
  static async findRelatedConcepts(concept: string, maxDepth: number = 1, limit: number = 10) {
    console.log(`🔍 Finding related concepts for: "${concept}" (depth: ${maxDepth})`);
    
    // Find the starting concept
    const startNode = await prisma.knowledgeNode.findFirst({
      where: {
        OR: [
          { title: { contains: concept } },
          { description: { contains: concept } },
        ],
      },
    });

    if (!startNode) {
      console.log(`❌ Concept "${concept}" not found in knowledge graph`);
      return [];
    }

    const visited = new Set<string>();
    const results: any[] = [];
    
    const traverse = async (nodeId: string, currentDepth: number) => {
      if (currentDepth > maxDepth || visited.has(nodeId)) return;
      
      visited.add(nodeId);
      
      // Find all relationships from and to this node
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
          results.push({
            concept: relatedNode.title,
            description: relatedNode.description,
            relationshipType: rel.type,
            strength: rel.strength,
            direction: direction,
            depth: currentDepth,
          });
          
          // Continue traversal if within depth limit
          if (currentDepth < maxDepth) {
            await traverse(relatedNode.id, currentDepth + 1);
          }
        }
      }
    };

    await traverse(startNode.id, 0);
    
    // Sort by strength and limit results
    const sortedResults = results
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit);
    
    console.log(`✅ Found ${sortedResults.length} related concepts`);
    return sortedResults;
  }

  /**
   * PATTERN 2: Find Learning Paths
   * Find optimal learning sequences from one concept to another
   */
  static async findLearningPaths(startConcept: string, endConcept?: string, maxLength: number = 5) {
    console.log(`🛤️ Finding learning paths from: "${startConcept}" to: "${endConcept || 'any'}"`);
    
    // Find start node
    const startNode = await prisma.knowledgeNode.findFirst({
      where: {
        OR: [
          { title: { contains: startConcept } },
          { description: { contains: startConcept } },
        ],
      },
    });

    if (!startNode) {
      console.log(`❌ Start concept "${startConcept}" not found`);
      return [];
    }

    // Find end node if specified
    let endNode = null;
    if (endConcept) {
      endNode = await prisma.knowledgeNode.findFirst({
        where: {
          OR: [
            { title: { contains: endConcept } },
            { description: { contains: endConcept } },
          ],
        },
      });
    }

    const paths: any[] = [];
    const visited = new Set<string>();
    
    const findPaths = async (currentNodeId: string, path: any[], currentLength: number) => {
      if (currentLength >= maxLength) return;
      
      // If we found the end node, save this path
      if (endNode && currentNodeId === endNode.id) {
        paths.push({
          path: [...path],
          length: currentLength,
          totalStrength: path.reduce((sum, step) => sum + step.strength, 0),
        });
        return;
      }
      
      // If no end node specified, save all paths of reasonable length
      if (!endNode && currentLength >= 2) {
        paths.push({
          path: [...path],
          length: currentLength,
          totalStrength: path.reduce((sum, step) => sum + step.strength, 0),
        });
      }

      visited.add(currentNodeId);
      
      // Find outgoing relationships
      const relationships = await prisma.knowledgeRelationship.findMany({
        where: { sourceId: currentNodeId },
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
    
    // Sort paths by total strength and length
    const sortedPaths = paths
      .sort((a, b) => {
        // Prefer shorter paths with higher strength
        const scoreA = a.totalStrength / a.length;
        const scoreB = b.totalStrength / b.length;
        return scoreB - scoreA;
      })
      .slice(0, 5); // Return top 5 paths
    
    console.log(`✅ Found ${sortedPaths.length} learning paths`);
    return sortedPaths;
  }

  /**
   * PATTERN 3: Find Similar Concepts
   * Find concepts that are similar based on shared relationships or attributes
   */
  static async findSimilarConcepts(concept: string, limit: number = 10) {
    console.log(`🔍 Finding similar concepts to: "${concept}"`);
    
    // Find the target concept
    const targetNode = await prisma.knowledgeNode.findFirst({
      where: {
        OR: [
          { title: { contains: concept } },
          { description: { contains: concept } },
        ],
      },
    });

    if (!targetNode) {
      console.log(`❌ Concept "${concept}" not found`);
      return [];
    }

    // Get all relationships for the target concept
    const targetRelationships = await prisma.knowledgeRelationship.findMany({
      where: {
        OR: [
          { sourceId: targetNode.id },
          { targetId: targetNode.id },
        ],
      },
    });

    // Find concepts that share relationships with the target
    const similarConcepts = new Map<string, any>();
    
    for (const targetRel of targetRelationships) {
      // Find other concepts that have similar relationship patterns
      const similarRels = await prisma.knowledgeRelationship.findMany({
        where: {
          type: targetRel.type,
          strength: {
            gte: targetRel.strength - 0.2, // Within 0.2 strength difference
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
            concept: similarNode.title,
            description: similarNode.description,
            sharedRelationshipType: similarRel.type,
            similarityScore: similarityScore,
            strength: similarRel.strength,
          });
        }
      }
    }

    // Convert to array and sort by similarity score
    const results = Array.from(similarConcepts.values())
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
    
    console.log(`✅ Found ${results.length} similar concepts`);
    return results;
  }

  /**
   * BONUS: Find Concept Clusters
   * Group related concepts into clusters for organized learning
   */
  static async findConceptClusters(minClusterSize: number = 3) {
    console.log(`🎯 Finding concept clusters (min size: ${minClusterSize})`);
    
    const allNodes = await prisma.knowledgeNode.findMany();
    const clusters: any[] = [];
    const visited = new Set<string>();
    
    for (const node of allNodes) {
      if (visited.has(node.id)) continue;
      
      const cluster = await this.buildCluster(node.id, visited);
      
      if (cluster.length >= minClusterSize) {
        clusters.push({
          clusterId: clusters.length + 1,
          concepts: cluster,
          size: cluster.length,
          centerConcept: cluster[0].title, // First concept as cluster center
        });
      }
    }
    
    console.log(`✅ Found ${clusters.length} concept clusters`);
    return clusters;
  }

  private static async buildCluster(nodeId: string, visited: Set<string>): Promise<any[]> {
    const cluster: any[] = [];
    const toVisit = [nodeId];
    
    while (toVisit.length > 0) {
      const currentNodeId = toVisit.shift()!;
      
      if (visited.has(currentNodeId)) continue;
      
      visited.add(currentNodeId);
      
      const node = await prisma.knowledgeNode.findUnique({
        where: { id: currentNodeId },
      });
      
      if (node) {
        cluster.push({
          id: node.id,
          title: node.title,
          description: node.description,
        });
        
        // Find strongly connected neighbors
        const relationships = await prisma.knowledgeRelationship.findMany({
          where: {
            OR: [
              { sourceId: currentNodeId },
              { targetId: currentNodeId },
            ],
            strength: { gte: 0.7 }, // Only strong relationships
          },
        });
        
        for (const rel of relationships) {
          const neighborId = rel.sourceId === currentNodeId ? rel.targetId : rel.sourceId;
          if (!visited.has(neighborId)) {
            toVisit.push(neighborId);
          }
        }
      }
    }
    
    return cluster;
  }
}
