import { type ReactNode, createContext, useEffect } from 'react'
import { useContext, useState } from 'react'
import { router, useSegments } from 'expo-router'
import { loginPreflightCheck, postForm, get } from '@requests'
import * as Linking from 'expo-linking'
import { Storage } from './cache.js'
import * as WebBrowser from 'expo-web-browser'
import { Platform, Alert } from 'react-native'
import { verifyCredentials, handleLogin, fetchSelfAccount, handleLoginTwoFactor } from 'src/requests'
import * as Burnt from "burnt";

type User = {
  server: string
  token: string
}

type AuthProvider = {
  isLoading: boolean
  user: User | null
  login: (server: string) => boolean
  logout: () => void
  setUser: User | null
}

function useProtectedRoute(user: User | null, setUser: any, setIsLoading: any) {
  const segments = useSegments()

  useEffect(() => {
    const checkToken = async () => {
      try {
        if(!Storage.contains('app.token')) {
          setIsLoading(false)
          return
        }
        const token = Storage.getString('app.token')
        const server = 'loops.video'
        if (token && !user) {
          const userInfo = await fetchSelfAccount()
          if (userInfo) {
            setUser({
              server: server,
              token: token,
            })
            Storage.set('user.id', userInfo.id)
            Storage.set('user.username', userInfo.username)
          } else {
            setIsLoading(false)
            return;
          }
        }
      } catch (error) {
        setIsLoading(false)
        console.error('Failed to fetch token from MMKV:', error)
      }
    }
    checkToken()

    const inAuthGroup = segments[0] === '(auth)'

    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    if (!user && inAuthGroup) {
      router.replace('/login')
    } else if (user && !inAuthGroup) {
      router.replace('/(auth)/(tabs)/')
    }
  }, [user, segments, setUser, setIsLoading])
}

export const AuthContext = createContext<AuthProvider>({
  isLoading: true,
  user: null,
  login: () => false,
  logout: () => {},
  setUser: () => {},
})

export function useAuth() {
  if (!useContext(AuthContext)) {
    throw new Error('useAuth must be used within a <AuthProvider />')
  }

  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<Boolean>(true)

  const login = async (data) => {
    let validate = await handleLogin(data.email, data.password, data.build)
    if(validate.chp) {
      router.push({ pathname:'/twofactorcheckpoint', params: data})
      return;
    }
    else if(validate.message) {
      Burnt.alert({
        title: "Error",
        preset: "error",
        haptic: "error",
        message: validate.message,
      });
      return false;
    } else if(validate.errors) {
        Burnt.alert({
          title: "Login Error",
          preset: "error",
          from: "top",
          haptic: "error",
          message: "The credentials are incorrect.",
      });
      return false;
    } else if(validate.hasOwnProperty('auth_token')) {
        Storage.set('app.token', validate.auth_token)
        setUser({
            server: 'loops.video',
            token: validate.access_token,
          })
    } else {

    }
    return true;
  }

  const loginTwoFactor = async (data) => {
    let validate = await handleLoginTwoFactor(data.email, data.password, data.build, data.code)
    if(validate.chp) {
      router.push('/twofactorcheckpoint')
      return;
    }
    else if(validate.message) {
      Burnt.alert({
        title: "Error",
        preset: "error",
        haptic: "error",
        message: validate.message,
      });
      return false;
    } else if(validate.errors) {
        Burnt.alert({
          title: "Login Error",
          preset: "error",
          from: "top",
          haptic: "error",
          message: "The credentials are incorrect.",
      });
      return false;
    } else if(validate.hasOwnProperty('auth_token')) {
        Storage.set('app.token', validate.auth_token)
        setUser({
            server: 'loops.video',
            token: validate.access_token,
          })
    } else {

    }
    return true;
  }

  const logout = async () => {
    setIsLoading(true)
    Storage.delete('app.token')
    Storage.delete('user.id')
    Storage.delete('user.username')
    Storage.clearAll()
    setUser(null)
    setIsLoading(false)
  }

  useProtectedRoute(user, setUser, setIsLoading)

  return (
    <AuthContext.Provider value={{ isLoading, user, login, logout, loginTwoFactor }}>
      {children}
    </AuthContext.Provider>
  )
}
