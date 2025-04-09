import { useFonts } from 'expo-font'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { ToastProvider, ToastViewport } from '@tamagui/toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LogBox } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import AuthProvider from 'src/state/AuthProvider'
import { TamaguiProvider } from 'tamagui'
import { tamaguiConfig } from '../tamagui.config'

export {
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

LogBox.ignoreAllLogs()

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2 } },
})

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  })

  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return <RootLayoutNav />
}

function RootLayoutNav() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <BottomSheetModalProvider>
              <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
                <ToastProvider native={true}>
                  <ToastViewport />
                  <Slot />
                </ToastProvider>
              </TamaguiProvider>
            </BottomSheetModalProvider>
          </QueryClientProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
