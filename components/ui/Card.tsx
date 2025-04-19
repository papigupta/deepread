import { YStack, YStackProps } from 'tamagui'
import { forwardRef } from 'react'

export interface CardProps extends YStackProps {
  variant?: 'elevated' | 'outline' | 'ghost'
}

export const Card = forwardRef<React.ElementRef<typeof YStack>, CardProps>(
  ({ variant = 'elevated', ...props }, ref) => {
    // Base styles that apply to all variants
    const baseStyles: YStackProps = {
      padding: '$4',
      borderRadius: '$md',
      backgroundColor: '$background',
    }

    // Variant-specific styles
    const variantStyles: Record<CardProps['variant'] & string, YStackProps> = {
      elevated: {
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: '$0.5' },
        shadowOpacity: 0.1,
        shadowRadius: '$2',
        elevation: '$0.5',
      },
      outline: {
        borderWidth: '$borderWidth.1',
        borderColor: '$borderColor',
      },
      ghost: {
        // No additional styles for ghost
      }
    }

    return (
      <YStack
        ref={ref}
        {...baseStyles}
        {...variantStyles[variant]}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card' 