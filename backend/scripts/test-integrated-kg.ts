import { KnowledgeGraphIntegrated } from '../src/services/knowledge-graph-integrated.service';

async function main() {
  try {
    console.log('🚀 Testing Integrated Knowledge Graph Functions\n');
    
    // Test 1: Enhanced Related Concepts
    console.log('='.repeat(70));
    console.log('🔍 TEST 1: Enhanced Related Concepts with Flashcards');
    console.log('='.repeat(70));
    
    const relatedData = await KnowledgeGraphIntegrated.findRelatedConcepts('procurement', {
      maxDepth: 2,
      limit: 5,
      includeFlashcards: true,
    });
    
    console.log(`\nFound ${relatedData.totalFound} related concepts:`);
    relatedData.concepts.forEach((concept, index) => {
      console.log(`  ${index + 1}. ${concept.title}`);
      console.log(`     Description: ${concept.description}`);
      console.log(`     Relationship: ${concept.relationshipType} (strength: ${concept.strength}, depth: ${concept.depth})`);
      console.log(`     Direction: ${concept.direction}\n`);
    });
    
    console.log(`\nFound ${relatedData.flashcards.length} related flashcards:`);
    relatedData.flashcards.forEach((card, index) => {
      console.log(`  ${index + 1}. ${card.word}: ${card.definition}`);
    });
    
    // Test 2: Enhanced Learning Paths
    console.log('='.repeat(70));
    console.log('🛤️ TEST 2: Enhanced Learning Paths with Difficulty');
    console.log('='.repeat(70));
    
    const learningPaths = await KnowledgeGraphIntegrated.findLearningPaths('procurement', 'contract', {
      maxLength: 4,
      minStrength: 0.5,
      includeDifficulty: true,
    });
    
    console.log(`\nFound ${learningPaths.length} learning paths:`);
    learningPaths.forEach((path, index) => {
      console.log(`\nPath ${index + 1} (difficulty: ${path.difficulty}):`);
      console.log(`  Length: ${path.length}, Avg Strength: ${path.avgStrength.toFixed(2)}`);
      path.path.forEach((step, stepIndex) => {
        console.log(`  ${stepIndex + 1}. ${step.concept} (${step.relationshipType}, strength: ${step.strength})`);
      });
    });
    
    // Test 3: Enhanced Similar Concepts
    console.log('='.repeat(70));
    console.log('🔍 TEST 3: Enhanced Similar Concepts with Context');
    console.log('='.repeat(70));
    
    const similarConcepts = await KnowledgeGraphIntegrated.findSimilarConcepts('procurement', {
      limit: 5,
      minSimilarity: 0.5,
      includeContext: true,
    });
    
    console.log(`\nFound ${similarConcepts.length} similar concepts:`);
    similarConcepts.forEach((concept, index) => {
      console.log(`  ${index + 1}. ${concept.concept}`);
      console.log(`     Description: ${concept.description}`);
      console.log(`     Similarity Score: ${concept.similarityScore}`);
      console.log(`     Shared Relationship: ${concept.sharedRelationshipType}`);
      if (concept.context && concept.context.length > 0) {
        console.log(`     Context: ${concept.context.map(c => c.concept).join(', ')}`);
      }
      console.log('');
    });
    
    // Test 4: Enhanced RAG Integration
    console.log('='.repeat(70));
    console.log('🧠 TEST 4: Enhanced RAG with Knowledge Graph');
    console.log('='.repeat(70));
    
    const enhancedRAG = await KnowledgeGraphIntegrated.enhanceRAGWithKnowledgeGraph('procurement');
    
    console.log(`\nEnhanced RAG for "procurement":`);
    console.log(`  Related Concepts: ${enhancedRAG.relatedConcepts.length}`);
    console.log(`  Related Flashcards: ${enhancedRAG.relatedFlashcards.length}`);
    console.log(`  Learning Paths: ${enhancedRAG.learningPaths.length}`);
    console.log(`  Similar Concepts: ${enhancedRAG.similarConcepts.length}`);
    
    console.log('\nEnhanced Context Preview:');
    console.log(enhancedRAG.enhancedContext.substring(0, 500) + '...');
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ All Integrated Knowledge Graph Functions Tested Successfully!');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Error testing integrated knowledge graph:', error);
  } finally {
    process.exit(0);
  }
}

main();
