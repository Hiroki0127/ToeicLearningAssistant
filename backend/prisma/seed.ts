import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Sample TOEIC vocabulary flashcards
  const sampleFlashcards = [
    {
      word: 'procurement',
      definition: 'The process of obtaining goods or services',
      example: 'The procurement department handles all vendor contracts.',
      partOfSpeech: 'noun',
      difficulty: 'hard',
    },
    {
      word: 'invoice',
      definition: 'A document listing goods or services provided and their prices',
      example: 'Please send me the invoice for the consulting services.',
      partOfSpeech: 'noun',
      difficulty: 'medium',
    },
    {
      word: 'efficient',
      definition: 'Achieving maximum productivity with minimum wasted effort',
      example: 'The new system is much more efficient than the old one.',
      partOfSpeech: 'adjective',
      difficulty: 'easy',
    },
    {
      word: 'deadline',
      definition: 'A date or time by which something must be completed',
      example: 'The project deadline is next Friday.',
      partOfSpeech: 'noun',
      difficulty: 'easy',
    },
    {
      word: 'negotiate',
      definition: 'To try to reach an agreement by formal discussion',
      example: 'We need to negotiate the terms of the contract.',
      partOfSpeech: 'verb',
      difficulty: 'medium',
    },
    {
      word: 'revenue',
      definition: 'Income, especially when of a company or organization',
      example: 'The company\'s revenue increased by 15% this year.',
      partOfSpeech: 'noun',
      difficulty: 'medium',
    },
    {
      word: 'implement',
      definition: 'To put a plan or system into operation',
      example: 'We will implement the new software next month.',
      partOfSpeech: 'verb',
      difficulty: 'medium',
    },
    {
      word: 'strategy',
      definition: 'A plan of action designed to achieve a long-term goal',
      example: 'The company developed a new marketing strategy.',
      partOfSpeech: 'noun',
      difficulty: 'medium',
    },
    {
      word: 'collaborate',
      definition: 'To work jointly on an activity or project',
      example: 'The teams will collaborate on this project.',
      partOfSpeech: 'verb',
      difficulty: 'medium',
    },
    {
      word: 'innovation',
      definition: 'A new method, idea, or product',
      example: 'The company is known for its innovation in technology.',
      partOfSpeech: 'noun',
      difficulty: 'medium',
    },
    {
      word: 'sustainable',
      definition: 'Able to be maintained at a certain rate or level',
      example: 'We need to find sustainable solutions for energy.',
      partOfSpeech: 'adjective',
      difficulty: 'medium',
    },
    {
      word: 'leverage',
      definition: 'To use something to maximum advantage',
      example: 'We can leverage our existing technology.',
      partOfSpeech: 'verb',
      difficulty: 'hard',
    },
    {
      word: 'paradigm',
      definition: 'A typical example or pattern of something',
      example: 'This represents a paradigm shift in our industry.',
      partOfSpeech: 'noun',
      difficulty: 'hard',
    },
    {
      word: 'synergy',
      definition: 'The interaction of elements that when combined produce a total effect greater than the sum of the individual elements',
      example: 'The merger created great synergy between the two companies.',
      partOfSpeech: 'noun',
      difficulty: 'hard',
    },
    {
      word: 'optimize',
      definition: 'To make the best or most effective use of a situation or resource',
      example: 'We need to optimize our production process.',
      partOfSpeech: 'verb',
      difficulty: 'medium',
    },
  ];

  // Create sample flashcards
  for (const flashcardData of sampleFlashcards) {
    await prisma.flashcard.create({
      data: flashcardData,
    });
  }

  // Create a sample user
  const sampleUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', // password: DemoPass123
      preferences: JSON.stringify({
        dailyGoal: 20,
        notificationTime: '09:00',
        difficulty: 'intermediate',
        focusAreas: ['vocabulary', 'grammar', 'reading'],
      }),
    },
  });

  // Create user progress
  await prisma.userProgress.create({
    data: {
      userId: sampleUser.id,
      totalCardsStudied: 0,
      totalCorrectAnswers: 0,
      totalIncorrectAnswers: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalStudyTime: 0,
      level: 'beginner',
      experience: 0,
    },
  });

  // Create sample quiz
  const sampleQuiz = await prisma.quiz.create({
    data: {
      title: 'Business Vocabulary Quiz',
      description: 'Test your knowledge of common business terms',
      type: 'vocabulary',
      difficulty: 'medium',
      timeLimit: 15,
      questions: JSON.stringify([
        {
          id: '1',
          type: 'multiple-choice',
          question: 'What does "procurement" mean?',
          options: [
            'The process of selling goods',
            'The process of obtaining goods or services',
            'The process of manufacturing products',
            'The process of marketing products'
          ],
          correctAnswer: 'The process of obtaining goods or services',
          explanation: 'Procurement refers to the process of obtaining goods or services, typically for business use.',
          points: 5
        },
        {
          id: '2',
          type: 'multiple-choice',
          question: 'Which word means "achieving maximum productivity with minimum wasted effort"?',
          options: [
            'Effective',
            'Efficient',
            'Productive',
            'Successful'
          ],
          correctAnswer: 'Efficient',
          explanation: 'Efficient means achieving maximum productivity with minimum wasted effort.',
          points: 5
        }
      ]),
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created ${sampleFlashcards.length} flashcards`);
  console.log('👤 Created demo user (email: demo@example.com, password: DemoPass123)');
  console.log('📝 Created sample quiz');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
