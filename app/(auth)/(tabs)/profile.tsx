import FastImage from '@d11/react-native-fast-image'
import { Ionicons } from '@expo/vector-icons'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Link, Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, Dimensions, FlatList, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { VideoFeedItem } from 'src/components/feed/VideoFeedItem'
import ProfileHeader from 'src/components/profile/ProfileHeader'
import { fetchAccountVideos, fetchSelfAccount } from 'src/requests'
import { Text, View, YStack } from 'tamagui'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function Screen() {
  const {
    isPending,
    isError,
    data: profile,
  } = useQuery({
    queryKey: ['selfAccount'],
    queryFn: fetchSelfAccount,
  })

  const handleOpenMenu = () => {
    router.push('/settings')
  }

  const HeaderRight = () => (
    <Pressable onPress={() => handleOpenMenu()} style={{ marginRight: 10 }}>
      <Ionicons name="menu" size={30} />
    </Pressable>
  )

  const userId = profile?.id

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['fetchAccountVideos', userId],
    queryFn: fetchAccountVideos,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.meta?.next_cursor,
    enabled: !!userId,
  })

  if (isPending || status === 'pending') {
    return (
      <View flexGrow={1} justifyContent="center" alignItems="center">
        <ActivityIndicator />
      </View>
    )
  }

  if (isError || status === 'error') {
    return (
      <View flexGrow={1} justifyContent="center" alignItems="center">
        <Text>Error: {error.message}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['right', 'left']}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#000',
          },
          headerBackTitleVisible: false,
          headerShown: true,
          headerShadowVisible: false,
          title: 'My Account',
          headerRight: HeaderRight,
        }}
      />
      <StatusBar style="dark" />
      <FlatList
        data={data?.pages.flatMap((page) => page.data)}
        numColumns={3}
        renderItem={VideoFeedItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        onEndReached={() => {
          if (hasNextPage && !isFetching && !isFetchingNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={3}
        ListHeaderComponent={
          <ProfileHeader
            profile={profile}
            isFollowing={false}
            likesCount={profile.likes_count}
            openMenu={handleOpenMenu}
          />
        }
      />
    </SafeAreaView>
  )
}
