import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function viewFlashcards() {
  try {
    console.log('📚 All Flashcards in Database:\n');
    
    const flashcards = await prisma.flashcard.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    if (flashcards.length === 0) {
      console.log('❌ No flashcards found in database');
      return;
    }
    
    flashcards.forEach((card, index) => {
      console.log(`${index + 1}. ${card.word.toUpperCase()}`);
      console.log(`   Definition: ${card.definition}`);
      console.log(`   Example: ${card.example}`);
      console.log(`   Part of Speech: ${card.partOfSpeech} | Difficulty: ${card.difficulty}`);
      console.log(`   Created: ${card.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    
    console.log(`✅ Total flashcards: ${flashcards.length}`);
    
  } catch (error) {
    console.error('Error viewing flashcards:', error);
  } finally {
    await prisma.$disconnect();
  }
}

viewFlashcards();
