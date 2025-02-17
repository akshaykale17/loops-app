import { useMutation, useQuery } from '@tanstack/react-query'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fetchSelfAccount, storeUpdateBio } from 'src/requests'
import { Button, Text, TextArea, View, XStack, YStack } from 'tamagui'

const MAX_BIO_LENGTH = 80
const LOADING_DELAY = 500

const BioGuidelines = () => (
  <YStack mt="$3" gap="$3">
    <Text color="$gray9" fontSize="$3">
      - Choose a bio that reflects your identity or content.
    </Text>
    <Text color="$gray9" fontSize="$3">
      - Keep it easy to read and remember.
    </Text>
    <Text color="$gray9" fontSize="$3">
      - If you have a brand or online presence, try to keep your bio consistent across
      platforms.
    </Text>
    <Text color="$gray9" fontSize="$3">
      - Be respectful and avoid using offensive or inappropriate language.
    </Text>
  </YStack>
)

const BioInput = ({ bio, onBioChange, onSave, canSave, isSaving, maxLength }) => {
  const handleClear = useCallback(() => onBioChange(''), [onBioChange])

  return (
    <YStack gap="$2">
      <Text fontSize="$6" color="$gray9">
        Bio
      </Text>
      <TextArea
        autoFocus
        placeholder="Add your display bio"
        size="$6"
        fontWeight="500"
        value={bio}
        maxLength={maxLength}
        onChangeText={onBioChange}
      />
      <XStack justifyContent="space-between" px="$3">
        {bio?.length ? (
          <Text color="$red9" fontSize="$4" onPress={handleClear}>
            Clear
          </Text>
        ) : (
          <View />
        )}
        <Text color="$gray9" fontSize="$4">
          {bio?.length || 0}/{maxLength}
        </Text>
      </XStack>
      {canSave && (
        <Button
          size="$5"
          theme={canSave ? 'active' : 'white'}
          themeInverse={!!canSave}
          color={canSave ? 'black' : 'transparent'}
          disabled={!canSave}
          onPress={onSave}
          marginTop="$3"
        >
          <Text fontWeight="900" color={canSave ? 'white' : 'transparent'}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Text>
        </Button>
      )}
    </YStack>
  )
}

const useBioUpdate = (initialBio) => {
  const [bio, setBio] = useState(initialBio || '')

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await storeUpdateBio(data)
      if (!res?.id) {
        throw new Error(res?.message || 'An unexpected error occurred!')
      }
      return res
    },
    onSuccess: () => {
      router.push('/profile')
    },
    onError: (error) => {
      Alert.alert('Error', error.message)
    },
  })

  const handleSave = useCallback(() => {
    const trimmedBio = bio.trim()
    if (trimmedBio !== bio) {
      setBio(trimmedBio)
      return
    }
    mutation.mutate({ bio: trimmedBio })
  }, [bio, mutation])

  return {
    bio,
    setBio,
    handleSave,
    isSaving: mutation.isPending,
  }
}

const useProfile = () => {
  const [isLoaded, setLoaded] = useState(false)

  const {
    data: profile,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ['selfAccount'],
    queryFn: async () => {
      const res = await fetchSelfAccount()
      setTimeout(() => setLoaded(true), LOADING_DELAY)
      return res
    },
  })

  return {
    profile,
    isPending,
    isError,
    error,
    isLoaded,
  }
}

export default function BioUpdateScreen() {
  const { profile, isPending, isError, error, isLoaded } = useProfile()
  const { bio, setBio, handleSave, isSaving } = useBioUpdate(profile?.bio)

  const canSave = useMemo(() => {
    return isLoaded && bio && bio.trim() !== profile?.bio && !isSaving
  }, [isLoaded, bio, profile?.bio, isSaving])

  if (isPending) {
    return (
      <View flexGrow={1} justifyContent="center" alignItems="center">
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Update Bio',
          headerStyle: styles.header,
          headerTintColor: '#fff',
          headerTitleStyle: styles.headerTitle,
          headerBackTitle: 'Back',
          headerShown: true,
        }}
      />
      <StatusBar animated style="light" />

      <YStack p="$5" gap="$3" flexGrow={1}>
        <BioInput
          bio={bio}
          onBioChange={setBio}
          maxLength={MAX_BIO_LENGTH}
          onSave={handleSave}
          canSave={canSave}
          isSaving={isSaving}
        />
        <BioGuidelines />
      </YStack>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#000000',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
})
