import { Activity } from '@tamagui/lucide-icons'
import { Button as TamaguiButton, ButtonProps as TamaguiButtonProps, XStack, styled } from 'tamagui'
import { forwardRef } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'

export interface ButtonProps extends Omit<TamaguiButtonProps, 'variant'> {
  variant?: ButtonVariant
  fullWidth?: boolean
  isLoading?: boolean
}

export const Button = forwardRef<React.ElementRef<typeof TamaguiButton>, ButtonProps>(
  (
    { 
      variant = 'primary', 
      fullWidth = false, 
      isLoading = false, 
      disabled,
      children,
      ...props 
    }, 
    ref
  ) => {
    // Compose dynamic props based on variant
    const variantProps: Partial<TamaguiButtonProps> = {
      primary: {
        backgroundColor: '$primary',
        color: '$color',
        borderColor: '$primary',
        hoverStyle: {
          backgroundColor: '$primaryHover',
          borderColor: '$primaryHover',
        },
      },
      secondary: {
        backgroundColor: '$secondary',
        color: '$color',
        borderColor: '$secondary',
        hoverStyle: {
          backgroundColor: '$secondaryHover',
          borderColor: '$secondaryHover',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: '$primary',
        borderColor: '$primary',
        borderWidth: '$borderWidth.1',
        hoverStyle: {
          backgroundColor: '$backgroundHover',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '$primary',
        borderColor: 'transparent',
        hoverStyle: {
          backgroundColor: '$backgroundHover',
        },
      },
    }[variant]

    const isDisabled = disabled || isLoading

    return (
      <TamaguiButton
        ref={ref}
        {...variantProps}
        {...props}
        disabled={isDisabled}
        width={fullWidth ? '100%' : undefined}
        opacity={isDisabled ? 0.6 : 1}
        pressStyle={{
          opacity: 0.6,
          scale: 0.98,
        }}
      >
        {isLoading ? (
          <XStack space="$2" alignItems="center">
            <Activity size="$4" color="currentColor" />
            {children}
          </XStack>
        ) : (
          children
        )}
      </TamaguiButton>
    )
  }
)

Button.displayName = 'Button' 