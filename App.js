import React, { useState, useEffect } from 'react';
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
  const [conceptsWithDepth, setConceptsWithDepth] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepth, setLoadingDepth] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const [depthSource, setDepthSource] = useState(null);
  const [bookName, setBookName] = useState('');

  const handleBookSubmit = async (name) => {
    console.log('Book submitted:', name);
    setBookName(name);
    
    setLoading(true);
    setLoadingDepth(false);
    setError(null);
    setSource(null);
    setDepthSource(null);
    setConcepts([]);
    setConceptsWithDepth([]);
    
    try {
      console.log(`Sending request to ${API_URL}/extract-concepts`);
      
      const response = await fetch(`${API_URL}/extract-concepts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookName: name })
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

  // Use useEffect to trigger depth target assignment when concepts change
  useEffect(() => {
    if (concepts.length > 0 && bookName) {
      assignDepthTargets(bookName, concepts);
    }
  }, [concepts, bookName]);

  const assignDepthTargets = async (name, conceptsList) => {
    if (!conceptsList || conceptsList.length === 0) {
      console.log('No concepts to assign depth targets to');
      return;
    }
    
    setLoadingDepth(true);
    
    try {
      console.log(`Sending request to ${API_URL}/assign-depth-targets for ${name}`);
      
      const response = await fetch(`${API_URL}/assign-depth-targets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookName: name, concepts: conceptsList })
      });
      
      console.log('Depth target response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response for depth targets:', errorText);
        throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Depth target response data:', data);
      console.log('Depth targets received:', JSON.stringify(data.conceptsWithDepth));
      
      if (data.conceptsWithDepth && data.conceptsWithDepth.length > 0) {
        setConceptsWithDepth(data.conceptsWithDepth);
        setDepthSource(data.source || 'unknown');
        console.log(`Set ${data.conceptsWithDepth.length} concepts with depth targets`);
      } else {
        console.log('No depth targets assigned in response');
      }
    } catch (error) {
      console.error('Error assigning depth targets:', error);
      Alert.alert('Warning', `Failed to assign depth targets: ${error.message}. Using basic concepts instead.`);
    } finally {
      setLoadingDepth(false);
    }
  };

  // Add debug render output
  console.log('RENDER - concepts:', concepts.length, 'conceptsWithDepth:', conceptsWithDepth.length);

  return (
    <View style={styles.container}>
      <BookInputScreen onSubmit={handleBookSubmit} />
      
      {loading && <Text style={styles.message}>Loading concepts...</Text>}
      {loadingDepth && <Text style={styles.message}>Assigning depth targets...</Text>}
      {error && <Text style={styles.error}>Error: {error}</Text>}
      
      {/* Force display the debug info at the top */}
      <View style={styles.debugContainer}>
        <Text style={styles.debug}>Debug Status:</Text>
        <Text style={styles.debug}>- Concepts: {concepts.length}</Text>
        <Text style={styles.debug}>- Concepts with depth: {conceptsWithDepth.length}</Text>
        <Text style={styles.debug}>- Book: {bookName}</Text>
      </View>
      
      {conceptsWithDepth.length > 0 ? (
        <View style={styles.conceptsContainer}>
          <Text style={styles.heading}>Key Concepts with Depth Targets:</Text>
          {depthSource && <Text style={styles.source}>Source: {depthSource}</Text>}
          {conceptsWithDepth.map((item, index) => (
            <View key={index} style={styles.conceptWithDepth}>
              <Text style={styles.concept}>{item.concept}</Text>
              <View style={[styles.depthBadge, { backgroundColor: getDepthColor(item.depth_target) }]}>
                <Text style={styles.depthText}>{item.depth_target}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : concepts.length > 0 && (
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

// Helper function to get a color based on depth target
const getDepthColor = (depth) => {
  const colors = {
    1: '#E0F7FA', // Light blue - Recall
    2: '#B2EBF2', // Cyan - Reframe
    3: '#80DEEA', // Teal - Apply
    4: '#4DD0E1', // Darker teal - Contrast
    5: '#26C6DA', // Blue - Critique
    6: '#00BCD4'  // Dark blue - Remix
  };
  return colors[depth] || '#F5F5F5';
};

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
    flex: 1,
  },
  conceptWithDepth: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  depthBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  depthText: {
    fontWeight: 'bold',
    color: '#333',
  },
  debug: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 2,
  },
  debugContainer: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFECB3',
    borderRadius: 5,
  }
});
