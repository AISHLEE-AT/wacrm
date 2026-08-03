import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Smartphone, Lock, ShieldCheck, MessageCircle, KeyRound, UserCheck, Eye, EyeOff, Sparkles } from 'lucide-react-native';
import { API } from '../utils/api';

const CATEGORIES = [
  { key: 'Admin',      label: '👑 Admin (CRM & All Modules)' },
  { key: 'Traveller',  label: '🧳 Traveller (RideO)' },
  { key: 'Farmer',    label: '🚜 Farmer (RentO Agri)' },
  { key: 'Shopper',   label: '🛍️ Shopper (DealO)' },
  { key: 'Driver',    label: '🚖 Driver (DriveO)' },
  { key: 'Student',   label: '🎓 Student (TeachO)' },
  { key: 'Teacher',   label: '👨‍🏫 Teacher (TeachO)' },
  { key: 'Financier', label: '💰 Financier (MoneyO)' },
  { key: 'Tourist',   label: '🛕 Tourist (TourO)' },
];

export default function LoginScreen({ navigation }: any) {
  const [step, setStep] = useState<'phone' | 'otp' | 'set-pin' | 'pin'>('phone');
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState('Traveller');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [wabaPhone, setWabaPhone] = useState('916381029380');

  useEffect(() => {
    checkBiometrics();
    fetchWaba();
  }, []);

  const fetchWaba = async () => {
    const waba = await API.getWabaPhone();
    setWabaPhone(waba);
  };

  const checkBiometrics = async () => {
    const savedToken = await SecureStore.getItemAsync('sb-access-token');
    const savedPhone = await SecureStore.getItemAsync('user-phone');
    
    if (savedToken && savedPhone) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Login to SuprO',
          fallbackLabel: 'Use PIN',
        });
        
        if (result.success) {
          navigation.replace('Dashboard');
        }
      }
    }
  };

  const handlePhoneChange = async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setPhone(clean);
    setError(null);
    setIsExistingUser(null);

    if (clean.length === 10) {
      setIsChecking(true);
      try {
        const data = await API.checkUser(clean);
        setIsExistingUser(data.exists);
        if (data.exists) {
          if (data.name) setFullName(data.name);
          if (data.category) setCategory(data.category);
          if (data.role) await SecureStore.setItemAsync('user-role', data.role);
          if (data.gemini_api_key) await SecureStore.setItemAsync('gemini-api-key', data.gemini_api_key);
        }
        
        if (clean === '9486335870') {
          // Hardcode admin role for 9486335870
          setCategory('Admin');
          await SecureStore.setItemAsync('user-role', 'admin');
        }
      } catch (err) {
        setIsExistingUser(false);
      } finally {
        setIsChecking(false);
      }
    }
  };

  const requestOtp = () => {
    if (phone.length !== 10) { 
      setError("Please enter a valid 10-digit mobile number"); 
      return; 
    }
    setError(null);
    setStep('otp');
    
    Linking.openURL(`whatsapp://send?phone=${wabaPhone}&text=Requesting OTP for Login`).catch(() => {
      Linking.openURL(`https://wa.me/${wabaPhone}?text=Requesting OTP for Login`);
    });
  };

  const handleOtpVerify = async () => {
    setError(null);
    if (phone.length !== 10) { setError("Please enter a valid 10-digit mobile number"); return; }
    if (otp.length !== 6) { setError("Please enter the 6-digit OTP"); return; }
    
    setLoading(true);
    try {
      const data = await API.verifyOtp(
        phone, 
        otp, 
        isExistingUser ? undefined : fullName, 
        isExistingUser ? undefined : category
      );
      
      await SecureStore.setItemAsync('sb-access-token', data.session.access_token);
      await SecureStore.setItemAsync('user-phone', phone);
      
      if (data.needs_pin_setup) {
        setStep('set-pin');
      } else {
        navigation.replace('Category');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPin = async () => {
    setError(null);
    if (newPin.length !== 4) { setError("PIN must be exactly 4 digits"); return; }
    if (newPin !== confirmPin) { setError("PINs do not match"); return; }

    setLoading(true);
    try {
      await API.setPin(phone, newPin, confirmPin);
      navigation.replace('Category');
    } catch (err: any) {
      setError(err.message || 'Failed to save PIN');
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async () => {
    setError(null);
    if (phone.length !== 10) { setError("Please enter a valid 10-digit mobile number"); return; }
    if (pin.length !== 4) { setError("Please enter your 4-digit PIN"); return; }

    setLoading(true);
    try {
      const data = await API.loginWithPin(phone, pin);
      await SecureStore.setItemAsync('sb-access-token', data.session.access_token);
      await SecureStore.setItemAsync('user-phone', phone);
      navigation.replace('Category');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SuprO</Text>
          <View style={styles.subtitleRow}>
            <Sparkles color="#fbbf24" size={14} />
            <Text style={styles.subtitle}>for Local Needs</Text>
          </View>
          <Text style={styles.stepText}>
            {step === 'set-pin' ? '🔐 Set Your 4-Digit Secret PIN' : 'Secure Authentication via WhatsApp'}
          </Text>
        </View>

        <View style={styles.card}>
          {/* STEP: PHONE */}
          {step === 'phone' && (
            <View style={styles.stepContainer}>
              <Text style={styles.label}>MOBILE NUMBER</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputLeftIcon}>
                  <Smartphone color="#34d399" size={20} />
                  <Text style={styles.countryCode}>+91</Text>
                  <View style={styles.divider} />
                </View>
                <TextInput
                  style={[styles.input, { paddingLeft: 95 }]}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                  maxLength={10}
                  value={phone}
                  onChangeText={handlePhoneChange}
                />
              </View>

              {/* Dynamic New User Form */}
              {phone.length === 10 && isExistingUser === false && !isChecking && (
                <View style={styles.dynamicForm}>
                  <Text style={styles.label}>FULL NAME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your Full Name"
                    placeholderTextColor="#475569"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                  <Text style={[styles.label, { marginTop: 12 }]}>PRIMARY ROLE</Text>
                  {/* Since native select is complex, we map a simple list of buttons for demo, or just use a text input/button list */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {CATEGORIES.map(c => (
                      <TouchableOpacity 
                        key={c.key} 
                        style={[styles.categoryBtn, category === c.key && styles.categoryBtnActive]}
                        onPress={() => setCategory(c.key)}
                      >
                        <Text style={[styles.categoryBtnText, category === c.key && styles.categoryBtnTextActive]}>
                          {c.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Dynamic Existing User Welcome */}
              {phone.length === 10 && isExistingUser === true && !isChecking && (
                <View style={styles.welcomeBackCard}>
                  <UserCheck color="#34d399" size={24} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.welcomeText}>WELCOME BACK</Text>
                    <Text style={styles.welcomeName}>{fullName}</Text>
                    <Text style={styles.welcomeRole}>{CATEGORIES.find(c => c.key === category)?.label || category}</Text>
                  </View>
                </View>
              )}

              {phone.length === 10 && isChecking && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#34d399" size="small" />
                  <Text style={styles.loadingText}>Checking profile...</Text>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.primaryButton, (phone.length !== 10 || isChecking) && styles.disabledButton]} 
                onPress={requestOtp}
                disabled={phone.length !== 10 || isChecking}
              >
                {isChecking ? <ActivityIndicator color="#fff" /> : <MessageCircle color="#fff" size={20} />}
                <Text style={styles.primaryButtonText}>Send OTP via WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.secondaryButton, phone.length !== 10 && styles.disabledButton]} 
                onPress={() => { setError(null); setStep('pin'); }}
                disabled={phone.length !== 10}
              >
                <KeyRound color="#34d399" size={16} />
                <Text style={styles.secondaryButtonText}>Use Fallback PIN Instead</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP: OTP */}
          {step === 'otp' && (
            <View style={styles.stepContainer}>
              <Text style={styles.label}>6-DIGIT WHATSAPP OTP</Text>
              <View style={styles.inputContainer}>
                <View style={[styles.inputLeftIcon, { width: 50 }]}>
                  <Lock color="#34d399" size={20} />
                </View>
                <TextInput
                  style={[styles.input, { paddingLeft: 50, fontSize: 24, letterSpacing: 8, fontWeight: 'bold' }]}
                  placeholder="••••••"
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>
              <Text style={styles.hint}>We opened WhatsApp for you. Hit send and we'll reply with your OTP.</Text>

              <TouchableOpacity 
                style={[styles.primaryButton, (loading || otp.length !== 6) && styles.disabledButton]} 
                onPress={handleOtpVerify}
                disabled={loading || otp.length !== 6}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <ShieldCheck color="#fff" size={20} />}
                <Text style={styles.primaryButtonText}>Verify OTP & Continue</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backButton} onPress={() => setStep('phone')}>
                <Text style={styles.backButtonText}>← Go back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP: SET PIN */}
          {step === 'set-pin' && (
            <View style={styles.stepContainer}>
              <View style={styles.warningCard}>
                <Text style={styles.warningTitle}>🔐 One Last Step!</Text>
                <Text style={styles.warningText}>Set a 4-digit PIN for quick future logins when WhatsApp OTP is unavailable.</Text>
              </View>

              <Text style={styles.label}>NEW 4-DIGIT PIN</Text>
              <View style={styles.inputContainer}>
                <View style={[styles.inputLeftIcon, { width: 50 }]}>
                  <KeyRound color="#fbbf24" size={20} />
                </View>
                <TextInput
                  style={[styles.input, { paddingLeft: 50, fontSize: 24, letterSpacing: 8, fontWeight: 'bold' }]}
                  placeholder="••••"
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                  secureTextEntry={!showPin}
                  maxLength={4}
                  value={newPin}
                  onChangeText={setNewPin}
                />
              </View>

              <Text style={[styles.label, { marginTop: 12 }]}>CONFIRM PIN</Text>
              <View style={styles.inputContainer}>
                <View style={[styles.inputLeftIcon, { width: 50 }]}>
                  <KeyRound color="#fbbf24" size={20} />
                </View>
                <TextInput
                  style={[styles.input, { paddingLeft: 50, fontSize: 24, letterSpacing: 8, fontWeight: 'bold' },
                    confirmPin.length === 4 && (confirmPin === newPin ? { borderColor: '#34d399', borderWidth: 1 } : { borderColor: '#ef4444', borderWidth: 1 })
                  ]}
                  placeholder="••••"
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                  secureTextEntry={!showPin}
                  maxLength={4}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPin(!showPin)}>
                  {showPin ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: '#f59e0b' }, (loading || newPin.length !== 4 || newPin !== confirmPin) && styles.disabledButton]} 
                onPress={handleSetPin}
                disabled={loading || newPin.length !== 4 || newPin !== confirmPin}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <ShieldCheck color="#fff" size={20} />}
                <Text style={styles.primaryButtonText}>Save PIN & Enter App</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP: PIN FALLBACK */}
          {step === 'pin' && (
            <View style={styles.stepContainer}>
              <Text style={styles.label}>4-DIGIT SECURE PIN</Text>
              <View style={styles.inputContainer}>
                <View style={[styles.inputLeftIcon, { width: 50 }]}>
                  <Lock color="#fbbf24" size={20} />
                </View>
                <TextInput
                  style={[styles.input, { paddingLeft: 50, fontSize: 24, letterSpacing: 8, fontWeight: 'bold' }]}
                  placeholder="••••"
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                  secureTextEntry={true}
                  maxLength={4}
                  value={pin}
                  onChangeText={setPin}
                />
              </View>
              <Text style={styles.hint}>Use your PIN set during registration. If you forgot it, login via WhatsApp OTP.</Text>

              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: '#f59e0b' }, (loading || pin.length !== 4) && styles.disabledButton]} 
                onPress={handlePinLogin}
                disabled={loading || pin.length !== 4}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <ShieldCheck color="#fff" size={20} />}
                <Text style={styles.primaryButtonText}>Sign In with PIN</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backButton} onPress={() => { setError(null); setStep('phone'); }}>
                <Text style={styles.backButtonText}>← Go back</Text>
              </TouchableOpacity>
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Authentication verified by SuprO Engine</Text>
            <Text style={styles.footerTamil}>வாழ்க • வளர்க • வெல்க 🌿</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 36, fontWeight: '900', color: '#34d399', letterSpacing: 1 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 12 },
  subtitle: { color: '#34d399', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' },
  stepText: { color: '#94a3b8', fontSize: 14 },
  card: { backgroundColor: '#111827', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(52, 211, 153, 0.2)' },
  stepContainer: { gap: 16 },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  inputContainer: { position: 'relative', justifyContent: 'center' },
  inputLeftIcon: { position: 'absolute', left: 16, zIndex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  countryCode: { color: '#34d399', fontWeight: 'bold', fontSize: 14 },
  divider: { width: 1, height: 16, backgroundColor: 'rgba(52,211,153,0.3)' },
  input: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)', borderRadius: 12, color: '#fff', padding: 16, fontSize: 16 },
  dynamicForm: { marginTop: 12, gap: 12 },
  categoryScroll: { flexDirection: 'row', marginTop: 8 },
  categoryBtn: { backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  categoryBtnActive: { backgroundColor: 'rgba(52,211,153,0.2)', borderColor: '#34d399' },
  categoryBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: 'bold' },
  categoryBtnTextActive: { color: '#34d399' },
  welcomeBackCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(52,211,153,0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)' },
  welcomeText: { color: '#34d399', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  welcomeName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginVertical: 2 },
  welcomeRole: { color: '#94a3b8', fontSize: 12 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  loadingText: { color: '#34d399', fontSize: 14 },
  hint: { color: '#64748b', fontSize: 12, marginTop: -8 },
  primaryButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#0f172a', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)' },
  secondaryButtonText: { color: '#34d399', fontSize: 14, fontWeight: 'bold' },
  disabledButton: { opacity: 0.5 },
  backButton: { padding: 16, alignItems: 'center' },
  backButtonText: { color: '#94a3b8', fontSize: 14 },
  eyeIcon: { position: 'absolute', right: 16, zIndex: 1 },
  warningCard: { backgroundColor: 'rgba(245,158,11,0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', alignItems: 'center' },
  warningTitle: { color: '#fbbf24', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  warningText: { color: '#94a3b8', fontSize: 12, textAlign: 'center' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', marginTop: 16 },
  errorText: { color: '#f87171', fontSize: 12, textAlign: 'center' },
  footer: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(52,211,153,0.1)', alignItems: 'center' },
  footerText: { color: '#64748b', fontSize: 12 },
  footerTamil: { color: '#475569', fontSize: 12, marginTop: 4 }
});
