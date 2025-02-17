import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import { Link, Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import mime from 'mime'
import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { deleteAvatar, fetchSelfAccount, storeUpdateAvatar } from 'src/requests'
import { Avatar, Button, Input, Text, TextArea, View, XStack, YStack } from 'tamagui'

const MAX_LENGTH = 80

export default function Screen() {
  const [bio, setBio] = useState()
  const [savable, setSavable] = useState(false)
  const [isLoaded, setLoaded] = useState(false)

  const RenderCounter = useCallback(() => {
    const limit = MAX_LENGTH
    const curLimit = bio && bio?.length ? bio.length : 0

    return (
      <Text color="$gray9" fontSize="$4">
        {curLimit}/{limit}
      </Text>
    )
  }, [bio])

  useEffect(() => {
    if (status === 'success') {
      setSavable(profile && profile.bio && bio !== profile.bio)
    }
  }, [bio])

  const uploadAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    const image = result.assets[0].uri
    const name = image.split('/').slice(-1)[0]
    const payload = {
      uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
      type: mime.getType(image),
      name: name,
    }

    mutation.mutate({ avatar: payload })
  }

  const handleDeleteAvatar = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete your current avatar?',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => mutation.mutate({ type: 'delete' }),
        },
      ]
    )
  }

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (data?.type == 'delete') {
        return await deleteAvatar()
      }
      const res = await storeUpdateAvatar(data)
      if (!res) {
        if (res?.message) {
          throw res.message
        }
        throw 'An unexpected error occured!'
      }
      return res
    },
    onSuccess: (data, variables, context) => {
      router.push('/profile')
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
      if (res && res.bio) {
        setBio(res.bio)
        setTimeout(() => setLoaded(true), 500)
      }
      return res
    },
  })

  if (isPending) {
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
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Update Avatar',
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: 'Back',
          headerShown: true,
          headerTitle: 'Update Avatar',
        }}
      />
      <StatusBar animated={true} style="light" />

      <YStack p="$5" gap="$3" flexGrow={1}>
        <YStack justifyContent="center" alignItems="center">
          <XStack p="$3" justifyContent="center" alignItems="center">
            <Avatar circular size="$14">
              <Avatar.Image src={profile.avatar} />
              <Avatar.Fallback bg="gray" />
            </Avatar>
          </XStack>
          <Text color="$gray10" fontSize="$7">
            Current Avatar
          </Text>
        </YStack>
        <YStack justifyContent="center" alignItems="center" flexGrow={1} gap="$3">
          <Button
            theme="blue"
            bg="$blue9"
            color="white"
            alignSelf="stretch"
            size="$6"
            fontWeight={'bold'}
            onPress={() => uploadAvatar()}
          >
            Upload
          </Button>
          <Button
            theme="red"
            alignSelf="stretch"
            size="$6"
            fontWeight={'bold'}
            onPress={() => handleDeleteAvatar()}
          >
            Delete
          </Button>
        </YStack>
        <YStack mt="$3" gap="$3">
          <Text color="$gray9" fontSize="$3">
            - It may take a few minutes for your new avatar to take effect.
          </Text>
          <Text color="$gray9" fontSize="$3">
            - Choose an avatar that reflects your identity or content.
          </Text>
          <Text color="$gray9" fontSize="$3">
            - If you have a brand or online presence, try to keep your avatar consistent
            across platforms.
          </Text>
          <Text color="$gray9" fontSize="$3">
            - Be respectful and avoid avatars with offensive or inappropriate language or
            imagery.
          </Text>
        </YStack>
      </YStack>
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
