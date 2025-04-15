// Simple test script for the API
const fetch = require('node-fetch');

const testBookAPI = async () => {
  const bookName = process.argv[2] || '1984';
  console.log(`Testing API with book name: ${bookName}`);
  
  try {
    // Using localhost since this is running on the same machine as the server
    const response = await fetch('http://localhost:3000/extract-concepts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookName })
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.concepts && data.concepts.length > 0) {
      console.log('\nConcepts found:');
      data.concepts.forEach((concept, index) => {
        console.log(`${index + 1}. ${concept}`);
      });
      console.log(`\nSource: ${data.source || 'unknown'}`);
    } else {
      console.log('No concepts found in the response');
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
};

testBookAPI(); 