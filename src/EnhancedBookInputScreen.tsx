import React, { useState } from 'react';
import { YStack, Text } from 'tamagui';
import { Card, TextInput, Button, Heading } from '../components/ui';

interface BookInputScreenProps {
  onSubmit: (bookName: string) => void;
}

const EnhancedBookInputScreen: React.FC<BookInputScreenProps> = ({ onSubmit }) => {
  const [bookName, setBookName] = useState('');

  const handleSubmit = () => {
    if (bookName.trim()) {
      onSubmit(bookName);
      setBookName('');
    }
  };

  return (
    <Card padding="$4" marginVertical="$4">
      <YStack space="$4">
        <Heading level="2">Enter a Book or Course Title</Heading>
        <Text color="$textMuted" fontSize="$3">
          We'll extract key concepts and help you practice them
        </Text>
        <TextInput
          placeholder="Enter book or course title"
          value={bookName}
          onChangeText={setBookName}
        />
        <Button 
          variant="primary" 
          onPress={handleSubmit}
          disabled={!bookName.trim()}
          fullWidth
        >
          Generate Concepts
        </Button>
      </YStack>
    </Card>
  );
};

export default EnhancedBookInputScreen; 