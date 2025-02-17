import { Feather } from '@expo/vector-icons'
import { Link, Redirect, Tabs } from 'expo-router'
import { Platform, Pressable } from 'react-native'
import { Text, View } from 'tamagui'

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        initialRouteName: 'index',
        backBehavior: 'order',
        tabBarActiveTintColor: '#ffe504',
        animation: 'shift',
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopWidth: 1,
          borderTopColor: '#222',
          height: Platform.OS === 'ios' ? 80 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 5,
          elevation: 0,
          shadowColor: '#000',
          shadowOpacity: 0,
          shadowOffset: {
            height: 0,
          },
          shadowRadius: 0,
        },
      }}
      initialRouteName="index"
      backBehavior="history"
    >
      <Tabs.Screen
        name="index"
        options={{
          href: '/',
          tabBarLabel: 'Feed',
          tabBarShowLabel: false,
          tabBarLabelStyle: { display: 'none' },
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="home" size={26} color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: '/explore',
          tabBarLabel: 'Explore',
          tabBarShowLabel: false,
          tabBarLabelStyle: { display: 'none' },
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="zap" size={26} color={color} />,
        }}
      />

      <Tabs.Screen
        name="camera"
        options={{
          href: '/camera',
          tabBarLabel: ' ',
          tabBarShowLabel: false,
          headerShown: false,
          tabBarLabelStyle: { display: 'none' },
          tabBarIcon: ({ color, focused }) => (
            <Feather name="camera" size={26} color={focused ? '#ffe504' : '#ffe50470'} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          href: '/notifications',
          tabBarLabel: 'Notifications',
          tabBarShowLabel: false,
          tabBarLabelStyle: { display: 'none' },
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="bell" size={26} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: '/profile',
          tabBarLabel: 'Profile',
          tabBarShowLabel: false,
          tabBarLabelStyle: { display: 'none' },
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="user" size={26} color={color} />,
        }}
      />
    </Tabs>
  )
}
