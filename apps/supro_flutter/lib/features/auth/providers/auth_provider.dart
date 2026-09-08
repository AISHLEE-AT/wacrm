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
  final String? name;
  final String? upiId;
  final String? location;
  final Map<String, dynamic> userMetadata;

  OciUser({
    required this.id,
    required this.phone,
    required this.role,
    required this.category,
    this.name,
    this.upiId,
    this.location,
    Map<String, dynamic>? userMetadata,
  }) : userMetadata = userMetadata ?? {
          'role': role,
          'category': category,
          if (name != null) 'name': name,
          if (upiId != null) 'upi_id': upiId,
          if (location != null) 'location': location,
        };
}

// ─── 24-Hour WhatsApp Session Model & State ──────────────────────────────────
class WhatsAppSessionState {
  final bool isSessionActive;
  final double hoursRemaining;
  final DateTime? expiresAt;
  final DateTime? lastInboundAt;
  final bool isChecking;

  const WhatsAppSessionState({
    this.isSessionActive = false,
    this.hoursRemaining = 0.0,
    this.expiresAt,
    this.lastInboundAt,
    this.isChecking = false,
  });

  String get formattedRemaining {
    if (!isSessionActive || hoursRemaining <= 0) return 'Expired';
    final totalMinutes = (hoursRemaining * 60).round();
    final h = totalMinutes ~/ 60;
    final m = totalMinutes % 60;
    if (h > 0) return '${h}h ${m}m';
    return '${m}m';
  }

  double get progressFraction {
    if (!isSessionActive || hoursRemaining <= 0) return 0.0;
    final fraction = hoursRemaining / 24.0;
    return fraction.clamp(0.0, 1.0);
  }

  WhatsAppSessionState copyWith({
    bool? isSessionActive,
    double? hoursRemaining,
    DateTime? expiresAt,
    DateTime? lastInboundAt,
    bool? isChecking,
  }) {
    return WhatsAppSessionState(
      isSessionActive: isSessionActive ?? this.isSessionActive,
      hoursRemaining: hoursRemaining ?? this.hoursRemaining,
      expiresAt: expiresAt ?? this.expiresAt,
      lastInboundAt: lastInboundAt ?? this.lastInboundAt,
      isChecking: isChecking ?? this.isChecking,
    );
  }
}

class WhatsAppSessionNotifier extends Notifier<WhatsAppSessionState> {
  Timer? _ticker;

  @override
  WhatsAppSessionState build() {
    _initFromPrefs();
    _startTicker();
    ref.onDispose(() {
      _ticker?.cancel();
    });
    return const WhatsAppSessionState();
  }

  Future<void> _initFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final expiresStr = prefs.getString('whatsapp_window_expires_at');
    final lastInboundStr = prefs.getString('last_whatsapp_inbound_at');

    DateTime? expiresAt;
    DateTime? lastInboundAt;

    if (expiresStr != null) expiresAt = DateTime.tryParse(expiresStr);
    if (lastInboundStr != null) lastInboundAt = DateTime.tryParse(lastInboundStr);

    if (expiresAt != null) {
      _recalc(expiresAt, lastInboundAt);
    }
  }

  void _startTicker() {
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 30), (_) {
      if (state.expiresAt != null) {
        _recalc(state.expiresAt!, state.lastInboundAt);
      }
    });
  }

  void _recalc(DateTime expiresAt, DateTime? lastInboundAt) {
    final now = DateTime.now();
    final diffSec = expiresAt.difference(now).inSeconds;
    if (diffSec <= 0) {
      state = WhatsAppSessionState(
        isSessionActive: false,
        hoursRemaining: 0.0,
        expiresAt: expiresAt,
        lastInboundAt: lastInboundAt,
      );
    } else {
      final hours = double.parse((diffSec / 3600.0).toStringAsFixed(1));
      state = WhatsAppSessionState(
        isSessionActive: true,
        hoursRemaining: hours,
        expiresAt: expiresAt,
        lastInboundAt: lastInboundAt,
      );
    }
  }

  Future<void> updateFromApiData(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    final bool active = data['is_whatsapp_session_active'] == true;
    final double hours = (data['whatsapp_hours_remaining'] ?? 0).toDouble();

    DateTime? expiresAt;
    DateTime? lastInboundAt;

    if (data['whatsapp_window_expires_at'] != null) {
      expiresAt = DateTime.tryParse(data['whatsapp_window_expires_at'].toString());
    } else if (active && hours > 0) {
      expiresAt = DateTime.now().add(Duration(minutes: (hours * 60).round()));
    }

    if (data['last_whatsapp_inbound_at'] != null) {
      lastInboundAt = DateTime.tryParse(data['last_whatsapp_inbound_at'].toString());
    }

    if (expiresAt != null) {
      await prefs.setString('whatsapp_window_expires_at', expiresAt.toIso8601String());
    }
    if (lastInboundAt != null) {
      await prefs.setString('last_whatsapp_inbound_at', lastInboundAt.toIso8601String());
    }

    if (expiresAt != null) {
      _recalc(expiresAt, lastInboundAt);
    } else {
      state = WhatsAppSessionState(
        isSessionActive: active,
        hoursRemaining: hours,
        expiresAt: expiresAt,
        lastInboundAt: lastInboundAt,
      );
    }
  }

  Future<void> renewSessionLocal24Hours() async {
    final now = DateTime.now();
    final expires = now.add(const Duration(hours: 24));
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('whatsapp_window_expires_at', expires.toIso8601String());
    await prefs.setString('last_whatsapp_inbound_at', now.toIso8601String());
    _recalc(expires, now);
  }

  Future<void> refreshSession([String? phone]) async {
    final targetPhone = phone ?? ref.read(currentUserPhoneProvider);
    if (targetPhone == null || targetPhone.isEmpty) return;

    state = state.copyWith(isChecking: true);
    try {
      final clean = targetPhone.replaceAll(RegExp(r'\D'), '');
      final clean10 = clean.length >= 10 ? clean.substring(clean.length - 10) : clean;
      final res = await http.get(Uri.parse('${AppEnv.apiUrl}/api/auth/check?phone=$clean10')).timeout(const Duration(seconds: 6));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        if (data is Map<String, dynamic>) {
          await updateFromApiData(data);
        }
      }
    } catch (_) {
    } finally {
      state = state.copyWith(isChecking: false);
    }
  }
}

