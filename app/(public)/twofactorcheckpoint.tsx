import { useAuth } from '@state/AuthProvider'
import { useToastController } from '@tamagui/toast'
import { useQuery } from '@tanstack/react-query'
import { Link, useGlobalSearchParams, useLocalSearchParams } from 'expo-router'
import { useContext, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FeatherIcon from 'src/components/common/FeatherIcon'
import { getLoginOnboardingState } from 'src/requests'
import { AuthContext } from 'src/state/AuthContext'
import { openBrowserAsync } from 'src/utils'
import { BUILD_VERSION } from 'src/utils'
import { Button, Input, Separator, Stack, Text, XStack, YStack } from 'tamagui'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function Modal() {
  const local = useLocalSearchParams()
  const [code, setCode] = useState('')

  const { login, isLoading, loginTwoFactor } = useAuth()

  const handleLogin = () => {
    Keyboard.dismiss()
    if (!code || !code.length === 6) {
      return
    }
    loginTwoFactor({
      email: local.email,
      password: local.password,
      code: code,
      build: BUILD_VERSION,
    })
  }

  const openTerms = async () => {
    await openBrowserAsync('https://loops.video/legal/terms-of-service')
  }

  const openPrivacy = async () => {
    await openBrowserAsync('https://loops.video/legal/privacy-policy')
  }

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['onboarding'],
    queryFn: getLoginOnboardingState,
  })

  if (isPending) {
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
        <XStack flexShrink={1} justifyContent="space-around" alignItems="center">
          <Link href={'/'} flexGrow={1}>
            <FeatherIcon name="chevron-left" size={30} />
          </Link>
          <Text
            flexGrow={1}
            fontSize={SCREEN_WIDTH > 350 ? '$8' : '$5'}
            allowFontScaling={false}
            fontWeight={'bold'}
            letterSpacing={-0.5}
          >
            Two Factor Auth
          </Text>
          <Pressable>
            <FeatherIcon name="info" size={20} color="transparent" />
          </Pressable>
        </XStack>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inner}>
              <YStack gap="$2">
                <Text fontWeight="bold" pl="$3">
                  Two Factor Code
                </Text>
                <Input
                  themeInverse={true}
                  placeholder="Enter your 6 digit 2FA code here"
                  bg="transparent"
                  borderColor="black"
                  textContentType="oneTimeCode"
                  inputMode="numeric"
                  maxLength={6}
                  borderWidth={3}
                  color="black"
                  placeholderTextColor={'#555'}
                  size="$6"
                  value={code}
                  borderRadius={30}
                  onChangeText={setCode}
                />
              </YStack>

              <XStack justifyContent="center" mb="$3" flexWrap="wrap">
                <Text>By continuing, you agree to our </Text>
                <Pressable onPress={() => openTerms()}>
                  <Text fontWeight={'bold'}>Terms of Service</Text>
                </Pressable>
                <Text> and acknowledge that you have read our </Text>
                <Pressable onPress={() => openPrivacy()}>
                  <Text fontWeight={'bold'}>Privacy Policy</Text>
                </Pressable>
                <Text>.</Text>
              </XStack>
              {code && code.length === 6 && (
                <Button
                  themeInverse={true}
                  color="white"
                  size="$6"
                  fontSize="$7"
                  fontWeight="bold"
                  disabled={!code || !code.length}
                  onPress={() => handleLogin()}
                >
                  Login
                </Button>
              )}
              <View flexGrow={1}></View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
    marginTop: 30,
    gap: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 36,
    marginBottom: 48,
  },
  textInput: {
    height: 40,
    borderColor: '#000000',
    backgroundColor: '#665c00',
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  btnContainer: {
    backgroundColor: 'white',
    marginTop: 12,
  },
  subTextLinks: {
    fontSize: 18,
    color: '#333',
  },
  resetPassword: {
    marginTop: 0,
    paddingRight: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#665c00',
  },
})
