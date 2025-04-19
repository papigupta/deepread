import { Input, InputProps, Label, Text, YStack } from 'tamagui'
import { forwardRef } from 'react'

export interface TextInputProps extends InputProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
}

export const TextInput = forwardRef<React.ElementRef<typeof Input>, TextInputProps>(
  ({ label, error, helperText, id, required, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`
    
    return (
      <YStack space="$1">
        {label && (
          <Label htmlFor={inputId} color="$text">
            {label}
            {required && <Text color="$error"> *</Text>}
          </Label>
        )}
        
        <Input
          ref={ref}
          id={inputId}
          borderColor={error ? '$error' : '$borderColor'}
          placeholder={props.placeholder}
          {...props}
        />
        
        {(error || helperText) && (
          <Text fontSize="$fontSize.1" color={error ? '$error' : '$textMuted'}>
            {error || helperText}
          </Text>
        )}
      </YStack>
    )
  }
)

TextInput.displayName = 'TextInput' 