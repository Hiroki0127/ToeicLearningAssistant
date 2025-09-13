import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api/knowledge-graph';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual token

async function testAPI() {
  try {
    console.log('🚀 Testing Knowledge Graph API Endpoints\n');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_TOKEN}`,
    };

    // Test 1: Get related concepts
    console.log('='.repeat(60));
    console.log('🔍 TEST 1: Get Related Concepts');
    console.log('='.repeat(60));
    
    try {
      const response = await fetch(`${BASE_URL}/related-concepts?word=procurement&maxDepth=2&limit=5`, {
        method: 'GET',
        headers,
      });
      
      const data = await response.json();
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.log('Error:', error.message);
    }

    // Test 2: Get learning paths
    console.log('\n' + '='.repeat(60));
    console.log('🛤️ TEST 2: Get Learning Paths');
    console.log('='.repeat(60));
    
    try {
      const response = await fetch(`${BASE_URL}/learning-paths?startWord=procurement&endWord=contract&maxLength=4`, {
        method: 'GET',
        headers,
      });
      
      const data = await response.json();
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.log('Error:', error.message);
    }

    // Test 3: Get similar concepts
    console.log('\n' + '='.repeat(60));
    console.log('🔍 TEST 3: Get Similar Concepts');
    console.log('='.repeat(60));
    
    try {
      const response = await fetch(`${BASE_URL}/similar-concepts?word=procurement&limit=5&minSimilarity=0.5`, {
        method: 'GET',
        headers,
      });
      
      const data = await response.json();
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.log('Error:', error.message);
    }

    // Test 4: Enhance RAG
    console.log('\n' + '='.repeat(60));
    console.log('🧠 TEST 4: Enhance RAG');
    console.log('='.repeat(60));
    
    try {
      const response = await fetch(`${BASE_URL}/enhance-rag`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: 'procurement' }),
      });
      
      const data = await response.json();
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.log('Error:', error.message);
    }

    // Test 5: Get concept info
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST 5: Get Concept Info');
    console.log('='.repeat(60));
    
    try {
      const response = await fetch(`${BASE_URL}/concept/procurement`, {
        method: 'GET',
        headers,
      });
      
      const data = await response.json();
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.log('Error:', error.message);
    }

    // Test 6: Get stats
    console.log('\n' + '='.repeat(60));
    console.log('📈 TEST 6: Get Knowledge Graph Stats');
    console.log('='.repeat(60));
    
    try {
      const response = await fetch(`${BASE_URL}/stats`, {
        method: 'GET',
        headers,
      });
      
      const data = await response.json();
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.log('Error:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Knowledge Graph API Tests Completed!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    console.log('✅ Server is running:', data.status);
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first with: npm run dev');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testAPI();
  }
  process.exit(0);
}

main();
