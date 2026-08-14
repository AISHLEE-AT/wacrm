import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';


final supabaseClientProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

final authStateProvider = StreamProvider<AuthState>((ref) {
  final client = ref.watch(supabaseClientProvider);
  return client.auth.onAuthStateChange;
});

final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authStateProvider).value;
  return authState?.session?.user;
});

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.watch(supabaseClientProvider));
});

class AuthService {
  final SupabaseClient _supabase;
  final String _apiUrl = 'https://watscrm.vercel.app/api';

  AuthService(this._supabase);

  Future<Map<String, dynamic>?> getProfileByPhone(String phone) async {
    try {
      final res = await _supabase
          .from('profiles')
          .select()
          .eq('phone', phone)
          .maybeSingle();
      return res;
    } catch (_) {
      return null;
    }
  }
}

class AuthController extends AsyncNotifier<void> {
  late final SupabaseClient _supabase;
  final String _apiUrl = 'https://watscrm.vercel.app/api'; 

  @override
  FutureOr<void> build() {
    _supabase = ref.watch(supabaseClientProvider);
  }

  Future<bool> requestOtp(
    String phone, {
    bool isNewUser = false,
    String? name,
    String? category,
  }) async {
    state = const AsyncValue.loading();
    try {
      final response = await http.post(
        Uri.parse('$_apiUrl/auth/otp/request'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'phone': phone,
          'isNewUser': isNewUser,
          'fullName': name,
          'category': category,
        }),
      );
      if (response.statusCode == 200) {
        state = const AsyncValue.data(null);
        return true;
      } else {
        final data = json.decode(response.body);
        throw Exception(data['error'] ?? 'Failed to request OTP');
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> verifyOtp(String phone, String otp) async {
    state = const AsyncValue.loading();
    try {
      final response = await http.post(
        Uri.parse('$_apiUrl/auth/otp/verify'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'phone': phone,
          'otp': otp,
        }),
      );
      
      final data = json.decode(response.body);
      if (response.statusCode == 200) {
        if (data['session'] != null) {
          await _supabase.auth.setSession(data['session']['refresh_token']);
        }
        state = const AsyncValue.data(null);
        return true;
      } else {
        throw Exception(data['error'] ?? 'OTP Verification failed');
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> setPin(String pin) async {
    state = const AsyncValue.loading();
    try {
      final user = _supabase.auth.currentUser;
      if (user == null) throw Exception('User not logged in');

      final response = await http.post(
        Uri.parse('$_apiUrl/auth/pin/set'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': user.id,
          'pin': pin,
        }),
      );
      final data = json.decode(response.body);
      if (response.statusCode == 200) {
        state = const AsyncValue.data(null);
        return true;
      } else {
        throw Exception(data['error'] ?? 'Failed to set PIN');
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<bool> loginWithPin(String phone, String pin) async {
    state = const AsyncValue.loading();
    try {
      final response = await http.post(
        Uri.parse('$_apiUrl/auth/pin'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'phone': phone,
          'pin': pin,
        }),
      );
      final data = json.decode(response.body);
      if (response.statusCode == 200) {
        if (data['session'] != null) {
          await _supabase.auth.setSession(data['session']['refresh_token']);
        }
        state = const AsyncValue.data(null);
        return true;
      } else {
        throw Exception(data['error'] ?? 'PIN Login failed');
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }
  
  Future<void> signOut() async {
    await _supabase.auth.signOut();
  }
}

final authControllerProvider = AsyncNotifierProvider<AuthController, void>(() {
  return AuthController();
});

final authNotifierProvider = authControllerProvider;
