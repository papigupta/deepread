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

   app.post('/assign-depth-targets', async (req, res) => {
     console.log('\n==== NEW DEPTH TARGET REQUEST ====');
     console.log('Request body:', req.body);
     
     const { bookName, concepts } = req.body;

     if (!bookName || !concepts || !Array.isArray(concepts) || concepts.length === 0) {
       console.log('Missing or invalid bookName or concepts in request');
       return res.status(400).json({ error: 'Request must include bookName and an array of concepts' });
     }

     try {
       console.log(`Assigning depth targets for book: "${bookName}" with ${concepts.length} concepts`);
       
       try {
         // Initialize OpenAI
         console.log("Creating OpenAI client with key prefix:", process.env.OPENAI_API_KEY.substring(0, 10) + "...");
         const openai = new OpenAI({
           apiKey: process.env.OPENAI_API_KEY.trim(),
         });
         
         // Use OpenAI to assign depth targets
         console.log("Sending depth target request to OpenAI API...");
         
         const messages = [
           {
             role: "system",
             content: `You are an expert instructional designer.`
           },
           {
             role: "user",
             content: `For each of the following concepts from the book "${bookName}," assign a \`depth_target\` — a number between 1 and 6 — that reflects how deeply the user should understand the concept.

Use this scale:

1 = Recall → Just remember the definition  
2 = Reframe → Explain it in your own words  
3 = Apply → Use it in a real-world situation  
4 = Contrast → Compare it with other ideas  
5 = Critique → Evaluate its limitations or flaws  
6 = Remix → Combine it with other models or frameworks to create something new

Your job is to decide how far a learner should go to truly *digest* each concept — not just understand it, but internalize it.

Return a clean JSON array like this:

\`\`\`json
[
  { "concept": "Concept 1", "depth_target": 4 },
  { "concept": "Concept 2", "depth_target": 3 },
  ...
]
\`\`\`

Here are the concepts:
${concepts.map((concept, index) => `${index + 1}. ${concept}`).join('\n')}`
           }
         ];
         
         console.log("Depth target request messages:", JSON.stringify(messages, null, 2));
         
         try {
           const completion = await openai.chat.completions.create({
             model: "gpt-4o-mini",
             messages: messages,
             temperature: 0.7,
             max_tokens: 1500,
           });
           
           console.log("Received depth target response from OpenAI API");
           
           if (completion.choices && completion.choices.length > 0) {
             const responseContent = completion.choices[0].message.content.trim();
             console.log("Raw depth target response:", responseContent);
             
             try {
               // Extract JSON array from the response
               let jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
               
               // If the response doesn't use the ```json format, try to parse the entire response
               const jsonText = jsonMatch ? jsonMatch[1] : responseContent;
               
               const conceptsWithDepth = JSON.parse(jsonText);
               console.log("Parsed concepts with depth targets:", conceptsWithDepth);
               
               if (Array.isArray(conceptsWithDepth) && conceptsWithDepth.length > 0) {
                 return res.json({ 
                   conceptsWithDepth: conceptsWithDepth, 
                   source: 'openai' 
                 });
               } else {
                 console.log("Invalid response format, using fallback");
                 const conceptsWithDepth = concepts.map(concept => ({ concept, depth_target: 3 }));
                 return res.json({ conceptsWithDepth, source: 'parsing-failed-fallback' });
               }
             } catch (parseError) {
               console.error("Error parsing JSON response:", parseError);
               const conceptsWithDepth = concepts.map(concept => ({ concept, depth_target: 3 }));
               return res.json({ conceptsWithDepth, source: 'json-parse-error-fallback' });
             }
           } else {
             console.log("No valid response, using fallback");
             const conceptsWithDepth = concepts.map(concept => ({ concept, depth_target: 3 }));
             return res.json({ conceptsWithDepth, source: 'api-empty-response-fallback' });
           }
         } catch (callError) {
           console.error("Error calling OpenAI API for depth targets:", callError);
           const conceptsWithDepth = concepts.map(concept => ({ concept, depth_target: 3 }));
           return res.json({ conceptsWithDepth, source: `api-call-error-fallback: ${callError.message}` });
         }
       } catch (clientError) {
         console.error("Error creating OpenAI client:", clientError.message);
         const conceptsWithDepth = concepts.map(concept => ({ concept, depth_target: 3 }));
         return res.json({ conceptsWithDepth, source: 'client-error-fallback' });
       }
     } catch (error) {
       console.error('Server error:', error.message);
       const conceptsWithDepth = concepts.map(concept => ({ concept, depth_target: 3 }));
       return res.json({ 
         conceptsWithDepth,
         source: 'error-handler-fallback'
       });
     }
   });

   app.post('/generate-questions', async (req, res) => {
     console.log('\n==== NEW QUESTION GENERATION REQUEST ====');
     console.log('Request body:', req.body);
     
     const { concept, depth_target, book_title, related_concepts, mental_models_pool } = req.body;

     if (!concept || !depth_target || !book_title) {
       console.log('Missing required fields in request');
       return res.status(400).json({ error: 'Request must include concept, depth_target, and book_title' });
     }

     try {
       console.log(`Generating questions for concept: "${concept}" with depth_target: ${depth_target} from book: "${book_title}"`);
       
       try {
         // Initialize OpenAI
         console.log("Creating OpenAI client with key prefix:", process.env.OPENAI_API_KEY.substring(0, 10) + "...");
         const openai = new OpenAI({
           apiKey: process.env.OPENAI_API_KEY.trim(),
         });
         
         // Use OpenAI to generate questions
         console.log("Sending question generation request to OpenAI API...");
         
         const messages = [
           {
             role: "system",
             content: `You are an expert educational content designer who creates practice questions to help students understand concepts deeply.

Each depth level corresponds to a specific cognitive level:
Level 1: Recall - Recognize or identify the idea
Level 2: Reframe - Explain it in their own words
Level 3: Apply - Use it in real-life context
Level 4: Contrast - Compare it with other ideas
Level 5: Critique - Evaluate flaws or limitations
Level 6: Remix - Combine it with other models

Your task is to generate 3 thought-provoking, open-ended questions for the requested concept at the specified depth level. These questions should help students truly understand and internalize the concept.`
           },
           {
             role: "user",
             content: `Generate 3 practice questions for the concept "${concept}" from the book "${book_title}" at depth level ${depth_target}.

${related_concepts && related_concepts.length > 0 ? `Related concepts: ${related_concepts.join(', ')}` : ''}
${mental_models_pool && mental_models_pool.length > 0 ? `Mental models pool: ${mental_models_pool.join(', ')}` : ''}

The questions should:
1. Match the cognitive depth level ${depth_target}
2. Be open-ended, encouraging deep thinking
3. Be specific to this concept, not generic
4. Include context relevant to the book when possible

Return ONLY a JSON object with this structure:
{
  "questions": [
    "Question 1 here",
    "Question 2 here",
    "Question 3 here"
  ]
}`
           }
         ];
         
         console.log("Question generation request messages:", JSON.stringify(messages, null, 2));
         
         try {
           const completion = await openai.chat.completions.create({
             model: "gpt-4o-mini",
             messages: messages,
             temperature: 0.7,
             max_tokens: 1000,
           });
           
           console.log("Received question generation response from OpenAI API");
           
           if (completion.choices && completion.choices.length > 0) {
             const responseContent = completion.choices[0].message.content.trim();
             console.log("Raw question generation response:", responseContent);
             
             try {
               // Extract JSON array from the response
               let jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
               
               // If the response doesn't use the ```json format, try to parse the entire response
               const jsonText = jsonMatch ? jsonMatch[1] : responseContent;
               
               const questionsData = JSON.parse(jsonText);
               console.log("Parsed questions:", questionsData);
               
               if (questionsData && questionsData.questions && Array.isArray(questionsData.questions)) {
                 return res.json({ 
                   questions: questionsData.questions, 
                   source: 'openai' 
                 });
               } else {
                 console.log("Invalid response format, using fallback");
                 const fallbackQuestions = generateFallbackQuestions(concept, depth_target);
                 return res.json({ questions: fallbackQuestions, source: 'parsing-failed-fallback' });
               }
             } catch (parseError) {
               console.error("Error parsing JSON response:", parseError);
               const fallbackQuestions = generateFallbackQuestions(concept, depth_target);
               return res.json({ questions: fallbackQuestions, source: 'json-parse-error-fallback' });
             }
           } else {
             console.log("No valid response, using fallback");
             const fallbackQuestions = generateFallbackQuestions(concept, depth_target);
             return res.json({ questions: fallbackQuestions, source: 'api-empty-response-fallback' });
           }
         } catch (callError) {
           console.error("Error calling OpenAI API for question generation:", callError);
           const fallbackQuestions = generateFallbackQuestions(concept, depth_target);
           return res.json({ questions: fallbackQuestions, source: `api-call-error-fallback: ${callError.message}` });
         }
       } catch (clientError) {
         console.error("Error creating OpenAI client:", clientError.message);
         const fallbackQuestions = generateFallbackQuestions(concept, depth_target);
         return res.json({ questions: fallbackQuestions, source: 'client-error-fallback' });
       }
     } catch (error) {
       console.error('Server error:', error.message);
       const fallbackQuestions = generateFallbackQuestions(concept, depth_target);
       return res.json({ 
         questions: fallbackQuestions,
         source: 'error-handler-fallback'
       });
     }
   });

   // Add a new endpoint for evaluating user responses
   app.post('/evaluate-insight', async (req, res) => {
     try {
       console.log('\n==== NEW EVALUATION REQUEST ====');
       const { userResponse, originalInsight, depthTarget } = req.body;
       
       // Validate inputs
       if (!userResponse || !originalInsight || !depthTarget) {
         return res.status(400).json({ 
           error: 'Missing required parameters',
           required: ['userResponse', 'originalInsight', 'depthTarget']
         });
       }

       console.log(`Evaluating response for depth target: ${depthTarget}`);
       console.log(`Original insight: ${originalInsight.substring(0, 50)}...`);
       console.log(`User response: ${userResponse.substring(0, 50)}...`);

       // Define the supabase URL and API key
       const supabaseUrl = process.env.SUPABASE_URL;
       const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
       
       // Check if Supabase credentials are available
       if (supabaseUrl && supabaseKey) {
         try {
           // Call the Supabase Edge Function
           const response = await fetch(`${supabaseUrl}/functions/v1/evaluate_insight`, {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${supabaseKey}`
             },
             body: JSON.stringify({
               userResponse,
               originalInsight,
               depthTarget
             })
           });

           if (!response.ok) {
             const errorText = await response.text();
             console.error(`Supabase function error: ${response.status} - ${errorText}`);
             // Fall through to OpenAI direct approach
           } else {
             const evaluationResult = await response.json();
             console.log('Evaluation result from Supabase:', JSON.stringify(evaluationResult, null, 2));
             return res.json(evaluationResult);
           }
         } catch (error) {
           console.error('Error calling Supabase function:', error);
           // Fall through to OpenAI direct approach
         }
       } else {
         console.log('Supabase credentials not found, using direct OpenAI evaluation');
       }

       // FALLBACK: Directly use OpenAI for evaluation if Supabase is not configured or fails
       console.log('Using direct OpenAI evaluation...');
       
       // Helper function to determine factors and weights
       function getFactorsForDepth(depthTarget) {
         const factors = {
           1: { // Recall
             accuracy: 0.40,
             understanding: 0.30,
             clarity: 0.20,
             relevance: 0.10
           },
           2: { // Reframe
             understanding: 0.30,
             clarity: 0.30,
             accuracy: 0.20,
             relevance: 0.20
           },
           3: { // Apply
             context_fit: 0.35,
             relevance: 0.20,
             understanding: 0.20,
             clarity: 0.15,
             depth: 0.10
           },
           4: { // Contrast
             understanding: 0.25,
             depth: 0.25,
             relevance: 0.20,
             clarity: 0.15,
             accuracy: 0.15
           },
           5: { // Critique
             depth: 0.30,
             understanding: 0.25,
             clarity: 0.20,
             context_fit: 0.15,
             relevance: 0.10
           },
           6: { // Remix
             creativity: 0.30,
             depth: 0.25,
             understanding: 0.20,
             context_fit: 0.15,
             clarity: 0.10
           }
         };
         
         return factors[depthTarget] || factors[2]; // Default to Reframe if invalid depth
       }
       
       // Get the depth name for display
       function getDepthName(depthTarget) {
         const depthNames = {
           1: "Recall",
           2: "Reframe",
           3: "Apply",
           4: "Contrast",
           5: "Critique",
           6: "Remix"
         };
         return depthNames[depthTarget] || `Level ${depthTarget}`;
       }
       
       try {
         // Get the factors and weights for this depth
         const factors = getFactorsForDepth(depthTarget);
         const factorNames = Object.keys(factors).join(", ");
         const depthName = getDepthName(depthTarget);
         
         // Create the system prompt
         const systemPrompt = `You are an evaluation assistant for learning responses.
         
You are evaluating a user's answer to a prompt at cognitive depth level ${depthTarget} (${depthName}).

For this depth level, evaluate ONLY these factors: ${factorNames}.

Score each factor on a scale of 0-10:
${Object.entries(factors).map(([name, weight]) => `- ${name}: Score out of 10`).join('\n')}

Apply these weights to calculate the final score:
${Object.entries(factors).map(([name, weight]) => `- ${name}: ${weight * 100}%`).join('\n')}

Return:
1. Scores for each factor (0-10)
2. A weighted eval_score (0-1)
3. A brief explanation (under 280 characters) focusing on strengths/weaknesses

Format your response as valid JSON:
{
  "factors": {
    ${Object.keys(factors).map(name => `"${name}": Number`).join(',\n    ')}
  },
  "eval_score": Number, // Normalized 0-1
  "simplified_score": Number, // 0-5 scale
  "explanation": "String" // Under 280 chars
}`;

         // Initialize OpenAI
         const openai = new OpenAI({
           apiKey: process.env.OPENAI_API_KEY.trim(),
         });
         
         // Call OpenAI API
         const completion = await openai.chat.completions.create({
           model: "gpt-4o-mini", // Use a cheaper model than the Supabase function
           messages: [
             {
               role: "system",
               content: systemPrompt
             },
             {
               role: "user",
               content: `Insight:\n${originalInsight}\n\nUser's Response:\n${userResponse}`
             }
           ],
           response_format: { type: "json_object" }
         });
         
         // Parse and validate the response
         if (completion.choices && completion.choices.length > 0) {
           try {
             const content = completion.choices[0].message.content;
             const result = JSON.parse(content);
             
             // Ensure the result has the required fields
             if (!result.factors || !result.eval_score || !result.explanation) {
               throw new Error("Missing required fields in evaluation result");
             }
             
             // Make sure simplified_score exists (0-5 scale)
             if (!result.simplified_score) {
               result.simplified_score = Math.min(5, Math.max(0, result.eval_score * 5));
             }
             
             console.log('Direct evaluation result:', JSON.stringify(result, null, 2));
             return res.json(result);
           } catch (parseError) {
             console.error('Error parsing OpenAI response:', parseError);
             return res.status(500).json({
               error: 'Invalid response format from evaluation service',
               details: parseError.message
             });
           }
         } else {
           return res.status(500).json({
             error: 'No response from evaluation service'
           });
         }
       } catch (openaiError) {
         console.error('OpenAI API error:', openaiError);
         return res.status(500).json({
           error: 'Error calling evaluation service',
           details: openaiError.message
         });
       }
     } catch (error) {
       console.error('Server error in evaluation:', error);
       return res.status(500).json({ error: 'Unexpected server error', details: error.message });
     }
   });

   // Helper function to generate fallback questions
   function generateFallbackQuestions(concept, depthTarget) {
     const levelDescriptions = {
       1: "recall or identify",
       2: "explain in your own words",
       3: "apply in a real-life context",
       4: "compare with other ideas",
       5: "evaluate critically",
       6: "combine with other models"
     };
     
     // Generate 3 fallback questions based on the depth target
     return [
       `Can you ${levelDescriptions[depthTarget]} the concept of ${concept}?`,
       `What is an example where you would ${levelDescriptions[depthTarget]} ${concept}?`,
       `Why is it important to ${levelDescriptions[depthTarget]} ${concept}?`
     ];
   }

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