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
import { SafeAreaView } from 'react-native-safe-area-context'
import AccountItem from 'src/components/flatlist/AccountItem'
import { fetchAccount, fetchAccountFollowing } from 'src/requests'
import { Button } from 'tamagui'
import { Text, View, XStack, YStack } from 'tamagui'

const keyExtractor = (_, index) => `followers-${_.id}-${index}`
const RenderItem = ({ item }) => <AccountItem key={item.id} item={item} />

export default function Screen() {
  const { id } = useLocalSearchParams()

  const { data: profile } = useQuery({
    queryKey: ['accountFollowingAccount', id],
    queryFn: async () => {
      const res = await fetchAccount(id)
      return res
    },
  })

  const profileId = profile?.id

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
    enabled: !!profileId,
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: 'white' }}
      edges={['left', 'right', 'bottom']}
    >
      <Stack.Screen
        options={{
          title: 'Following',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#000',
          },
          headerBackTitle: 'Back',
          headerShown: true,
          headerTitle: 'Following',
        }}
      />
      <StatusBar animated={true} style="dark" />
      <FlatList
        data={feed?.pages.flatMap((page) => page.data)}
        keyExtractor={keyExtractor}
        renderItem={RenderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatlist}
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
            <View h={200}></View>
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
