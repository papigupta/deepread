import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';

const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000' 
  : 'http://192.168.1.4:3000';

const PracticeQuestions = ({ concept, depth_target, current_depth, bookName, onClose, onLevelComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState({});
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
        const initialAnswers = {};
        data.questions.forEach((_, index) => {
          initialAnswers[index] = '';
        });
        setAnswers(initialAnswers);
        setEvaluationResults({});
        setShowResults(false);
      } else {
        setError('No questions received');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, text) => {
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

  const evaluateAnswer = async (questionIndex) => {
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
    } catch (err) {
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
    const results = {};
    
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
  const getDepthName = (level) => {
    const depthNames = {
      1: "Recall",
      2: "Reframe",
      3: "Apply",
      4: "Contrast",
      5: "Critique",
      6: "Remix"
    };
    return depthNames[level] || `Level ${level}`;
  };

  const getScoreColor = (score) => {
    if (score >= 4) return '#4CAF50'; // Good - Green
    if (score >= 3) return '#FFC107'; // Acceptable - Yellow
    return '#F44336'; // Needs improvement - Red
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (evaluating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Evaluating your answers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Practice: {concept}</Text>
      <View style={styles.progressContainer}>
        <Text style={styles.subtitle}>
          Level {current_depth} of {depth_target}: {getDepthName(current_depth)}
        </Text>
        <View style={styles.progressBar}>
          {Array.from({ length: depth_target }, (_, i) => (
            <View 
              key={i} 
              style={[
                styles.progressStep, 
                i < current_depth ? styles.progressCompleted : null,
                i === current_depth - 1 ? styles.progressCurrent : null
              ]} 
            />
          ))}
        </View>
      </View>
      
      {questions.map((question, index) => (
        <View key={index} style={styles.questionContainer}>
          <Text style={styles.question}>{question}</Text>
          <TextInput
            style={styles.input}
            placeholder="Your answer..."
            multiline
            value={answers[index]}
            onChangeText={(text) => handleAnswerChange(index, text)}
            editable={!showResults}
          />
          
          {showResults && evaluationResults[index] && (
            <View style={styles.evaluationContainer}>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Score: </Text>
                <Text 
                  style={[
                    styles.scoreValue, 
                    {color: getScoreColor(evaluationResults[index].simplified_score)}
                  ]}
                >
                  {evaluationResults[index].simplified_score.toFixed(1)}/5
                </Text>
              </View>
              
              <Text style={styles.explanation}>{evaluationResults[index].explanation}</Text>
              
              {evaluationResults[index].factors && (
                <View style={styles.factorsContainer}>
                  {Object.entries(evaluationResults[index].factors).map(([factor, score]) => (
                    <View key={factor} style={styles.factorRow}>
                      <Text style={styles.factorName}>{factor}: </Text>
                      <Text style={styles.factorScore}>{score}/10</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      ))}
      
      <View style={styles.buttonContainer}>
        {!showResults ? (
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSubmitForEvaluation}
          >
            <Text style={styles.buttonText}>Submit Answers</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>
              {current_depth < depth_target ? "Continue to Next Level" : "Complete Practice"}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    flexDirection: 'row',
    height: 10,
    marginTop: 10,
  },
  progressStep: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 2,
  },
  progressCompleted: {
    backgroundColor: '#26C6DA',
  },
  progressCurrent: {
    backgroundColor: '#00BCD4',
  },
  questionContainer: {
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
  evaluationContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  scoreLabel: {
    fontWeight: '600',
  },
  scoreValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  explanation: {
    marginBottom: 10,
    fontStyle: 'italic',
  },
  factorsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e1e4e8',
    paddingTop: 5,
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  factorName: {
    textTransform: 'capitalize',
  },
  factorScore: {
    fontWeight: '600',
  },
});

export default PracticeQuestions; 