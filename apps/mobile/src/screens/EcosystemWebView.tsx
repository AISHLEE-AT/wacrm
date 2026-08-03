import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
const API_URL = 'https://watscrm.vercel.app';

interface Props {
  route: {
    params: {
      moduleName: string;
      path: string;
    };
  };
}

export default function EcosystemWebView({ route }: Props) {
  const { path } = route.params;
  const webViewRef = useRef<WebView>(null);
  
  // Construct the full URL, e.g. https://watscrm.vercel.app/testo
  const targetUrl = `${API_URL}${path}`;

  // This JS runs inside the webview as soon as it loads.
  // It adds a special class so the Next.js app knows it's inside the native app
  // and can hide its own navigation bars if necessary.
  const INJECTED_JAVASCRIPT = `
    document.body.classList.add('is-native-app');
    window.ReactNativeWebView.postMessage(JSON.stringify({type: 'READY'}));
    true;
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: targetUrl }}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        onMessage={(event) => {
          // Listen for messages from the Next.js app if needed
          console.log('Message from WebView:', event.nativeEvent.data);
        }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        )}
        style={styles.webview}
        // Basic performance optimizations
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e', // Match app background
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loader: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0f1e',
  },
});
