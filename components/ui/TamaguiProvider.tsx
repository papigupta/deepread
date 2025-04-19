import { TamaguiProvider as Provider, Theme } from 'tamagui'
import { useColorScheme } from 'react-native'
import { useFonts, Manrope_200ExtraLight, Manrope_300Light, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope'
import config from '../../tamagui.config'
import { ActivityIndicator, View } from 'react-native'

export interface TamaguiProviderProps {
  children: React.ReactNode
  disableInjectCSS?: boolean
  defaultTheme?: 'light' | 'dark'
}

export function TamaguiProvider({
  children,
  disableInjectCSS = false,
  defaultTheme,
}: TamaguiProviderProps) {
  const colorScheme = useColorScheme()
  const theme = defaultTheme || colorScheme || 'light'
  
  // Load fonts
  const [fontsLoaded] = useFonts({
    Manrope_200ExtraLight,
    Manrope_300Light,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  })

  // Show loading indicator while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <Provider
      config={config}
      disableInjectCSS={disableInjectCSS}
      defaultTheme={theme}
    >
      <Theme name={theme}>
        {children}
      </Theme>
    </Provider>
  )
}

export default TamaguiProvider 