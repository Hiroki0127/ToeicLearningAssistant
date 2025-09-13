import { KnowledgeGraphQueries } from '../src/services/knowledge-graph-queries.service';

async function main() {
  try {
    console.log('🚀 Testing Knowledge Graph Query Patterns\n');
    
    // PATTERN 1: Find Related Concepts
    console.log('='.repeat(60));
    console.log('🔍 PATTERN 1: Find Related Concepts');
    console.log('='.repeat(60));
    
    const relatedConcepts = await KnowledgeGraphQueries.findRelatedConcepts('procurement', 2, 10);
    console.log('\nRelated concepts for "procurement":');
    relatedConcepts.forEach((concept, index) => {
      console.log(`  ${index + 1}. ${concept.concept}`);
      console.log(`     Description: ${concept.description}`);
      console.log(`     Relationship: ${concept.relationshipType} (strength: ${concept.strength}, depth: ${concept.depth})`);
      console.log(`     Direction: ${concept.direction}\n`);
    });
    
    // PATTERN 2: Find Learning Paths
    console.log('='.repeat(60));
    console.log('🛤️ PATTERN 2: Find Learning Paths');
    console.log('='.repeat(60));
    
    const learningPaths = await KnowledgeGraphQueries.findLearningPaths('procurement', 'contract', 4);
    console.log('\nLearning paths from "procurement" to "contract":');
    learningPaths.forEach((path, index) => {
      console.log(`\nPath ${index + 1} (length: ${path.length}, total strength: ${path.totalStrength.toFixed(2)}):`);
      path.path.forEach((step, stepIndex) => {
        console.log(`  ${stepIndex + 1}. ${step.concept} (${step.relationshipType}, strength: ${step.strength})`);
      });
    });
    
    // PATTERN 3: Find Similar Concepts
    console.log('='.repeat(60));
    console.log('🔍 PATTERN 3: Find Similar Concepts');
    console.log('='.repeat(60));
    
    const similarConcepts = await KnowledgeGraphQueries.findSimilarConcepts('procurement', 5);
    console.log('\nSimilar concepts to "procurement":');
    similarConcepts.forEach((concept, index) => {
      console.log(`  ${index + 1}. ${concept.concept}`);
      console.log(`     Description: ${concept.description}`);
      console.log(`     Similarity Score: ${concept.similarityScore}`);
      console.log(`     Shared Relationship: ${concept.sharedRelationshipType}\n`);
    });
    
    // BONUS: Find Concept Clusters
    console.log('='.repeat(60));
    console.log('🎯 BONUS: Find Concept Clusters');
    console.log('='.repeat(60));
    
    const clusters = await KnowledgeGraphQueries.findConceptClusters(2);
    console.log('\nConcept clusters:');
    clusters.forEach((cluster, index) => {
      console.log(`\nCluster ${index + 1} (size: ${cluster.size}):`);
      console.log(`  Center: ${cluster.centerConcept}`);
      cluster.concepts.forEach((concept, conceptIndex) => {
        console.log(`  ${conceptIndex + 1}. ${concept.title}: ${concept.description}`);
      });
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All Knowledge Graph Query Patterns Tested Successfully!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error testing knowledge graph queries:', error);
  } finally {
    process.exit(0);
  }
}

main();
