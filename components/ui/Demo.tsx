import React from 'react'
import { ScrollView } from 'react-native'
import { YStack, XStack, Text, Separator } from 'tamagui'
import { Button } from './Button'
import { TextInput } from './TextInput'
import { Card } from './Card'
import { Heading } from './Heading'
import { Label } from './Label'

export function ComponentDemo() {
  return (
    <ScrollView>
      <YStack padding="$4" space="$6">
        <Heading level="1">UI Components Demo</Heading>
        <Separator />
        
        {/* Button Demo */}
        <YStack space="$4">
          <Heading level="2">Buttons</Heading>
          
          <YStack space="$2">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button isLoading>Loading Button</Button>
            <Button fullWidth>Full Width Button</Button>
          </YStack>
        </YStack>
        
        <Separator />
        
        {/* TextInput Demo */}
        <YStack space="$4">
          <Heading level="2">Text Inputs</Heading>
          
          <YStack space="$2">
            <TextInput placeholder="Basic input" />
            <TextInput 
              label="Email Address" 
              placeholder="example@email.com" 
            />
            <TextInput 
              label="Password" 
              placeholder="Enter password" 
              error="Password must be at least 8 characters" 
            />
            <TextInput 
              label="Username" 
              placeholder="Enter username"
              helperText="Your username will be visible to others" 
            />
            <TextInput 
              label="Full Name" 
              placeholder="Enter your full name"
              required
            />
          </YStack>
        </YStack>
        
        <Separator />
        
        {/* Card Demo */}
        <YStack space="$4">
          <Heading level="2">Cards</Heading>
          
          <YStack space="$2">
            <Card>
              <Heading level="3">Default Card</Heading>
              <Text>This is a default card with elevation.</Text>
            </Card>
            
            <Card variant="outline">
              <Heading level="3">Outline Card</Heading>
              <Text>This card has a border instead of elevation.</Text>
            </Card>
            
            <Card variant="ghost">
              <Heading level="3">Ghost Card</Heading>
              <Text>This card has no border or elevation.</Text>
            </Card>
          </YStack>
        </YStack>
        
        <Separator />
        
        {/* Heading Demo */}
        <YStack space="$4">
          <Heading level="2">Headings</Heading>
          
          <YStack space="$2">
            <Heading level="1">Heading Level 1</Heading>
            <Heading level="2">Heading Level 2</Heading>
            <Heading level="3">Heading Level 3</Heading>
            <Heading level="4">Heading Level 4</Heading>
            <Heading level="5">Heading Level 5</Heading>
            <Heading level="6">Heading Level 6</Heading>
            
            <Heading level="3" weight="light">Light Weight (300)</Heading>
            <Heading level="3" weight="regular">Regular Weight (400)</Heading>
            <Heading level="3" weight="medium">Medium Weight (500)</Heading>
            <Heading level="3" weight="semibold">Semibold Weight (600)</Heading>
            <Heading level="3" weight="bold">Bold Weight (700)</Heading>
            <Heading level="3" weight="extrabold">ExtraBold Weight (800)</Heading>
          </YStack>
        </YStack>
        
        <Separator />
        
        {/* Label Demo */}
        <YStack space="$4">
          <Heading level="2">Labels</Heading>
          
          <YStack space="$2">
            <Label htmlFor="demo-input-1">Standard Label</Label>
            <Label htmlFor="demo-input-2" required>Required Label</Label>
          </YStack>
        </YStack>
      </YStack>
    </ScrollView>
  )
}

export default ComponentDemo 