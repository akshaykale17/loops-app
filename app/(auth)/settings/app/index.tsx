import { Ionicons } from '@expo/vector-icons'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useState } from 'react'
import { StyleSheet, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Storage } from 'src/state/cache'
import { Button, ScrollView, Text, View, XStack, YStack } from 'tamagui'

export default function Screen() {
  const forceUnmuteDefault = Storage.contains('settings.video_forceunmute')
    ? Storage.getBoolean('settings.video_forceunmute')
    : false
  const videoCoverDefault = Storage.contains('settings.video_cover')
    ? Storage.getBoolean('settings.video_cover')
    : false
  const [videoCover, setVideoCover] = useState(videoCoverDefault)
  const [forceUnmute, setForceUnmute] = useState(forceUnmuteDefault)

  const mutateVideoCoverData = useCallback((val) => {
    setVideoCover(val)
    Storage.set('settings.video_cover', val)
  }, [])

  const mutateForceUnmuteData = useCallback((val) => {
    setForceUnmute(val)
    Storage.set('settings.video_forceunmute', val)
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'App Settings',
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: 'Back',
          headerShown: true,
          headerTitle: 'App Settings',
        }}
      />
      <StatusBar animated={true} style="light" />

      <ScrollView flexGrow={1}>
        {/* <YStack justifyContent='center' alignItems='center' py="$3">
                    <Text fontSize="$5">App settings are synced across devices.</Text>
                </YStack> */}
        <XStack style={styles.settingStack}>
          <YStack maxWidth="75%" gap="$2">
            <Text fontSize="$5" fontWeight="bold">
              Stretch videos
            </Text>
            <Text fontSize="$4">Stretch videos to fill full screen</Text>
          </YStack>
          <Switch
            trackColor={{ false: '#fff', true: 'red' }}
            thumbColor={videoCover ? '#fff' : '#f4f3f4'}
            ios_backgroundColor="#ccc"
            onValueChange={mutateVideoCoverData}
            value={videoCover}
          />
        </XStack>

        <XStack style={styles.settingStack}>
          <YStack maxWidth="75%" gap="$2">
            <Text fontSize="$5" fontWeight="bold">
              Force Unmute
            </Text>
            <Text fontSize="$4">Force audio even in silent mode</Text>
          </YStack>
          <Switch
            trackColor={{ false: '#fff', true: 'red' }}
            thumbColor={videoCover ? '#fff' : '#f4f3f4'}
            ios_backgroundColor="#ccc"
            onValueChange={mutateForceUnmuteData}
            value={forceUnmute}
          />
        </XStack>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  settingStack: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    padding: 20,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eaeaea',
  },
  linkContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
  },
  linkWrapper: {
    padding: 20,
  },
})
