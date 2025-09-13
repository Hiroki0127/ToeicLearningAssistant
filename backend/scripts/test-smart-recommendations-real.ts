import { SmartRecommendationsService } from '../src/services/smart-recommendations.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Testing Smart Recommendations with Real User Data\n');
    
    // Get a real user from the database
    const user = await prisma.user.findFirst({
      where: {
        email: 'hiro@gmail.com', // Your test user
      },
    });
    
    if (!user) {
      console.log('❌ No user found with email hiro@gmail.com');
      console.log('Available users:');
      const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true },
      });
      users.forEach(u => console.log(`  - ${u.email} (${u.name})`));
      return;
    }
    
    console.log(`✅ Testing with user: ${user.name} (${user.email})`);
    
    // Check user's flashcards
    const userFlashcards = await prisma.flashcard.findMany({
      where: { userId: user.id },
    });
    
    console.log(`📚 User has ${userFlashcards.length} flashcards`);
    
    if (userFlashcards.length === 0) {
      console.log('❌ User has no flashcards. Please create some flashcards first.');
      return;
    }
    
    // Test smart recommendations
    console.log('\n' + '='.repeat(60));
    console.log('🎯 Smart Recommendations Test');
    console.log('='.repeat(60));
    
    const recommendations = await SmartRecommendationsService.getRecommendations(user.id, {
      limit: 5,
      includeReasons: true,
      difficulty: 'all',
    });
    
    console.log(`\nGenerated ${recommendations.totalFound} recommendations:`);
    console.log(`User Stats:`, recommendations.userStats);
    console.log(`\nReasons:`, recommendations.reasons);
    
    if (recommendations.recommendations.length > 0) {
      console.log('\nRecommendations:');
      recommendations.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec.flashcard.word}`);
        console.log(`     Type: ${rec.type}`);
        console.log(`     Score: ${rec.score}`);
        console.log(`     Priority: ${rec.priority}`);
        console.log(`     Reason: ${rec.reason}`);
        console.log('');
      });
    } else {
      console.log('\nNo specific recommendations generated.');
    }
    
    // Test different recommendation types
    console.log('\n' + '='.repeat(60));
    console.log('📊 Testing Different Recommendation Types');
    console.log('='.repeat(60));
    
    // Check for weak areas
    const weakAreaRecs = recommendations.recommendations.filter(r => r.type === 'weak_area');
    console.log(`Weak area recommendations: ${weakAreaRecs.length}`);
    
    // Check for spaced repetition
    const spacedRecs = recommendations.recommendations.filter(r => r.type === 'spaced_repetition');
    console.log(`Spaced repetition recommendations: ${spacedRecs.length}`);
    
    // Check for knowledge graph
    const kgRecs = recommendations.recommendations.filter(r => r.type === 'knowledge_graph');
    console.log(`Knowledge graph recommendations: ${kgRecs.length}`);
    
    // Check for related concepts
    const relatedRecs = recommendations.recommendations.filter(r => r.type === 'related_concept');
    console.log(`Related concept recommendations: ${relatedRecs.length}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Smart Recommendations Test Completed!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error testing smart recommendations:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
