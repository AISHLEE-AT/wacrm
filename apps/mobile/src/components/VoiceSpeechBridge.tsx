// @ts-nocheck
import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export interface VoiceSpeechBridgeRef {
  startListening: (lang?: 'ta-IN' | 'en-IN') => void;
  stopListening: () => void;
  speak: (text: string, lang?: 'ta-IN' | 'en-IN') => void;
  stopSpeaking: () => void;
}

interface VoiceSpeechBridgeProps {
  onSpeechStart?: () => void;
  onSpeechResult?: (transcript: string, isFinal: boolean) => void;
  onSpeechEnd?: () => void;
  onSpeechError?: (error: string) => void;
  onTtsStart?: () => void;
  onTtsEnd?: () => void;
}

const VOICE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voice Bridge</title>
</head>
<body style="background:transparent; margin:0; padding:0;">
  <script>
    (function() {
      var recognition = null;
      var isListening = false;
      var currentLang = 'ta-IN';
      var finalTranscript = '';
      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      function postMsg(data) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }
      }

      function initRecognition() {
        if (!SpeechRecognition) {
          postMsg({ type: 'SPEECH_ERROR', error: 'SpeechRecognition not supported in this environment.' });
          return null;
        }

        try {
          var rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = currentLang;

          rec.onstart = function() {
            isListening = true;
            postMsg({ type: 'SPEECH_START' });
          };

          rec.onresult = function(event) {
            var interimTranscript = '';
            for (var i = event.resultIndex; i < event.results.length; ++i) {
              var result = event.results[i];
              if (result.isFinal) {
                finalTranscript += result[0].transcript + ' ';
                postMsg({
                  type: 'SPEECH_RESULT',
                  transcript: finalTranscript.trim(),
                  isFinal: true
                });
              } else {
                interimTranscript += result[0].transcript;
                postMsg({
                  type: 'SPEECH_RESULT',
                  transcript: (finalTranscript + interimTranscript).trim(),
                  isFinal: false
                });
              }
            }
          };

          rec.onerror = function(event) {
            console.warn('Speech recognition error:', event.error);
            postMsg({ type: 'SPEECH_ERROR', error: event.error || 'Recognition error' });
          };

          rec.onend = function() {
            if (isListening) {
              // Automatically restart if still flagged as listening (e.g. paused temporarily)
              try {
                rec.start();
              } catch(e) {
                isListening = false;
                postMsg({ type: 'SPEECH_END' });
              }
            } else {
              postMsg({ type: 'SPEECH_END' });
            }
          };

          return rec;
        } catch(err) {
          postMsg({ type: 'SPEECH_ERROR', error: err.message || 'Init error' });
          return null;
        }
      }

      window.handleCommand = function(cmdStr) {
        try {
          var cmd = typeof cmdStr === 'string' ? JSON.parse(cmdStr) : cmdStr;
          
          if (cmd.action === 'START_LISTENING') {
            currentLang = cmd.lang || 'ta-IN';
            finalTranscript = '';
            if (recognition) {
              try { recognition.stop(); } catch(e){}
            }
            recognition = initRecognition();
            if (recognition) {
              isListening = true;
              recognition.lang = currentLang;
              recognition.start();
            }
          } else if (cmd.action === 'STOP_LISTENING') {
            isListening = false;
            if (recognition) {
              try {
                recognition.stop();
              } catch(e){}
            }
            postMsg({ type: 'SPEECH_END' });
          } else if (cmd.action === 'SPEAK') {
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              var text = cmd.text || '';
              if (!text.trim()) return;

              // Clean markdown symbols for cleaner speech
              var cleanText = (text || '')
                .replace(/[*#_~>()\n\r]/g, ' ')
                .split('[').join(' ')
                .split(']').join(' ')
                .split(String.fromCharCode(96)).join(' ')
                .replace(/\s+/g, ' ')
                .trim();

              var utterance = new SpeechSynthesisUtterance(cleanText);
              utterance.lang = cmd.lang || 'ta-IN';
              utterance.rate = 0.95;
              utterance.pitch = 1.0;

              utterance.onstart = function() {
                postMsg({ type: 'TTS_START' });
              };
              utterance.onend = function() {
                postMsg({ type: 'TTS_END' });
              };
              utterance.onerror = function(e) {
                postMsg({ type: 'TTS_END', error: e.error });
              };

              window.speechSynthesis.speak(utterance);
            } else {
              postMsg({ type: 'TTS_END', error: 'TTS not supported' });
            }
          } else if (cmd.action === 'STOP_SPEAKING') {
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
            postMsg({ type: 'TTS_END' });
          }
        } catch(e) {
          console.error('Command handling error:', e);
        }
      };

      // Let React Native know bridge is ready
      postMsg({ type: 'BRIDGE_READY' });
    })();
  </script>
</body>
</html>
`;

export const VoiceSpeechBridge = forwardRef<VoiceSpeechBridgeRef, VoiceSpeechBridgeProps>(
  (
    {
      onSpeechStart,
      onSpeechResult,
      onSpeechEnd,
      onSpeechError,
      onTtsStart,
      onTtsEnd,
    },
    ref
  ) => {
    const webViewRef = useRef<WebView>(null);

    const sendCommand = (cmd: any) => {
      if (webViewRef.current) {
        const js = `window.handleCommand && window.handleCommand(${JSON.stringify(cmd)}); true;`;
        webViewRef.current.injectJavaScript(js);
      }
    };

    useImperativeHandle(ref, () => ({
      startListening: (lang = 'ta-IN') => {
        sendCommand({ action: 'START_LISTENING', lang });
      },
      stopListening: () => {
        sendCommand({ action: 'STOP_LISTENING' });
      },
      speak: (text: string, lang = 'ta-IN') => {
        sendCommand({ action: 'SPEAK', text, lang });
      },
      stopSpeaking: () => {
        sendCommand({ action: 'STOP_SPEAKING' });
      },
    }));

    const handleMessage = (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        switch (data.type) {
          case 'SPEECH_START':
            onSpeechStart?.();
            break;
          case 'SPEECH_RESULT':
            onSpeechResult?.(data.transcript || '', !!data.isFinal);
            break;
          case 'SPEECH_END':
            onSpeechEnd?.();
            break;
          case 'SPEECH_ERROR':
            onSpeechError?.(data.error || 'Recognition error');
            break;
          case 'TTS_START':
            onTtsStart?.();
            break;
          case 'TTS_END':
            onTtsEnd?.();
            break;
          case 'BRIDGE_READY':
            break;
          default:
            break;
        }
      } catch (err) {
        console.warn('VoiceBridge message parse error:', err);
      }
    };

    return (
      <View style={styles.hiddenContainer} pointerEvents="none">
        <WebView
          ref={webViewRef}
          source={{ html: VOICE_HTML, baseUrl: 'https://localhost' }}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          androidLayerType="hardware"
          onPermissionRequest={(request) => {
            if (request && typeof request.grant === 'function') {
              request.grant(request.resources);
            }
          }}
          onMessage={handleMessage}
          style={styles.hiddenWebView}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  hiddenContainer: {
    width: 1,
    height: 1,
    opacity: 0.01,
    position: 'absolute',
    bottom: -100,
    left: -100,
  },
  hiddenWebView: {
    width: 1,
    height: 1,
    backgroundColor: 'transparent',
  },
});
export default VoiceSpeechBridge;
