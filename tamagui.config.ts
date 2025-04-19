import { createMedia } from '@tamagui/react-native-media-driver'
import { shorthands } from '@tamagui/shorthands'
import { themes, tokens } from '@tamagui/themes'
import { createTamagui, createTokens } from 'tamagui'
import { createManropeFont } from './components/ui/font-manrope'

// Create our design tokens
const appTokens = createTokens({
  color: {
    // Base
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    secondary: '#6B7280',
    secondaryHover: '#4B5563',
    accent: '#8B5CF6',
    background: '#FFFFFF',
    backgroundHover: '#F3F4F6',
    
    // Text
    text: '#111827',
    textMuted: '#4B5563',
    textLight: '#9CA3AF',

    // States
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Focus
    focus: 'rgba(59, 130, 246, 0.5)',
  },

  space: {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
    true: 16, // Default size (same as 4)
  },

  size: {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
    true: 16, // Default size (same as 4)
    
    // Screen
    'screen-sm': 640,
    'screen-md': 768,
    'screen-lg': 1024,
    'screen-xl': 1280,
  },

  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    true: 8,
    full: 9999,
  },

  zIndex: {
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    auto: 'auto',
  },

  // Border widths
  borderWidth: {
    0: 0,
    1: 1,
    2: 2,
    4: 4,
    8: 8,
  },

  // Font definitions
  fontSize: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
    7: 30,
    8: 36,
    9: 48,
    10: 60,
    // Named sizes
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  fontWeight: {
    1: '200', // ExtraLight
    2: '300', // Light
    3: '400', // Regular
    4: '500', // Medium
    5: '600', // SemiBold
    6: '700', // Bold
    7: '800', // ExtraBold
  },
})

// Create fonts with Manrope
const headingFont = createManropeFont()
const bodyFont = createManropeFont()

// Create media queries
const media = createMedia({
  sm: { maxWidth: 640 },
  md: { maxWidth: 768 },
  lg: { maxWidth: 1024 },
  xl: { maxWidth: 1280 },
  xxl: { maxWidth: 1536 },
  gtSm: { minWidth: 641 },
  gtMd: { minWidth: 769 },
  gtLg: { minWidth: 1025 },
  gtXl: { minWidth: 1281 },
  landscape: { orientation: 'landscape' },
  portrait: { orientation: 'portrait' },
  hoverNone: { hover: 'none' },
  pointerCoarse: { pointer: 'coarse' },
})

// Define themes
const lightTheme = {
  background: '#FFFFFF',
  backgroundHover: '#F3F4F6',
  backgroundPress: '#E5E7EB',
  color: '#F9FAFB',  // This should be white to contrast with primary/secondary
  colorHover: '#F3F4F6',
  borderColor: '#E5E7EB',
  borderColorHover: '#D1D5DB',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  shadowColorHover: 'rgba(0, 0, 0, 0.15)',
}

const darkTheme = {
  background: '#111827',
  backgroundHover: '#1F2937',
  backgroundPress: '#374151',
  color: '#F9FAFB',
  colorHover: '#F3F4F6',
  borderColor: '#374151',
  borderColorHover: '#4B5563',
  shadowColor: 'rgba(0, 0, 0, 0.3)',
  shadowColorHover: 'rgba(0, 0, 0, 0.4)',
}

// Create the Tamagui configuration
const appConfig = createTamagui({
  defaultFont: 'body',
  // Add fonts
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  // Add tokens
  tokens: appTokens,
  // Add shorthands (px, py, m, mx, etc.)
  shorthands,
  // Set media queries for responsiveness
  media,
  // Define themes
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  // Additional configuration
  defaultTheme: 'light',
})

// Export types
export type AppConfig = typeof appConfig

// Export the config
export default appConfig 