import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'

serve(async (req) => {
  try {
    const { userResponse, originalInsight } = await req.json()

    const openaiKey = Deno.env.get("OPENAI_API_KEY")
    if (!openaiKey) {
      return new Response("Missing OpenAI API key", { status: 500 })
    }

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an evaluation assistant. Given a user's answer and the original insight, grade them on clarity, application, and understanding. Give scores out of 10 and a short explanation for each."
          },
          {
            role: "user",
            content: `Insight:\n${originalInsight}\n\nUser's Response:\n${userResponse}`
          }
        ]
      })
    })

    const result = await completion.json()

    console.log("🧠 OpenAI Raw Response:", JSON.stringify(result, null, 2))  // debug log
    
    const feedback = result?.choices?.[0]?.message?.content ?? "⚠️ No feedback returned from OpenAI."
    
    return new Response(JSON.stringify({ feedback }), {
      headers: { "Content-Type": "application/json" }
    })
    
  } catch (err) {
    return new Response(JSON.stringify({ error: "Unexpected server error", details: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})
