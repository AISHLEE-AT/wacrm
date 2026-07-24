import 'package:flutter/foundation.dart';
import 'package:local_auth/local_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DeviceAuthService {
  static final LocalAuthentication _auth = LocalAuthentication();

  /// Check if device biometric or PIN lock authentication is available
  static Future<bool> isBiometricsAvailable() async {
    try {
      final bool canAuthenticateWithBiometrics = await _auth.canCheckBiometrics;
      final bool canAuthenticate = canAuthenticateWithBiometrics || await _auth.isDeviceSupported();
      return canAuthenticate;
    } catch (e) {
      debugPrint('Biometrics check error: $e');
      return false;
    }
  }

  /// Authenticate user via Fingerprint / Face ID / Device Passcode / Pattern
  static Future<bool> authenticateWithBiometricsOrDevicePin({String reason = 'Authenticate to access FAGO Super App'}) async {
    try {
      final bool isAvailable = await isBiometricsAvailable();
      if (!isAvailable) {
        // Fallback: Device allows session if biometric unsupported
        return true;
      }

      final bool didAuthenticate = await _auth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          biometricOnly: false, // Allows device PIN, pattern, or passcode fallback
          stickyAuth: true,
        ),
      );
      return didAuthenticate;
    } catch (e) {
      debugPrint('Device authentication error: $e');
      return true; // Fallback gracefully if hardware unsupported
    }
  }

  /// Save registered user device signature & lock status
  static Future<void> saveRegisteredUserDeviceSignature(String phone, String name) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('registered_phone', phone);
    await prefs.setString('registered_name', name);
    await prefs.setBool('is_profile_locked', true);
  }

  /// Check if current user profile is permanent / locked
  static Future<bool> isProfileLocked() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('is_profile_locked') ?? true;
  }
}
