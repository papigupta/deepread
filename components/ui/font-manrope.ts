import { createFont } from 'tamagui'

// Create a custom Manrope font utility similar to createInterFont
export const createManropeFont = () => {
  return createFont({
    family: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    size: {
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
    },
    lineHeight: {
      1: 16,
      2: 20,
      3: 24,
      4: 26,
      5: 28,
      6: 32,
      7: 36,
      8: 42,
      9: 54,
      10: 66,
    },
    weight: {
      1: '200', // ExtraLight
      2: '300', // Light
      3: '400', // Regular
      4: '500', // Medium
      5: '600', // SemiBold
      6: '700', // Bold
      7: '800', // ExtraBold
    },
    letterSpacing: {
      1: 0,
      2: -0.25,
      3: -0.5,
      4: -0.75,
      5: -1,
      6: -1.25,
      7: -1.5,
      8: -1.75,
      9: -2,
      10: -2.25,
    },
    // Alias tokens for easier use
    face: {
      // These keys match well with the weights above
      200: { normal: 'Manrope_200ExtraLight' },
      300: { normal: 'Manrope_300Light' },
      400: { normal: 'Manrope_400Regular' },
      500: { normal: 'Manrope_500Medium' },
      600: { normal: 'Manrope_600SemiBold' },
      700: { normal: 'Manrope_700Bold' },
      800: { normal: 'Manrope_800ExtraBold' },
    },
  })
}

export default createManropeFont 