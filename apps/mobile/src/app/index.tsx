import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
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
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [fallbackOtp, setFallbackOtp] = useState<string | null>(null);
  const router = useRouter();

  // Helper to determine API Base URL
  const getApiBaseUrl = () => {
    // If running in Expo Go or local simulator, use network IP or localhost 
    // depending on the setup. For a robust setup, process.env.EXPO_PUBLIC_API_URL is preferred.
    return process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('localhost') 
      ? 'http://10.29.166.142:3000' // using local network IP as seen in Next.js logs
      : 'https://watscrm.vercel.app';
  };

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

  const requestOTP = async () => {
    if (!phone || phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      const fullPhone = `+91${phone}`;
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/whatsapp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setOtpRequested(true);
      if (data.fallbackOtp) {
        setFallbackOtp(data.fallbackOtp);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await AsyncStorage.setItem('intendedDestination', selectedApp);
      const fullPhone = `+91${phone}`;
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/whatsapp/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
      
      // We got the session tokens directly from the server!
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error verifying OTP');
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

        {!otpRequested ? (
          <View style={styles.authContainer}>
            <Text style={styles.authLabel}>Login with WhatsApp</Text>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.phonePrefix}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="9876543210"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => setPhone(text.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
              />
            </View>
            <TouchableOpacity 
              style={styles.button}
              onPress={requestOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Get OTP via WhatsApp</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={[styles.button, styles.googleButton]}
              onPress={performOAuth}
              disabled={loading}
            >
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.authContainer}>
            <Text style={styles.authLabel}>Enter Code</Text>
            {fallbackOtp ? (
              <View style={styles.fallbackContainer}>
                <Text style={styles.fallbackTitle}>Testing Mode</Text>
                <Text style={styles.fallbackText}>Since WhatsApp delivery is disabled, use this code:</Text>
                <View style={styles.fallbackCodeBox}>
                  <Text style={styles.fallbackCode}>{fallbackOtp}</Text>
                </View>
              </View>
            ) : null}
            <TextInput
              style={[styles.input, { textAlign: 'center', letterSpacing: 8, fontSize: 20, fontWeight: 'bold' }]}
              placeholder="ABC123"
              placeholderTextColor="#9ca3af"
              keyboardType="default"
              autoCapitalize="characters"
              value={otp}
              onChangeText={(text) => setOtp(text.toUpperCase())}
              maxLength={6}
            />
            <TouchableOpacity 
              style={styles.button}
              onPress={verifyOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify & Continue</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setOtpRequested(false)}
            >
              <Text style={styles.backButtonText}>Change Phone Number</Text>
            </TouchableOpacity>
          </View>
        )}
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
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 0,
    shadowOpacity: 0,
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  authContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  authLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 26,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 26,
    paddingHorizontal: 20,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  phonePrefix: {
    fontSize: 16,
    color: '#6b7280',
    marginRight: 8,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1f2937',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    marginTop: 16,
  },
  backButtonText: {
    color: '#00A884',
    fontSize: 14,
    fontWeight: '600',
  },
  fallbackContainer: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  fallbackTitle: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  fallbackText: {
    color: '#10b981',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  fallbackCodeBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  fallbackCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    letterSpacing: 4,
  },
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
