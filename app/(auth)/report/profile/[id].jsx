import { useQuery } from '@tanstack/react-query'
import * as Burnt from 'burnt'
import { Link, Stack, router, useLocalSearchParams, useRouter } from 'expo-router'
import { ActivityIndicator, Alert, Pressable, ScrollView } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import FeatherIcon from 'src/components/common/FeatherIcon'
import { getReportRules, postReportProfile } from 'src/requests'
import { Separator, Text, View, XStack, YStack } from 'tamagui'

export default function Screen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()

  const {
    data: reasons,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ['reportRules'],
    queryFn: getReportRules,
  })

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
    return (
      <View flexGrow={1}>
        <Text>Error: {error.message}</Text>
      </View>
    )
  }

  const RenderItem = ({ item }) => {
    return (
      <View px="$5" py="$3" bg="$gray2" mb="$1">
        <Pressable onPress={() => handleReport(item.key)}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontWeight="bold">{item.message}</Text>
            <FeatherIcon name="chevron-right" size={20} />
          </XStack>
        </Pressable>
      </View>
    )
  }

  const handleReport = (item) => {
    const params = {
      report_type: item,
      reported_profile_id: id,
    }
    Alert.alert('Confirm Report', 'Are you sure you want to report this account?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => sendReport(params),
      },
    ])
  }

  const sendReport = async (params) => {
    try {
      await postReportProfile(params)
        .then(() => {
          Burnt.toast({
            title: 'Report Sent!',
            preset: 'done',
            from: 'bottom',
            haptic: 'success',
            message: 'Thanks for reporting.',
          })
        })
        .catch((error) => {})
        .finally(() => {
          router.back()
        })
    } catch (e) {
      router.back()
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['right', 'left']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitle: 'Back',
          headerTitle: 'Report Account',
          headerBackTitleStyle: {
            color: 'white',
          },
        }}
      />
      <FlatList
        data={reasons}
        renderItem={RenderItem}
        contentContainerStyle={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}
