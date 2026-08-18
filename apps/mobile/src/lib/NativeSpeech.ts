import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid } from 'react-native';

const { NativeSpeechModule } = NativeModules;

export interface SpeechResultEvent {
  text: string;
  isFinal: boolean;
}

export interface SpeechErrorEvent {
  error: string;
  errorCode?: number;
}

class NativeSpeechService {
  private eventEmitter: NativeEventEmitter | null = null;
  private listeners: any[] = [];
  private isAvailableCached: boolean | null = null;

  constructor() {
    if (NativeSpeechModule) {
      this.eventEmitter = new NativeEventEmitter(NativeSpeechModule);
    }
  }

  async checkPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      if (hasPermission) return true;

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'குரல் உள்ளீடு அனுமதி (Microphone Permission)',
          message: 'குரல் மூலம் தேட மற்றும் பேச மைக்ரோஃபோன் அனுமதி தேவை (Microphone access is needed for voice search).',
          buttonPositive: 'அனுமதி (Allow)',
          buttonNegative: 'வேண்டாம் (Deny)',
        }
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (e) {
      console.warn('Microphone permission check error:', e);
      return false;
    }
  }

  async isAvailable(): Promise<boolean> {
    if (this.isAvailableCached !== null) return this.isAvailableCached;
    if (NativeSpeechModule && NativeSpeechModule.isRecognitionAvailable) {
      try {
        const avail = await NativeSpeechModule.isRecognitionAvailable();
        this.isAvailableCached = !!avail;
        return this.isAvailableCached;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  async startListening(
    lang: 'ta-IN' | 'en-IN' = 'ta-IN',
    callbacks?: {
      onStart?: () => void;
      onResult?: (text: string, isFinal: boolean) => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
    }
  ): Promise<boolean> {
    const hasPerm = await this.checkPermission();
    if (!hasPerm) {
      callbacks?.onError?.('Microphone permission denied. Please allow microphone access in settings.');
      return false;
    }

    this.removeAllListeners();

    if (this.eventEmitter) {
      if (callbacks?.onStart) {
        this.listeners.push(
          this.eventEmitter.addListener('onSpeechStart', () => {
            callbacks.onStart?.();
          })
        );
      }
      if (callbacks?.onResult) {
        this.listeners.push(
          this.eventEmitter.addListener('onSpeechRecognized', (event: SpeechResultEvent) => {
            callbacks.onResult?.(event.text || '', !!event.isFinal);
          })
        );
      }
      if (callbacks?.onEnd) {
        this.listeners.push(
          this.eventEmitter.addListener('onSpeechEnd', () => {
            callbacks.onEnd?.();
          })
        );
      }
      if (callbacks?.onError) {
        this.listeners.push(
          this.eventEmitter.addListener('onSpeechError', (event: SpeechErrorEvent) => {
            callbacks.onError?.(event.error || 'Speech recognition error');
          })
        );
      }
    }

    if (NativeSpeechModule && NativeSpeechModule.startListening) {
      try {
        await NativeSpeechModule.startListening(lang);
        return true;
      } catch (err: any) {
        callbacks?.onError?.(err?.message || 'Failed to start speech recognizer');
        return false;
      }
    } else {
      callbacks?.onError?.('Native speech recognizer module not registered.');
      return false;
    }
  }

  async stopListening(): Promise<void> {
    if (NativeSpeechModule && NativeSpeechModule.stopListening) {
      try {
        await NativeSpeechModule.stopListening();
      } catch (e) {
        // Ignore
      }
    }
    this.removeAllListeners();
  }

  async cancel(): Promise<void> {
    if (NativeSpeechModule && NativeSpeechModule.cancel) {
      try {
        await NativeSpeechModule.cancel();
      } catch (e) {
        // Ignore
      }
    }
    this.removeAllListeners();
  }

  removeAllListeners(): void {
    this.listeners.forEach(sub => {
      try {
        sub?.remove?.();
      } catch (e) {
        // Ignore
      }
    });
    this.listeners = [];
  }
}

export const NativeSpeech = new NativeSpeechService();
export default NativeSpeech;
