import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Link, Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fetchSelfAccount } from 'src/requests'
import { formatTimestampMonthYear } from 'src/utils'
import { Button, Text, View, XStack, YStack } from 'tamagui'

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

  const RenderSection = ({ title, value }) => (
    <XStack
      justifyContent="space-between"
      borderWidth={1}
      p="$3"
      borderRadius={10}
      bg="white"
      borderColor="$gray4"
    >
      <Text fontSize="$6" color="$gray9">
        {title}
      </Text>
      <Text fontSize="$6">{value}</Text>
    </XStack>
  )

  if (isPending) {
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
          title: 'Account',
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: 'Back',
          headerShown: true,
          headerTitle: 'Account',
        }}
      />
      <StatusBar animated={true} style="light" />

      <YStack p="$5" gap="$3" flexShrink={1}>
        <RenderSection title="Username" value={profile.username} />
        {/* <RenderSection title="Display Name" value={profile.name} /> */}
        <RenderSection title="Follower Count" value={profile.follower_count} />
        <RenderSection title="Following Count" value={profile.following_count} />
        <RenderSection title="Post Count" value={profile.post_count} />
        <RenderSection
          title="Account Created"
          value={formatTimestampMonthYear(profile.created_at)}
        />
      </YStack>

      <XStack gap="$3" width="100%" px="$5" flexGrow={1}>
        <Link href="/settings/account/edit-password" asChild>
          <Button flexGrow={1} fontWeight={'bold'} bg="white">
            Edit Password
          </Button>
        </Link>
        {/* <Button flexGrow={1} fontWeight={'bold'}>Edit Email Address</Button> */}
      </XStack>

      {/* <YStack flexShrink={1} p="$5" gap="$1">
            <Button theme="red">Delete Account</Button>
        </YStack> */}
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
