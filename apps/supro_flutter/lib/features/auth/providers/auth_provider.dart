import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'dart:async';

import '../../../core/env.dart';

// ─── OCI User Model ──────────────────────────────────────────────────────────
class OciUser {
  final String id;
  final String phone;
  final String role;
  final String category;
  final Map<String, dynamic> userMetadata;

  OciUser({
    required this.id,
    required this.phone,
    required this.role,
    required this.category,
    Map<String, dynamic>? userMetadata,
  }) : userMetadata = userMetadata ?? {'role': role, 'category': category};
}

// ─── OCI Auth State ──────────────────────────────────────────────────────────
class OciAuthState {
  final bool isLoggedIn;
  final String? token;
  final OciUser? user;

  const OciAuthState({
    this.isLoggedIn = false,
    this.token,
    this.user,
  });

  String? get phone => user?.phone;

  OciAuthState copyWith({
    bool? isLoggedIn,
    String? token,
    OciUser? user,
  }) => OciAuthState(
    isLoggedIn: isLoggedIn ?? this.isLoggedIn,
    token: token ?? this.token,
    user: user ?? this.user,
  );
}

// ─── Auth State Notifier (Riverpod 3 Notifier) ────────────────────────────────
class OciAuthNotifier extends Notifier<OciAuthState> {
  @override
  OciAuthState build() {
    _loadFromPrefs();
    return const OciAuthState();
  }

  Future<void> _loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('oci_auth_token');
    final phone = prefs.getString('user_phone');
    final userId = prefs.getString('user_id') ?? 'user_$phone';
    final role = prefs.getString('user_role') ?? 'user';
    final category = prefs.getString('user_category') ?? 'Traveller';

    if (token != null && phone != null) {
      state = OciAuthState(
        isLoggedIn: true,
        token: token,
        user: OciUser(
          id: userId,
          phone: phone,
          role: role,
          category: category,
        ),
      );
    }
  }

  Future<void> setLoggedIn({
    required String token,
    required String phone,
    String? userId,
    String? role,
    String? category,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('oci_auth_token', token);
    await prefs.setString('user_phone', phone);
    if (userId != null) await prefs.setString('user_id', userId);
    if (role != null) await prefs.setString('user_role', role);
    if (category != null) await prefs.setString('user_category', category);

    final resolvedId = userId ?? 'user_$phone';
    final resolvedRole = role ?? 'user';
    final resolvedCat = category ?? 'Traveller';

    state = OciAuthState(
      isLoggedIn: true,
      token: token,
      user: OciUser(
        id: resolvedId,
        phone: phone,
        role: resolvedRole,
        category: resolvedCat,
      ),
    );
  }

  Future<void> signOut() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('oci_auth_token');
    await prefs.remove('user_id');
    await prefs.remove('user_role');
    await prefs.remove('user_category');

    state = const OciAuthState();
  }
}

final ociAuthStateProvider = NotifierProvider<OciAuthNotifier, OciAuthState>(() {
  return OciAuthNotifier();
});

// ─── Backward-compatible Providers ──────────────────────────────────────────
final currentUserProvider = Provider<OciUser?>((ref) {
  return ref.watch(ociAuthStateProvider).user;
});

final isLoggedInProvider = Provider<bool>((ref) {
  return ref.watch(ociAuthStateProvider).isLoggedIn;
});

final currentUserPhoneProvider = Provider<String?>((ref) {
  return ref.watch(ociAuthStateProvider).phone;
});

// ─── Auth Controller (API calls) ────────────────────────────────────────────
class AuthController extends AsyncNotifier<void> {
  final String _apiUrl = '${AppEnv.apiUrl}/api';

  @override
  FutureOr<void> build() {}

  Future<Map<String, dynamic>> checkUser(String phone) async {
    state = const AsyncValue.loading();
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '').replaceAll(' ', '');
    final clean10 = cleanPhone.length >= 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;

    try {
      final response = await http.get(
        Uri.parse('$_apiUrl/auth/check?phone=$clean10'),
      ).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        state = const AsyncValue.data(null);
        return data;
      } else {
        state = const AsyncValue.data(null);
        return {
          'exists': false,
          'category': 'Traveller',
          'role': 'user',
          'has_pin': false,
        };
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return {
        'exists': false,
        'category': 'Traveller',
        'role': 'user',
        'has_pin': false,
      };
    }
  }

  Future<Map<String, dynamic>> verifyOtp({
    required String phone,
    required String otp,
    String? fullName,
    String? category,
  }) async {
    state = const AsyncValue.loading();
    try {
      final response = await http.post(
        Uri.parse('$_apiUrl/auth/otp/verify'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'phone': phone,
          'otp': otp,
          if (fullName != null) 'fullName': fullName,
          if (category != null) 'category': category,
        }),
      ).timeout(const Duration(seconds: 8));

      final data = json.decode(response.body);
      if (response.statusCode == 200) {
        final token = data['session']?['access_token'] ?? data['token'] ?? '';
        final userId = data['user']?['id']?.toString() ?? '';
        final role = data['user']?['role'] ?? 'user';
        final cat = data['user']?['category'] ?? category ?? 'Traveller';

        if (token.isNotEmpty) {
          await ref.read(ociAuthStateProvider.notifier).setLoggedIn(
            token: token,
            phone: phone,
            userId: userId,
            role: role,
            category: cat,
          );
        }

        state = const AsyncValue.data(null);
        return data;
      } else {
        throw Exception(data['error'] ?? 'OTP Verification failed');
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> setPin({
    required String phone,
    required String pin,
    required String confirmPin,
  }) async {
    state = const AsyncValue.loading();
    try {
      final response = await http.post(
        Uri.parse('$_apiUrl/auth/pin/set'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'phone': phone,
          'pin': pin,
          'confirmPin': confirmPin,
        }),
      ).timeout(const Duration(seconds: 8));

      final data = json.decode(response.body);
      if (response.statusCode == 200) {
        state = const AsyncValue.data(null);
        return data;
      } else {
        throw Exception(data['error'] ?? 'Failed to set PIN');
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> loginWithPin({
    required String phone,
    required String pin,
  }) async {
    state = const AsyncValue.loading();
    try {
      final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
      final response = await http.post(
        Uri.parse('$_apiUrl/auth/pin'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'phone': cleanPhone,
          'pin': pin,
        }),
      ).timeout(const Duration(seconds: 8));

      final data = json.decode(response.body);
      if (response.statusCode == 200) {
        final token = data['session']?['access_token'] ?? data['token'] ?? '';
        final userId = data['user']?['id']?.toString() ?? '';
        final role = data['user']?['role'] ?? 'user';
        final cat = data['user']?['category'] ?? 'Traveller';

        if (token.isNotEmpty) {
          await ref.read(ociAuthStateProvider.notifier).setLoggedIn(
            token: token,
            phone: cleanPhone,
            userId: userId,
            role: role,
            category: cat,
          );
        }

        state = const AsyncValue.data(null);
        return data;
      } else {
        throw Exception(data['error'] ?? 'PIN Login failed');
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<void> signOut() async {
    await ref.read(ociAuthStateProvider.notifier).signOut();
  }
}

final authControllerProvider = AsyncNotifierProvider<AuthController, void>(() {
  return AuthController();
});
