// server-compare.js - Compare both APIs
const fetch = require('node-fetch');

async function compare() {
  const bookName = 'The Hobbit'; // Test with the same book name
  
  console.log('=== Testing MAIN server (3000) ===');
  try {
    const mainResponse = await fetch('http://localhost:3000/extract-concepts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookName })
    });
    const mainData = await mainResponse.json();
    console.log('Main server response:', JSON.stringify(mainData, null, 2));
  } catch (error) {
    console.error('Error with main server:', error.message);
  }
  
  console.log('\n=== Testing DEBUG server (3001) ===');
  try {
    const debugResponse = await fetch('http://localhost:3001/test-openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookName })
    });
    const debugData = await debugResponse.json();
    console.log('Debug server response:', JSON.stringify(debugData, null, 2));
  } catch (error) {
    console.error('Error with debug server:', error.message);
  }
}

compare(); 