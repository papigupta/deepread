// server-new.js - A clean implementation
const express = require('express');
const { OpenAI } = require('openai');
const fetch = require('node-fetch');
require('dotenv').config();

// Basic fallback data
const fallbackConcepts = [
  'Adventure',
  'Journey',
  'Growth',
  'Friendship',
  'Courage',
  'Conflict',
  'Identity',
  'Sacrifice',
  'Transformation',
  'Redemption'
];

// Create Express app
const app = express();
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Direct API endpoint without using the OpenAI SDK
app.post('/direct-concepts', async (req, res) => {
  console.log('Request body:', req.body);
  const { bookName } = req.body;
  
  if (!bookName) {
    return res.status(400).json({ error: 'Missing bookName in request' });
  }
  
  try {
    // Log environment for debugging
    console.log(`API key length: ${process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0}`);
    console.log(`Book name: "${bookName}"`);
    
    // Make direct API call
    const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY.trim()}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a literary analyst. List key concepts as a comma-separated list without additional text.' },
          { role: 'user', content: `Extract 10 key concepts from "${bookName}" as a comma-separated list without numbering.` }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    
    // Check response
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log('OpenAI response:', JSON.stringify(data, null, 2));
      
      if (data.choices && data.choices.length > 0) {
        const text = data.choices[0].message.content.trim();
        console.log('Raw text:', text);
        
        // Parse concepts - supporting comma-separated or line-separated formats
        let concepts = [];
        
        if (text.includes(',')) {
          // Comma-separated format
          concepts = text.split(',').map(c => c.trim()).filter(c => c.length > 0);
        } else if (text.includes('\n')) {
          // Line-separated format  
          concepts = text.split('\n').map(c => c.trim())
            .filter(c => c.length > 0)
            .map(c => c.replace(/^\d+[\.\)]\s*/, '')) // Remove numbering
            .map(c => c.replace(/^[•\-*]\s*/, '')); // Remove bullets
        } else {
          // Just use the whole text
          concepts = [text];
        }
        
        console.log('Parsed concepts:', concepts);
        
        if (concepts.length > 0) {
          return res.json({ 
            concepts: concepts.slice(0, 10), 
            source: 'openai-direct'
          });
        }
      }
      
      // If we got here, we didn't parse any concepts
      console.log('Failed to parse concepts from response');
      return res.json({ 
        concepts: fallbackConcepts,
        source: 'openai-parse-fail' 
      });
    } else {
      // API call failed
      const errorText = await apiResponse.text();
      console.error(`API error (${apiResponse.status}):`, errorText);
      
      return res.json({ 
        concepts: fallbackConcepts,
        source: 'openai-api-error' 
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    
    return res.json({ 
      concepts: fallbackConcepts,
      source: 'server-error'
    });
  }
});

// Original endpoint name for compatibility with frontend
app.post('/extract-concepts', async (req, res) => {
  console.log('Using extract-concepts endpoint');
  // Just forward to the direct implementation
  req.url = '/direct-concepts';
  app.handle(req, res);
});

// Start server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`New server running on port ${PORT}`);
  console.log(`OpenAI API Key exists: ${!!process.env.OPENAI_API_KEY}`);
}); 