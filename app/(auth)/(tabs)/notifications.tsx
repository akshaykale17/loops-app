import FastImage from '@d11/react-native-fast-image'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Link, Stack, useFocusEffect, useNavigation } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getNotifications, likeVideo, unlikeVideo } from 'src/requests'
import { Separator, Text, View, XStack, YStack } from 'tamagui'
import FeatherIcon from 'src/components/common/FeatherIcon'
import { Storage } from 'src/state/cache'

export default function Screen() {
  const videoRef = useRef(null)
  const queryClient = useQueryClient()
  const flatListRef = useRef(null)
  const navigation = useNavigation()
  const selfUserId = Storage.getString('user.id')

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('tabPress', () => {
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 })
      })

      return unsubscribe
    }, [navigation])
  )

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
    isFetching,
    isPending,
    status,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['getNotifications'],
    queryFn: getNotifications,
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => lastPage.meta?.next_cursor,
  })

  const refreshFeed = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['getNotifications'] })
  }, [queryClient])

  const getRelativeTime = (timestamp) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diff = Math.floor((now - date) / 1000) // Convert to seconds

    // Less than a minute
    if (diff < 60) {
      return 'now'
    }

    // Less than an hour
    if (diff < 3600) {
      const minutes = Math.floor(diff / 60)
      return `${minutes}m`
    }

    // Less than a day
    if (diff < 86400) {
      const hours = Math.floor(diff / 3600)
      return `${hours}h`
    }

    // Less than a week
    if (diff < 604800) {
      const days = Math.floor(diff / 86400)
      return `${days}d`
    }

    // Less than a month
    if (diff < 2592000) {
      const weeks = Math.floor(diff / 604800)
      return `${weeks}w`
    }

    // Less than a year
    if (diff < 31536000) {
      const months = Math.floor(diff / 2592000)
      return `${months}mo`
    }

    // More than a year
    const years = Math.floor(diff / 31536000)
    return `${years}y`
  }

  const notifyText = (type) => {
    switch (type) {
      case 'video.like':
        return (
          <>
            <Text color="$gray8">liked your </Text>
            <Text color="$gray8">video</Text>
          </>
        )
        break
      case 'new_follower':
        return 'followed you'
        break

      case 'video.comment':
        return 'commented on your video'
        break

      default:
        break
    }
  }

  const renderItem = useCallback(
    ({ item }) => (
      <YStack px="$5" gap="$3" pt="$3">
        <XStack
          flexWrap="wrap"
          w="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          <XStack flexWrap="wrap" gap="$3" alignItems="center">
            <XStack>
              <Link href={`/profile/${item.actor.id}`}>
                <FastImage
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 40,
                    margin: 0,
                    backgroundColor: '#000',
                  }}
                  source={{ uri: item.actor.avatar }}
                  resizeMode={FastImage.resizeMode.cover}
                />
              </Link>
            </XStack>
            {Platform.OS === 'ios' ? (
              <>
                <XStack flexWrap="wrap">
                  <Text flexWrap="wrap" fontSize="$4" fontWeight={'bold'} color="$gray3">
                    {item.actor.username}
                  </Text>
                  <Text flexWrap="wrap" fontSize="$4" color="$gray8">
                    {' '}
                    {notifyText(item.type)}
                  </Text>
                </XStack>
                <Text fontSize="$4" fontWeight="bold" color="$gray8">
                  {getRelativeTime(item.created_at)}
                </Text>
              </>
            ) : (
              <YStack>
                <XStack flexWrap="wrap">
                  <Text flexWrap="wrap" fontSize="$4" fontWeight={'bold'}>
                    {item.actor.username}
                  </Text>
                </XStack>
                <Text flexWrap="wrap" fontSize="$4" color="$gray5">
                  {notifyText(item.type)}
                </Text>
                <Text fontSize="$4" fontWeight="bold" color="$gray8">
                  {getRelativeTime(item.created_at)}
                </Text>
              </YStack>
            )}
          </XStack>

          {item.video_thumbnail && (
            <Link href={`/video/watch/${item.video_id}?pid=${selfUserId}`}>
              <FastImage
                style={{
                  width: 40,
                  height: 60,
                  borderRadius: 10,
                  margin: 0,
                  backgroundColor: '#000',
                }}
                source={{ uri: item.video_thumbnail }}
                resizeMode={FastImage.resizeMode.cover}
              />
            </Link>
          )}
          {/* { !item.video_thumbnail && (
                    <View h={60} />
                )} */}
        </XStack>
        <Separator borderColor="#222" />
      </YStack>
    ),
    [selfUserId]
  )

  const flatListData = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data?.pages]
  )

  const keyExtractor = useCallback((item, index) => item.id + index, [])

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetching && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage])

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['right', 'left']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitle: 'Back',
          headerTitle: 'Notifications',
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerBackTitleStyle: {
            color: '#fff',
          },
        }}
      />

      <StatusBar animated={true} style="light" />

      <FlatList
        ref={flatListRef}
        data={flatListData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={3}
        onEndReached={onEndReached}
        refreshing={isRefetching}
        onRefresh={refetch}
      />
    </SafeAreaView>
  )
}
