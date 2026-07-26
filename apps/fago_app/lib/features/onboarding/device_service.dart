import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:mobile_number/mobile_number.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DeviceService {
  static final DeviceInfoPlugin _deviceInfoPlugin = DeviceInfoPlugin();

  static const String keyExtractedSimPhone = 'extracted_sim_phone';
  static const String keyAllSimNumbers = 'all_sim_numbers';

  /// Clean raw phone string into a 10-digit Indian mobile number
  static String? cleanToTenDigits(String? raw) {
    if (raw == null || raw.isEmpty) return null;
    final digits = raw.replaceAll(RegExp(r'\D'), '');
    if (digits.length >= 10) {
      final tenDigit = digits.substring(digits.length - 10);
      if (RegExp(r'^[6-9]\d{9}$').hasMatch(tenDigit)) {
        return tenDigit;
      }
    }
    return null;
  }

  static Future<Map<String, dynamic>> collectDeviceSignatures() async {
    Map<String, dynamic> deviceData = {};

    try {
      if (kIsWeb) {
        WebBrowserInfo webBrowserInfo = await _deviceInfoPlugin.webBrowserInfo;
        deviceData['os'] = 'web';
        deviceData['model'] = webBrowserInfo.userAgent;
        deviceData['deviceId'] = webBrowserInfo.vendor;
      } else if (Platform.isAndroid) {
        AndroidDeviceInfo androidInfo = await _deviceInfoPlugin.androidInfo;
        deviceData['os'] = 'android';
        deviceData['model'] = androidInfo.model;
        deviceData['deviceId'] = androidInfo.id;
      } else if (Platform.isIOS) {
        IosDeviceInfo iosInfo = await _deviceInfoPlugin.iosInfo;
        deviceData['os'] = 'ios';
        deviceData['model'] = iosInfo.name;
        deviceData['deviceId'] = iosInfo.identifierForVendor;
      }
    } catch (e) {
      debugPrint('Failed to get device info: $e');
    }

    // SIM Phone Number Extraction (Android Device-Level SIM Cell Number)
    List<String> extractedSimNumbers = [];
    String? primarySimNumber;

    try {
      if (!kIsWeb && Platform.isAndroid) {
        bool hasPhonePermission = await MobileNumber.hasPhonePermission;
        if (!hasPhonePermission) {
          // Attempt to request if not yet granted
          try {
            await MobileNumber.requestPhonePermission;
            hasPhonePermission = await MobileNumber.hasPhonePermission;
          } catch (_) {}
        }

        if (hasPhonePermission) {
          // 1. Primary mobile number
          String? mobileNumber = await MobileNumber.mobileNumber;
          String? cleanedPrimary = cleanToTenDigits(mobileNumber);
          if (cleanedPrimary != null) {
            primarySimNumber = cleanedPrimary;
            extractedSimNumbers.add(cleanedPrimary);
          }

          // 2. Secondary/Dual SIM Cards
          final List<SimCard>? simCards = await MobileNumber.getSimCards;
          if (simCards != null) {
            for (var sim in simCards) {
              String? simNum = cleanToTenDigits(sim.number);
              if (simNum != null && !extractedSimNumbers.contains(simNum)) {
                extractedSimNumbers.add(simNum);
                primarySimNumber ??= simNum;
              }
            }
          }
        }
      }
    } on PlatformException catch (e) {
      debugPrint("Failed to get mobile number: '${e.message}'.");
    } catch (e) {
      debugPrint("SIM extraction note: $e");
    }

    if (primarySimNumber != null) {
      deviceData['phoneNumber'] = primarySimNumber;
    }

    // Save signatures locally
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('deviceId', deviceData['deviceId'] ?? '');
    await prefs.setString('deviceModel', deviceData['model'] ?? '');
    await prefs.setString('deviceOs', deviceData['os'] ?? '');

    if (primarySimNumber != null) {
      await prefs.setString(keyExtractedSimPhone, primarySimNumber);
      await prefs.setString('phoneNumber', primarySimNumber);
    }
    if (extractedSimNumbers.isNotEmpty) {
      await prefs.setStringList(keyAllSimNumbers, extractedSimNumbers);
    }

    return deviceData;
  }

  /// Retrieve the auto-extracted SIM phone number stored during onboarding
  static Future<String?> getExtractedSimPhone() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(keyExtractedSimPhone) ?? prefs.getString('phoneNumber');
  }

  /// Retrieve all extracted SIM phone numbers (for Dual SIM devices)
  static Future<List<String>> getAllExtractedSimNumbers() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(keyAllSimNumbers) ?? [];
  }
}
