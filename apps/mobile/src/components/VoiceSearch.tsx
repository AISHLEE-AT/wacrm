import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import { Mic, Square } from 'lucide-react-native';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence
} from 'react-native-reanimated';

const isExpoGo = Constants.appOwnership === 'expo';
let Audio: any = null;

if (!isExpoGo) {
  try {
    Audio = require('expo-av').Audio;
  } catch (e) {
    console.warn('Could not load expo-av', e);
  }
}

interface VoiceSearchProps {
  onTranscription: (text: string) => void;
  isTranscribing: boolean;
  setIsTranscribing: (val: boolean) => void;
}

export default function VoiceSearch({ onTranscription, isTranscribing, setIsTranscribing }: VoiceSearchProps) {
  const [recording, setRecording] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    if (isRecording) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1, // infinite
        true
      );
    } else {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording]);

  async function startRecording() {
    if (isExpoGo || !Audio) {
      Alert.alert('Not Supported', 'Voice Search requires a compiled custom build (EAS). It cannot be used in Expo Go.');
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsRecording(false);
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setRecording(null);
      
      if (uri) {
        await transcribeAudio(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
      setIsRecording(false);
    }
  }

  async function transcribeAudio(uri: string) {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'audio.m4a',
        type: 'audio/m4a',
      } as any);

      // Using our local Web app backend for transcription
      // If running on device, this should point to your production URL or ngrok
      // For now we use the production URL or fallback to localhost
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://watscrm.vercel.app';
      
      const response = await fetch(`${apiUrl}/api/transcribe`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (data.text) {
        onTranscription(data.text);
      }
    } catch (error) {
      console.error('Transcription error:', error);
    } finally {
      setIsTranscribing(false);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={isRecording ? stopRecording : startRecording}
        disabled={isTranscribing}
      >
        <Animated.View style={[
          styles.button, 
          isRecording && styles.buttonRecording,
          isTranscribing && styles.buttonDisabled,
          animatedStyle
        ]}>
          {isRecording ? (
            <Square color="#fff" fill="#fff" size={20} />
          ) : (
            <Mic color={isTranscribing ? "#999" : "#fff"} size={20} />
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00A884',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonRecording: {
    backgroundColor: '#ff4444',
    shadowColor: '#ff4444',
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
    shadowColor: 'transparent',
  }
});
