import { useAuth } from '@state/AuthProvider'
import { useToastController } from '@tamagui/toast'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { login, isLoading } = useAuth()

  const handleLogin = () => {
    Keyboard.dismiss()
    if (!email || !password || password.length < 8) {
      return
    }
    login({ email, password, build: BUILD_VERSION })
  }

  const openWebsite = async () => {
    await openBrowserAsync('https://loops.video/support/contact')
  }

  const openPasswordReset = async () => {
    await openBrowserAsync('https://loops.video/password/reset')
  }

  const openSupport = async () => {
    await openBrowserAsync('https://loops.video/help-center')
  }

  const openPixelfed = async () => {
    await openBrowserAsync('https://pixelfed.social/loops')
  }

  const openStatus = async () => {
    await openBrowserAsync('https://status.pixelfed.org')
  }

  const openTerms = async () => {
    await openBrowserAsync('https://loops.video/legal/terms-of-service')
  }

  const openPrivacy = async () => {
    await openBrowserAsync('https://loops.video/legal/privacy-policy')
  }

  const openJoinBeta = async () => {
    await openBrowserAsync('https://loops.video/beta/sign-up')
  }

  const loopsVersion = () => {
    Alert.alert('Loops Version', 'v1.0.0.' + BUILD_VERSION)
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
            Loops by Pixelfed
          </Text>
          <Pressable onPress={() => loopsVersion()}>
            <FeatherIcon name="info" size={20} />
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
                  Email address
                </Text>
                <Input
                  themeInverse={true}
                  placeholder="jappleseed@me.com"
                  bg="transparent"
                  borderColor="black"
                  textContentType="emailAddress"
                  borderWidth={3}
                  color="black"
                  placeholderTextColor={'#555'}
                  size="$6"
                  value={email}
                  borderRadius={30}
                  onChangeText={setEmail}
                />
              </YStack>
              <YStack gap="$2">
                <Text fontWeight="bold" pl="$3">
                  Password
                </Text>
                <Input
                  themeInverse={true}
                  bg="transparent"
                  borderColor="black"
                  borderWidth={3}
                  color="black"
                  placeholderTextColor={'#555'}
                  placeholder="Password"
                  value={password}
                  size="$6"
                  onChangeText={setPassword}
                  textContentType="newPassword"
                  borderRadius={30}
                  secureTextEntry
                />
                {data && data?.can_reset && (
                  <XStack justifyContent="flex-end" mb="$3">
                    <Pressable onPress={() => openPasswordReset()}>
                      <Text style={styles.resetPassword}>Reset Password</Text>
                    </Pressable>
                  </XStack>
                )}
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
              {email && password && password.length >= 8 && (
                <Button
                  themeInverse={true}
                  color="white"
                  size="$6"
                  fontSize="$7"
                  fontWeight="bold"
                  disabled={!email || !password}
                  onPress={() => handleLogin()}
                >
                  Login
                </Button>
              )}
              <View flexGrow={1}></View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        <YStack gap="$3">
          <XStack justifyContent="space-around">
            {data && data?.can_signup && (
              <Pressable onPress={() => openJoinBeta()}>
                <Text style={styles.subTextLinks}>Create an Account</Text>
              </Pressable>
            )}
            <Pressable onPress={() => openSupport()}>
              <Text style={styles.subTextLinks}>Help Center</Text>
            </Pressable>
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
