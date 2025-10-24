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

  // Create official TOEIC Part 5 questions
  const toeicPart5Quiz = await prisma.quiz.create({
    data: {
      title: 'TOEIC Part 5 - Official Sample Questions',
      description: 'Authentic TOEIC Part 5 questions from official sample test',
      type: 'part5',
      difficulty: 'medium',
      timeLimit: 600,
      questions: JSON.stringify([
        {
          id: 'toeic-101',
          question: 'Customer reviews indicate that many modern mobile devices are often unnecessarily ------- .',
          options: ['complication', 'complicates', 'complicate', 'complicated'],
          correctAnswer: 'complicated',
          explanation: 'The sentence needs an adjective to describe \'mobile devices\'. \'Complicated\' is the correct adjective form.',
          points: 10
        },
        {
          id: 'toeic-102',
          question: 'Jamal Nawzad has received top performance reviews ------- he joined the sales department two years ago.',
          options: ['despite', 'except', 'since', 'during'],
          correctAnswer: 'since',
          explanation: '\'Since\' is used with present perfect tense to indicate a point in time when an action started that continues to the present.',
          points: 10
        },
        {
          id: 'toeic-103',
          question: 'Gyeon Corporation\'s continuing education policy states that ------- learning new skills enhances creativity and focus.',
          options: ['regular', 'regularity', 'regulate', 'regularly'],
          correctAnswer: 'regularly',
          explanation: 'The sentence needs an adverb to modify the verb \'learning\'. \'Regularly\' is the correct adverb form.',
          points: 10
        },
        {
          id: 'toeic-104',
          question: 'Among ------- recognized at the company awards ceremony were senior business analyst Natalie Obi and sales associate Peter Comeau.',
          options: ['who', 'whose', 'they', 'those'],
          correctAnswer: 'those',
          explanation: '\'Those\' is used as a pronoun to refer to people who were recognized at the ceremony.',
          points: 10
        },
        {
          id: 'toeic-105',
          question: 'All clothing sold in Develyn\'s Boutique is made from natural materials and contains no ------- dyes.',
          options: ['immediate', 'synthetic', 'reasonable', 'assumed'],
          correctAnswer: 'synthetic',
          explanation: 'The context indicates the boutique uses only natural materials, so \'synthetic\' (artificial/man-made) is the opposite of what they use.',
          points: 10
        }
      ]),
    },
  });

  // Create official TOEIC Part 6 questions
  const toeicPart6Quiz = await prisma.quiz.create({
    data: {
      title: 'TOEIC Part 6 - Official Text Completion',
      description: 'Authentic TOEIC Part 6 text completion questions from official sample test',
      type: 'part6',
      difficulty: 'medium',
      timeLimit: 600,
      questions: JSON.stringify([
        {
          id: 'toeic-part6-email',
          passage: `To: Project Leads
From: James Pak
Subject: Training Courses

To all Pak Designs project leaders:

In the coming weeks, we will be organizing several training sessions for ------- employees. At Pak Designs, we believe that with the proper help and support from our senior project leaders, less experienced staff can quickly ------- a deep understanding of the design process. ------- , they can improve their ability to communicate effectively across divisions. When employees at all experience levels interact, every employee's competency level rises and the business overall benefits. For that reason, we are urging experienced project leaders to attend each one of the interactive seminars that will be held throughout the coming month. -------.

Thank you for your support.
James Pak
Pak Designs`,
          questions: [
            {
              number: 131,
              question: 'In the coming weeks, we will be organizing several training sessions for ------- employees.',
              options: ['interest', 'interests', 'interested', 'interesting'],
              correctAnswer: 'interested',
              explanation: 'The blank needs an adjective to describe \'employees\'. \'Interested\' is the correct adjective form meaning \'having an interest in\'.',
              points: 10
            },
            {
              number: 132,
              question: 'Less experienced staff can quickly ------- a deep understanding of the design process.',
              options: ['develop', 'raise', 'open', 'complete'],
              correctAnswer: 'develop',
              explanation: '\'Develop\' means \'to acquire or build up\' and is commonly used with \'understanding\' in business contexts.',
              points: 10
            },
            {
              number: 133,
              question: '------- , they can improve their ability to communicate effectively across divisions.',
              options: ['After all', 'For', 'Even so', 'At the same time'],
              correctAnswer: 'At the same time',
              explanation: '\'At the same time\' is used to introduce an additional point or benefit, showing that this is another positive outcome.',
              points: 10
            },
            {
              number: 134,
              question: '-------.',
              options: [
                'Let me explain our plans for on-site staff training.',
                'We hope that you will strongly consider joining us.',
                'Today\'s training session will be postponed until Monday.',
                'This is the first in a series of such lectures.'
              ],
              correctAnswer: 'We hope that you will strongly consider joining us.',
              explanation: 'This sentence appropriately concludes the email by encouraging participation in the training sessions mentioned throughout the message.',
              points: 10
            }
          ]
        }
      ]),
    },
  });

  // Create official TOEIC Part 7 questions
  const toeicPart7Quiz = await prisma.quiz.create({
    data: {
      title: 'TOEIC Part 7 - Official Reading Comprehension',
      description: 'Authentic TOEIC Part 7 reading comprehension questions from official sample test',
      type: 'part7',
      difficulty: 'medium',
      timeLimit: 600,
      questions: JSON.stringify([
        {
          id: 'toeic-part7-car-ad',
          passage: `Used Car For Sale

Six-year old Carlisle Custom. Only one owner. Low Mileage. Car used to commute short distances to town. Brakes and tires replaced six months ago. Struts replaced two weeks ago. Air conditioning works well, but heater takes a while to warm up. Brand new spare tire included. Priced to sell. Owner going overseas at the end of this month and must sell the car.

Call Giroozeh Ghorbani at 848-555-0231.`,
          questions: [
            {
              number: 147,
              question: 'What is suggested about the car?',
              options: [
                'It was recently repaired.',
                'It has had more than one owner.',
                'It is very fuel efficient.',
                'It has been on sale for six months.'
              ],
              correctAnswer: 'It was recently repaired.',
              explanation: 'The advertisement mentions that \'Struts replaced two weeks ago\' and \'Brakes and tires replaced six months ago\', indicating recent repairs.',
              points: 10
            },
            {
              number: 148,
              question: 'According to the advertisement, why is Ms. Ghorbani selling her car?',
              options: [
                'She cannot repair the car\'s temperature control.',
                'She finds it difficult to maintain.',
                'She would like to have a newer model.',
                'She is leaving for another country.'
              ],
              correctAnswer: 'She is leaving for another country.',
              explanation: 'The advertisement states \'Owner going overseas at the end of this month and must sell the car.\'',
              points: 10
            }
          ]
        }
      ]),
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created ${sampleFlashcards.length} flashcards`);
  console.log('👤 Created demo user (email: demo@example.com, password: DemoPass123)');
  console.log('📝 Created sample quiz');
  console.log('🎯 Created official TOEIC Part 5, 6, and 7 questions for AI context');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
