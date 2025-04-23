import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, Platform } from 'react-native';
import { YStack, XStack, Text, ScrollView, Separator } from 'tamagui';
import { Button, Card, Heading, TextInput } from '../components/ui';
import { insertPracticeSession } from './lib/practiceSessions';


const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL!;

// Log API URL on component initialization
console.log("🔗 API_URL for EnhancedPracticeQuestions:", API_URL);

// Helper function to validate UUID strings
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

function getFactorsForDepth(depth: number) {
  return {
    clarity: 0.4,
    application: 0.3,
    depth: 0.3,
  };
}


interface PracticeQuestionsProps {
  concept: string;
  depth_target: number;
  current_depth: number;
  insight: {
    id: string;
    book_id: string;
    title?: string;
    // other insight properties as needed
  };
  user_id: string;
  onClose: () => void;
  onLevelComplete: (
    concept: string, 
    current_depth: number, 
    final_depth: number, 
    evaluationResults: Record<string, any>
  ) => void;
}

interface EvaluationResult {
  eval_score: number;
  simplified_score: number;
  explanation: string;
  error?: string;
}

interface SessionResponse {
  level: number;
  question: string;
  answer: string;
  result: EvaluationResult;
  auto_difficulty_next?: 'easier' | 'same' | 'harder';
}

