import { Feather, Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { Link, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Alert, Image, Linking, Platform, StatusBar, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Avatar,
  Button,
  Heading,
  Pressable,
  Text,
  View,
  XStack,
  YStack,
  ZStack,
} from 'tamagui'
import FeatherIcon from '../../../src/components/common/FeatherIcon'

export default function Screen() {
  const [video, setVideo] = useState<string | null>(null)
  const router = useRouter()

  const selectVideo = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [9, 16],
        videoMaxDuration: 60,
        quality: 1,
      })

      if (!result.canceled) {
        router.push({
          pathname: '/camera/caption',
          params: { path: result.assets[0].uri },
        })
      }
    } catch (error) {
      Alert.alert('Error', JSON.stringify(error))
    }
  }

  return (
    <SafeAreaView flexGrow={1} style={{ backgroundColor: 'black' }}>
      <StatusBar animated={true} barStyle="light" />
      <YStack gap="$3" px="$5" alignItems="center" justifyContent="center" flexGrow={1}>
        <Ionicons name="create-outline" color="yellow" size={100} />
        <Heading size="$10" color="#fff" fontWeight="bold">
          Create Loop
        </Heading>
      </YStack>

      <YStack gap="$3" px="$5" alignItems="center" justifyContent="center" flexGrow={1}>
        <Text color="#fff" fontSize="$6" style={{ textAlign: 'center' }}>
          Adult content or nudity is not allowed.
        </Text>
        <Text color="#fff" fontSize="$6" style={{ textAlign: 'center' }}>
          You can share videos up to 60 seconds long.
        </Text>
      </YStack>

      <YStack
        flexShrink={1}
        w="100%"
        alignItems="center"
        justifyContent="center"
        px="$3"
        gap="$3"
      >
        <Button
          theme="yellow"
          size="$6"
          bg="$yellow9"
          alignSelf="stretch"
          color="black"
          fontWeight="bold"
          onPress={() => selectVideo()}
        >
          Select
        </Button>
      </YStack>
    </SafeAreaView>
  )
}
