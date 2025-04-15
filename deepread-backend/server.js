   // server.js
   const express = require('express');
   const { OpenAI } = require('openai');
   const fetch = require('node-fetch');
   require('dotenv').config();

   const app = express();
   app.use(express.json());

   // Print all environment variables for debugging
   console.log("Environment variables:", Object.keys(process.env));
   console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
   console.log("OPENAI_API_KEY length:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
   console.log("OPENAI_API_KEY starts with:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) : "not set");
   console.log("\n===== SERVER STARTED AND READY FOR REQUESTS =====\n");

   try {
     // Initialize OpenAI client
     const openai = new OpenAI({
       apiKey: process.env.OPENAI_API_KEY,
     });

     console.log("OpenAI client initialized successfully");
   } catch (error) {
     console.error("Error initializing OpenAI client:", error);
   }

   // Add CORS support for browser requests
   app.use((req, res, next) => {
     console.log(`Received ${req.method} request to ${req.path} from ${req.ip}`);
     console.log('Request headers:', req.headers);
     
     res.header('Access-Control-Allow-Origin', '*');
     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
     if (req.method === 'OPTIONS') {
       return res.sendStatus(200);
     }
     next();
   });

   // Reliable fallback mock data
   const mockResponses = {
     'thinking, fast and slow': [
       'System 1 vs System 2 thinking',
       'Cognitive biases',
       'Heuristics',
       'Prospect theory',
       'Loss aversion',
       'Anchoring effect',
       'Availability heuristic',
       'Overconfidence',
       'Sunk cost fallacy',
       'Decision making under uncertainty'
     ],
     '1984': [
       'Totalitarianism',
       'Government surveillance',
       'Thought control',
       'Dystopian society',
       'Historical revisionism',
       'Manipulation of language',
       'Psychological control',
       'Political propaganda',
       'Individual freedom',
       'Resistance against authority'
     ],
     'to kill a mockingbird': [
       'Racial injustice',
       'Moral growth',
       'Social inequality',
       'Courage',
       'Empathy',
       'Childhood innocence',
       'Legal system',
       'Prejudice',
       'Small-town life',
       'Family relationships'
     ],
     'the great gatsby': [
       'American Dream',
       'Wealth inequality',
       'Social class',
       'Love and obsession',
       'Disillusionment',
       'Morality',
       'Symbolism',
       'Jazz Age',
       'Materialism',
       'Identity'
     ],
     'default': [
       'Character development',
       'Plot structure',
       'Setting and atmosphere',
       'Themes and motifs',
       'Narrative perspective',
       'Literary devices',
       'Cultural context',
       'Historical significance',
       'Symbolism',
       "Author's style"
     ]
   };

   // Testing endpoint
   app.get('/test', (req, res) => {
     res.json({ status: 'Server is running' });
   });

   app.post('/extract-concepts', async (req, res) => {
     console.log('\n==== NEW REQUEST ====');
     console.log('Request body:', req.body);
     
     const { bookName } = req.body;

     if (!bookName) {
       console.log('Missing bookName in request');
       return res.status(400).json({ error: 'Missing bookName in request body' });
     }

     try {
       // Log the request for debugging
       console.log(`Received request for book: "${bookName}"`);
       const bookKey = bookName.toLowerCase();

       try {
         // Initialize OpenAI
         console.log("Creating OpenAI client with key prefix:", process.env.OPENAI_API_KEY.substring(0, 10) + "...");
         const openai = new OpenAI({
           apiKey: process.env.OPENAI_API_KEY.trim(), // Make sure to trim whitespace
         });
         
         // Use OpenAI to extract concepts
         console.log("Sending request to OpenAI API...");
         
         // Log the exact request we're sending
          
         const messages = [
            {
              role: "system",
              content: `You are an expert in educational content design. Your task is to break down non-fiction books into specific, teachable concepts. Extract named principles, methods, frameworks, and key ideas that could each be taught as a standalone lesson. Identify precise terminology from the book, not vague categories.`
            },
            {
              role: "user",
              content: `Extract ALL specific learning concepts from the book "${bookName}".

Follow these guidelines:
1. Identify precise named principles, theories, methods, models, and key ideas
2. Use the actual terminology from the book 
3. Combine related ideas into meaningful concept pairs when appropriate
4. Be specific enough that each concept could be the title of a focused lesson
5. Avoid overly broad categories 
6. Be comprehensive - include ALL teachable concepts from the book

Format the output as a numbered list with ONLY the concept names. Do not include descriptions, explanations, or any other text besides the numbered concepts.`
            }
         ];
         console.log("Request messages:", JSON.stringify(messages, null, 2));
         
         try {
           // Add a simple test to directly use Fetch API like the debug server
           console.log("\n==== DIRECT FETCH TEST ====");
           console.log("Making a direct API request from server.js to verify API is working...");
           
           const url = "https://api.openai.com/v1/chat/completions";
           const headers = {
             "Content-Type": "application/json",
             "Authorization": `Bearer ${process.env.OPENAI_API_KEY.trim()}`
           };
           const body = {
             model: "gpt-4o-mini",
             messages: [
               {
                 role: "system",
                 content: "You are a literary analysis assistant."
               },
               {
                 role: "user",
                 content: `Give me 5 key concepts from the book "The Hobbit" as a comma-separated list.`
               }
             ],
             temperature: 0.7,
             max_tokens: 1000
           };
           
           console.log("Sending request to URL:", url);
           console.log("With headers:", JSON.stringify({...headers, Authorization: "Bearer sk-..."}));
           console.log("And body:", JSON.stringify(body));
           
           try {
             const directResponse = await fetch(url, {
               method: 'POST',
               headers: headers,
               body: JSON.stringify(body)
             });
             
             if (directResponse.ok) {
               const directData = await directResponse.json();
               console.log("Direct API call succeeded!");
               console.log("Direct API response:", JSON.stringify(directData, null, 2));
             } else {
               console.error("Direct API call failed with status:", directResponse.status);
               const errorText = await directResponse.text();
               console.error("Error response:", errorText);
             }
           } catch (fetchError) {
             console.error("Error making direct API call:", fetchError.message);
           }
           
           // Now try the normal OpenAI SDK approach
           console.log("\n==== SDK APPROACH ====");
           console.log("Sending request to OpenAI API via SDK...");
           const completion = await openai.chat.completions.create({
             model: "gpt-4o-mini",
             messages: messages,
             temperature: 0.7,
             max_tokens: 1000,
           });
           
           console.log("Received response from OpenAI API");
           console.log("Response object type:", typeof completion);
           console.log("Response has choices:", !!completion.choices);
           console.log("Choices length:", completion.choices ? completion.choices.length : 0);
           
           if (completion.choices && completion.choices.length > 0) {
             const conceptsText = completion.choices[0].message.content.trim();
             console.log("Raw concepts text:", conceptsText);
             
             let concepts = [];
             
             // Try multiple parsing methods
             // First check if it's a numbered list with newlines
             if (conceptsText.includes('\n') && /\d\./.test(conceptsText)) {
               console.log("Detected numbered list format");
               concepts = conceptsText
                 .split('\n')
                 .map(line => line.trim())
                 .filter(line => line.length > 0)
                 .map(line => line.replace(/^\d+[\.\)]\s*/, '')); // Remove number prefixes like "1." or "1)"
             } 
             // Next check if it's comma-separated
             else if (conceptsText.includes(',')) {
               console.log("Detected comma-separated format");
               concepts = conceptsText
                 .split(',')
                 .map(line => line.trim())
                 .filter(line => line.length > 0);
             }
             // Fallback to generic line splitting
             else {
               console.log("Using fallback line splitting");
               concepts = conceptsText
                 .split(/[\n\r]+/)
                 .map(line => line.trim())
                 .filter(line => line.length > 0)
                 .map(line => line.replace(/^[•\-*]\s*/, ''))  // Remove bullet points
                 .map(line => line.replace(/^\d+[\.\)]\s*/, '')); // Remove numbers
             }
             
             console.log("Parsed concepts:", concepts);
             
             if (concepts.length > 0) {
               return res.json({ 
                 concepts: concepts, 
                 source: 'openai' 
               });
             } else {
               console.log("No concepts parsed from response, using fallback");
               const concepts = mockResponses[bookKey] || mockResponses['default'];
               return res.json({ concepts, source: 'parsing-failed-fallback' });
             }
           } else {
             console.log("No concepts found in API response, using fallback");
             const concepts = mockResponses[bookKey] || mockResponses['default'];
             return res.json({ concepts, source: 'api-empty-response-fallback' });
           }
         } catch (callError) {
           console.error("Error calling OpenAI API:", callError);
           console.error("Error type:", typeof callError);
           console.error("Error name:", callError.name);
           console.error("Error message:", callError.message);
           
           if (callError.stack) {
             console.error("Error stack:", callError.stack);
           }
           
           if (callError.response) {
             console.error("Error status:", callError.response.status);
             console.error("Error data:", callError.response.data);
           }

           const concepts = mockResponses[bookKey] || mockResponses['default'];
           return res.json({ concepts, source: `api-call-error-fallback: ${callError.message}` });
         }
       } catch (clientError) {
         console.error("Error creating OpenAI client:", clientError.message);
         const concepts = mockResponses[bookKey] || mockResponses['default'];
         return res.json({ concepts, source: 'client-error-fallback' });
       }
     } catch (error) {
       console.error('Server error:', error.message);
       const bookKey = req.body.bookName ? req.body.bookName.toLowerCase() : '';
       const concepts = mockResponses[bookKey] || mockResponses['default'];
       
       res.status(200).json({ 
         concepts,
         source: 'error-handler-fallback'
       });
     }
   });

   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
     
     if (!process.env.OPENAI_API_KEY) {
       console.error(`WARNING: OPENAI_API_KEY is not set in environment variables.`);
       console.error(`Please set this key in a .env file or environment to use the API.`);
     } else {
       console.log(`Using OpenAI API for concept extraction`);
     }
   });