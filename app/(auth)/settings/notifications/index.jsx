import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Text, View, XStack, YStack } from 'tamagui'

export default function Screen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View p="$3">
        <XStack w="100%" justifyContent="space-between" alignItems="center">
          <Button chromeless onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} />
          </Button>

          <Text fontSize="$8" fontWeight="bold">
            Notifications
          </Text>

          <Button chromeless>
            <Ionicons name="menu" size={20} color="white" />
          </Button>
        </XStack>
      </View>
      <YStack flexGrow={1} justifyContent="center" alignItems="center">
        <Text fontSize="$9">Oops!</Text>
        <Text fontSize="$7">This page isn't finished yet</Text>
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
