// api-debug.js - Tool to debug OpenAI API issues
const { OpenAI } = require('openai');
require('dotenv').config();

console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
console.log("OPENAI_API_KEY length:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
console.log("OPENAI_API_KEY first 10 chars:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + "..." : "N/A");

async function testOpenAI() {
  try {
    console.log("Creating OpenAI client...");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("OpenAI client created successfully");
    
    console.log("Sending request to OpenAI API...");
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a literary analysis assistant that extracts key concepts from books."
          },
          {
            role: "user",
            content: `Extract 5 key concepts or themes from the book "1984". Return only the concepts as a list without numbering or explanation.`
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      });
      
      console.log("Response received!");
      console.log(JSON.stringify(completion, null, 2));
      
      if (completion && completion.choices && completion.choices.length > 0) {
        const conceptsText = completion.choices[0].message.content.trim();
        console.log("\nConcepts extracted:", conceptsText);
      } else {
        console.log("No completion choices found in response");
      }
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      }
    }
  } catch (error) {
    console.error("Error initializing OpenAI client:", error);
  }
}

testOpenAI(); 