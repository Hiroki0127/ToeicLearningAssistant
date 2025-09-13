import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleQuizzes = [
  // EASY QUIZZES (3)
  {
    title: "Basic Business Vocabulary",
    description: "Essential business terms for TOEIC beginners",
    type: "vocabulary" as const,
    difficulty: "easy" as const,
    timeLimit: 600, // 10 minutes
    questions: [
      {
        id: "q1",
        question: "What does 'meeting' mean?",
        options: [
          "A gathering of people to discuss business",
          "A type of food",
          "A building",
          "A computer program"
        ],
        correctAnswer: "A gathering of people to discuss business",
        explanation: "A meeting is a gathering of people to discuss business matters.",
        points: 10
      },
      {
        id: "q2", 
        question: "Which word means 'to buy'?",
        options: ["Sell", "Purchase", "Give", "Lose"],
        correctAnswer: "Purchase",
        explanation: "Purchase is a formal word meaning 'to buy'.",
        points: 10
      },
      {
        id: "q3",
        question: "What is a 'contract'?",
        options: [
          "A legal agreement between parties",
          "A type of building",
          "A meeting room",
          "A computer file"
        ],
        correctAnswer: "A legal agreement between parties",
        explanation: "A contract is a legally binding agreement between two or more parties.",
        points: 10
      }
    ]
  },
  {
    title: "Simple Grammar Basics",
    description: "Fundamental grammar for TOEIC preparation",
    type: "grammar" as const,
    difficulty: "easy" as const,
    timeLimit: 600,
    questions: [
      {
        id: "q1",
        question: "Choose the correct form: 'I _____ to work every day.'",
        options: ["go", "goes", "going", "went"],
        correctAnswer: "go",
        explanation: "Use 'go' for first person singular present tense.",
        points: 10
      },
      {
        id: "q2",
        question: "Which is correct: 'There _____ many people in the office.'",
        options: ["is", "are", "was", "were"],
        correctAnswer: "are",
        explanation: "Use 'are' with plural subjects like 'people'.",
        points: 10
      },
      {
        id: "q3",
        question: "Complete: 'The meeting _____ at 3 PM.'",
        options: ["start", "starts", "starting", "started"],
        correctAnswer: "starts",
        explanation: "Use 'starts' for third person singular present tense.",
        points: 10
      }
    ]
  },
  {
    title: "Basic Reading Comprehension",
    description: "Simple reading passages for TOEIC beginners",
    type: "reading" as const,
    difficulty: "easy" as const,
    timeLimit: 600,
    questions: [
      {
        id: "q1",
        question: "Read: 'The office is open from 9 AM to 5 PM.' When does the office close?",
        options: ["9 AM", "5 PM", "12 PM", "6 PM"],
        correctAnswer: "5 PM",
        explanation: "The text clearly states the office closes at 5 PM.",
        points: 10
      },
      {
        id: "q2",
        question: "Read: 'Please send the report by email.' What should you send?",
        options: ["A letter", "The report", "A phone call", "A meeting"],
        correctAnswer: "The report",
        explanation: "The instruction asks to send 'the report' by email.",
        points: 10
      },
      {
        id: "q3",
        question: "Read: 'The conference room is on the second floor.' Where is the conference room?",
        options: ["First floor", "Second floor", "Third floor", "Ground floor"],
        correctAnswer: "Second floor",
        explanation: "The text explicitly states the conference room is on the second floor.",
        points: 10
      }
    ]
  },

  // MEDIUM QUIZZES (3)
  {
    title: "Intermediate Business Communication",
    description: "Moderate difficulty business vocabulary and phrases",
    type: "vocabulary" as const,
    difficulty: "medium" as const,
    timeLimit: 900, // 15 minutes
    questions: [
      {
        id: "q1",
        question: "What does 'procurement' mean?",
        options: [
          "The process of obtaining goods or services",
          "A type of meeting",
          "A financial report",
          "A computer system"
        ],
        correctAnswer: "The process of obtaining goods or services",
        explanation: "Procurement refers to the process of obtaining goods or services for a business.",
        points: 15
      },
      {
        id: "q2",
        question: "Which phrase means 'to discuss terms'?",
        options: ["Negotiate", "Celebrate", "Ignore", "Delay"],
        correctAnswer: "Negotiate",
        explanation: "To negotiate means to discuss terms to reach an agreement.",
        points: 15
      },
      {
        id: "q3",
        question: "What is a 'deadline'?",
        options: [
          "A specific date by which something must be completed",
          "A type of contract",
          "A meeting room",
          "A computer program"
        ],
        correctAnswer: "A specific date by which something must be completed",
        explanation: "A deadline is the latest time or date by which something must be completed.",
        points: 15
      }
    ]
  },
  {
    title: "Intermediate Grammar Patterns",
    description: "Complex grammar structures for TOEIC intermediate level",
    type: "grammar" as const,
    difficulty: "medium" as const,
    timeLimit: 900,
    questions: [
      {
        id: "q1",
        question: "Choose the correct form: 'If I _____ the budget, I would approve the project.'",
        options: ["have", "had", "will have", "would have"],
        correctAnswer: "had",
        explanation: "Use 'had' in the if-clause for second conditional (unreal present).",
        points: 15
      },
      {
        id: "q2",
        question: "Complete: 'The report _____ by the manager yesterday.'",
        options: ["was reviewed", "reviewed", "is reviewed", "will be reviewed"],
        correctAnswer: "was reviewed",
        explanation: "Use past passive voice 'was reviewed' for actions completed in the past.",
        points: 15
      },
      {
        id: "q3",
        question: "Which is correct: 'Neither John nor Mary _____ present at the meeting.'",
        options: ["was", "were", "is", "are"],
        correctAnswer: "was",
        explanation: "With 'neither...nor', the verb agrees with the subject closest to it (Mary - singular).",
        points: 15
      }
    ]
  },
  {
    title: "Business Reading Comprehension",
    description: "Complex business texts for TOEIC intermediate level",
    type: "reading" as const,
    difficulty: "medium" as const,
    timeLimit: 900,
    questions: [
      {
        id: "q1",
        question: "Read: 'The company's quarterly profits increased by 15% compared to the previous year, largely due to improved efficiency in the manufacturing process.' What contributed to the profit increase?",
        options: [
          "Higher prices",
          "Improved efficiency in manufacturing",
          "New product launches",
          "Reduced staff"
        ],
        correctAnswer: "Improved efficiency in manufacturing",
        explanation: "The text explicitly states profits increased 'largely due to improved efficiency in the manufacturing process.'",
        points: 15
      },
      {
        id: "q2",
        question: "Read: 'All employees must complete the safety training by the end of the month. Those who fail to comply will face disciplinary action.' What happens to employees who don't complete training?",
        options: [
          "They get a bonus",
          "They face disciplinary action",
          "They are promoted",
          "Nothing happens"
        ],
        correctAnswer: "They face disciplinary action",
        explanation: "The text clearly states that non-compliance will result in 'disciplinary action.'",
        points: 15
      },
      {
        id: "q3",
        question: "Read: 'The merger between TechCorp and InnovateInc was announced yesterday. The combined company will have over 5,000 employees worldwide.' How many employees will the merged company have?",
        options: ["Under 1,000", "Around 2,500", "Over 5,000", "Exactly 10,000"],
        correctAnswer: "Over 5,000",
        explanation: "The text explicitly states the combined company will have 'over 5,000 employees worldwide.'",
        points: 15
      }
    ]
  },

  // HARD QUIZZES (3)
  {
    title: "Advanced Business Terminology",
    description: "Complex business vocabulary for TOEIC advanced level",
    type: "vocabulary" as const,
    difficulty: "hard" as const,
    timeLimit: 1200, // 20 minutes
    questions: [
      {
        id: "q1",
        question: "What does 'amortization' mean in business context?",
        options: [
          "The gradual reduction of a debt over time",
          "A type of investment",
          "A meeting schedule",
          "A computer algorithm"
        ],
        correctAnswer: "The gradual reduction of a debt over time",
        explanation: "Amortization is the gradual reduction of a debt through regular payments over time.",
        points: 20
      },
      {
        id: "q2",
        question: "Which term describes 'the difference between revenue and cost of goods sold'?",
        options: ["Gross margin", "Net profit", "Operating expense", "Capital expenditure"],
        correctAnswer: "Gross margin",
        explanation: "Gross margin is the difference between revenue and the cost of goods sold.",
        points: 20
      },
      {
        id: "q3",
        question: "What does 'leverage' mean in financial context?",
        options: [
          "Using borrowed money to increase potential returns",
          "A type of insurance",
          "A management style",
          "A marketing strategy"
        ],
        correctAnswer: "Using borrowed money to increase potential returns",
        explanation: "Leverage refers to using borrowed money to increase the potential return on investment.",
        points: 20
      }
    ]
  },
  {
    title: "Advanced Grammar Mastery",
    description: "Complex grammar structures for TOEIC advanced level",
    type: "grammar" as const,
    difficulty: "hard" as const,
    timeLimit: 1200,
    questions: [
      {
        id: "q1",
        question: "Choose the correct form: 'Had the company _____ earlier, the losses could have been avoided.'",
        options: ["acted", "act", "acting", "to act"],
        correctAnswer: "acted",
        explanation: "Use past participle 'acted' after 'had' in past perfect conditional structure.",
        points: 20
      },
      {
        id: "q2",
        question: "Complete: 'Not only _____ the sales increase, but customer satisfaction also improved.'",
        options: ["did", "do", "does", "will"],
        correctAnswer: "did",
        explanation: "With 'not only...but also', use auxiliary 'did' to form the inverted structure.",
        points: 20
      },
      {
        id: "q3",
        question: "Which is correct: 'The committee, along with its advisors, _____ a decision yesterday.'",
        options: ["made", "make", "makes", "will make"],
        correctAnswer: "made",
        explanation: "The subject 'committee' is singular, so use 'made' (past tense). 'Along with' doesn't affect verb agreement.",
        points: 20
      }
    ]
  },
  {
    title: "Complex Business Analysis",
    description: "Sophisticated business texts for TOEIC advanced level",
    type: "reading" as const,
    difficulty: "hard" as const,
    timeLimit: 1200,
    questions: [
      {
        id: "q1",
        question: "Read: 'The company's strategic pivot towards digital transformation, while initially costly, has positioned it favorably in the competitive landscape. However, the transition has been met with resistance from legacy system users.' What challenge does the company face?",
        options: [
          "High digital transformation costs",
          "Resistance from legacy system users",
          "Unfavorable competitive position",
          "Lack of strategic direction"
        ],
        correctAnswer: "Resistance from legacy system users",
        explanation: "The text explicitly mentions that 'the transition has been met with resistance from legacy system users.'",
        points: 20
      },
      {
        id: "q2",
        question: "Read: 'Market volatility has necessitated a more conservative approach to portfolio management. Consequently, the investment committee has revised its risk tolerance parameters and implemented stricter due diligence protocols.' What action did the investment committee take?",
        options: [
          "Increased risk tolerance",
          "Implemented stricter due diligence protocols",
          "Expanded portfolio diversification",
          "Reduced market analysis"
        ],
        correctAnswer: "Implemented stricter due diligence protocols",
        explanation: "The text states the committee 'implemented stricter due diligence protocols' as a response to market volatility.",
        points: 20
      },
      {
        id: "q3",
        question: "Read: 'The merger's success hinges on seamless integration of disparate corporate cultures. While the financial synergies are promising, cultural misalignment could undermine the projected $50 million in annual cost savings.' What could threaten the merger's success?",
        options: [
          "Financial difficulties",
          "Cultural misalignment",
          "Regulatory issues",
          "Market competition"
        ],
        correctAnswer: "Cultural misalignment",
        explanation: "The text explicitly states that 'cultural misalignment could undermine the projected cost savings,' indicating it threatens the merger's success.",
        points: 20
      }
    ]
  }
];

async function addSampleQuizzes() {
  try {
    console.log('Adding sample quizzes to database...');
    
    for (const quiz of sampleQuizzes) {
      await prisma.quiz.create({
        data: {
          title: quiz.title,
          description: quiz.description,
          type: quiz.type,
          difficulty: quiz.difficulty,
          timeLimit: quiz.timeLimit,
          questions: JSON.stringify(quiz.questions),
        },
      });
      console.log(`✅ Added quiz: ${quiz.title} (${quiz.difficulty})`);
    }
    
    console.log(`\n🎉 Successfully added ${sampleQuizzes.length} sample quizzes!`);
    console.log('📊 Breakdown:');
    console.log('   - Easy: 3 quizzes');
    console.log('   - Medium: 3 quizzes'); 
    console.log('   - Hard: 3 quizzes');
    
  } catch (error) {
    console.error('❌ Error adding sample quizzes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleQuizzes();
