import { Label as TamaguiLabel, LabelProps, Text } from 'tamagui'
import { forwardRef } from 'react'

export interface CustomLabelProps extends LabelProps {
  required?: boolean
}

export const Label = forwardRef<React.ElementRef<typeof TamaguiLabel>, CustomLabelProps>(
  ({ required, children, ...props }, ref) => {
    return (
      <TamaguiLabel
        ref={ref}
        fontSize="$2"
        fontWeight="$4"
        color="$textMuted"
        marginBottom="$1"
        {...props}
      >
        {children}
        {required && <Text color="$error"> *</Text>}
      </TamaguiLabel>
    )
  }
)

Label.displayName = 'Label' 