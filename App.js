import React, { useState } from 'react';
import { StyleSheet, View, Text, Platform, Alert } from 'react-native';
import BookInputScreen from './src/BookInputScreen';

// Get the correct localhost address based on platform
// For physical devices, replace localhost with your computer's IP address
// Your computer's IP address is: 192.168.1.4
const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000' 
  : 'http://192.168.1.4:3000'; // Using actual IP for both iOS simulator and physical devices

export default function App() {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  const handleBookSubmit = async (bookName) => {
    console.log('Book submitted:', bookName);
    
    setLoading(true);
    setError(null);
    setSource(null);
    setConcepts([]);
    
    try {
      console.log(`Sending request to ${API_URL}/extract-concepts`);
      
      const response = await fetch(`${API_URL}/extract-concepts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookName })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      setConcepts(data.concepts || []);
      setSource(data.source || 'unknown');
      
      if (!data.concepts || data.concepts.length === 0) {
        setError('No concepts found for this book');
      }
    } catch (error) {
      console.error('Error fetching concepts:', error);
      setError(error.message || 'Failed to fetch concepts');
      Alert.alert('Error', `Failed to fetch concepts: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BookInputScreen onSubmit={handleBookSubmit} />
      
      {loading && <Text style={styles.message}>Loading concepts...</Text>}
      {error && <Text style={styles.error}>Error: {error}</Text>}
      
      {concepts.length > 0 && (
        <View style={styles.conceptsContainer}>
          <Text style={styles.heading}>Key Concepts for Your Book:</Text>
          {source && <Text style={styles.source}>Source: {source}</Text>}
          {concepts.map((concept, index) => (
            <Text key={index} style={styles.concept}>{concept}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  message: {
    marginTop: 20,
    fontSize: 16,
  },
  error: {
    marginTop: 20,
    color: 'red',
    fontSize: 16,
  },
  conceptsContainer: {
    marginTop: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  source: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 10,
    color: '#666',
  },
  concept: {
    fontSize: 16,
    marginBottom: 5,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
});
