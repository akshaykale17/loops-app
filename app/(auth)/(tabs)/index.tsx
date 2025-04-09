import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import Constants from 'expo-constants'
import { useFocusEffect, useNavigation } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  type ListRenderItem,
  Platform,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import VideoPost from 'src/components/feed/VideoPost'
import { fetchFeed, likeVideo, unlikeVideo } from 'src/requests'
import { Text, View, XStack } from 'tamagui'

interface Account {
  id: string
  name: string
  avatar: string
  username: string
  is_owner: boolean
  bio: string
  post_count: number
  follower_count: number
  following_count: number
  url: string
  is_blocking: boolean
  created_at: string
}

interface Media {
  width: number
  height: number
  thumbnail: string
  src_url: string
}

interface Post {
  id: string
  account: Account
  caption: string
  url: string
  is_owner: boolean
  is_sensitive: boolean
  media: Media
  likes: number
  shares: number
  comments: number
  has_liked: boolean
}

interface ApiResponse {
  data: Post[]
  meta: {
    path: string
    per_page: number
    next_cursor: string | null
    prev_cursor: string | null
  }
}

const getUsableScreenHeight = () => {
  const { height, width } = useWindowDimensions()

  const STATUS_BAR_HEIGHT = Platform.select({
    android: 40,
    ios: 0,
  })

  const bottomTabHeight = useBottomTabBarHeight()

  const usableHeight = height - STATUS_BAR_HEIGHT - bottomTabHeight

  return usableHeight
}

export default function HomeScreen() {
  const [activePostId, setActivePostId] = useState<string>()
  const [viewHeight, setViewHeight] = useState(0)
  const [scrollPosition, setScrollPosition] = useState(0)
  const videoRef = useRef(null)
  const queryClient = useQueryClient()
  const flatListRef = useRef(null)
  const navigation = useNavigation()
  const isMountedRef = useRef(false)

  // Memoize query configuration with additional caching options
  const queryConfig = useMemo(
    () => ({
      queryKey: ['homeFeed'],
      queryFn: fetchFeed,
      initialPageParam: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Prevent refetch when component mounts
      refetchOnReconnect: false, // Prevent refetch on reconnection
      staleTime: Number.POSITIVE_INFINITY, // Data will never be considered stale automatically
      cacheTime: Number.POSITIVE_INFINITY, // Keep the data cached indefinitely
      getNextPageParam: (lastPage: ApiResponse) => lastPage.meta?.next_cursor,
    }),
    []
  )

  const height_screen = Platform.OS === 'android' ? viewHeight : getUsableScreenHeight()

  useFocusEffect(
    useCallback(() => {
      if (isMountedRef.current && flatListRef.current && scrollPosition > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({
            offset: scrollPosition,
            animated: false,
          })
        }, 0)
      }

      isMountedRef.current = true

      const unsubscribe = navigation.addListener('tabPress', (e) => {
        if (navigation.isFocused()) {
          flatListRef.current?.scrollToOffset({ animated: true, offset: 0 })
          setScrollPosition(0)
        }
      })

      return unsubscribe
    }, [navigation, scrollPosition])
  )

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
    isFetching,
  } = useInfiniteQuery(queryConfig)

  // Memoize flat list data
  const flatListData = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data?.pages]
  )

  const refreshFeed = useCallback(() => {
    setScrollPosition(0)
    refetch()
  }, [refetch])

  const handleScroll = useCallback((event) => {
    const offset = event.nativeEvent.contentOffset.y
    setScrollPosition(offset)
  }, [])

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 90,
  }).current

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { itemVisiblePercentThreshold: 50 },
      onViewableItemsChanged: ({ changed, viewableItems }) => {
        if (viewableItems.length > 0 && viewableItems[0].isViewable) {
          setActivePostId(viewableItems[0].item.id)
        }
      },
    },
  ])

  const updatePost = useCallback(
    (postId: string, updatedData: Partial<Post>) => {
      queryClient.setQueryData(['homeFeed'], (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: ApiResponse) => ({
            ...page,
            data: page.data.map((post: Post) =>
              post.id === postId ? { ...post, ...updatedData } : post
            ),
          })),
        }
      })
    },
    [queryClient]
  )

  const handleLike = useCallback(
    async (post: Post) => {
      try {
        const res = post.has_liked ? await unlikeVideo(post.id) : await likeVideo(post.id)

        updatePost(post.id, {
          has_liked: res.has_liked,
          likes: res.likes,
          shares: res.shares,
        })
      } catch (err) {
        console.error(err)
      }
    },
    [updatePost]
  )

  const renderItem: ListRenderItem<Post> = useCallback(
    ({ item }) => (
      <VideoPost
        ref={videoRef}
        post={item}
        activePostId={activePostId}
        onShare={() => {}}
        onRefreshFeed={refreshFeed}
        onLike={() => handleLike(item)}
        swipeLeft={true}
        tabBarHeight={Platform.OS === 'android' ? viewHeight : true}
      />
    ),
    [activePostId, handleLike, refreshFeed, viewHeight]
  )

  const keyExtractor = useCallback((item: Post) => item.id, [])

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetching && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage])

  return Platform.OS === 'android' ? (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="auto" backgroundColor="#000000" />
      <View
        style={{ flex: 1 }}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout
          setViewHeight(height)
        }}
      >
        <FlatList
          ref={flatListRef}
          data={flatListData}
          pagingEnabled={true}
          renderItem={({ item, idx }) => (
            <VideoPost
              ref={videoRef}
              post={item}
              activePostId={activePostId}
              onShare={() => {}}
              onRefreshFeed={refreshFeed}
              onLike={() => handleLike(item)}
              swipeLeft={true}
              tabBarHeight={viewHeight}
            />
          )}
          keyExtractor={keyExtractor}
          viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
          scrollEventThrottle={50}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.2}
          maxToRenderPerBatch={2}
          updateCellsBatchingPeriod={50}
          initialNumToRender={1}
          windowSize={3}
          removeClippedSubviews={true}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          overScrollMode={'never'}
          scrollToOverflowEnabled={true}
          automaticallyAdjustContentInsets={false}
          directionalLockEnabled={true}
          bounces={false}
          bouncesZoom={false}
          alwaysBounceVertical={false}
          contentContainerStyle={{
            flexGrow: 1,
          }}
          onEndReached={onEndReached}
          refreshing={isRefetching}
          onRefresh={refetch}
          pinchGestureEnabled={false}
          snapToAlignment="start"
          decelerationRate={'normal'}
          getItemLayout={(data, index) => ({
            length: height_screen,
            offset: height_screen * index,
            index,
          })}
        />
      </View>
    </SafeAreaView>
  ) : (
    <View style={styles.container}>
      <StatusBar barStyle="auto" backgroundColor="#000000" />

      <FlatList
        ref={flatListRef}
        data={flatListData}
        pagingEnabled={true}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        scrollEventThrottle={50}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={3}
        onEndReached={onEndReached}
        refreshing={isRefetching}
        onRefresh={refetch}
        removeClippedSubviews={true}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        maxToRenderPerBatch={3}
        windowSize={3}
        initialNumToRender={1}
        pinchGestureEnabled={true}
        snapToAlignment="start"
        decelerationRate={'normal'}
        overScrollMode="never"
        scrollToOverflowEnabled={true}
        automaticallyAdjustContentInsets={false}
        directionalLockEnabled={true}
        bounces={false}
        bouncesZoom={false}
        alwaysBounceVertical={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 0,
  },
})
