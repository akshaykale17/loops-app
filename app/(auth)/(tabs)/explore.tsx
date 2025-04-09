import FastImage from '@d11/react-native-fast-image'
import { useQuery } from '@tanstack/react-query'
import { Link, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FeatherIcon from 'src/components/common/FeatherIcon'
import { fetchTrendingTags } from 'src/requests'
import { Input, ScrollView, Text, View, XStack, YStack } from 'tamagui'
import { Storage } from '../../../src/state/cache'

interface Hashtag {
  id: string
  name: string
  count: number
  videos: Array<{
    id: string
    thumbnail: string
    pid: string
    caption: string
    likes: number
    created_at: string
  }>
}

const VideoThumbnail = ({
  uri,
  id,
  pid,
  likes,
}: { uri: string; id: string; pid: string; likes: number }) => (
  <Link style={{ marginRight: 8 }} href={`/video/watch/${id}?pid=${pid}`}>
    <View
      style={{
        width: 110,
        height: 180,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#222',
      }}
    >
      <FastImage
        source={{ uri }}
        style={{
          width: 110,
          height: 180,
          borderRadius: 8,
        }}
        resizeMode={FastImage.resizeMode.cover}
      />
      {likes >= 5 && (
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
          <Text style={{ color: 'white', marginLeft: 4, fontSize: 12 }}>{likes}</Text>
        </View>
      )}
    </View>
  </Link>
)

const HashtagRow = ({ hashtag }: { hashtag: Hashtag }) => {
  return (
    <YStack p="$4" mb="$5">
      <XStack space="$2" marginBottom="$3" alignItems="center">
        <XStack flex={1} space="$2" alignItems="center">
          <View
            w={40}
            h={40}
            bg="#212121"
            borderRadius={40}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontWeight="bold" fontSize={18} color="$gray9">
              #
            </Text>
          </View>
          <YStack>
            <Text fontSize={25} fontWeight="500" color="$gray3">
              {hashtag.name}
            </Text>
            {/* <Text fontSize={14} color="$gray10">Trending</Text> */}
          </YStack>
        </XStack>
        <Text color="$gray9" fontWeight={500}>
          {hashtag.count.toLocaleString()} Loops
        </Text>
      </XStack>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {hashtag &&
          hashtag.videos?.map((video) => (
            <VideoThumbnail
              key={video.id}
              uri={video.thumbnail}
              pid={video.pid}
              id={video.id}
              likes={video.likes}
            />
          ))}
      </ScrollView>
    </YStack>
  )
}

const Header = () => (
  <XStack backgroundColor="black" px="$4" py="$4" alignItems="center">
    {/* <FeatherIcon name="search" size={20} color="$gray11" />
        <Input 
          flex={1}
          borderWidth={0}
          size="$3"
          fontWeight={400}
          backgroundColor="transparent"
          placeholder="Search hashtags or people"
          placeholderTextColor="#999"
        /> */}
    <Text fontSize="$10" fontWeight={700} color="white">
      Trending
    </Text>
  </XStack>
)

export default function Screen() {
  const {
    isPending,
    isError,
    status,
    data: hashtags,
  } = useQuery({
    queryKey: ['exploreHashtags'],
    queryFn: () => fetchTrendingTags(),
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
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }} edges={['top']}>
      <StatusBar animated={true} style="light" />
      <FlatList
        data={hashtags}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HashtagRow hashtag={item} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={Header}
        ItemSeparatorComponent={() => <Stack height={1} backgroundColor="#222" />}
      />
    </SafeAreaView>
  )
}
