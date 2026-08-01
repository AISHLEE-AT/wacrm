import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../services/device_auth_service.dart';

// ── Unified User Roles (matches web & Kotlin) ─────────────────────────────
enum UserRole { guest, admin, user, provider, driver, lister, professional }

class AuthState {
  final bool isLoading;
  final UserRole role;
  final User? supabaseUser;
  final String? phone;
  final String? fullName;
  final String? mainCategory;
  final String? errorMessage;
  final String? defaultModule;
  final bool isProfileComplete;

  const AuthState({
    this.isLoading = false,
    this.role = UserRole.user,
    this.supabaseUser,
    this.phone = '9123596988',
    this.fullName = 'aishu',
    this.mainCategory = 'Traveller',
    this.errorMessage,
    this.defaultModule = '/rideo',
    this.isProfileComplete = true,
  });

  AuthState copyWith({
    bool? isLoading,
    UserRole? role,
    User? supabaseUser,
    String? phone,
    String? fullName,
    String? mainCategory,
    String? errorMessage,
    String? defaultModule,
    bool? isProfileComplete,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      role: role ?? this.role,
      supabaseUser: supabaseUser ?? this.supabaseUser,
      phone: phone ?? this.phone,
      fullName: fullName ?? this.fullName,
      mainCategory: mainCategory ?? this.mainCategory,
      errorMessage: errorMessage ?? this.errorMessage,
      defaultModule: defaultModule ?? this.defaultModule,
      isProfileComplete: isProfileComplete ?? this.isProfileComplete,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  final SupabaseClient _supabase = Supabase.instance.client;

  /// Base URL for FAGO API (WhatsApp OTP, PIN login, profile)
  String get _apiBase =>
      dotenv.env['NEXT_PUBLIC_APP_URL'] ??
      dotenv.env['FIREBASE_BRIDGE_URL']?.replaceAll('/api/auth/firebase-bridge', '') ??
      'https://watscrm.vercel.app';

  // Bootstrap admin phones — DB role='admin' is primary source of truth
  static const List<String> _bootstrapAdminPhones = [
    '9486335870', '919486335870',
  ];
  static const String _bootstrapAdminEmail = 'aishleetechnology@gmail.com';

  @override
  AuthState build() {
    _init();
    return const AuthState();
  }

  void _init() {
    _supabase.auth.onAuthStateChange.listen((data) async {
      if (data.session?.user != null) {
        final sbUser = data.session!.user;
        final phone = sbUser.phone ??
            sbUser.userMetadata?['phone']?.toString() ??
            sbUser.email?.split('@').first;
        await _resolveRole(phone, sbUser);
      } else {
        state = const AuthState(isLoading: false, role: UserRole.guest);
      }
    });

    // Check existing session on startup
    final existingSession = _supabase.auth.currentSession;
    if (existingSession?.user != null) {
      final sbUser = existingSession!.user;
      final phone = sbUser.phone ??
          sbUser.userMetadata?['phone']?.toString() ??
          sbUser.email?.split('@').first;
      _resolveRole(phone, sbUser);
    } else {
      _checkDeviceSession();
    }
  }

  Future<void> _checkDeviceSession() async {
    try {
      final regPhone = await DeviceAuthService.getRegisteredPhone();
      if (regPhone == null || regPhone.isEmpty) {
        state = const AuthState(isLoading: false, role: UserRole.guest);
        return;
      }
      // Attempt to restore Supabase session from device
      final session = await DeviceAuthService.getStoredSession();
      if (session != null) {
        await _supabase.auth.setSession(session);
        return; // onAuthStateChange will handle the rest
      }
    } catch (e) {
      debugPrint('Device session restore error: $e');
    }
    state = const AuthState(isLoading: false, role: UserRole.guest);
  }

  /// Resolves role from Supabase profiles table (DB as single source of truth)
  Future<void> _resolveRole(String? phone, User? sbUser) async {
    if (sbUser == null) {
      state = const AuthState(isLoading: false, role: UserRole.guest);
      return;
    }

    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      // Fetch profile from DB (Dual Strategy: ID first, then Phone)
      Map<String, dynamic>? profile;
      try {
        final result = await _supabase
            .from('profiles')
            .select('full_name, main_category, role, profile_complete, default_module')
            .eq('id', sbUser.id)
            .maybeSingle();
        profile = result;
      } catch (_) {}

      final cleanPhone = phone?.replaceAll(RegExp(r'\D'), '') ?? '';
      final digits = cleanPhone.length > 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;

      if ((profile == null || profile['full_name'] == null || profile['full_name'].toString().startsWith('User ')) && digits.isNotEmpty) {
        try {
          final results = await _supabase
              .from('profiles')
              .select('full_name, main_category, role, profile_complete, default_module')
              .or('phone.eq.$digits,phone.eq.91$digits,whatsapp.eq.$digits,whatsapp.eq.91$digits')
              .limit(1);
          if (results.isNotEmpty) {
            profile = results.first;
          }
        } catch (_) {}
      }

      // Resolve admin: DB first, then bootstrap fallback
      final isBootstrapAdmin = _bootstrapAdminPhones.any((p) =>
          digits == p || digits == p.substring(p.length > 10 ? p.length - 10 : 0)) ||
          (sbUser.email?.contains(_bootstrapAdminEmail) ?? false);
      final isAdmin = dbRole == 'admin' || isBootstrapAdmin;
      final isDriver = dbRole == 'driver';

      UserRole resolvedRole;
      if (isAdmin) {
        resolvedRole = UserRole.admin;
      } else if (isDriver) {
        resolvedRole = UserRole.driver;
      } else {
        resolvedRole = UserRole.user;
      }

      final defaultModule = profile?['default_module']?.toString() ??
          _defaultModuleForRole(resolvedRole, profile?['main_category']?.toString());

      state = state.copyWith(
        isLoading: false,
        role: resolvedRole,
        supabaseUser: sbUser,
        phone: digits.isNotEmpty ? digits : phone,
        fullName: profile?['full_name']?.toString(),
        mainCategory: profile?['main_category']?.toString() ?? 'Traveller',
        defaultModule: defaultModule,
        isProfileComplete: profile?['profile_complete'] == true,
        errorMessage: null,
      );
    } catch (e) {
      debugPrint('Role resolution error: $e');
      state = state.copyWith(
        isLoading: false,
        role: UserRole.user,
        supabaseUser: sbUser,
        errorMessage: null,
      );
    }
  }

  String _defaultModuleForRole(UserRole role, String? category) {
    if (role == UserRole.admin) return 'crm';
    if (role == UserRole.driver) return 'drivo';
    const map = {
      'Traveller': 'rideo', 'Driver': 'drivo', 'Farmer': 'rento',
      'Shopper': 'dealo', 'Student': 'teacho', 'Teacher': 'teacho',
      'Financier': 'moneyo', 'Tourist': 'touro',
    };
    return map[category] ?? 'rideo';
  }

  // ── Customer-Initiated WhatsApp Inbound Session (Deep Link + Polling) ──────
  Future<Map<String, dynamic>> initWhatsAppSession({
    required String phone,
    required String fullName,
    required String category,
  }) async {
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '').substring(
        (phone.replaceAll(RegExp(r'\D'), '').length - 10).clamp(0, 999));
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/api/auth/whatsapp/init-session'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'phone': cleanPhone,
          'fullName': fullName,
          'category': category,
        }),
      ).timeout(const Duration(seconds: 20));

      final data = jsonDecode(res.body) as Map<String, dynamic>;
      if (res.statusCode == 200 && data['success'] == true) {
        return data;
      }
      throw Exception(data['error'] ?? data['message'] ?? 'Failed to initialize WhatsApp session');
    } catch (e) {
      throw Exception('Could not initialize WhatsApp session: $e');
    }
  }

  Future<Map<String, dynamic>> pollWhatsAppSession(String pollId) async {
    try {
      final res = await http.get(
        Uri.parse('$_apiBase/api/auth/whatsapp/poll-session?poll_id=$pollId'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      final data = jsonDecode(res.body) as Map<String, dynamic>;
      if (res.statusCode == 200) {
        if (data['status'] == 'verified') {
          final session = data['session'] as Map<String, dynamic>?;
          if (session != null) {
            final accessToken = session['access_token']?.toString();
            final refreshToken = session['refresh_token']?.toString();
            if (accessToken != null && refreshToken != null) {
              await _supabase.auth.setSession(refreshToken);
              await DeviceAuthService.saveSession(accessToken, refreshToken);
              if (data['phone'] != null) {
                await DeviceAuthService.saveRegisteredPhone(data['phone'].toString());
              }
              if (data['full_name'] != null) {
                await DeviceAuthService.saveRegisteredName(data['full_name'].toString());
              }
            }
          }
        }
        return data;
      }
      throw Exception(data['error'] ?? 'Polling failed');
    } catch (e) {
      return {'status': 'pending', 'error': e.toString()};
    }
  }

  // ── Send WhatsApp OTP ──────────────────────────────────────────────────────
  Future<Map<String, dynamic>> sendWhatsAppOTP(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '').substring(
        (phone.replaceAll(RegExp(r'\D'), '').length - 10).clamp(0, 999));
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/api/auth/whatsapp/send-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': cleanPhone}),
      ).timeout(const Duration(seconds: 20));
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      if (res.statusCode == 200) return data;
      throw Exception(data['error'] ?? 'Failed to send OTP');
    } catch (e) {
      throw Exception('Could not reach FAGO server: $e');
    }
  }

  // ── Verify WhatsApp OTP ────────────────────────────────────────────────────
  Future<void> verifyWhatsAppOTP({
    required String phone,
    required String otp,
    String? fullName,
    String? category,
    String? pin,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '').substring(
        (phone.replaceAll(RegExp(r'\D'), '').length - 10).clamp(0, 999));
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/api/auth/whatsapp/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'phone': cleanPhone,
          'otp': otp,
          if (fullName != null) 'fullName': fullName,
          if (category != null) 'category': category,
          if (pin != null && pin.length == 4) 'pin': pin,
        }),
      ).timeout(const Duration(seconds: 20));

      final data = jsonDecode(res.body) as Map<String, dynamic>;
      if (res.statusCode != 200) {
        state = state.copyWith(isLoading: false, errorMessage: data['error']?.toString() ?? 'OTP verification failed');
        return;
      }

      final session = data['session'] as Map<String, dynamic>?;
      if (session == null) {
        state = state.copyWith(isLoading: false, errorMessage: 'Invalid session received');
        return;
      }

      final accessToken = session['access_token']?.toString();
      final refreshToken = session['refresh_token']?.toString();
      if (accessToken == null || refreshToken == null) {
        state = state.copyWith(isLoading: false, errorMessage: 'Missing tokens in session');
        return;
      }

      await _supabase.auth.setSession(refreshToken);
      await DeviceAuthService.saveSession(accessToken, refreshToken);
      await DeviceAuthService.saveRegisteredPhone(cleanPhone);
      if (fullName != null) await DeviceAuthService.saveRegisteredName(fullName);
      // Auth state change listener will resolve role
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: 'Network error: $e');
    }
  }

  // ── Instant Bypass Login (Single Supabase DB Sync) ──────────────────────────
  Future<void> instantBypassLogin({
    required String phone,
    String? fullName,
    String? category,
  }) async {
    await verifyWhatsAppOtp(
      phone: phone,
      otp: 'BYPASS',
      fullName: fullName,
      category: category,
    );
  }

  // ── PIN Login (DB-backed) ──────────────────────────────────────────────────
  Future<void> pinLogin({required String phone, required String pin}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '').substring(
        (phone.replaceAll(RegExp(r'\D'), '').length - 10).clamp(0, 999));
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/api/auth/pin-login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': cleanPhone, 'pin': pin}),
      ).timeout(const Duration(seconds: 20));

      final data = jsonDecode(res.body) as Map<String, dynamic>;
      if (res.statusCode != 200) {
        state = state.copyWith(isLoading: false, errorMessage: data['error']?.toString() ?? 'PIN login failed');
        return;
      }

      final session = data['session'] as Map<String, dynamic>?;
      final accessToken = session?['access_token']?.toString();
      final refreshToken = session?['refresh_token']?.toString();
      if (accessToken == null || refreshToken == null) {
        state = state.copyWith(isLoading: false, errorMessage: 'Invalid session');
        return;
      }

      await _supabase.auth.setSession(refreshToken);
      await DeviceAuthService.saveSession(accessToken, refreshToken);
      await DeviceAuthService.saveRegisteredPhone(cleanPhone);
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: 'PIN login error: $e');
    }
  }

  // ── Sign Out ────────────────────────────────────────────────────────────────
  Future<void> signOut() async {
    try {
      await _supabase.auth.signOut();
      await DeviceAuthService.clearSession();
      await DeviceAuthService.clearRegisteredUser();
    } catch (e) {
      debugPrint('Sign out error: $e');
    }
    state = const AuthState(isLoading: false, role: UserRole.guest);
  }

  // ── Check if phone is registered ────────────────────────────────────────────
  Future<Map<String, dynamic>?> checkPhoneRegistration(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '').substring(
        (phone.replaceAll(RegExp(r'\D'), '').length - 10).clamp(0, 999));
    try {
      // Try API first
      final res = await http.get(
        Uri.parse('$_apiBase/api/fago/search?phone=$cleanPhone'),
      ).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        if (data['profile'] != null) return data['profile'] as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('API search failed, trying Supabase direct: $e');
    }
    // Fallback: direct Supabase query
    try {
      final results = await _supabase
          .from('profiles')
          .select('full_name, main_category, pin_hash')
          .or('phone.eq.$cleanPhone,phone.eq.91$cleanPhone,whatsapp.eq.$cleanPhone')
          .limit(1);
      return results.isNotEmpty ? results.first as Map<String, dynamic> : null;
    } catch (e) {
      return null;
    }
  }

  // ── Compatibility Shims (for login_screen.dart) ──────────────────────────
  // These delegate to the canonical new methods so existing screens compile.

  /// @deprecated Use checkPhoneRegistration()
  Future<Map<String, dynamic>?> fetchProfileByPhone(String phone) =>
      checkPhoneRegistration(phone);

  /// @deprecated Use sendWhatsAppOTP()
  Future<Map<String, dynamic>> sendWhatsAppOtp(String phone) =>
      sendWhatsAppOTP(phone);

  /// @deprecated Use verifyWhatsAppOTP()
  Future<void> verifyWhatsAppOtp(
    String phone,
    String otp, {
    String? fullName,
    String? userCategory,
    String? pin,
  }) =>
      verifyWhatsAppOTP(
        phone: phone,
        otp: otp,
        fullName: fullName,
        category: userCategory,
        pin: pin,
      );

  /// @deprecated Firebase SMS removed — auto-routes to WhatsApp OTP
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String, int?) codeSent,
    required Function(dynamic) verificationFailed,
    Function(String)? verificationCompleted,
  }) async {
    final clean = phoneNumber.replaceAll(RegExp(r'\D'), '').substring(
        (phoneNumber.replaceAll(RegExp(r'\D'), '').length - 10).clamp(0, 999));
    try {
      final result = await sendWhatsAppOTP(clean);
      codeSent(result['message']?.toString() ?? 'whatsapp_otp_sent', null);
    } catch (e) {
      verificationFailed(e);
    }
  }

  /// @deprecated Firebase SMS removed — no-op for Firebase OTP verify
  Future<void> verifyOTP({
    required String verificationId,
    required String smsCode,
  }) async {
    // Firebase SMS is no longer the primary auth method.
    // Users should verify via WhatsApp OTP (verifyWhatsAppOTP).
    state = state.copyWith(
      isLoading: false,
      errorMessage: 'Please use WhatsApp OTP for login. SMS OTP has been replaced.',
    );
  }

  /// Device biometric/PIN auto-login — restores session from device storage.
  Future<void> verifyDeviceAndAutoLogin(String phone, {String? inputPin}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '').substring(
        (phone.replaceAll(RegExp(r'\D'), '').length - 10).clamp(0, 999));
    try {
      // If PIN provided, use DB-backed PIN login
      if (inputPin != null && inputPin.length == 4) {
        await pinLogin(phone: cleanPhone, pin: inputPin);
        return;
      }
      // Otherwise try to restore session from device
      final storedRefresh = await DeviceAuthService.getStoredSession();
      if (storedRefresh != null && storedRefresh.isNotEmpty) {
        await _supabase.auth.setSession(storedRefresh);
        // onAuthStateChange will handle role resolution
      } else {
        state = state.copyWith(
          isLoading: false,
          errorMessage: 'No saved session. Please login via WhatsApp OTP.',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Auto-login failed: $e',
      );
    }
  }
}

// ── Providers ───────────────────────────────────────────────────────────────
final authProvider = NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);

// Convenience selectors
final isAdminProvider = Provider<bool>((ref) =>
    ref.watch(authProvider).role == UserRole.admin);
final isDriverProvider = Provider<bool>((ref) =>
    ref.watch(authProvider).role == UserRole.driver);
final isLoggedInProvider = Provider<bool>((ref) =>
    ref.watch(authProvider).role != UserRole.guest &&
    ref.watch(authProvider).supabaseUser != null);
final currentUserPhoneProvider = Provider<String?>((ref) =>
    ref.watch(authProvider).phone);
final currentUserNameProvider = Provider<String?>((ref) =>
    ref.watch(authProvider).fullName);
