import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'

interface EvaluationRequest {
  userResponse: string;
  originalInsight: string;
  depthTarget: number;
}

interface Factor {
  name: string;
  weight: number;
}

// Get the active factors and weights based on depth target
function getFactorsForDepth(depthTarget: number): Factor[] {
  switch (depthTarget) {
    case 1: // Recall
      return [
        { name: "accuracy", weight: 0.40 },
        { name: "understanding", weight: 0.30 },
        { name: "clarity", weight: 0.20 },
        { name: "relevance", weight: 0.10 }
      ];
    case 2: // Reframe
      return [
        { name: "understanding", weight: 0.30 },
        { name: "clarity", weight: 0.30 },
        { name: "accuracy", weight: 0.20 },
        { name: "relevance", weight: 0.20 }
      ];
    case 3: // Apply
      return [
        { name: "context_fit", weight: 0.35 },
        { name: "relevance", weight: 0.20 },
        { name: "understanding", weight: 0.20 },
        { name: "clarity", weight: 0.15 },
        { name: "depth", weight: 0.10 }
      ];
    case 4: // Contrast
      return [
        { name: "understanding", weight: 0.25 },
        { name: "depth", weight: 0.25 },
        { name: "relevance", weight: 0.20 },
        { name: "clarity", weight: 0.15 },
        { name: "accuracy", weight: 0.15 }
      ];
    case 5: // Critique
      return [
        { name: "depth", weight: 0.30 },
        { name: "understanding", weight: 0.25 },
        { name: "clarity", weight: 0.20 },
        { name: "context_fit", weight: 0.15 },
        { name: "relevance", weight: 0.10 }
      ];
    case 6: // Remix
      return [
        { name: "creativity", weight: 0.30 },
        { name: "depth", weight: 0.25 },
        { name: "understanding", weight: 0.20 },
        { name: "context_fit", weight: 0.15 },
        { name: "clarity", weight: 0.10 }
      ];
    default:
      return [
        { name: "understanding", weight: 0.30 },
        { name: "clarity", weight: 0.30 },
        { name: "accuracy", weight: 0.20 },
        { name: "relevance", weight: 0.20 }
      ];
  }
}

// Get the depth name for display
function getDepthName(depthTarget: number): string {
  const depthNames: Record<number, string> = {
    1: "Recall",
    2: "Reframe",
    3: "Apply",
    4: "Contrast",
    5: "Critique",
    6: "Remix"
  };
  return depthNames[depthTarget] || `Level ${depthTarget}`;
}

serve(async (req) => {
  try {
    const { userResponse, originalInsight, depthTarget }: EvaluationRequest = await req.json();

    if (!userResponse || !originalInsight || !depthTarget) {
      return new Response(JSON.stringify({ 
        error: "Missing required parameters" 
      }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response("Missing OpenAI API key", { status: 500 });
    }

    // Get the active factors for this depth
    const factors = getFactorsForDepth(depthTarget);
    const factorNames = factors.map(f => f.name).join(", ");
    const depthName = getDepthName(depthTarget);

    // Create the system prompt with the specific factors and weights
    const systemPrompt = `You are an evaluation assistant for learning responses.
    
You are evaluating a user's answer to a prompt at cognitive depth level ${depthTarget} (${depthName}).

For this depth level, evaluate ONLY these factors: ${factorNames}.

Score each factor on a scale of 0-10:
${factors.map(f => `- ${f.name}: Score out of 10`).join('\n')}

Apply these weights to calculate the final score:
${factors.map(f => `- ${f.name}: ${f.weight * 100}%`).join('\n')}

Return:
1. Scores for each factor (0-10)
2. A weighted eval_score (0-1)
3. A brief explanation (under 280 characters) focusing on strengths/weaknesses

Format your response as valid JSON:
{
  "factors": {
    ${factors.map(f => `"${f.name}": Number`).join(',\n    ')}
  },
  "eval_score": Number, // Normalized 0-1
  "simplified_score": Number, // 0-5 scale
  "explanation": "String" // Under 280 chars
}`;

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Insight:\n${originalInsight}\n\nUser's Response:\n${userResponse}`
          }
        ]
      })
    });

    const result = await completion.json();
    console.log("🧠 OpenAI Raw Response:", JSON.stringify(result, null, 2));  // debug log
    
    const feedbackContent = result?.choices?.[0]?.message?.content;
    
    if (!feedbackContent) {
      return new Response(JSON.stringify({ 
        error: "No feedback returned from OpenAI"
      }), { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      });
    }
    
    // Parse the JSON response
    let feedback;
    try {
      feedback = JSON.parse(feedbackContent);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      return new Response(JSON.stringify({ 
        error: "Invalid JSON response from OpenAI",
        raw_content: feedbackContent
      }), { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      });
    }
    
    return new Response(JSON.stringify(feedback), {
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (err) {
    return new Response(JSON.stringify({ 
      error: "Unexpected server error", 
      details: err.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
})
