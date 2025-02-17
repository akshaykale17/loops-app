import { Feather } from '@expo/vector-icons'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet } from 'react-native'
import VideoPost from 'src/components/feed/VideoPost'
import { getVideoById, likeVideo, unlikeVideo } from 'src/requests'
import { Button, Text, View, XStack } from 'tamagui'

export default function Screen() {
  const { id } = useLocalSearchParams()
  const queryClient = useQueryClient()
  const router = useRouter()

  const {
    data: video,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ['getVideoById', id],
    queryFn: getVideoById,
  })

  const handleLike = async () => {
    if (video.has_liked) {
      await unlikeVideo(video.id).then((res) => {
        queryClient.setQueryData(['getVideoById', id], (oldData) =>
          oldData
            ? {
                ...oldData,
                has_liked: false,
                likes: oldData.likes ? oldData.likes - 1 : 0,
              }
            : oldData
        )
      })
    } else {
      await likeVideo(video.id).then((res) => {
        queryClient.setQueryData(['getVideoById', id], (oldData) =>
          oldData
            ? {
                ...oldData,
                has_liked: true,
                likes: oldData.likes + 1,
              }
            : oldData
        )
      })
    }
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
    return <Text>Error: {error.message}</Text>
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <Stack.Screen
        options={{
          headerShown: false,
          headerBackTitle: 'Back',
          headerTitle: 'Watch',
          headerBackTitleStyle: {
            color: 'white',
          },
        }}
      />
      <StatusBar barStyle="auto" backgroundColor="#000000" />

      <VideoPost
        post={video}
        activePostId={id}
        onShare={() => null}
        onRefreshFeed={() => router.navigate('/')}
        onLike={() => handleLike()}
        swipeLeft={false}
        tabBarHeight={1}
        showFullHeight={true}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 0,
  },
})
