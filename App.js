import * as Linking from 'expo-linking';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, Alert, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import BookInputScreen from './src/BookInputScreen';
import PracticeQuestions from './src/PracticeQuestions';
import LoginScreen from './src/LogicScreen';  // 🔥 FIXED path, NO extension
import LoginCallbackScreen from './src/LogicCallbackScreen';  // ✅ Already correct
import { supabase } from './src/lib/supabaseClient';

// rest of your App.js...



import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:3000';

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isHandlingCallback, setIsHandlingCallback] = useState(false);



  // App state
  const [concepts, setConcepts] = useState([]);
  const [conceptsWithDepth, setConceptsWithDepth] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepth, setLoadingDepth] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const [depthSource, setDepthSource] = useState(null);
  const [bookName, setBookName] = useState('');
  const [practiceModalVisible, setPracticeModalVisible] = useState(false);
  const [activePracticeConcept, setActivePracticeConcept] = useState(null);

  // Check for authentication on load
  useEffect(() => {
    console.log("App mounted - checking authentication status");
    checkAuth();

    Linking.getInitialURL().then(url => {
      if (url && url.includes('access_token')) {
        console.log("Detected magic link callback:", url);
        setIsHandlingCallback(true);
      }
    });

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, "Session:", session ? "Present" : "None");
        
        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in:", session.user.email);
          setSession(session);
          setIsAuthenticated(true);
          setAuthLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          setSession(null);
          setIsAuthenticated(false);
          setAuthLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Token refreshed");
          setSession(session);
          setIsAuthenticated(!!session);
          setAuthLoading(false);
        }
      }
    );

    // Cleanup on unmount
    return () => {
      console.log("App unmounting - cleaning up auth listener");
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const checkAuth = async () => {
    console.log("Checking authentication status...");
    try {
      setAuthLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking auth:", error);
        setIsAuthenticated(false);
        return;
      }
      
      console.log("Session check result:", session ? "Active session" : "No session");
      setSession(session);
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error("Exception checking auth:", error);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error signing out", error.message);
    }
  };

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

  const handlePracticePress = (concept, depth_target) => {
    console.log(`Practice pressed for ${concept} with depth ${depth_target}`);
    setActivePracticeConcept({ concept, depth_target, current_depth: 1 });
    setPracticeModalVisible(true);
  };

  const closePracticeModal = () => {
    setPracticeModalVisible(false);
    setActivePracticeConcept(null);
  };

  // Add debug render output
  console.log('RENDER - concepts:', concepts.length, 'conceptsWithDepth:', conceptsWithDepth.length);

  // Handle loading state
  if (authLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading...</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Log authentication state for debugging
  console.log("Auth state in App.js:", { isAuthenticated, session: session?.user?.email || "none" });

  // If not authenticated, show login screen
  if (isHandlingCallback) {
    return (
      <LoginCallbackScreen
        setIsAuthenticated={setIsAuthenticated}
        setAuthLoading={setAuthLoading}
        setIsHandlingCallback={setIsHandlingCallback}  // 👈 ADD THIS
      />
    );
  }  
  
  if (!isAuthenticated) {
    return <LoginScreen setIsAuthenticated={setIsAuthenticated} setLoading={setAuthLoading} />;
  }
  

  // We are authenticated, show the main app
  console.log("Showing main app for user:", session?.user?.email);

  // Return the original UI with an added sign out button
  return (
    <View style={styles.container}>
      {/* Add sign out button */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {session?.user?.email || 'User'}
        </Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

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
      
      <ScrollView style={styles.scrollView}>
        {conceptsWithDepth.length > 0 ? (
          <View style={styles.conceptsContainer}>
            <Text style={styles.heading}>Key Concepts with Depth Targets:</Text>
            {depthSource && <Text style={styles.source}>Source: {depthSource}</Text>}
            {conceptsWithDepth.map((item, index) => (
              <View key={index} style={styles.conceptWithDepthContainer}>
                <View style={styles.conceptWithDepth}>
                  <Text style={styles.concept}>{item.concept}</Text>
                  <View style={[styles.depthBadge, { backgroundColor: getDepthColor(item.depth_target) }]}>
                    <Text style={styles.depthText}>{item.depth_target}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.practiceButton}
                  onPress={() => handlePracticePress(item.concept, item.depth_target)}
                >
                  <Text style={styles.practiceButtonText}>Practice</Text>
                </TouchableOpacity>
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
      </ScrollView>
      
      {/* Practice Questions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={practiceModalVisible}
        onRequestClose={closePracticeModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {activePracticeConcept && (
              <PracticeQuestions
                concept={activePracticeConcept.concept}
                depth_target={activePracticeConcept.depth_target}
                current_depth={activePracticeConcept.current_depth}
                bookName={bookName}
                onClose={closePracticeModal}
                onLevelComplete={(concept, current_depth, final_depth, evaluationResults) => {
                  console.log('Level completed:', {
                    concept,
                    current_depth,
                    final_depth,
                    evaluationResults
                  });
                  
                  // TODO: Store evaluation results in database
                  // This would typically make an API call to your backend to:
                  // 1. Save the evaluation scores for this practice session
                  // 2. Update the book's aggregate scores based on this session
                  
                  if (current_depth < final_depth) {
                    // Move to the next level
                    setActivePracticeConcept({
                      concept,
                      depth_target: final_depth, 
                      current_depth: current_depth + 1
                    });
                  } else {
                    // User completed all levels
                    closePracticeModal();
                    Alert.alert('Congratulations!', `You've completed all depth levels for ${concept}!`);
                  }
                }}
              />
            )}
          </View>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
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
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    flex: 1,
  },
  conceptWithDepthContainer: {
    marginBottom: 10,
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
  practiceButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  practiceButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  welcomeText: {
    fontSize: 14,
    color: '#333',
  },
  signOutButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 5,
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 12,
  },
});
