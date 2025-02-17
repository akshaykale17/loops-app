import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fetchSelfAccount, updatePassword } from 'src/requests'
import { Avatar, Button, Input, Text, TextArea, View, XStack, YStack } from 'tamagui'

const MAX_LENGTH = 72

export default function Screen() {
  const [name, setName] = useState()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savable, setSavable] = useState(false)
  const [isLoaded, setLoaded] = useState(false)

  useEffect(() => {
    if (status === 'success') {
      setSavable(
        profile &&
          currentPassword?.length &&
          newPassword === confirmPassword &&
          currentPassword !== confirmPassword
      )
    }
  }, [currentPassword, newPassword, confirmPassword])

  const handleSave = () => {
    mutation.mutate({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    })
  }

  const HeaderRight = useCallback(
    () => (
      <Button chromeless onPress={() => handleSave()} disabled={!savable}>
        <Text
          fontSize="$6"
          color={isLoaded && savable ? '$blue9' : 'transparent'}
          fontWeight="bold"
        >
          Save
        </Text>
      </Button>
    ),
    [isLoaded, savable]
  )

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await updatePassword(data)
      if (res && res.status && res.status === 200) {
        Alert.alert('Password Updated', 'Your password has been successfully updated!', [
          {
            text: 'Go back to Settings',
            onPress: () => router.back(),
          },
        ])
        return
      }
      if (!res || !res.id) {
        if (res?.message) {
          throw res.message
        }
        throw 'An unexpected error occured!'
      }
      return res
    },
    onError: (error) => {
      Alert.alert('Error', error)
    },
  })

  const {
    data: profile,
    isPending,
    isError,
    error,
    status,
  } = useQuery({
    queryKey: ['selfAccount'],
    queryFn: async () => {
      const res = await fetchSelfAccount()
      if (res && res.name) {
        setTimeout(() => setLoaded(true), 500)
      }
      return res
    },
  })

  if (isPending || !isLoaded) {
    return (
      <View flexGrow={1} justifyContent="center" alignItems="center">
        <ActivityIndicator />
      </View>
    )
  }

  if (isError) {
    return (
      <View>
        <Text>Error: {error.message}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Edit Password',
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: 'Back',
          headerShown: true,
          headerTitle: 'Edit Password',
          headerRight: () => <HeaderRight />,
        }}
      />
      <StatusBar animated={true} style="light" />

      <ScrollView>
        <YStack p="$5" gap="$3" flexGrow={1}>
          <YStack gap="$2">
            <Text fontSize="$6" color="$gray9">
              Current Password
            </Text>
            <Input
              autoFocus={true}
              placeholder="Enter your current password"
              size="$6"
              defaultValue={currentPassword}
              maxLength={MAX_LENGTH}
              onChangeText={setCurrentPassword}
            />
          </YStack>
          <YStack gap="$2">
            <Text fontSize="$6" color="$gray9">
              New Password
            </Text>
            <Input
              placeholder="Enter your new password"
              size="$6"
              secureTextEntry={true}
              defaultValue={newPassword}
              maxLength={MAX_LENGTH}
              onChangeText={setNewPassword}
            />
          </YStack>
          <YStack gap="$2">
            <Text fontSize="$6" color="$gray9">
              New Password
            </Text>
            <Input
              placeholder="Confirm your new password"
              size="$6"
              secureTextEntry={true}
              defaultValue={confirmPassword}
              maxLength={MAX_LENGTH}
              onChangeText={setConfirmPassword}
            />
          </YStack>
          <YStack mt="$3" gap="$3">
            <Text color="$gray10" fontSize="$4" fontWeight="bold" textAlign="center">
              Password Tips
            </Text>
            <Text color="$gray9" fontSize="$3">
              - Use at least 12 characters with a mix of uppercase, lowercase, numbers,
              and symbols. Aim for a password that's unique and not easily guessable.
            </Text>
            <Text color="$gray9" fontSize="$3">
              - This password should be different from any others you use for other
              accounts. Reusing passwords puts all your accounts at risk if one is
              compromised.
            </Text>
            <Text color="$gray9" fontSize="$3">
              - Password managers can help you create and store strong, unique passwords
              for all your accounts, including this one..
            </Text>
          </YStack>

          <View h={400}></View>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  linkContainer: {
    marginVertical: 20,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
  },
  linkWrapper: {
    padding: 20,
  },
})
