import { supabase } from './supabaseClient';

/**
 * Input type for creating a practice session
 */
type InsertPracticeSessionInput = {
  user_id: string;
  book_id: string;
  insight_id: string;
  response_text: string;
  llm_feedback: object;
  eval_score: number;
  user_feedback_score?: number;
  auto_difficulty_next?: 'easier' | 'same' | 'harder';
  submitted_at?: string; // Optional timestamp
};

/**
 * Result type for practice session operations
 */
type PracticeSessionResult = {
  success: boolean;
  data?: any;
  error?: string;
};

/**
 * Inserts a new practice session record in the database
 * 
 * @param input - The practice session data to insert
 * @returns A result object with success status and either the inserted data or error
 */
export async function insertPracticeSession(
  input: InsertPracticeSessionInput
): Promise<PracticeSessionResult> {
  try {
    console.log("📥 insertPracticeSession() called");
    console.log("🚀 insertPracticeSession() called with payload:", input);
    
    let data = null;
    let error = null;
    
    try {
      console.log("🚩 BEFORE insert");

      const row = {
        user_id: input.user_id,
        book_id: input.book_id,
        insight_id: input.insight_id,
        response_text: input.response_text,
        llm_feedback: input.llm_feedback,
        eval_score: input.eval_score,
        user_feedback_score: input.user_feedback_score,
        auto_difficulty_next: input.auto_difficulty_next,
        submitted_at: input.submitted_at || new Date().toISOString()
      };
      
      console.log('📝 practice_sessions row →', JSON.stringify(row, null, 2));
      
      const payload = row;

      console.log("🧪 Supabase before insert →", supabase);

      try {
        const insertPromise = supabase
          .from("practice_sessions")
          .insert([payload])
          .select();

        console.log("🧾 Awaiting insert...");
        const { data: result, error: resultError, status } = await insertPromise;
        console.log("📤 Supabase insert → status:", status);
        console.log("📥 Supabase insert → data:", result);
        console.error("🧨 Supabase insert → error:", resultError);
        
        // Set the outer variables for later use
        data = result;
        error = resultError;
      } catch (e) {
        console.error("🔥 Unexpected insert failure:", e);
      }
      
      console.log("🏁 AFTER insert");

      // Ping Supabase to check if client is alive
      const testPing = await supabase.from("books").select("*").limit(1);
      console.log("📡 Supabase is reachable:", testPing);
    } catch (err) {
      console.error("💥 insertPracticeSession() failed →", err);
    }
    
    if (error) {
      console.error("❌ Supabase insert error:", error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }

    return { 
      success: true,
      data
    };
  } catch (error) {
    console.error("💥 insertPracticeSession() failed →", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
} 