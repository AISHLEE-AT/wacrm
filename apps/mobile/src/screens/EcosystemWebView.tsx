import React, { useRef, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, SafeAreaView, StatusBar, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { AppContext } from '../context/AppContext';
import { RefreshCw, ArrowLeft, Home } from 'lucide-react-native';

const BASE_URL = 'https://watscrm.vercel.app';

interface Props {
  route: {
    params: {
      moduleName: string;
      path: string;
      /** Override full URL instead of composing from path */
      url?: string;
    };
  };
  navigation: any;
}

export default function EcosystemWebView({ route, navigation }: Props) {
  const { path, moduleName, url: overrideUrl } = route.params;
  const { user } = useContext(AppContext);
  const webViewRef = useRef<WebView>(null);

  const accessToken = user?.accessToken ?? '';
  const refreshToken = user?.refreshToken ?? '';
  
  const userPhone   = user?.phone ?? '';
  const userName    = user?.name ?? '';
  const userRole    = user?.role ?? 'user';
  const isAdmin     = user?.isAdmin ? 'true' : 'false';

  let targetUrl = overrideUrl ?? `${BASE_URL}${path}`;
  const separator = targetUrl.includes('?') ? '&' : '?';
  targetUrl = `${targetUrl}${separator}embed=true`;

  // We no longer pass access_token and refresh_token in the URL query parameters
  // because it can crash the Aishlee-web Vite app router.
  // We rely entirely on INJECTED_JS to write to localStorage and send the SUPRO_AUTH_INJECT postMessage.

  // ─────────────────────────────────────────────────────────────────────────
  // Injected JS that:
  //   1. Marks the page as running inside the native app (hides web nav)
  //   2. Writes the Supabase auth token into localStorage so Next.js
  //      picks it up on the next auth check — no re-login needed
  //   3. Listens for navigation requests sent from the web page back
  //      to the native app (e.g. the web "login" page can redirect to
  //      native login instead of the web login form)
  // ─────────────────────────────────────────────────────────────────────────


  const INJECTED_JS = `
    (function() {
      try {
        // Mark as native so web can hide its own nav/header
        document.documentElement.classList.add('is-native-app');
        document.body.classList.add('is-native-app');

        // Inject Supabase session so user doesn't get redirected to login
        if ("${accessToken}") {
          var tokenKey = null;
          for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && k.includes('supabase') && k.includes('auth-token')) {
              tokenKey = k; break;
            }
          }
          if (!tokenKey) {
            // Fallback key pattern used by Supabase JS client v2
            if ("${targetUrl}".includes('thamizhan.vercel.app')) {
              tokenKey = 'sb-jjgdatjthyeesmgunnlp-auth-token';
            } else {
              tokenKey = 'sb-gmahjdzqitbomtmdzlfp-auth-token';
            }
          }
          var existing = localStorage.getItem(tokenKey);
          if (!existing) {
            localStorage.setItem(tokenKey, JSON.stringify({
              access_token: "${accessToken}",
              user: {
                id: "${user?.id}",
                phone: "${userPhone}",
                name: "${userName}",
                user_metadata: { role: "${userRole}", is_admin: ${isAdmin} }
              }
            }));
          }
          
          // Also simulate the iframe postMessage that the web app uses!
          // This tells the aishlee-web app (which listens for message events) to sync immediately.
          setTimeout(function() {
            window.postMessage({
              type: 'SUPRO_AUTH_INJECT',
              access_token: "${accessToken}",
              refresh_token: "${refreshToken}",
              supabaseKey: tokenKey,
              user: { id: "${user?.id}", phone: "${userPhone}", email: "${user?.email}" }
            }, "*");
            
            // If we are currently on the login page, the token injection was successful but Next.js middleware 
            // already redirected us here. Redirect back to the intended module path!
            if (window.location.pathname === '/login' || window.location.pathname.startsWith('/login')) {
              window.location.href = "${path}?embed=true";
            }
          }, 500);
        }

        // Expose native user info to the web app
        window.__NATIVE_USER__ = {
          phone: "${userPhone}",
          name: "${userName}",
          role: "${userRole}",
          isAdmin: ${isAdmin},
          isNative: true
        };

        // If web tries to redirect to /login, intercept and tell native
        var _push = history.pushState;
        history.pushState = function(state, title, url) {
          if (url && (url === '/login' || url.startsWith('/login?'))) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'AUTH_REQUIRED', url: url
            }));
            return;
          }
          return _push.apply(history, arguments);
        };

        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY', module: '${moduleName}' }));
      } catch(e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', error: e.message }));
      }
    })();
    true;
  `;

  const handleMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'AUTH_REQUIRED') {
        // Web module requires login — go back to native login
        navigation.replace('Login');
      }
    } catch (_) {}
  }, [navigation]);

  const handleReload = () => webViewRef.current?.reload();
  const handleBack   = () => {
    if (webViewRef.current) webViewRef.current.goBack();
    else navigation.goBack();
  };

  const MODULE_COLORS: Record<string, string> = {
    TvO:    '#ec4899',
    TestO:  '#8b5cf6',
    TeachO: '#f59e0b',
    MoneyO: '#14b8a6',
    CRM:    '#ef4444',
    Admin:  '#ef4444',
    DealO:  '#f97316',
    TourO:  '#06b6d4',
    RideO:  '#10b981',
    GameO:  '#8b5cf6',
  };
  const accentColor = MODULE_COLORS[moduleName] ?? '#34d399';
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safe, { borderTopColor: accentColor }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />

      {/* Slim native top bar */}
      <View style={[styles.topBar, { 
        borderBottomColor: accentColor + '30',
        paddingTop: Platform.OS === 'android' ? insets.top + 10 : insets.top || 10
      }]}>
        <TouchableOpacity style={styles.topBtn} onPress={handleBack}>
          <ArrowLeft color="#94a3b8" size={18} />
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <View style={[styles.dot, { backgroundColor: accentColor }]} />
          <Text style={[styles.topTitle, { color: accentColor }]}>{moduleName}</Text>
        </View>

        <TouchableOpacity style={styles.topBtn} onPress={handleReload}>
          <RefreshCw color="#94a3b8" size={16} />
        </TouchableOpacity>
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: targetUrl }}
        injectedJavaScript={INJECTED_JS}
        injectedJavaScriptBeforeContentLoaded={INJECTED_JS}
        onMessage={handleMessage}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={[styles.loadingText, { color: accentColor }]}>
              Loading {moduleName}...
            </Text>
          </View>
        )}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        // Pass user agent so Next.js middleware can detect native app
        applicationNameForUserAgent="SuprO-Native/1.0"
        onNavigationStateChange={(navState) => {
          // If webview navigates to the web login page, intercept
          if (navState.url?.includes('/login') && navState.url?.includes(BASE_URL)) {
            navigation.replace('Login');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0a0f1e',
    borderTopWidth: 2,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: '#0d1526',
    borderBottomWidth: 1,
  },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loader: {
    position: 'absolute',
    inset: 0,
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0f1e',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
