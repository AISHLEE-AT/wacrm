import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

// Represents the resolved user role
enum UserRole { guest, admin, driver, rider }

class AuthState {
  final bool isLoading;
  final UserRole role;
  final firebase.User? firebaseUser;
  final User? supabaseUser;

  AuthState({
    this.isLoading = true,
    this.role = UserRole.guest,
    this.firebaseUser,
    this.supabaseUser,
  });

  AuthState copyWith({
    bool? isLoading,
    UserRole? role,
    firebase.User? firebaseUser,
    User? supabaseUser,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      role: role ?? this.role,
      firebaseUser: firebaseUser ?? this.firebaseUser,
      supabaseUser: supabaseUser ?? this.supabaseUser,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  final firebase.FirebaseAuth _auth = firebase.FirebaseAuth.instance;
  final SupabaseClient _supabase = Supabase.instance.client;
  
  // Dynamic bridge URL from environment, fallback to production
  String get _bridgeUrl => 
      dotenv.env['FIREBASE_BRIDGE_URL'] ?? 'https://watscrm.vercel.app/api/auth/firebase-bridge';

  @override
  AuthState build() {
    _init();
    return AuthState();
  }

  void _init() {
    _auth.authStateChanges().listen((user) async {
      if (user == null) {
        state = AuthState(isLoading: false, role: UserRole.guest);
      } else {
        state = state.copyWith(isLoading: true, firebaseUser: user);
        bool exchanged = await exchangeFirebaseForSupabase();
        if (exchanged) {
          await _resolveRole(user.phoneNumber);
        } else {
          state = AuthState(isLoading: false, role: UserRole.guest);
        }
      }
    });
  }

  Future<void> _resolveRole(String? phoneNumber) async {
    if (phoneNumber == null) {
      state = state.copyWith(isLoading: false, role: UserRole.guest);
      return;
    }

    try {
      // 1. Check Admin
      // Admin phones on mobile default to rider (admin features are web-only)
      // No admin role assignment on mobile

      // 2. Check Driver
      final driverCheck = await _supabase
          .from('drivers')
          .select('id')
          .eq('phone', phoneNumber.replaceAll('+91', ''))
          .maybeSingle();

      if (driverCheck != null) {
        state = state.copyWith(isLoading: false, role: UserRole.driver, supabaseUser: _supabase.auth.currentUser);
        return;
      }

      // 3. Fallback to Rider
      state = state.copyWith(isLoading: false, role: UserRole.rider, supabaseUser: _supabase.auth.currentUser);
    } catch (e) {
      debugPrint('Role resolution error: $e');
      state = state.copyWith(isLoading: false, role: UserRole.rider, supabaseUser: _supabase.auth.currentUser);
    }
  }

  Future<bool> exchangeFirebaseForSupabase() async {
    try {
      final user = _auth.currentUser;
      if (user == null) return false;

      final idToken = await user.getIdToken();
      if (idToken == null) return false;

      final response = await http.post(
        Uri.parse(_bridgeUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'firebaseToken': idToken}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['access_token'] != null && data['refresh_token'] != null) {
          await _supabase.auth.setSession(data['access_token']);
          return true;
        }
      }
      return false;
    } catch (e) {
      debugPrint('Firebase→Supabase bridge error: $e');
      return false;
    }
  }

  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String verificationId, int? resendToken) codeSent,
    required Function(firebase.FirebaseAuthException e) verificationFailed,
  }) async {
    await _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: (firebase.PhoneAuthCredential credential) async {
        await _auth.signInWithCredential(credential);
      },
      verificationFailed: verificationFailed,
      codeSent: codeSent,
      codeAutoRetrievalTimeout: (String verificationId) {},
    );
  }

  Future<void> verifyOTP({
    required String verificationId,
    required String smsCode,
  }) async {
    firebase.PhoneAuthCredential credential = firebase.PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode,
    );
    await _auth.signInWithCredential(credential);
  }

  Future<void> signOut() async {
    await _auth.signOut();
    await _supabase.auth.signOut();
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
