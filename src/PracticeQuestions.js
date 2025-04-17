import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';

const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000' 
  : 'http://192.168.1.4:3000';

const PracticeQuestions = ({ concept, depth_target, current_depth, bookName, onClose, onLevelComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleSubmit = () => {
    // Here you would typically validate the answers
    // For now, we'll consider all answers acceptable to progress
    console.log('Submitting answers:', {
      concept,
      current_depth,
      answers,
      timestamp: new Date().toISOString()
    });
    
    // Notify about level completion and progress to next level
    if (onLevelComplete) {
      onLevelComplete(concept, current_depth, depth_target);
    } else {
      // Fallback if the callback is not provided
      onClose();
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading questions...</Text>
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
          />
        </View>
      ))}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {current_depth < depth_target ? "Continue to Next Level" : "Complete Practice"}
          </Text>
        </TouchableOpacity>
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
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
});

export default PracticeQuestions; 