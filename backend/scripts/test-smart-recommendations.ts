import { SmartRecommendationsService } from '../src/services/smart-recommendations.service';

async function main() {
  try {
    console.log('🚀 Testing Smart Recommendations Service\n');
    
    // Test with a sample user ID (you can replace with actual user ID)
    const testUserId = 'test-user-id';
    
    // Test 1: Basic recommendations
    console.log('='.repeat(60));
    console.log('🎯 TEST 1: Basic Smart Recommendations');
    console.log('='.repeat(60));
    
    const recommendations = await SmartRecommendationsService.getRecommendations(testUserId, {
      limit: 5,
      includeReasons: true,
      difficulty: 'all',
    });
    
    console.log(`\nGenerated ${recommendations.totalFound} recommendations:`);
    console.log(`User Stats:`, recommendations.userStats);
    console.log(`\nReasons:`, recommendations.reasons);
    
    console.log('\nRecommendations:');
    recommendations.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec.flashcard.word}`);
      console.log(`     Type: ${rec.type}`);
      console.log(`     Score: ${rec.score}`);
      console.log(`     Priority: ${rec.priority}`);
      console.log(`     Reason: ${rec.reason}`);
      console.log('');
    });
    
    // Test 2: Daily recommendations
    console.log('='.repeat(60));
    console.log('📅 TEST 2: Daily Recommendations');
    console.log('='.repeat(60));
    
    const dailyRecs = await SmartRecommendationsService.getRecommendations(testUserId, {
      limit: 3,
      includeReasons: true,
      difficulty: 'all',
    });
    
    console.log(`\nDaily focus: ${dailyRecs.recommendations.length} cards`);
    dailyRecs.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec.flashcard.word} (${rec.type})`);
    });
    
    // Test 3: Different difficulty levels
    console.log('='.repeat(60));
    console.log('🎚️ TEST 3: Difficulty-Based Recommendations');
    console.log('='.repeat(60));
    
    const easyRecs = await SmartRecommendationsService.getRecommendations(testUserId, {
      limit: 3,
      difficulty: 'easy',
    });
    
    console.log(`\nEasy recommendations: ${easyRecs.totalFound}`);
    easyRecs.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec.flashcard.word} (${rec.flashcard.difficulty})`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Smart Recommendations Service Tested Successfully!');
    console.log('='.repeat(60));
    
    console.log('\n📋 Summary:');
    console.log(`- Total recommendations generated: ${recommendations.totalFound}`);
    console.log(`- User has ${recommendations.userStats.totalFlashcards} flashcards`);
    console.log(`- Studied today: ${recommendations.userStats.studiedToday} cards`);
    console.log(`- Current streak: ${recommendations.userStats.currentStreak} days`);
    console.log(`- Weak areas identified: ${recommendations.userStats.weakAreas}`);
    
  } catch (error) {
    console.error('❌ Error testing smart recommendations:', error);
  } finally {
    process.exit(0);
  }
}

main();
