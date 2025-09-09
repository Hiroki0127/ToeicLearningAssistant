import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignFlashcardsToUser() {
  try {
    console.log('🔗 Assigning flashcards to user...');
    
    // Get the first user (assuming it's you)
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('❌ No user found. Please create an account first.');
      return;
    }
    
    console.log(`👤 Found user: ${user.name} (${user.email})`);
    
    // Update flashcards without userId to assign them to this user
    const result = await prisma.flashcard.updateMany({
      where: {
        userId: null
      },
      data: {
        userId: user.id
      }
    });
    
    console.log(`✅ Assigned ${result.count} flashcards to user ${user.name}`);
    
    // Show all flashcards for this user
    const userFlashcards = await prisma.flashcard.findMany({
      where: {
        userId: user.id
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n📚 Your flashcards:');
    userFlashcards.forEach((card, index) => {
      console.log(`${index + 1}. ${card.word.toUpperCase()}`);
      console.log(`   Definition: ${card.definition}`);
      console.log(`   Example: ${card.example}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error assigning flashcards:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignFlashcardsToUser();
