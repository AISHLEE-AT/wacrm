import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Search, ClipboardList, Car } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '../providers/auth';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState('/(tabs)');
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
      AsyncStorage.getItem('intendedDestination').then((dest) => {
        const targetRoute = dest || '/(tabs)';
        AsyncStorage.removeItem('intendedDestination').catch(() => {});
        
        if (accountRole === 'admin' || accountRole === 'owner') {
          router.replace(targetRoute as any);
        } else {
          router.replace(targetRoute as any);
        }
      });
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
      await AsyncStorage.setItem('intendedDestination', selectedApp);
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

        <View style={styles.selectionContainer}>
          <Text style={styles.selectionLabel}>Where to?</Text>
          <View style={styles.grid}>
            <TouchableOpacity 
              style={[styles.card, selectedApp === '/(tabs)' && styles.cardActive]}
              onPress={() => setSelectedApp('/(tabs)')}
            >
              <Search color={selectedApp === '/(tabs)' ? '#00A884' : '#64748b'} size={24} />
              <Text style={[styles.cardText, selectedApp === '/(tabs)' && styles.cardTextActive]}>Super App</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.card, selectedApp === '/(tabs)/transo' && styles.cardActive]}
              onPress={() => setSelectedApp('/(tabs)/transo')}
            >
              <Car color={selectedApp === '/(tabs)/transo' ? '#00A884' : '#64748b'} size={24} />
              <Text style={[styles.cardText, selectedApp === '/(tabs)/transo' && styles.cardTextActive]}>TransO</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.card, selectedApp === '/(tabs)/trado' && styles.cardActive]}
              onPress={() => setSelectedApp('/(tabs)/trado')}
            >
              <ClipboardList color={selectedApp === '/(tabs)/trado' ? '#00A884' : '#64748b'} size={24} />
              <Text style={[styles.cardText, selectedApp === '/(tabs)/trado' && styles.cardTextActive]}>TradO</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.card, selectedApp === '/(tabs)/drivo' && styles.cardActiveDrivo]}
              onPress={() => setSelectedApp('/(tabs)/drivo')}
            >
              <Car color={selectedApp === '/(tabs)/drivo' ? '#f97316' : '#64748b'} size={24} />
              <Text style={[styles.cardText, selectedApp === '/(tabs)/drivo' && styles.cardTextActiveDrivo]}>DrivO</Text>
            </TouchableOpacity>
          </View>
        </View>

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
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  selectionContainer: {
    width: '100%',
    marginBottom: 30,
  },
  selectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    textAlign: 'left',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardActive: {
    borderColor: '#00A884',
    backgroundColor: '#ecfdf5',
  },
  cardActiveDrivo: {
    borderColor: '#f97316',
    backgroundColor: '#fff7ed',
  },
  cardText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  cardTextActive: {
    color: '#00A884',
  },
  cardTextActiveDrivo: {
    color: '#f97316',
  },
});
