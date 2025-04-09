import { Ionicons } from '@expo/vector-icons'
import * as Burnt from 'burnt'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import mime from 'mime'
import { useCallback, useRef, useState } from 'react'
import { ActivityIndicator, Platform, Pressable } from 'react-native'
import { StyleSheet, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import VideoOptimizer from 'src/components/camera/VideoOptimizer'
import { uploadVideo } from 'src/requests'
import { generateUUID } from 'src/utils'
import { Button, Heading, ScrollView, Text, TextArea, XStack, YStack } from 'tamagui'

export default function Screen() {
  const { path } = useLocalSearchParams()
  const [description, setDescription] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [canEdit, setCanEdit] = useState(true)
  const [canPost, setCanPost] = useState(false)
  const [commentState, setCommentState] = useState(true)
  const [downloadState, setDownloadState] = useState(false)
  const [isOptimized, setOptimized] = useState(false)
  const properPath = path
  const outputName = generateUUID()
  const desLen = description.length

  const handleCommentStateChange = (commentState: any) => {
    setCommentState(commentState)
  }

  const handleDownloadStateChange = (state: any) => {
    setDownloadState(state)
  }

  const handleOnStartOptimize = () => {
    setCanEdit(false)
  }

  const HeaderRight = useCallback(() => {
    return (
      <Button
        theme="yellow"
        size="$2"
        backgroundColor="#ffe504"
        px="$4"
        fontSize="$5"
        borderRadius={20}
        color="black"
        fontWeight="bold"
        opacity={canPost ? 1 : 0.3}
        disabled={!canPost}
        onPress={() => handlePost()}
      >
        {isPosting ? <ActivityIndicator color="#000" /> : 'Post'}
      </Button>
    )
  }, [isPosting])

  const handleOnOptimized = async (val) => {
    setIsPosting(true)
    const uri = Platform.OS === 'ios' ? val.replace('file://', '') : val
    let name = val.split('/').slice(-1)[0]
    await uploadVideo({
      video: {
        uri: uri,
        type: mime.getType(uri),
        name: name,
      },
      description: description,
      comment_state: commentState ? 4 : 0,
      can_download: downloadState,
    })
      .then((res) => {
        if (res && res.id) {
          setTimeout(() => {
            Burnt.toast({
              title: 'Video Uploading',
              preset: 'done',
              from: 'top',
              haptic: 'success',
              message: 'Your loop is processing!',
            })
            router.replace('/')
          }, 1000)
          return
        }
        setIsPosting(false)
        if (res && res.message) {
          Burnt.alert({
            title: 'Error',
            preset: 'error',
            from: 'top',
            haptic: 'error',
            message: res.message,
          })
        }
      })
      .catch((err) => {
        setIsPosting(false)
        const data = err.response?.data

        if (data?.message) {
          Burnt.alert({
            title: 'Error',
            preset: 'error',
            from: 'top',
            haptic: 'error',
            message: data?.message,
          })
          return
        }
        Burnt.alert({
          title: 'Error',
          preset: 'error',
          from: 'top',
          haptic: 'error',
          message: 'An unexpected error occured.',
        })
      })
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitle: 'Back',
          headerTitle: 'New Loop',
        }}
      />

      <StatusBar animated={true} barStyle={'light-content'} />

      <ScrollView>
        {canEdit && (
          <YStack gap="$3" mb="$3">
            <XStack mt="$3" style={styles.settingStack}>
              <YStack flexGrow={1} gap="$2">
                <Text fontSize="$5" fontWeight="bold">
                  Caption
                </Text>
                <TextArea
                  size="$5"
                  borderWidth={2}
                  flexGrow={1}
                  color="black"
                  placeholderTextColor={'#ccc'}
                  placeholder="Add optional caption"
                  defaultValue={description}
                  maxLength={200}
                  fontWeight="500"
                  onChangeText={(newText) => setDescription(newText)}
                />
                <XStack>
                  <Text color="$gray9">{desLen}/200</Text>
                </XStack>
              </YStack>
            </XStack>

            <XStack style={styles.settingStack}>
              <YStack maxWidth="75%" gap="$2">
                <Text fontSize="$6" fontWeight="bold">
                  Downloads
                </Text>
                <Text fontSize="$4">Allow users to download your Loop</Text>
              </YStack>
              <Switch
                trackColor={{ false: '#fff', true: '#2563eb' }}
                thumbColor={commentState ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#ccc"
                onValueChange={handleDownloadStateChange}
                value={downloadState}
              />
            </XStack>

            <XStack style={styles.settingStack}>
              <YStack maxWidth="75%" gap="$2">
                <Text fontSize="$6" fontWeight="bold">
                  Comments
                </Text>
                <Text fontSize="$4">Allow users to comment on your Loop</Text>
              </YStack>
              <Switch
                trackColor={{ false: '#fff', true: '#2563eb' }}
                thumbColor={commentState ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#ccc"
                onValueChange={handleCommentStateChange}
                value={commentState}
              />
            </XStack>
          </YStack>
        )}

        <YStack gap="$3" mt="$3">
          {!canPost && !isPosting && (
            <VideoOptimizer
              inputUri={properPath}
              outputName={outputName}
              onStartOptimize={() => handleOnStartOptimize()}
              onOptimized={(val) => handleOnOptimized(val)}
            />
          )}

          {isPosting && (
            <YStack mx="$3" gap="$2" justifyContent="center" alignItems="center">
              <Button
                size="$6"
                backgroundColor="#000"
                px="$4"
                w="100%"
                fontSize="$6"
                borderRadius={20}
                color="black"
                fontWeight="bold"
                disabled={true}
              >
                <ActivityIndicator color="#fff" />
                <Text fontSize="$6" fontWeight="bold" color="white">
                  Uploading...
                </Text>
              </Button>
              <Text fontSize="$4" fontWeight="bold">
                Please do not exit the app or navigate away from the screen.
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  settingStack: {
    borderRadius: 10,
    marginHorizontal: 15,
    padding: 14,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eaeaea',
  },
})
