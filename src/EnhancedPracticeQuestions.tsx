import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, Platform } from 'react-native';
import { YStack, XStack, Text, ScrollView, Separator } from 'tamagui';
import { Button, Card, Heading, TextInput } from '../components/ui';

const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000' 
  : 'http://172.20.10.2:3000';

interface PracticeQuestionsProps {
  concept: string;
  depth_target: number;
  current_depth: number;
  bookName: string;
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

const EnhancedPracticeQuestions: React.FC<PracticeQuestionsProps> = ({
  concept,
  depth_target,
  current_depth,
  bookName,
  onClose,
  onLevelComplete,
}) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<Record<number, EvaluationResult>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [concept, current_depth]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching questions for concept: ${concept}, current depth: ${current_depth} (of target: ${depth_target})`);
      
      const response = await fetch(`${API_URL}/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          concept,
          depth_target: current_depth, // Use current_depth instead of final depth_target
          book_title: bookName,
          related_concepts: [],  // Could be dynamically populated in the future
          mental_models_pool: []  // Could be dynamically populated in the future
        })
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
      console.error('Error fetching questions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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
    if (!validateAnswers()) return;
    
    setEvaluating(true);
    const results: Record<number, any> = {};
    
    // Evaluate each answer
    for (let i = 0; i < questions.length; i++) {
      results[i] = await evaluateAnswer(i);
    }
    
    setEvaluationResults(results);
    setShowResults(true);
    setEvaluating(false);
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
                onPress={handleSubmitForEvaluation}
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
                <Button variant="ghost" onPress={onClose}>
                  Close
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