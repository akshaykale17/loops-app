import FastImage from '@d11/react-native-fast-image'
import { Ionicons } from '@expo/vector-icons'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, Stack, router, useLocalSearchParams, useNavigation } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  Share,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FeatherIcon from 'src/components/common/FeatherIcon'
import { VideoFeedItem } from 'src/components/feed/VideoFeedItem'
import EmptyFeed from 'src/components/profile/EmptyFeed'
import ProfileHeader from 'src/components/profile/ProfileHeader'
import {
  fetchAccountExtended,
  fetchAccountVideos,
  followAccount,
  postProfileBlock,
  postProfileUnblock,
  unfollowAccount,
} from 'src/requests'
import { Storage } from 'src/state/cache'
import { Button, Text, View, XStack, YStack } from 'tamagui'

const SCREEN_WIDTH = Dimensions.get('screen').width
const LOADING_TIMEOUT = 300

const FeedItem = ({ item }) => (
  <View borderWidth={1} borderColor="white" bg="white">
    <Link href={`/video/watch/${item.id}?pid=${item.account.id}`} asChild>
      <Pressable>
        <View>
          <FastImage
            style={{
              width: SCREEN_WIDTH / 3 - 2.5,
              height: 240,
              backgroundColor: '#000',
            }}
            source={{ uri: item.media.thumbnail }}
            resizeMode={FastImage.resizeMode.contain}
          />
          {item.likes && item.likes >= 5 && (
            <View
              style={{
                position: 'absolute',
                bottom: 4,
                left: 4,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: 4,
                borderRadius: 4,
              }}
            >
              <FeatherIcon name="heart" size={14} color="white" />
              <Text style={{ color: 'white', marginLeft: 4, fontSize: 12 }}>
                {item.likes}
              </Text>
            </View>
          )}

          {item && item.pinned && (
            <View
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: '#ff0000',
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 4,
              }}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                Pinned
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Link>
  </View>
)

