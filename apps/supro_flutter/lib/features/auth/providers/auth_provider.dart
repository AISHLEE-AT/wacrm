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

class AuthController extends AsyncNotifier<void> {
  late final SupabaseClient _supabase;
  final String _apiUrl = 'https://watscrm.vercel.app/api'; 

  @override
  FutureOr<void> build() {
    _supabase = ref.watch(supabaseClientProvider);
  }

  Future<Map<String, dynamic>> checkUser(String phone) async {
    state = const AsyncValue.loading();
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '').replaceAll(' ', '');
    final clean10 = cleanPhone.length >= 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;
    
    // 1. Try API first with timeout
    try {
      final response = await http.get(
        Uri.parse('$_apiUrl/auth/check?phone=$clean10'),
      ).timeout(const Duration(seconds: 3));
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        state = const AsyncValue.data(null);
        return data;
      }
    } catch (_) {
      // Fallback to direct Supabase query
    }

    // 2. Direct Supabase Fallback (100% offline-resistant & self-healing)
    try {
      final profileRes = await _supabase
          .from('profiles')
          .select('id, full_name, main_category, role, pin_hash, gemini_api_key, last_whatsapp_inbound_at')
          .or('phone.eq.$clean10,phone.eq.91$clean10,phone.ilike.%$clean10%,whatsapp.eq.$clean10,whatsapp.ilike.%$clean10%')
          .order('updated_at', ascending: false)
          .limit(1)
          .maybeSingle();

      if (profileRes != null) {
        state = const AsyncValue.data(null);
        final lastInboundStr = profileRes['last_whatsapp_inbound_at'];
        final lastInbound = lastInboundStr != null ? DateTime.tryParse(lastInboundStr.toString()) : null;
        final isWindowActive = lastInbound != null && DateTime.now().difference(lastInbound).inHours < 24;
        
        return {
          'exists': true,
          'id': profileRes['id'],
          'name': profileRes['full_name'] ?? 'SuprO User',
          'full_name': profileRes['full_name'] ?? 'SuprO User',
          'category': profileRes['main_category'] ?? 'Traveller',
          'role': profileRes['role'] ?? 'user',
          'has_pin': profileRes['pin_hash'] != null && profileRes['pin_hash'].toString().isNotEmpty,
          'gemini_api_key': profileRes['gemini_api_key'],
          'is_whatsapp_session_active': isWindowActive,
          'whatsapp_window_expires_at': lastInbound?.add(const Duration(hours: 24)).toIso8601String(),
        };
      }

      state = const AsyncValue.data(null);
      return {
        'exists': false,
        'category': 'Traveller',
        'role': 'user',
        'has_pin': false,
        'is_whatsapp_session_active': false,
      };
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

  Future<void> sendOtp(String phone) async {
    // UI handles WhatsApp redirect
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
          'fullName': ?fullName,
          'category': ?category,
        }),
      );
      
      final data = json.decode(response.body);
      if (response.statusCode == 200) {
        if (data['session'] != null) {
          await _supabase.auth.setSession(data['session']['refresh_token']);
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
      );
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
    await _supabase.auth.signOut();
  }
}

final authControllerProvider = AsyncNotifierProvider<AuthController, void>(() {
  return AuthController();
});
