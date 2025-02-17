import Ionicons from '@expo/vector-icons/Ionicons'
import { FlashList } from '@shopify/flash-list'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native'
import { useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SceneMap, TabBar, TabView } from 'react-native-tab-view'
import AccountItem from 'src/components/flatlist/AccountItem'
import { fetchAccount, fetchAccountFollowers, fetchAccountFollowing } from 'src/requests'
import { Button } from 'tamagui'
import { Text, View, XStack, YStack } from 'tamagui'

const keyExtractor = (_, index) => `followers-${_.id}-${index}`
const RenderItem = ({ item }) => <AccountItem key={item.id} item={item} />

const FollowingRoute = () => {
  const { id } = useLocalSearchParams()
  const {
    data: feed,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
    isFetching,
    status,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['accountFollowing', id],
    queryFn: fetchAccountFollowing,
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => lastPage.meta.next_cursor,
  })

  const EmptyList = useCallback(() => {
    if (isFetching || isFetchingNextPage) {
      return null
    }

    if (feed?.pages?.length && feed.pages.some((page) => page.data.length > 0)) {
      return null
    }

    if (status === 'success') {
      return (
        <View py="$5" justifyContent="center" alignItems="center">
          <Text fontSize="$6">This account is not following anyone</Text>
        </View>
      )
    }

    return null
  }, [isFetching, isFetchingNextPage, status, feed])
  return (
    <>
      <FlatList
        data={feed?.pages.flatMap((page) => page.data)}
        keyExtractor={keyExtractor}
        renderItem={RenderItem}
        contentContainerStyle={styles.flatlist}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetching && !isFetchingNextPage) fetchNextPage()
        }}
        ListEmptyComponent={EmptyList}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetching || isFetchingNextPage ? (
            <View py="$5" justifyContent="center" alignItems="center">
              <ActivityIndicator />
            </View>
          ) : (
            <View h={100}></View>
          )
        }
      />
    </>
  )
}

const FollowersRoute = () => {
  const { id } = useLocalSearchParams()
  const {
    data: feed,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
    isFetching,
    status,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['accountFollowers', id],
    queryFn: fetchAccountFollowers,
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => lastPage.meta.next_cursor,
  })

  const EmptyList = useCallback(() => {
    if (isFetching || isFetchingNextPage) {
      return null
    }

    if (feed?.pages?.length && feed.pages.some((page) => page.data.length > 0)) {
      return null
    }

    if (status === 'success') {
      return (
        <View py="$5" justifyContent="center" alignItems="center">
          <Text fontSize="$6">This account has no followers</Text>
        </View>
      )
    }

    return null
  }, [isFetching, isFetchingNextPage, status, feed])
  return (
    <>
      <FlatList
        data={feed?.pages.flatMap((page) => page.data)}
        keyExtractor={keyExtractor}
        renderItem={RenderItem}
        contentContainerStyle={styles.flatlist}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetching && !isFetchingNextPage) fetchNextPage()
        }}
        ListEmptyComponent={EmptyList}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetching || isFetchingNextPage ? (
            <View py="$5" justifyContent="center" alignItems="center">
              <ActivityIndicator />
            </View>
          ) : (
            <View h={100}></View>
          )
        }
      />
    </>
  )
}

const renderScene = SceneMap({
  following: FollowingRoute,
  followers: FollowersRoute,
})

const renderTabBar = (props) => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: 'black' }}
    inactiveColor="#ccc"
    activeColor="#000"
    style={{ backgroundColor: 'white', color: 'black', fontWeight: 'bold' }}
  />
)

const routes = [
  { key: 'following', title: 'Following' },
  { key: 'followers', title: 'Followers' },
]

export default function Screen() {
  const { id } = useLocalSearchParams()
  const layout = useWindowDimensions()
  const [index, setIndex] = React.useState(1)

  const { data: profile } = useQuery({
    queryKey: ['accountFollowersAccount', id],
    queryFn: async () => {
      const res = await fetchAccount(id)
      return res
    },
  })

  const profileId = profile?.id

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          title: 'User',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#000',
          },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          headerShown: true,
          headerTitle: profile?.username,
        }}
      />

      <StatusBar animated={true} style="dark" />

      <TabView
        navigationState={{ index, routes }}
        renderTabBar={renderTabBar}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </SafeAreaView>
  )
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: 'white' }}
      edges={['left', 'right', 'bottom']}
    >
      <Stack.Screen
        options={{
          title: 'Followers',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#000',
          },
          headerBackTitle: 'Back',
          headerShown: true,
          headerTitle: 'Followers',
        }}
      />
      <StatusBar animated={true} style="dark" />
      <FlatList
        data={feed?.pages.flatMap((page) => page.data)}
        keyExtractor={keyExtractor}
        renderItem={RenderItem}
        contentContainerStyle={styles.flatlist}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetching && !isFetchingNextPage) fetchNextPage()
        }}
        ListEmptyComponent={EmptyList}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetching || isFetchingNextPage ? (
            <View py="$5" justifyContent="center" alignItems="center">
              <ActivityIndicator />
            </View>
          ) : (
            <View h={100}></View>
          )
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  flatlist: {
    flexGrow: 1,
  },
})