export default function ProfileScreen() {
  const { id } = useLocalSearchParams()
  const [isFollowing, setFollowing] = useState(null)
  const queryClient = useQueryClient()
  const selfId = Storage.getString('user.id')
  const navigation = useNavigation()

  const bottomSheetModalRef = useRef(null)
  const snapPoints = useMemo(() => ['25%'], [])
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior={'close'}
        disappearsOnIndex={0}
        appearsOnIndex={1}
      />
    ),
    []
  )

  const { data: profile } = useQuery({
    queryKey: ['fetchAccountExtended', id],
    queryFn: async (id) => {
      return await fetchAccountExtended(id)
    },
  })

  const userId = profile?.data?.id

  useLayoutEffect(() => {
    if (profile && profile?.data && profile?.data?.name) {
      navigation.setOptions({ headerTitle: profile.data.name })
    }
  }, [profile, userId])

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
    getNextPageParam: (lastPage) => lastPage.meta?.next_cursor,
    enabled: !!userId,
  })

  const handleFollow = async (idx) => {
    setFollowing(true)
    await followAccount(idx)
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ['fetchAccountExtended', id] })
      })
      .catch((err) => {})
  }

  const handleUnfollow = async (idx) => {
    setFollowing(false)
    await unfollowAccount(idx)
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ['fetchAccountExtended', id] })
      })
      .catch((err) => {})
  }

  const handleOpenMenu = () => {
    if ((profile && profile.data.is_owner) || userId == selfId) {
      router.push('/settings/')
      return
    }
    handlePresentModalPress()
  }

  const handleBlock = () => {
    Alert.alert('Confirm Block', 'Are you sure you want to block this account?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Block',
        style: 'destructive',
        onPress: () => postBlock(),
      },
    ])
  }

  const handleUnblock = () => {
    Alert.alert('Confirm Unblock', 'Are you sure you want to unblock this account?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Unblock',
        style: 'destructive',
        onPress: () => postUnblock(),
      },
    ])
  }

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `Checkout ${profile.data.username}'s Loops.video account!`,
        url: profile.data.url,
      })
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message)
    }
  }

  const _handleGotoReport = (id) => {
    bottomSheetModalRef.current?.close()
    setTimeout(() => {
      router.push(`/report/profile/${id}`)
    }, 500)
  }

  const postBlock = async () => {
    await postProfileBlock(userId)
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ['fetchAccountExtended', id] })
      })
      .catch((err) => {})
  }

  const postUnblock = async () => {
    await postProfileUnblock(userId)
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ['fetchAccountExtended', id] })
      })
      .catch((err) => {})
  }

  const HeaderRight = () => (
    <Pressable onPress={() => handleOpenMenu()}>
      <Ionicons name="menu" size={30} />
    </Pressable>
  )

  if (status === 'pending') {
    return (
      <View flexGrow={1} justifyContent="center" alignItems="center">
        <ActivityIndicator />
      </View>
    )
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['right', 'left', 'top']}>
        <Text>Error: {error.message}</Text>
      </SafeAreaView>
    )
  }

  if (profile && profile.data && profile.data.is_blocking == 1) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['right', 'left', 'top']}>
        <YStack justifyContent="center" alignItems="center" flexGrow={1} gap="$3">
          <YStack flexGrow={1} justifyContent="center" alignItems="center" gap="$3">
            <Ionicons name="ban-outline" size={50} color="red" />
            <Text fontSize="$8" fontWeight="bold">
              You are blocking this account
            </Text>
          </YStack>
          <XStack w="100%" flexShrink={1} mb="$4" justifyContent="space-around">
            <Button
              chromeless
              fontWeight="bold"
              fontSize="$5"
              onPress={() => router.back()}
            >
              Go back
            </Button>
            <Button
              chromeless
              fontWeight="bold"
              fontSize="$5"
              color="$red10"
              onPress={() => handleUnblock()}
            >
              Unblock
            </Button>
          </XStack>
        </YStack>
      </SafeAreaView>
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
          title: 'User',
          headerShadowVisible: false,
          headerRight: HeaderRight,
        }}
      />
      <StatusBar animated={true} style="dark" />

      <View bg="white" flexGrow={1}>
        <FlatList
          data={data?.pages.flatMap((page) => page.data)}
          numColumns={3}
          renderItem={VideoFeedItem}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={3}
          onEndReached={() => {
            if (hasNextPage && !isFetching && !isFetchingNextPage) fetchNextPage()
          }}
          ListHeaderComponent={
            <ProfileHeader
              profile={profile.data}
              isFollowing={profile.meta.following}
              isFollowedBy={profile.meta.followed_by}
              likesCount={profile.meta.likes_count}
              handleFollow={handleFollow}
              handleUnfollow={handleUnfollow}
              openMenu={() => handleOpenMenu()}
            />
          }
          ListEmptyComponent={<EmptyFeed />}
        />

        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          enableDismissOnClose={true}
        >
          <BottomSheetView style={{ alignItems: 'center' }}>
            <YStack alignItems="center" alignSelf={'stretch'} px="$3" gap="$2">
              <Text fontSize="$6" fontWeight="bold">
                Menu
              </Text>
            </YStack>
          </BottomSheetView>
          <BottomSheetScrollView
            contentContainerStyle={{ flexShrink: 1, marginTop: 10, padding: 10, gap: 10 }}
            horizontal
          >
            <Pressable onPress={() => onShare()}>
              <YStack w={90} justifyContent="center" alignItems="center" gap="$3">
                <View
                  w={70}
                  h={70}
                  bg="$gray4"
                  justifyContent="center"
                  alignItems="center"
                  borderRadius={70}
                >
                  <Ionicons name="share-outline" size={30} color="#161722" />
                </View>
                <Text color="#4E4F57" fontSize={15}>
                  Share
                </Text>
              </YStack>
            </Pressable>
            <Pressable onPress={() => handleBlock()}>
              <YStack w={90} justifyContent="center" alignItems="center" gap="$3">
                <View
                  w={70}
                  h={70}
                  bg="$gray4"
                  justifyContent="center"
                  alignItems="center"
                  borderRadius={70}
                >
                  <Ionicons name="ban-outline" size={30} color="red" />
                </View>
                <Text color="#4E4F57" fontSize={15}>
                  Block
                </Text>
              </YStack>
            </Pressable>
            <Pressable onPress={() => _handleGotoReport(userId)}>
              <YStack w={90} justifyContent="center" alignItems="center" gap="$3">
                <View
                  w={70}
                  h={70}
                  bg="$gray4"
                  justifyContent="center"
                  alignItems="center"
                  borderRadius={70}
                >
                  <Ionicons name="warning-outline" size={30} color="#161722" />
                </View>
                <Text color="#4E4F57" fontSize={15}>
                  Report
                </Text>
              </YStack>
            </Pressable>
          </BottomSheetScrollView>
        </BottomSheetModal>
      </View>
    </SafeAreaView>
  )
}
