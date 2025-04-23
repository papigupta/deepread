import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, Separator } from 'tamagui';
import { Card, Heading, Button } from '../components/ui';

interface ConceptItem {
  concept: string;
  depth_target: number;
  insight_id: string;
}

interface EnhancedConceptListProps {
  concepts: string[];
  conceptsWithDepth: ConceptItem[];
  source?: string;
  depthSource?: string;
  onPracticePress: (concept: string, depth_target: number, insight_id: string) => void;
}

const EnhancedConceptList: React.FC<EnhancedConceptListProps> = ({
  concepts,
  conceptsWithDepth,
  source,
  depthSource,
  onPracticePress,
}) => {
  // Helper function to get color based on depth
  const getDepthColor = (depth: number) => {
    const colors: Record<number, string> = {
      1: '#E0F7FA', // Light blue - Recall
      2: '#B2EBF2', // Cyan - Reframe
      3: '#80DEEA', // Teal - Apply
      4: '#4DD0E1', // Darker teal - Contrast
      5: '#26C6DA', // Blue - Critique
      6: '#00BCD4'  // Dark blue - Remix
    };
    return colors[depth] || '#F5F5F5';
  };

  // Helper function to get depth name
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

  return (
    <ScrollView>
      <YStack space="$4" padding="$4">
        {conceptsWithDepth.length > 0 ? (
          <Card>
            <YStack space="$3">
              <Heading level="2">Key Concepts with Depth Targets</Heading>
              {depthSource && (
                <Text fontSize="$2" color="$textMuted" fontStyle="italic">
                  Source: {depthSource}
                </Text>
              )}
              <Separator />
              
              {conceptsWithDepth.map((item, index) => (
                <YStack key={index} space="$2" marginBottom="$3">
                  <XStack space="$2" alignItems="center">
                    <Text flex={1} fontSize="$4" fontWeight="$4">
                      {item.concept}
                    </Text>
                    <XStack 
                      backgroundColor={getDepthColor(item.depth_target)}
                      padding="$1"
                      paddingHorizontal="$2"
                      borderRadius="$full"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="$2" fontWeight="$6">
                        {getDepthName(item.depth_target)} ({item.depth_target})
                      </Text>
                    </XStack>
                  </XStack>
                  <Button 
                    variant="secondary"
                    onPress={() => onPracticePress(item.concept, item.depth_target, item.insight_id)}
                  >
                    Practice
                  </Button>
                </YStack>
              ))}
            </YStack>
          </Card>
        ) : concepts.length > 0 && (
          <Card>
            <YStack space="$3">
              <Heading level="2">Key Concepts</Heading>
              {source && (
                <Text fontSize="$2" color="$textMuted" fontStyle="italic">
                  Source: {source}
                </Text>
              )}
              <Separator />
              
              {concepts.map((concept, index) => (
                <Text key={index} fontSize="$4" fontWeight="$4" marginVertical="$1">
                  {concept}
                </Text>
              ))}
            </YStack>
          </Card>
        )}
      </YStack>
    </ScrollView>
  );
};

export default EnhancedConceptList; 