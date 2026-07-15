import 'package:firebase_auth/firebase_auth.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter/material.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  static const String _bridgeUrl =
      'https://watscrm.vercel.app/api/auth/firebase-bridge';

  // Step 1: Send OTP to phone
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String verificationId, int? resendToken) codeSent,
    required Function(FirebaseAuthException e) verificationFailed,
  }) async {
    await _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: (PhoneAuthCredential credential) async {
        await _auth.signInWithCredential(credential);
        await exchangeFirebaseForSupabase();
      },
      verificationFailed: verificationFailed,
      codeSent: codeSent,
      codeAutoRetrievalTimeout: (String verificationId) {},
    );
  }

  // Step 2: Verify OTP
  Future<UserCredential> verifyOTP({
    required String verificationId,
    required String smsCode,
  }) async {
    PhoneAuthCredential credential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode,
    );
    final userCredential = await _auth.signInWithCredential(credential);

    // Exchange Firebase token for Supabase session
    await exchangeFirebaseForSupabase();

    return userCredential;
  }

  // Step 3: Exchange Firebase token for Supabase session
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
          await Supabase.instance.client.auth.setSession(
            data['access_token'],
          );
          debugPrint('Supabase session set successfully');
          return true;
        }
      }
      debugPrint('Bridge response: ${response.statusCode} ${response.body}');
      return false;
    } catch (e) {
      debugPrint('Firebase→Supabase bridge error: $e');
      return false;
    }
  }

  // Sign out from both Firebase and Supabase
  Future<void> signOut() async {
    await _auth.signOut();
    await Supabase.instance.client.auth.signOut();
  }
}
