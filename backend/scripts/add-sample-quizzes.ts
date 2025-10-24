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
  },

  // Authentic TOEIC Part 5 Questions from Official Sample Test
  {
    title: "TOEIC Part 5 - Official Sample Questions",
    description: "Authentic TOEIC Part 5 questions from official sample test",
    type: "part5" as const,
    difficulty: "medium" as const,
    timeLimit: 600,
    questions: [
      {
        id: "toeic-101",
        question: "Customer reviews indicate that many modern mobile devices are often unnecessarily ------- .",
        options: [
          "complication",
          "complicates", 
          "complicate",
          "complicated"
        ],
        correctAnswer: "complicated",
        explanation: "The sentence needs an adjective to describe 'mobile devices'. 'Complicated' is the correct adjective form.",
        points: 10
      },
      {
        id: "toeic-102",
        question: "Jamal Nawzad has received top performance reviews ------- he joined the sales department two years ago.",
        options: [
          "despite",
          "except",
          "since",
          "during"
        ],
        correctAnswer: "since",
        explanation: "'Since' is used with present perfect tense to indicate a point in time when an action started that continues to the present.",
        points: 10
      },
      {
        id: "toeic-103",
        question: "Gyeon Corporation's continuing education policy states that ------- learning new skills enhances creativity and focus.",
        options: [
          "regular",
          "regularity",
          "regulate",
          "regularly"
        ],
        correctAnswer: "regularly",
        explanation: "The sentence needs an adverb to modify the verb 'learning'. 'Regularly' is the correct adverb form.",
        points: 10
      },
      {
        id: "toeic-104",
        question: "Among ------- recognized at the company awards ceremony were senior business analyst Natalie Obi and sales associate Peter Comeau.",
        options: [
          "who",
          "whose",
          "they",
          "those"
        ],
        correctAnswer: "those",
        explanation: "'Those' is used as a pronoun to refer to people who were recognized at the ceremony.",
        points: 10
      },
      {
        id: "toeic-105",
        question: "All clothing sold in Develyn's Boutique is made from natural materials and contains no ------- dyes.",
        options: [
          "immediate",
          "synthetic",
          "reasonable",
          "assumed"
        ],
        correctAnswer: "synthetic",
        explanation: "The context indicates the boutique uses only natural materials, so 'synthetic' (artificial/man-made) is the opposite of what they use.",
        points: 10
      }
    ]
  },

  // Authentic TOEIC Part 6 Questions from Official Sample Test
  {
    title: "TOEIC Part 6 - Official Text Completion",
    description: "Authentic TOEIC Part 6 text completion questions from official sample test",
    type: "part6" as const,
    difficulty: "medium" as const,
    timeLimit: 600,
    questions: [
      {
        id: "toeic-part6-email",
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
            question: "In the coming weeks, we will be organizing several training sessions for ------- employees.",
            options: [
              "interest",
              "interests", 
              "interested",
              "interesting"
            ],
            correctAnswer: "interested",
            explanation: "The blank needs an adjective to describe 'employees'. 'Interested' is the correct adjective form meaning 'having an interest in'.",
            points: 10
          },
          {
            number: 132,
            question: "Less experienced staff can quickly ------- a deep understanding of the design process.",
            options: [
              "develop",
              "raise",
              "open", 
              "complete"
            ],
            correctAnswer: "develop",
            explanation: "'Develop' means 'to acquire or build up' and is commonly used with 'understanding' in business contexts.",
            points: 10
          },
          {
            number: 133,
            question: "------- , they can improve their ability to communicate effectively across divisions.",
            options: [
              "After all",
              "For",
              "Even so",
              "At the same time"
            ],
            correctAnswer: "At the same time",
            explanation: "'At the same time' is used to introduce an additional point or benefit, showing that this is another positive outcome.",
            points: 10
          },
          {
            number: 134,
            question: "-------.",
            options: [
              "Let me explain our plans for on-site staff training.",
              "We hope that you will strongly consider joining us.",
              "Today's training session will be postponed until Monday.",
              "This is the first in a series of such lectures."
            ],
            correctAnswer: "We hope that you will strongly consider joining us.",
            explanation: "This sentence appropriately concludes the email by encouraging participation in the training sessions mentioned throughout the message.",
            points: 10
          }
        ]
      },
      {
        id: "toeic-part6-memo",
        passage: `DISCOUNT SHOE EMPORIUM

MEMORANDUM

TO: Sales Staff
FROM: Management B.K.
DATE: OCTOBER 9th, 20--
SUBJECT: FLYER MISPRINT

Please be aware that there was a misprint in an advertisement for our store in this week's local free press. The ad states that on Saturday all men's formal footwear is on for 55% percent off rather _______ 15% off. If customers come in and ask about this sale, please _______ and explain the printing error. Offer them an additional 5% off coupon to thank them for coming into our store. The coupon can be given out even if the customer decides not to purchase any shoes. Please call a manager to the sales floor _______ you encounter any customers who have the ad with them and demand to receive the 55% discount. These cases will be handled on an individual basis.

Thank you.

B.K.`,
        questions: [
          {
            number: 135,
            question: "The ad states that on Saturday all men's formal footwear is on for 55% percent off rather _______ 15% off.",
            options: [
              "that",
              "than",
              "then",
              "they're"
            ],
            correctAnswer: "than",
            explanation: "'Rather than' is the correct comparative phrase meaning 'instead of' or 'as opposed to'.",
            points: 10
          },
          {
            number: 136,
            question: "If customers come in and ask about this sale, please _______ and explain the printing error.",
            options: [
              "apologize",
              "compromise",
              "categorize",
              "analyze"
            ],
            correctAnswer: "apologize",
            explanation: "When there's an error that affects customers, the appropriate response is to 'apologize' for the mistake.",
            points: 10
          },
          {
            number: 137,
            question: "Please call a manager to the sales floor _______ you encounter any customers who have the ad with them.",
            options: [
              "because",
              "whether",
              "if",
              "before"
            ],
            correctAnswer: "if",
            explanation: "'If' introduces a conditional clause indicating what to do in a specific situation.",
            points: 10
          }
        ]
      },
      {
        id: "toeic-part6-letter",
        passage: `Sid's Stationery
2 Smythe St, Toronto, Canada M1B 5T6
Tel: (416) 295-1725

December 1st, 20--

Kerry Michaels
1 Stevens Rd.
Scarborough, Ontario, Canada M1E 4H7

Dear Ms. Michaels:

Holiday Sale

Seasons Greetings. As a _______ customer, we wanted you to be among the first to know about our upcoming holiday sale. All craft paper, specialty printer paper, and decorative envelopes will be reduced by 50% for the month of December. As per tradition at Sid's Stationery, we will be having a Christmas raffle. This year the grand prize is a 2-night stay for two at the Meridian Inn _______ Toronto Island. The winner will receive a free double occupancy stay in the penthouse suite as well as a free dinner on the moonlit patio. Money from ticket sales will be _______ to The Family Foundation, a local organization that provides food and clothing to those who need it most this Christmas. We look forward to seeing you this Christmas season.

Yours truly,

Sid and Sandy Chester`,
        questions: [
          {
            number: 138,
            question: "As a _______ customer, we wanted you to be among the first to know about our upcoming holiday sale.",
            options: [
              "value",
              "valued",
              "valid",
              "validate"
            ],
            correctAnswer: "valued",
            explanation: "'Valued customer' is a common business expression meaning 'important or appreciated customer'.",
            points: 10
          },
          {
            number: 139,
            question: "This year the grand prize is a 2-night stay for two at the Meridian Inn _______ Toronto Island.",
            options: [
              "through",
              "on",
              "over",
              "at"
            ],
            correctAnswer: "on",
            explanation: "The preposition 'on' is used with islands to indicate location (e.g., 'on Toronto Island').",
            points: 10
          },
          {
            number: 140,
            question: "Money from ticket sales will be _______ to The Family Foundation.",
            options: [
              "purchased",
              "donated",
              "funded",
              "collected"
            ],
            correctAnswer: "donated",
            explanation: "'Donated' means 'given as a gift' and is the appropriate verb when giving money to a charitable organization.",
            points: 10
          }
        ]
      }
    ]
  },

  // Authentic TOEIC Part 7 Questions from Official Sample Test
  {
    title: "TOEIC Part 7 - Official Reading Comprehension",
    description: "Authentic TOEIC Part 7 reading comprehension questions from official sample test",
    type: "part7" as const,
    difficulty: "medium" as const,
    timeLimit: 600,
    questions: [
      {
        id: "toeic-part7-car-ad",
        passage: `Used Car For Sale

Six-year old Carlisle Custom. Only one owner. Low Mileage. Car used to commute short distances to town. Brakes and tires replaced six months ago. Struts replaced two weeks ago. Air conditioning works well, but heater takes a while to warm up. Brand new spare tire included. Priced to sell. Owner going overseas at the end of this month and must sell the car.

Call Giroozeh Ghorbani at 848-555-0231.`,
        questions: [
          {
            number: 147,
            question: "What is suggested about the car?",
            options: [
              "It was recently repaired.",
              "It has had more than one owner.",
              "It is very fuel efficient.",
              "It has been on sale for six months."
            ],
            correctAnswer: "It was recently repaired.",
            explanation: "The advertisement mentions that 'Struts replaced two weeks ago' and 'Brakes and tires replaced six months ago', indicating recent repairs.",
            points: 10
          },
          {
            number: 148,
            question: "According to the advertisement, why is Ms. Ghorbani selling her car?",
            options: [
              "She cannot repair the car's temperature control.",
              "She finds it difficult to maintain.",
              "She would like to have a newer model.",
              "She is leaving for another country."
            ],
            correctAnswer: "She is leaving for another country.",
            explanation: "The advertisement states 'Owner going overseas at the end of this month and must sell the car.'",
            points: 10
          }
        ]
      },
      {
        id: "toeic-part7-business-article",
        passage: `On Monday, Salinas Products, a large food distributor based in Mexico City, announced its plans to acquire the Pablo's restaurant chain. Pablo Benavidez, the chain's owner, had been considering holding an auction for ownership of the chain. He ultimately made the decision to sell to Salinas without seeking other offers. According to inside sources, Salinas has agreed to keep the restaurant's name as part of the deal. Mr. Benavidez started the business 40 years ago right after finishing school. He opened a small food stand in his hometown of Cancún. Following that, he opened restaurants in Puerto Vallarta and Veracruz, and there are now over 50 Pablo's restaurants nationwide.`,
        questions: [
          {
            number: 149,
            question: "What is suggested about Mr. Benavidez?",
            options: [
              "He has hired Salinas Products to distribute his products.",
              "He has agreed to sell his business to Salinas Products.",
              "He has recently been hired as an employee of a school.",
              "He has been chosen to be the new president of Salinas Products."
            ],
            correctAnswer: "He has agreed to sell his business to Salinas Products.",
            explanation: "The article states that 'Salinas Products...announced its plans to acquire the Pablo's restaurant chain' and that Mr. Benavidez 'ultimately made the decision to sell to Salinas'.",
            points: 10
          },
          {
            number: 150,
            question: "According to the article, where is Mr. Benavidez from?",
            options: [
              "Cancún",
              "Veracruz",
              "Mexico City",
              "Puerto Vallarta"
            ],
            correctAnswer: "Cancún",
            explanation: "The article states that Mr. Benavidez 'opened a small food stand in his hometown of Cancún'.",
            points: 10
          },
          {
            number: 151,
            question: "What is indicated about the Pablo's restaurant chain?",
            options: [
              "It was recently sold in an auction.",
              "It will soon change its name.",
              "It was founded 40 years ago.",
              "It operates in several countries."
            ],
            correctAnswer: "It was founded 40 years ago.",
            explanation: "The article states that 'Mr. Benavidez started the business 40 years ago right after finishing school'.",
            points: 10
          }
        ]
      },
      {
        id: "toeic-part7-job-advertisement",
        passage: `Sizabantu Paralegal Service

We are looking for a proficient secretary for a local paralegal firm on West Wing Avenue.

A university degree or higher is required to qualify for this position. The duties include guiding clients, managing conference schedules, providing online and telephone customer service, and arranging documents. The successful candidate will also be skilled in the use of document editing software. The starting salary is $800 a month, and it can be further increased to $1,200 based on your output.

Kindly send your application to juliana@jerichoparalegal.com to be considered.`,
        questions: [
          {
            number: 152,
            question: "What job is the vacancy closest to in terms of the duties involved?",
            options: [
              "An international lawyer",
              "A customer service manager",
              "An administrative assistant",
              "A legal associate"
            ],
            correctAnswer: "An administrative assistant",
            explanation: "The duties listed (guiding clients, managing schedules, customer service, arranging documents) are typical administrative assistant responsibilities.",
            points: 10
          }
        ]
      },
      {
        id: "toeic-part7-delivery-email",
        passage: `To: Richard Thompson <richardthompson@gmail.com>
From: Stephen Warren <stephenwarren@matinowear.com>
Date: November 4
Subject: Our apologies for the late delivery!

Dear Mr. Thompson,

At Matino Wear, we appreciate you placing your order with us. Regrettably, there will be a slight delay in the delivery because of the recent wildfire in the southern part of the country.

Unfortunately, the incident has caused several road closures. We are working closely with the government and drivers to resume our regular deliveries as soon as possible. Notable adjustments have already been made, as the employees who can't commute are advised to work from home, and we expect to resume our deliveries at full capacity within 24 hours. We can guarantee that your order will be shipped at the end of the week.

Please bear with us. As a token of our appreciation, all the shipping fees for this order will not be charged, and the shipment of your next three orders will also be free of charge.

Thank you for your patience!

Best regards,
Stephen Warren
Customer Relations Manager`,
        questions: [
          {
            number: 153,
            question: "What is the main reason for the delivery delay?",
            options: [
              "The payment has still not been received",
              "The firm has used an inaccurate mailing address",
              "The government has imposed sanctions on shipping",
              "Unexpected circumstances have affected the delivery"
            ],
            correctAnswer: "Unexpected circumstances have affected the delivery",
            explanation: "The email states that the delay is 'because of the recent wildfire in the southern part of the country' which has 'caused several road closures'.",
            points: 10
          }
        ]
      },
      {
        id: "toeic-part7-spa-invoice",
        passage: `Invoice to Naomi Sawai
Chiba Luxury Spa Invoice

Customer: Naomi Sawai
Date: April 5

Services and Products Purchased:
Hot Rock Massage Treatment: $120.00
Relaxing hot rock massage focusing on reducing muscle tension and improving circulation.

House Brand Moisturizer: $45.00
A specially formulated moisturizer made with natural ingredients to help keep your skin soft and hydrated.

House Brand Cleanser: $30.00
A gentle facial cleanser that removes impurities while preserving natural moisture balance.

Total Amount: $195.00
Payment Method: Credit Card (ending in 1234)

Thank you for visiting Chiba Luxury Spa, Naomi! We hope you enjoyed your experience and look forward to welcoming you back soon. Don't forget to check out our upcoming sales on your favorite treatments and products!

Special Note: You earned 15 loyalty points with this visit. Collect points for future discounts!

Upcoming Sales Announcement
Chiba Luxury Spa – Special Sales Event
Event Dates: April 10 - April 15

Pamper Yourself for Less!

We are excited to announce fantastic discounts on our most popular treatments and skincare products during our special sales event. Don't miss this opportunity to indulge in luxury at a reduced price!

20% Off All Massage Treatments:
Enjoy a relaxing massage at a discounted rate. This includes our famous Hot Rock Massage, Swedish Massage, and Deep Tissue Massage. Whether you want to relieve stress or soothe sore muscles, this offer is perfect for you.

15% Off House Brand Skincare Products:
Keep your skin glowing with our premium house brand products, including moisturizers, cleansers, and serums. All products are crafted to provide the best care for your skin, using natural and high-quality ingredients.

Booking Information:
Book your appointment between April 10 and April 15 to take advantage of these offers.
Appointments are limited, so please call (555) 123-4567 or visit our website at www.chibaluxuryspa.com to reserve your spot.

Loyalty Member Bonus:
Earn double loyalty points for any purchases made during the sales event. Accumulate points and receive discounts on future visits!`,
        questions: [
          {
            number: 154,
            question: "What services and products did Naomi Sawai purchase during her visit to Chiba Luxury Spa?",
            options: [
              "A facial treatment, a cleanser, and a serum",
              "A hot rock massage, a moisturizer, and a cleanser",
              "A Swedish massage and a body scrub",
              "A manicure and pedicure"
            ],
            correctAnswer: "A hot rock massage, a moisturizer, and a cleanser",
            explanation: "The invoice shows Naomi purchased: Hot Rock Massage Treatment ($120.00), House Brand Moisturizer ($45.00), and House Brand Cleanser ($30.00).",
            points: 10
          },
          {
            number: 155,
            question: "How much would Naomi save if she books another Hot Rock Massage during the sales event?",
            options: [
              "$10.00",
              "$18.00",
              "$24.00",
              "$30.00"
            ],
            correctAnswer: "$24.00",
            explanation: "The original Hot Rock Massage costs $120.00. With 20% off, the discount would be $120.00 × 0.20 = $24.00.",
            points: 10
          },
          {
            number: 156,
            question: "If Naomi wants to buy another moisturizer during the sales event, how much would she pay?",
            options: [
              "$36.00",
              "$38.25",
              "$40.00",
              "$42.75"
            ],
            correctAnswer: "$38.25",
            explanation: "The original moisturizer costs $45.00. With 15% off, Naomi would pay $45.00 × 0.85 = $38.25.",
            points: 10
          }
        ]
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
