import { useAuth } from '@state/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getLoginOnboardingState } from 'src/requests'
import { BUILD_VERSION } from 'src/utils'
import { Button, Input, Separator, Text, View, XStack, YStack } from 'tamagui'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const { isLoading } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['onboarding'],
    queryFn: getLoginOnboardingState,
  })

  if (isPending || isLoading || loading) {
    return (
      <View flexGrow={1} justifyContent="center" alignItems="center" style={styles.root}>
        <ActivityIndicator />
      </View>
    )
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.root} edges={['right', 'left', 'top']}>
        <Text>Error: {error.message}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.root} edges={['bottom', 'left', 'right', 'top']}>
      <YStack style={{ padding: 20, flexGrow: 1 }} gap="$4">
        <View flexGrow={1}></View>

        <XStack flexGrow={1} justifyContent="center">
          <Text fontSize="$9" fontWeight={'bold'} letterSpacing={-0.5}>
            Loops by Pixelfed
          </Text>
        </XStack>

        <YStack>
          <Link href="/modal" asChild>
            <Button
              themeInverse={true}
              bg="black"
              color="white"
              size="$6"
              fontSize="$7"
              fontWeight="bold"
            >
              Login
            </Button>
          </Link>
          <XStack mt="$3" justifyContent="center">
            <Text
              allowFontScaling={false}
              fontSize={10}
              fontWeight={'bold'}
              color="rgba(0,0,0,0.2)"
            >
              v1.0.0.{BUILD_VERSION}
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffe504',
  },
  container: {
    flexGrow: 1,
  },
  inner: {
    flexGrow: 1,
    gap: 10,
    justifyContent: 'space-around',
  },
  header: {
    fontSize: 36,
    marginBottom: 48,
  },
  textInput: {
    height: 40,
    borderColor: '#000000',
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  btnContainer: {
    backgroundColor: 'white',
    marginTop: 12,
  },
  subTextLinks: {
    fontSize: 16,
    color: '#999',
  },
  resetPassword: {
    marginTop: -10,
    paddingRight: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#408DF6',
  },
})
