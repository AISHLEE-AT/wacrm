import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../features/push/push_service.dart';

// Represents the resolved user role
enum UserRole { guest, admin, driver, rider }

class AuthState {
  final bool isLoading;
  final UserRole role;
  final firebase.User? firebaseUser;
  final User? supabaseUser;
  final String? errorMessage;
  final String? defaultModule;

  AuthState({
    this.isLoading = true,
    this.role = UserRole.guest,
    this.firebaseUser,
    this.supabaseUser,
    this.errorMessage,
    this.defaultModule,
  });

  AuthState copyWith({
    bool? isLoading,
    UserRole? role,
    firebase.User? firebaseUser,
    User? supabaseUser,
    String? errorMessage,
    String? defaultModule,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      role: role ?? this.role,
      firebaseUser: firebaseUser ?? this.firebaseUser,
      supabaseUser: supabaseUser ?? this.supabaseUser,
      errorMessage: errorMessage ?? this.errorMessage,
      defaultModule: defaultModule ?? this.defaultModule,
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
        state = state.copyWith(isLoading: true, firebaseUser: user, errorMessage: null);
        try {
          await exchangeFirebaseForSupabase();
          await _resolveRole(user.phoneNumber);
        } catch (e) {
          debugPrint('Auth initialization error: $e');
          state = AuthState(isLoading: false, role: UserRole.guest, errorMessage: e.toString());
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
      final user = _supabase.auth.currentUser;
      String? defaultModule;
      if (user != null) {
        try {
          final profileData = await _supabase
              .from('profiles')
              .select('default_module')
              .eq('user_id', user.id)
              .maybeSingle();
          defaultModule = profileData?['default_module'];
        } catch (e) {
          debugPrint('Could not fetch profile default_module: $e');
        }
      }

      // 1. Check Admin
      if (phoneNumber.contains('9486335870')) {
        state = state.copyWith(isLoading: false, role: UserRole.admin, supabaseUser: user, defaultModule: defaultModule);
        return;
      }

      // 2. Check Driver
      final driverCheck = await _supabase
          .from('drivers')
          .select('id')
          .eq('mobile_number', phoneNumber.replaceAll('+91', ''))
          .maybeSingle();

      if (driverCheck != null) {
        state = state.copyWith(isLoading: false, role: UserRole.driver, supabaseUser: user, defaultModule: defaultModule);
        return;
      }

      // 3. Fallback to Rider
      state = state.copyWith(isLoading: false, role: UserRole.rider, supabaseUser: user, defaultModule: defaultModule);
    } catch (e) {
      debugPrint('Role resolution error: $e');
      state = state.copyWith(isLoading: false, role: UserRole.guest, errorMessage: e.toString());
    } finally {
      // Initialize Push Notifications if logged in
      if (state.role != UserRole.guest) {
        PushService.init();
      }
    }
  }

  Future<void> exchangeFirebaseForSupabase() async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('Firebase user is null');

    final idToken = await user.getIdToken();
    if (idToken == null) throw Exception('Firebase idToken is null');

    final response = await http.post(
      Uri.parse(_bridgeUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'firebaseToken': idToken}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['access_token'] != null && data['refresh_token'] != null) {
        final sessionJson = jsonEncode({
          'access_token': data['access_token'],
          'refresh_token': data['refresh_token'],
          'expires_in': 3600,
          'token_type': 'bearer',
          'user': data['user']
        });
        await _supabase.auth.recoverSession(sessionJson);
        return;
      } else {
        throw Exception('Bridge response missing tokens: ${response.body}');
      }
    } else {
      throw Exception('Bridge API failed (${response.statusCode}): ${response.body}');
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
    try {
      await _auth.signOut();
    } catch (e) {
      debugPrint('Firebase sign out error: $e');
    }
    try {
      await _supabase.auth.signOut();
    } catch (e) {
      debugPrint('Supabase sign out error: $e');
    }
    // Force state update so router catches it even if network fails
    state = AuthState(isLoading: false, role: UserRole.guest);
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
