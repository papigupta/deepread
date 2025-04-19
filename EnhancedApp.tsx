import React, { useState, useEffect } from 'react';
import { View, Platform, Alert, Modal } from 'react-native';
import { supabase } from './src/supabase';
import { YStack, XStack, Text, Separator, ScrollView } from 'tamagui';
import { Button, Card, Heading } from './components/ui';
import EnhancedBookInputScreen from './src/EnhancedBookInputScreen';
import EnhancedConceptList from './src/EnhancedConceptList';
import EnhancedPracticeQuestions from './src/EnhancedPracticeQuestions';
import EnhancedLoginScreen from './src/Auth/EnhancedLoginScreen';

// Get the correct localhost address based on platform
const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000' 
  : 'http://172.20.10.2:3000';

interface ConceptItem {
  concept: string;
  depth_target: number;
}

export default function EnhancedApp() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App state
  const [concepts, setConcepts] = useState<string[]>([]);
  const [conceptsWithDepth, setConceptsWithDepth] = useState<ConceptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepth, setLoadingDepth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [depthSource, setDepthSource] = useState<string | null>(null);
  const [bookName, setBookName] = useState('');
  const [practiceModalVisible, setPracticeModalVisible] = useState(false);
  const [activePracticeConcept, setActivePracticeConcept] = useState<{
    concept: string;
    depth_target: number;
    current_depth: number;
  } | null>(null);

  // Check for authentication on load
  useEffect(() => {
    console.log("App mounted - checking authentication status");
    checkAuth();

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
    } catch (error: any) {
      console.error("Error signing out:", error);
      Alert.alert("Error signing out", error.message);
    }
  };

  const handleBookSubmit = async (name: string) => {
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
    } catch (error: any) {
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

  const assignDepthTargets = async (name: string, conceptsList: string[]) => {
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
    } catch (error: any) {
      console.error('Error assigning depth targets:', error);
      Alert.alert('Warning', `Failed to assign depth targets: ${error.message}. Using basic concepts instead.`);
    } finally {
      setLoadingDepth(false);
    }
  };

  const handlePracticePress = (concept: string, depth_target: number) => {
    console.log(`Practice pressed for ${concept} with depth ${depth_target}`);
    setActivePracticeConcept({ concept, depth_target, current_depth: 1 });
    setPracticeModalVisible(true);
  };

  const closePracticeModal = () => {
    setPracticeModalVisible(false);
    setActivePracticeConcept(null);
  };

  // Handle loading state during authentication
  if (authLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" space="$4">
        <Heading level="2">Loading...</Heading>
        <View style={{ width: 32, height: 32 }}>
          {/* ActivityIndicator is handled by our Button component's isLoading state */}
        </View>
      </YStack>
    );
  }

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    console.log("Showing login screen");
    return <EnhancedLoginScreen setIsAuthenticated={setIsAuthenticated} setLoading={setAuthLoading} />;
  }

  // We are authenticated, show the main app
  console.log("Showing main app for user:", session?.user?.email);

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header with user info and sign out button */}
      <XStack 
        justifyContent="space-between" 
        alignItems="center" 
        padding="$4"
        backgroundColor="$backgroundHover"
      >
        <Text fontSize="$3" color="$textMuted">
          Welcome, {session?.user?.email || 'User'}
        </Text>
        <Button variant="outline" size="small" onPress={handleSignOut}>
          Sign Out
        </Button>
      </XStack>
      
      <ScrollView>
        <YStack padding="$4" space="$4">
          {/* Book Input */}
          <EnhancedBookInputScreen onSubmit={handleBookSubmit} />
          
          {/* Loading and Error States */}
          {loading && (
            <Card variant="outline">
              <YStack alignItems="center" padding="$4">
                <Text fontSize="$3" color="$textMuted">Loading concepts...</Text>
                <View style={{ width: 24, height: 24, marginTop: 8 }} />
              </YStack>
            </Card>
          )}
          
          {loadingDepth && (
            <Card variant="outline">
              <YStack alignItems="center" padding="$4">
                <Text fontSize="$3" color="$textMuted">Assigning depth targets...</Text>
                <View style={{ width: 24, height: 24, marginTop: 8 }} />
              </YStack>
            </Card>
          )}
          
          {error && (
            <Card variant="outline" backgroundColor="rgba(239, 68, 68, 0.1)">
              <Text fontSize="$3" color="$error" padding="$4">
                Error: {error}
              </Text>
            </Card>
          )}
          
          {/* Debug Info */}
          {(concepts.length > 0 || conceptsWithDepth.length > 0) && (
            <Card variant="outline" backgroundColor="rgba(245, 158, 11, 0.1)">
              <YStack padding="$3" space="$1">
                <Text fontSize="$2" fontWeight="$5">Debug Status:</Text>
                <Text fontSize="$2">- Concepts: {concepts.length}</Text>
                <Text fontSize="$2">- Concepts with depth: {conceptsWithDepth.length}</Text>
                <Text fontSize="$2">- Book: {bookName}</Text>
              </YStack>
            </Card>
          )}
          
          {/* Concept List */}
          {(concepts.length > 0 || conceptsWithDepth.length > 0) && (
            <EnhancedConceptList
              concepts={concepts}
              conceptsWithDepth={conceptsWithDepth}
              source={source}
              depthSource={depthSource}
              onPracticePress={handlePracticePress}
            />
          )}
        </YStack>
      </ScrollView>
      
      {/* Practice Questions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={practiceModalVisible}
        onRequestClose={closePracticeModal}
      >
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {activePracticeConcept && (
            <EnhancedPracticeQuestions
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
      </Modal>
    </YStack>
  );
} 