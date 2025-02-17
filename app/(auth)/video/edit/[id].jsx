import { useQuery } from '@tanstack/react-query'
import * as Burnt from 'burnt'
import { Link, Stack, router, useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import FeatherIcon from 'src/components/common/FeatherIcon'
import { EditPostForm } from 'src/components/video/EditPostForm'
import { getVideoById } from 'src/requests'
import { Separator, Text, TextArea, View, XStack, YStack } from 'tamagui'

export default function Screen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  const {
    data: post,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ['getVideoById', id],
    queryFn: getVideoById,
  })

  const onSuccess = () => {
    router.replace('profile')
  }

  if (isPending) {
    return (
      <SafeAreaView flex={1}>
        <View justifyContent="center" alignItems="center" flexGrow={1}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    )
  }

  if (isError) {
    return (
      <View flexGrow={1}>
        <Text>Error: {error.message}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['right', 'left']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitle: 'Back',
          headerTitle: 'Edit Loop',
          headerBackTitleStyle: {
            color: 'white',
          },
        }}
      />
      <StatusBar animated={true} barStyle={'light-content'} />
      <EditPostForm post={post} onSuccess={() => onSuccess()} />
    </SafeAreaView>
  )
}