const EnhancedPracticeQuestions: React.FC<PracticeQuestionsProps> = ({
  concept,
  depth_target,
  current_depth,
  insight,
  user_id,
  onClose,
  onLevelComplete,
}) => {
  console.log("🧩 EnhancedPracticeQuestions mounted");
  console.log("🛬 Props received:", { insight, concept, current_depth, user_id });
  
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<Record<number, EvaluationResult>>({});
  const [showResults, setShowResults] = useState(false);
  const [sessionResponses, setSessionResponses] = useState<SessionResponse[]>([]);
  const [savingResponses, setSavingResponses] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

  // Early return if insight is not yet loaded
  if (!insight) {
    throw new Error("Critical error: insight data is undefined - cannot proceed with practice questions");
  }

  useEffect(() => {
    console.log("🚀 useEffect ran – insight is:", insight);
    if (!insight || !insight.title) {
      console.error("⚠️ Insight is missing or incomplete in useEffect.");
      throw new Error("Critical error: insight or insight.title is undefined - cannot proceed with practice questions");
    }

    fetchQuestions();
  }, [concept, current_depth, insight]);

  const fetchQuestions = async () => {
    console.log("📡 fetchQuestions called with:", insight?.title);
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching questions for concept: ${concept}, current depth: ${current_depth} (of target: ${depth_target})`);
      
      const requestPayload = {
        concept,
        depth_target: current_depth, // Use current_depth instead of final depth_target
        book_title: insight?.title || 'unknown-book',
        related_concepts: [],  // Could be dynamically populated in the future
        mental_models_pool: []  // Could be dynamically populated in the future
      };
      
      console.log("📦 Request payload:", requestPayload);
      
      const response = await fetch(`${API_URL}/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Questions data:', data);
      
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        
        // Initialize answers object
        const initialAnswers: Record<number, string> = {};
        data.questions.forEach((_: any, index: number) => {
          initialAnswers[index] = '';
        });
        setAnswers(initialAnswers);
        setEvaluationResults({});
        setShowResults(false);
      } else {
        setError('No questions received');
      }
    } catch (err: any) {
      console.error('❌ Failed to fetch questions:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message);
    } finally {
      setLoading(false);
      console.log("⏱️ fetchQuestions completed - loading state set to false");
    }
  };

  const handleAnswerChange = (index: number, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [index]: text
    }));
  };

  const validateAnswers = () => {
    // Check if all questions have been answered
    const unansweredQuestions = Object.values(answers).filter(answer => !answer.trim()).length;
    
    if (unansweredQuestions > 0) {
      Alert.alert(
        'Incomplete Answers',
        `You still have ${unansweredQuestions} unanswered question(s). Please answer all questions before submitting.`,
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  };

  const evaluateAnswer = async (questionIndex: number) => {
    const question = questions[questionIndex];
    const answer = answers[questionIndex];
    
    try {
      const response = await fetch(`${API_URL}/evaluate-insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userResponse: answer,
          originalInsight: `${concept}: ${question}`,
          depthTarget: current_depth
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error evaluating response:', errorText);
        throw new Error(`Evaluation failed: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Evaluation result:', result);
      
      return result;
    } catch (err: any) {
      console.error('Error in evaluation:', err);
      return { 
        error: err.message,
        eval_score: 0,
        simplified_score: 0,
        explanation: "Error evaluating answer."
      };
    }
  };

  const handleSubmitForEvaluation = async () => {
    console.log("⚡ User triggered practice insert");
    console.log("① handleSubmitForEvaluation ENTER");
    console.log("🚀 handleSubmitForEvaluation() called");
    if (!validateAnswers()) return;
    
    console.log("② validateAnswers passed");
    setEvaluating(true);
    const results: Record<number, any> = {};
    
    // Evaluate each answer
    for (let i = 0; i < questions.length; i++) {
      console.log(`③ evaluating answer ${i}`);
      const result = await evaluateAnswer(i);
      if (!result || typeof result.simplified_score !== 'number') {
        console.warn(`❌ Invalid evaluation result for question ${i}:`, result);
        continue;
      }
      results[i] = result;
    }
    
    console.log("④ all answers evaluated");
    setEvaluationResults(results);
    setShowResults(true);
    setEvaluating(false);
    
    // Track the responses for this level
    const levelResponses: SessionResponse[] = questions.map((question, index) => ({
      level: current_depth,
      question,
      answer: answers[index],
      result: results[index],
      auto_difficulty_next: determineNextDifficulty(results[index])
    }));
    
    console.log("⑤ levelResponses created");
    const newResponses = [...sessionResponses, ...levelResponses];
    setSessionResponses(newResponses);
    
    console.log('⑥ user_id from props →', user_id);
    if (!user_id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }
    
    console.log("⑦ confirmed user_id is available");
    await saveAllResponses(newResponses, user_id);
    console.log("⑭ saveAllResponses completed");
    console.log("⑯ handleSubmitForEvaluation EXIT");
  };

  const determineNextDifficulty = (result: EvaluationResult): 'easier' | 'same' | 'harder' => {
    const score = result.simplified_score;
    if (score < 2) return 'easier';
    if (score > 4) return 'harder';
    return 'same';
  };

  // Save all session responses to the database
  const saveAllResponses = async (responsesToSave = sessionResponses, userId = user_id) => {
    console.log("⑰ saveAllResponses ENTER");
    console.log("🟡 saveAllResponses() triggered");
    if (responsesToSave.length === 0) {
      console.warn('🛑 saveAllResponses called with 0 responses – early exit');
      console.log("⑱ saveAllResponses early EXIT - zero responses");
      return;
    }
    
    console.log("⑲ setting savingResponses to true");
    setSavingResponses(true);
    
    try {
      console.log("⑳ saveAllResponses try block ENTER");
      // Use the provided userId parameter
      let validatedUserId = userId;

      // Validate required fields
      if (!validatedUserId) {
        console.log("㉒ validatedUserId not found");
        throw new Error('User ID not found');
      }
      
      if (!insight?.id) {
        console.log("㉓ insight?.id not found");
        throw new Error('Insight ID not found');
      }
      
      // Get the book ID from the insight object
      const book_id = insight?.book_id;
      
      // Debug log to verify book_id is a valid UUID string
      console.log("㉔ book_id value:", typeof book_id, book_id);
      
      if (!book_id) {
        console.log("㉕ book_id not found");
        throw new Error('Book ID not found');
      }

      // Validate UUIDs
      if (!isValidUUID(validatedUserId)) {
        console.log("㉖ invalid validatedUserId format");
        throw new Error(`Invalid user_id format: ${validatedUserId}`);
      }
      
      if (!isValidUUID(book_id)) {
        console.log("㉗ invalid book_id format");
        throw new Error(`Invalid book_id format: ${book_id}`);
      }
      
      if (!isValidUUID(insight.id)) {
        console.log("㉘ invalid insight.id format");
        throw new Error(`Invalid insight_id format: ${insight.id}`);
      }
      
      console.log("㉙ all IDs validated inside saveAllResponses");
      
      // Insert each response
      const savePromises = responsesToSave.map(async (response, i) => {
        try {
          console.log("📦 Attempting to insert practice session for:", {
            i,
            result: response.result,
            insightId: insight?.id,
            userId: validatedUserId,
            bookId: book_id
          });
          
          if (typeof response.result?.simplified_score !== 'number') {
            console.warn("⚠️ Skipping invalid session response:", response);
            return { success: false, error: 'Invalid score' };
          }
          
          // Calculate eval_score as float between 0-1
          const eval_score = response.result.simplified_score / 5;
          
          // Validate field types
          if (typeof eval_score !== 'number' || isNaN(eval_score)) {
            console.error("❌ Invalid eval_score type:", eval_score);
            return { success: false, error: 'Invalid eval_score type' };
          }
          
          // Create llm_feedback as proper JSON
          const llm_feedback = {
            ...response.result,
            raw_score: response.result.simplified_score,
            question: response.question,
            level: response.level,
          };
          
          // Check for missing or undefined required data before insert
          if (!validatedUserId || !insight?.id || !response.answer || !response.result) {
            console.error("❌ Missing data for insert:", {
              validatedUserId,
              insightId: insight?.id,
              response: response,
            });
            return { success: false, error: 'Missing required fields for insert' };
          }
          
          console.log("🛬 Insert payload:", {
            user_id: validatedUserId!,
            book_id,
            insight_id: insight?.id,
            response_text: response.answer,
            eval_score: response.result.simplified_score / 5,
            llm_feedback: {
              ...response.result,
              raw_score: response.result.simplified_score,
              question: response.question,
              level: response.level,
            }
          });
          
          try {
            const insertResult = await insertPracticeSession({
              user_id: validatedUserId!,
              book_id,
              insight_id: insight?.id,
              response_text: response.answer,
              llm_feedback,
              eval_score,
              auto_difficulty_next: response.auto_difficulty_next,
            });

            console.log("🟢 Insert result:", insertResult);
            if (!insertResult.success) {
              console.error("❌ Supabase insert failed:", insertResult.error);
            }
            
            return { success: insertResult.success, error: insertResult.error };
          } catch (e) {
            console.error('Supabase threw →', e);
            return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
          }
        } catch (error) {
          console.error("❌ Exception during insert:", error);
          return { success: false, error };
        }
      });

      const results = await Promise.all(savePromises);
      const allSuccessful = results.every(result => result.success);
      
      console.log('✅ saveAllResponses finished – results:', results);
      
      setSaveSuccess(allSuccessful);
      
      if (allSuccessful) {
        Alert.alert(
          'Success',
          `Your responses have been saved successfully. You reached Level ${current_depth} of this concept.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Warning',
          'Some responses could not be saved. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (err: any) {
      console.error('㉚ Error in saveAllResponses:', err);
      setSaveSuccess(false);
      
      Alert.alert(
        'Error',
        'There was a problem saving your responses. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      console.log("㉛ saveAllResponses finally block");
      setSavingResponses(false);
      console.log("㉜ saveAllResponses EXIT");
    }
    console.log("㉝ saveAllResponses absolute final EXIT log - this should always show");
  };

  const handleContinue = () => {
    // Calculate if all answers meet the minimum score requirement (3 out of 5)
    const allScoresAboveThreshold = Object.values(evaluationResults).every(
      result => (result.simplified_score >= 3)
    );
    
    if (allScoresAboveThreshold) {
      // Progress to next level
      if (onLevelComplete) {
        onLevelComplete(concept, current_depth, depth_target, evaluationResults);
      } else {
        // Fallback if the callback is not provided
        onClose();
      }
    } else {
      // Show feedback to user
      Alert.alert(
        'Keep Practicing',
        'Some of your answers need improvement. Review the feedback and try again to advance to the next level.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Modified onClose handler to save responses before closing
  const handleClose = async () => {
    if (sessionResponses.length > 0) {
      try {
        console.log("🔑 IDs about to save →", { user_id, book_id: insight?.book_id, insight_id: insight?.id });
        
        // Validate critical IDs before saving
        if (!user_id || !isValidUUID(user_id)) {
          throw new Error(`Invalid user_id format: ${user_id}`);
        }
        
        if (!insight?.book_id || !isValidUUID(insight.book_id)) {
          throw new Error(`Invalid book_id format: ${insight?.book_id}`);
        }
        
        if (!insight?.id || !isValidUUID(insight.id)) {
          throw new Error(`Invalid insight_id format: ${insight?.id}`);
        }
        
        console.log('🚦 About to call saveAllResponses');
        await saveAllResponses();
      } catch (err: any) {
        console.error('Error validating IDs before closing:', err);
        Alert.alert(
          'Error',
          `Cannot save responses: ${err.message}`,
          [{ text: 'OK' }]
        );
      }
    }
    onClose();
  };

  // Get depth level name for display
  const getDepthName = (level: number) => {
    const depthNames: Record<number, string> = {
      1: "Recall",
      2: "Reframe",
      3: "Apply",
      4: "Contrast",
      5: "Critique",
      6: "Remix"
    };
    return depthNames[level] || `Level ${level}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return '#4CAF50'; // Good - Green
    if (score >= 3) return '#FFC107'; // Acceptable - Yellow
    return '#F44336'; // Needs improvement - Red
  };

  if (loading) {
    return (
      <YStack 
        flex={1} 
        justifyContent="center" 
        alignItems="center" 
        space="$4"
        padding="$4"
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text fontSize="$4" color="$textMuted">Loading questions...</Text>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack 
        flex={1} 
        justifyContent="center" 
        alignItems="center" 
        space="$4"
        padding="$4"
      >
        <Text fontSize="$4" color="$error">Error: {error}</Text>
        <Button variant="secondary" onPress={onClose}>Close</Button>
      </YStack>
    );
  }

  return (
    <YStack flex={1} padding="$4">
      <ScrollView>
        <Card>
          <YStack space="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <Heading level="2">{concept}</Heading>
              <XStack 
                backgroundColor={`rgba(59, 130, 246, 0.2)`}
                paddingVertical="$1"
                paddingHorizontal="$2"
                borderRadius="$full"
              >
                <Text fontSize="$3" fontWeight="$6" color="$primary">
                  Level {current_depth}: {getDepthName(current_depth)}
                </Text>
              </XStack>
            </XStack>
            
            <Separator />
            
            <Text fontSize="$4" fontWeight="$4">
              Answer the following {questions.length} questions about this concept:
            </Text>
            
            {questions.map((question, index) => (
              <YStack key={index} space="$2" marginBottom="$4">
                <Text fontSize="$4" fontWeight="$5">
                  Question {index + 1}: {question}
                </Text>
                <TextInput
                  multiline
                  numberOfLines={3}
                  height={100}
                  placeholder="Enter your answer..."
                  value={answers[index]}
                  onChangeText={(text) => handleAnswerChange(index, text)}
                  error={showResults && evaluationResults[index]?.simplified_score < 3 ? "Needs improvement" : undefined}
                />
                
                {showResults && evaluationResults[index] && (
                  <Card 
                    variant={evaluationResults[index].simplified_score >= 3 ? "outline" : "elevated"}
                    backgroundColor={evaluationResults[index].simplified_score >= 3 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)"}
                  >
                    <YStack space="$2">
                      <Text fontSize="$3" fontWeight="$6" color={getScoreColor(evaluationResults[index].simplified_score)}>
                        Score: {evaluationResults[index].simplified_score}/5 
                        {evaluationResults[index].simplified_score >= 3 ? " (Passed)" : " (Needs Improvement)"}
                      </Text>
                      <Text fontSize="$3">
                        {evaluationResults[index].explanation}
                      </Text>
                    </YStack>
                  </Card>
                )}
              </YStack>
            ))}
            
            {!showResults ? (
              <Button 
                variant="primary" 
                onPress={() => {
                  console.log("🚨 Submit button pressed");
                  handleSubmitForEvaluation();
                }}
                isLoading={evaluating}
                disabled={evaluating}
              >
                {evaluating ? "Evaluating..." : "Submit Answers"}
              </Button>
            ) : (
              <YStack space="$3">
                <Button variant="primary" onPress={handleContinue}>
                  {Object.values(evaluationResults).every(r => r.simplified_score >= 3) 
                    ? (current_depth >= depth_target 
                        ? "Complete All Levels!" 
                        : "Continue to Next Level")
                    : "Try Again (Improve Answers)"
                  }
                </Button>
                <Button 
                  variant="ghost" 
                  onPress={handleClose}
                  isLoading={savingResponses}
                  disabled={savingResponses}
                >
                  {savingResponses ? "Saving..." : "Close"}
                </Button>
              </YStack>
            )}
          </YStack>
        </Card>
      </ScrollView>
    </YStack>
  );
};

export default EnhancedPracticeQuestions;