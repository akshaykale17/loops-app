import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@state/AuthProvider'
import { Link, Stack, router, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useContext, useEffect, useMemo, useState } from 'react'
import { Alert, FlatList, Keyboard, Platform, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { searchQuery } from 'src/requests'
import { BUILD_VERSION, openBrowserAsync } from 'src/utils'
import { Button, ScrollView, Text, View, XStack, YStack } from 'tamagui'

export default function SettingsScreen() {
  const { logout } = useAuth()
  const router = useRouter()

  const links = [
    { path: 'account', url: false, name: 'Account', icon: 'person-outline', id: 1 },
    { path: 'bio', url: false, name: 'Bio', icon: 'person-circle-outline', id: 2 },
    { path: 'app', url: false, name: 'App Settings', icon: 'settings-outline', id: 10 },
  ]

  const helpLinks = [
    {
      path: '',
      url: 'https://loops.video/help-center',
      name: 'Help Center',
      icon: 'help-circle-outline',
      id: 7,
    },
  ]

  const openWebLink = async (url) => {
    return await openBrowserAsync(url)
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ])
  }

  const RenderItem = ({ item }) => {
    if (item.url) {
      return (
        <Pressable onPress={() => openWebLink(item.url)}>
          <View key={item.id} style={styles.linkWrapper}>
            <XStack justifyContent="space-between" alignItems="center">
              <XStack gap={10} alignItems="center">
                <Ionicons name={item.icon} size={20} color="#aaa" />
                <Text fontSize="$6">{item.name}</Text>
              </XStack>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </XStack>
          </View>
        </Pressable>
      )
    }
    return (
      <Link href={`/settings/${item.path}`} asChild>
        <View key={item.id} style={styles.linkWrapper}>
          <XStack justifyContent="space-between" alignItems="center">
            <XStack gap={10} alignItems="center">
              <Ionicons name={item.icon} size={20} color="#aaa" />
              <Text fontSize="$6">{item.name}</Text>
            </XStack>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </XStack>
        </View>
      </Link>
    )
  }

  const ItemSeparator = () => <View h={1} bg="$gray3"></View>
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: 'Back',
          headerShown: true,
          headerTitle: 'Settings',
        }}
      />
      <StatusBar animated={true} style="light" />

      <View py="$3" flex={1}>
        <ScrollView flex={1}>
          <View flexGrow={1}>
            <View style={styles.linkContainer}>
              {links.map((item, index) => (
                <React.Fragment key={index}>
                  <RenderItem item={item} />
                  {index < links.length - 1 && <ItemSeparator />}
                </React.Fragment>
              ))}
            </View>

            <View style={styles.linkContainer}>
              {helpLinks.map((item, index) => (
                <React.Fragment key={index}>
                  <RenderItem item={item} />
                  {index < links.length - 1 && <ItemSeparator />}
                </React.Fragment>
              ))}
            </View>
          </View>

          <YStack flexShrink={1} justifyContent="center" p="$3">
            <Button
              variant="solid"
              theme="red"
              bg="$red9"
              onPress={() => handleLogout()}
              size="$5"
              borderColor="$red5"
              color="$red1"
              fontWeight="bold"
            >
              Sign out
            </Button>
            <XStack justifyContent="center" alignItems="center" mt="$3">
              <Text fontSize="$3" color="$gray9">
                v1.0.0.{BUILD_VERSION}
              </Text>
            </XStack>
          </YStack>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  linkContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 0,
    borderRadius: 10,
  },
  linkWrapper: {
    padding: 20,
  },
})
