import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '../providers/auth';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const redirectTo = makeRedirectUri();

  const createSessionFromUrl = async (url: string) => {
    const { params, errorCode } = QueryParams.getQueryParams(url);
    if (errorCode) throw new Error(errorCode);
    const { access_token, refresh_token } = params;

    if (!access_token) return;

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token: refresh_token || '',
    });
    if (error) throw error;
    return data.session;
  };

  const { session: currentSession, accountRole, loading: authLoading } = useAuth();

  useEffect(() => {
    // Only redirect if we have a session AND auth is done loading
    if (currentSession && !authLoading) {
      if (accountRole === 'admin' || accountRole === 'owner') {
        router.replace('/(tabs)');
      } else {
        // Fallback for 'user', 'viewer', 'agent', or null (if profile row isn't created yet)
        router.replace('/(tabs)');
      }
    }
  }, [currentSession, accountRole, authLoading]);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      createSessionFromUrl(event.url).catch(console.error);
    });
    Linking.getInitialURL().then((url) => {
      if (url) createSessionFromUrl(url).catch(console.error);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const performOAuth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (data?.url) {
        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (res.type === 'success') {
          await createSessionFromUrl(res.url);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/images/logo-title.png')} 
          style={styles.logo}
        />
        
        <Text style={styles.title}>Welcome to TradO</Text>
        <Text style={styles.subtitle}>
          Read our Privacy Policy. Tap "Agree and continue" to accept the Terms of Service.
        </Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={performOAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Agree and Continue with Google</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 40,
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 250,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: '#000',
    marginBottom: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#5e5e5e',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#00A884',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
