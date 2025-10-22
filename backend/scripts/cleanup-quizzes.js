// Simple script to delete test quizzes via API calls
const quizIds = [
  'cmh2j8ygw00011bsxdz23y6d3', // Test Quiz
  'cmh2j36h800001bsxydv0oxtb', // efef
  'cmh2fukqx00005kwuurzzl318'  // Console Test Quiz
];

async function deleteQuizzes() {
  for (const quizId of quizIds) {
    try {
      const response = await fetch(`https://toeiclearningassistant.onrender.com/api/quiz/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log(`Quiz ${quizId}: ${response.status} - ${JSON.stringify(result)}`);
    } catch (error) {
      console.error(`Error deleting quiz ${quizId}:`, error);
    }
  }
}

deleteQuizzes();
