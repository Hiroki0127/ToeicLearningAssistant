import { KnowledgeGraphService } from '../src/services/knowledge-graph.service';

async function main() {
  try {
    console.log('🚀 Initializing knowledge graph with basic TOEIC concepts...');
    
    const result = await KnowledgeGraphService.initializeBasicConcepts();
    
    console.log('✅ Knowledge graph initialized successfully!');
    console.log(`📊 Created ${result.nodes.length} new nodes`);
    console.log(`🔗 Created ${result.relationships.length} relationships`);
    
    // Test the knowledge graph
    console.log('\n🧪 Testing knowledge graph queries...');
    
    const relatedConcepts = await KnowledgeGraphService.getRelatedConcepts('procurement');
    console.log('\n📋 Related concepts for "procurement":');
    relatedConcepts.forEach(concept => {
      console.log(`  - ${concept.title}: ${concept.description} (${concept.relationshipType}, strength: ${concept.strength})`);
    });
    
    const learningPath = await KnowledgeGraphService.getLearningPath('procurement', 2);
    console.log('\n🛤️ Learning path from "procurement":');
    learningPath.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step.title}: ${step.description} (depth: ${step.depth})`);
    });
    
    const relatedFlashcards = await KnowledgeGraphService.getRelatedFlashcards('procurement');
    console.log('\n🎴 Related flashcards for "procurement":');
    relatedFlashcards.forEach(card => {
      console.log(`  - ${card.word}: ${card.definition}`);
    });
    
  } catch (error) {
    console.error('❌ Error initializing knowledge graph:', error);
  } finally {
    process.exit(0);
  }
}

main();
