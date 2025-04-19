import { Text, TextProps, styled } from 'tamagui'
import { forwardRef } from 'react'

export type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6'

export interface HeadingProps extends TextProps {
  level?: HeadingLevel
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold'
}

export const Heading = forwardRef<React.ElementRef<typeof Text>, HeadingProps>(
  ({ level = '2', weight = 'bold', color = '$text', ...props }, ref) => {
    // Map heading levels to font sizes
    const sizeMap: Record<HeadingLevel, string> = {
      '1': '$9',
      '2': '$8',
      '3': '$7',
      '4': '$6',
      '5': '$5',
      '6': '$4',
    }

    // Map weight names to Manrope font weights
    const weightMap: Record<HeadingProps['weight'] & string, string> = {
      light: '$2',     // 300
      regular: '$3',   // 400
      medium: '$4',    // 500
      semibold: '$5',  // 600
      bold: '$6',      // 700
      extrabold: '$7', // 800
    }

    return (
      <Text
        ref={ref}
        fontSize={sizeMap[level]}
        fontWeight={weightMap[weight]}
        color={color}
        fontFamily="$heading"
        {...props}
      />
    )
  }
)

Heading.displayName = 'Heading' 