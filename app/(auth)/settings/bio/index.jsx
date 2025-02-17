import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Link, Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, Image, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fetchSelfAccount } from 'src/requests'
import { Avatar, Button, Text, View, XStack, YStack } from 'tamagui'

export default function Screen() {
  const {
    data: profile,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ['selfAccount'],
    queryFn: fetchSelfAccount,
  })

  const truncateText = (val, limit) => {
    if (val && val.length > limit) {
      return val.slice(0, limit) + '...'
    }
    return val
  }

  const RenderSection = ({ title, value }) => (
    <YStack>
      <XStack
        justifyContent="space-between"
        borderWidth={1}
        p="$3"
        bg="white"
        borderRadius={10}
        borderColor="$gray4"
      >
        <Text fontSize="$6" color="$gray9">
          {title}
        </Text>
        <Text fontSize="$6">{truncateText(value, 20)}</Text>
      </XStack>
      <XStack justifyContent="flex-end" px="$3" pt="$1">
        <Text fontSize="$3" color="$gray8">
          Tap to edit
        </Text>
      </XStack>
    </YStack>
  )

  if (isPending || !profile) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    )
  }

  if (isError) {
    return (
      <View>
        <Text>Error: {error.message}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Bio',
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: 'Back',
          headerShown: true,
          headerTitle: 'Bio',
        }}
      />
      <StatusBar animated={true} style="light" />

      <YStack p="$5" gap="$3" flexGrow={1}>
        <Link href="/settings/bio/avatar" asChild>
          <Pressable>
            <YStack>
              <XStack
                borderWidth={1}
                p="$3"
                bg="white"
                borderRadius={10}
                borderColor="$gray4"
                justifyContent="space-between"
                alignItems="center"
              >
                <Text fontSize="$6" color="$gray9">
                  Avatar
                </Text>
                <Avatar circular size="$10">
                  <Avatar.Image src={profile.avatar} />
                  <Avatar.Fallback bg="gray" />
                </Avatar>
              </XStack>
              <XStack justifyContent="flex-end" px="$3" pt="$1">
                <Text fontSize="$3" color="$gray8">
                  Tap to edit
                </Text>
              </XStack>
            </YStack>
          </Pressable>
        </Link>

        <Link href="/settings/bio/name" asChild>
          <Pressable>
            <RenderSection title="Display Name" value={profile.name} />
          </Pressable>
        </Link>

        <Link href="/settings/bio/bio" asChild>
          <Pressable>
            <RenderSection title="Bio" value={profile.bio} />
          </Pressable>
        </Link>

        {/* <Link href="/settings/bio/links" asChild>
                <Pressable>
                    <RenderSection title="Links" value={profile.links && profile.links.length ? profile.links[0].url : null} />
                </Pressable>
            </Link> */}
      </YStack>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  linkContainer: {
    marginVertical: 20,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
  },
  linkWrapper: {
    padding: 20,
  },
})
