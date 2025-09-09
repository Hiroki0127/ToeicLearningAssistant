import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleFlashcards = [
  {
    word: "procurement",
    definition: "The process of obtaining goods or services, especially for a business",
    example: "The procurement department is responsible for purchasing office supplies.",
    partOfSpeech: "noun",
    category: "business",
    tags: "business,purchasing,supply chain",
    difficulty: "medium"
  },
  {
    word: "efficient",
    definition: "Achieving maximum productivity with minimum wasted effort or expense",
    example: "The new software system is more efficient than the old one.",
    partOfSpeech: "adjective",
    category: "business",
    tags: "productivity,optimization,business",
    difficulty: "easy"
  },
  {
    word: "negotiate",
    definition: "To discuss something with someone in order to reach an agreement",
    example: "We need to negotiate the contract terms with the supplier.",
    partOfSpeech: "verb",
    category: "business",
    tags: "business,agreement,discussion",
    difficulty: "medium"
  },
  {
    word: "deadline",
    definition: "The latest time or date by which something should be completed",
    example: "The project deadline is next Friday.",
    partOfSpeech: "noun",
    category: "business",
    tags: "time,project,business",
    difficulty: "easy"
  },
  {
    word: "implement",
    definition: "To put a decision or plan into effect",
    example: "The company will implement the new policy next month.",
    partOfSpeech: "verb",
    category: "business",
    tags: "action,policy,business",
    difficulty: "medium"
  }
];

async function addSampleFlashcards() {
  try {
    console.log('Adding sample flashcards...');
    
    for (const card of sampleFlashcards) {
      await prisma.flashcard.create({
        data: card
      });
      console.log(`Added: ${card.word}`);
    }
    
    console.log('✅ Sample flashcards added successfully!');
    console.log('You can now test the RAG system with these words:');
    sampleFlashcards.forEach(card => console.log(`- ${card.word}`));
    
  } catch (error) {
    console.error('Error adding sample flashcards:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleFlashcards();
