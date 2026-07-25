import 'package:flutter/foundation.dart';
import 'package:local_auth/local_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DeviceAuthService {
  static final LocalAuthentication _auth = LocalAuthentication();

  static const String _keyRegisteredPhone = 'registered_phone';
  static const String _keyRegisteredName = 'registered_name';
  static const String _keyIsProfileLocked = 'is_profile_locked';
  static const String _keyBiometricEnabled = 'biometric_enabled';

  /// Check if device biometric or PIN lock authentication is available
  static Future<bool> isBiometricsAvailable() async {
    try {
      final bool canAuthenticateWithBiometrics = await _auth.canCheckBiometrics;
      final bool canAuthenticate =
          canAuthenticateWithBiometrics || await _auth.isDeviceSupported();
      return canAuthenticate;
    } catch (e) {
      debugPrint('Biometrics check error: $e');
      return false;
    }
  }

  /// Authenticate user via Fingerprint / Face ID / Device Passcode / Pattern.
  /// Called every time the app opens cold (or resumes from background) for a
  /// registered user. Returns true on success, false if the user cancels.
  static Future<bool> authenticateWithBiometricsOrDevicePin({
    String reason =
        'ஒரு கணம் – FAGO-ல் உள்நுழைய உங்கள் திரை பூட்டு / கைரேகையை பயன்படுத்துங்கள்',
  }) async {
    try {
      final bool isAvailable = await isBiometricsAvailable();
      if (!isAvailable) {
        // Graceful fallback: if the device has no lock at all, allow access
        return true;
      }

      final bool didAuthenticate = await _auth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          biometricOnly: false, // Allow device PIN, pattern, or passcode too
          stickyAuth: true,     // Keep prompt alive if app goes to background
          sensitiveTransaction: false,
        ),
      );
      return didAuthenticate;
    } catch (e) {
      debugPrint('Device authentication error: $e');
      // Graceful fallback if hardware is unsupported or exception thrown
      return true;
    }
  }

  /// Save registered user device signature after a successful WhatsApp OTP login.
  /// This marks the device as "registered" so subsequent app opens show biometric.
  static Future<void> saveRegisteredUserDeviceSignature(
      String phone, String name) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyRegisteredPhone, phone);
    await prefs.setString(_keyRegisteredName, name);
    await prefs.setBool(_keyIsProfileLocked, true);
  }

  /// Clear the device signature on explicit sign-out so the next login
  /// starts fresh (no biometric gate until re-registered).
  static Future<void> clearDeviceSignature() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyRegisteredPhone);
    await prefs.remove(_keyRegisteredName);
    await prefs.setBool(_keyIsProfileLocked, false);
  }

  /// Returns true if the current device has a registered (locked) profile.
  /// Used in main.dart / auth_provider to decide whether to show biometric gate.
  static Future<bool> isProfileLocked() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyIsProfileLocked) ?? false;
  }

  /// Retrieve the phone number stored on this device (for display purposes).
  static Future<String?> getRegisteredPhone() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyRegisteredPhone);
  }

  /// Retrieve the name stored on this device (for display on lock screen).
  static Future<String?> getRegisteredName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyRegisteredName);
  }

  /// Returns true if biometric authentication preference is explicitly enabled.
  static Future<bool> isBiometricEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyBiometricEnabled) ?? true;
  }

  /// Toggle biometric authentication preference for this device.
  static Future<void> setBiometricEnabled(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyBiometricEnabled, enabled);
  }

  static const String _keyCustomFagoPin = 'custom_fago_pin';

  /// Save custom 4-digit FAGO PIN for instant device unlock
  static Future<void> setCustomFagoPin(String pin) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyCustomFagoPin, pin);
  }

  /// Retrieve custom 4-digit FAGO PIN
  static Future<String?> getCustomFagoPin() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyCustomFagoPin);
  }

  /// Verify entered 4-digit FAGO PIN
  static Future<bool> verifyCustomFagoPin(String pin) async {
    final stored = await getCustomFagoPin();
    if (stored == null) {
      // Default initial PIN set to last 4 digits of registered phone or 1234
      final phone = await getRegisteredPhone();
      if (phone != null && phone.length >= 4) {
        final lastFour = phone.substring(phone.length - 4);
        return pin == lastFour || pin == '1234';
      }
      return pin == '1234';
    }
    return stored == pin;
  }
}
