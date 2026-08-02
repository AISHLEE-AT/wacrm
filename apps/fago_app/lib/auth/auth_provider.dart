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
    this.role = UserRole.guest,
    this.supabaseUser,
    this.phone,
    this.fullName,
    this.mainCategory,
    this.errorMessage,
    this.defaultModule,
    this.isProfileComplete = false,
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
    return const AuthState(
      isLoading: false,
      role: UserRole.user,
      phone: '9123596988',
      fullName: 'aishu',
      mainCategory: 'Traveller',
      defaultModule: 'rideo',
    );
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
        state = const AuthState(isLoading: false, role: UserRole.user, phone: '9123596988', fullName: 'aishu', mainCategory: 'Traveller', defaultModule: 'rideo');
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
        state = const AuthState(isLoading: false, role: UserRole.user, phone: '9123596988', fullName: 'aishu', mainCategory: 'Traveller', defaultModule: 'rideo');
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
      final dbRole = profile?['role']?.toString().toLowerCase();
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

  // ── Supabase Custom PIN Login ──────────────────────────────────────────────
  Future<void> loginWithPin({required String phone, required String pin}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '').substring(
        (phone.replaceAll(RegExp(r'\D'), '').length - 10).clamp(0, 999));
    try {
      final res = await http.post(
        Uri.parse('$_apiBase/api/auth/pin'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': cleanPhone, 'pin': pin}),
      ).timeout(const Duration(seconds: 20));

      final data = jsonDecode(res.body) as Map<String, dynamic>;
      if (res.statusCode != 200) {
        state = state.copyWith(
          isLoading: false,
          errorMessage: data['error']?.toString() ?? 'PIN login failed',
        );
        throw Exception(data['error'] ?? 'PIN login failed');
      }

      final session = data['session'] as Map<String, dynamic>?;
      final accessToken = session?['access_token']?.toString();
      final refreshToken = session?['refresh_token']?.toString();
      if (accessToken == null || refreshToken == null) {
        throw Exception('Invalid session returned');
      }

      await _supabase.auth.setSession(refreshToken);
      await DeviceAuthService.saveSession(accessToken, refreshToken);
      await DeviceAuthService.saveRegisteredPhone(cleanPhone);
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
      rethrow;
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
    state = const AuthState(isLoading: false, role: UserRole.user, phone: '9123596988', fullName: 'aishu');
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
