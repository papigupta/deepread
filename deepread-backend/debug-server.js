// debug-server.js - A minimal server to test OpenAI API
const express = require('express');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());

// Set up CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Log all environment variables
console.log("Environment variables:", Object.keys(process.env));
console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
console.log("OPENAI_API_KEY length:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
console.log("OPENAI_API_KEY prefix:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + "..." : "N/A");

// Test OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple test endpoint
app.post('/test-openai', async (req, res) => {
  const { bookName } = req.body;
  
  if (!bookName) {
    return res.status(400).json({ error: 'Missing bookName parameter' });
  }
  
  console.log(`Test request for book: "${bookName}"`);
  
  try {
    console.log("Sending OpenAI request...");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a literary analysis assistant."
        },
        {
          role: "user",
          content: `Extract 5 key concepts from the book "${bookName}" as a comma-separated list.`
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });
    
    console.log("OpenAI response received:", JSON.stringify(completion, null, 2));
    
    if (completion.choices && completion.choices.length > 0) {
      const text = completion.choices[0].message.content.trim();
      console.log("Extracted text:", text);
      
      // Parse as comma-separated list
      const concepts = text.split(',').map(c => c.trim()).filter(c => c.length > 0);
      
      return res.json({
        success: true,
        source: 'openai',
        rawResponse: text,
        concepts: concepts
      });
    } else {
      console.log("No choices in response");
      return res.json({
        success: false,
        error: 'No content in API response',
        rawResponse: completion
      });
    }
  } catch (error) {
    console.error("API error:", error);
    console.error("Error type:", typeof error);
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.name,
      errorDetails: JSON.stringify(error)
    });
  }
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
}); 