final whatsAppSessionProvider = NotifierProvider<WhatsAppSessionNotifier, WhatsAppSessionState>(() {
  return WhatsAppSessionNotifier();
});

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
    final name = prefs.getString('user_name');
    final upi = prefs.getString('user_upi');
    final loc = prefs.getString('user_location');

    if (token != null && phone != null) {
      state = OciAuthState(
        isLoggedIn: true,
        token: token,
        user: OciUser(
          id: userId,
          phone: phone,
          role: role,
          category: category,
          name: name,
          upiId: upi,
          location: loc,
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
    String? name,
    String? upiId,
    String? location,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('oci_auth_token', token);
    await prefs.setString('user_phone', phone);
    if (userId != null) await prefs.setString('user_id', userId);
    if (role != null) await prefs.setString('user_role', role);
    if (category != null) await prefs.setString('user_category', category);
    if (name != null) await prefs.setString('user_name', name);
    if (upiId != null) await prefs.setString('user_upi', upiId);
    if (location != null) await prefs.setString('user_location', location);

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
        name: name,
        upiId: upiId,
        location: location,
      ),
    );
  }

  Future<void> updateCategory(String newCategory) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_category', newCategory);
    if (state.user != null) {
      final u = state.user!;
      state = state.copyWith(
        user: OciUser(
          id: u.id,
          phone: u.phone,
          role: newCategory.toLowerCase() == 'admin' ? 'admin' : (newCategory.toLowerCase() == 'driver' ? 'driver' : u.role),
          category: newCategory,
          name: u.name,
          upiId: u.upiId,
          location: u.location,
        ),
      );
    }
  }

  Future<void> signOut() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('oci_auth_token');
    await prefs.remove('user_id');
    await prefs.remove('user_role');
    await prefs.remove('user_category');
    await prefs.remove('whatsapp_window_expires_at');
    await prefs.remove('last_whatsapp_inbound_at');

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
        if (data is Map<String, dynamic>) {
          ref.read(whatsAppSessionProvider.notifier).updateFromApiData(data);
        }
        state = const AsyncValue.data(null);
        return data;
      } else {
        state = const AsyncValue.data(null);
        return {
          'exists': false,
          'category': 'Traveller',
          'role': 'user',
          'has_pin': false,
          'is_whatsapp_session_active': false,
          'whatsapp_hours_remaining': 0.0,
        };
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return {
        'exists': false,
        'category': 'Traveller',
        'role': 'user',
        'has_pin': false,
        'is_whatsapp_session_active': false,
        'whatsapp_hours_remaining': 0.0,
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
      final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
      final response = await http.post(
        Uri.parse('$_apiUrl/auth/otp/verify'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'phone': cleanPhone,
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
        final name = data['user']?['full_name'] ?? fullName;
        final upi = data['user']?['upi_id'];
        final loc = data['user']?['location'];

        if (token.isNotEmpty) {
          await ref.read(ociAuthStateProvider.notifier).setLoggedIn(
            token: token,
            phone: cleanPhone,
            userId: userId,
            role: role,
            category: cat,
            name: name,
            upiId: upi,
            location: loc,
          );
        }

        // Renew 24h WhatsApp session upon successful OTP entry
        await ref.read(whatsAppSessionProvider.notifier).renewSessionLocal24Hours();

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
        final name = data['user']?['full_name'];
        final upi = data['user']?['upi_id'];
        final loc = data['user']?['location'];

        if (token.isNotEmpty) {
          await ref.read(ociAuthStateProvider.notifier).setLoggedIn(
            token: token,
            phone: cleanPhone,
            userId: userId,
            role: role,
            category: cat,
            name: name,
            upiId: upi,
            location: loc,
          );
        }

        // Refresh or renew session
        ref.read(whatsAppSessionProvider.notifier).refreshSession(cleanPhone);

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
