import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function addToeicQuestions() {
  try {
    console.log('🌱 Adding official TOEIC questions to database...');
    
    // Check if TOEIC questions already exist
    const existingToeicQuizzes = await prisma.quiz.findMany({
      where: {
        OR: [
          { title: { contains: 'TOEIC Part 5' } },
          { title: { contains: 'TOEIC Part 6' } },
          { title: { contains: 'TOEIC Part 7' } }
        ]
      }
    });
    
    if (existingToeicQuizzes.length > 0) {
      console.log('✅ Official TOEIC questions already exist in database');
      console.log(`Found ${existingToeicQuizzes.length} existing TOEIC quizzes`);
      return;
    }
    
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
    
    console.log('✅ Official TOEIC questions added successfully!');
    console.log(`📝 Added: ${toeicPart5Quiz.title}`);
    console.log(`📝 Added: ${toeicPart6Quiz.title}`);
    console.log(`📝 Added: ${toeicPart7Quiz.title}`);
    
  } catch (error) {
    console.error('❌ Error adding TOEIC questions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addToeicQuestions();
