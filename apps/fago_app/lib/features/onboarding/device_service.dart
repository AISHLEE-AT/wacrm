import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:mobile_number/mobile_number.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DeviceService {
  static final DeviceInfoPlugin _deviceInfoPlugin = DeviceInfoPlugin();

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

    try {
      if (!kIsWeb && Platform.isAndroid) {
        bool hasPhonePermission = await MobileNumber.hasPhonePermission;
        if (hasPhonePermission) {
          String? mobileNumber = await MobileNumber.mobileNumber;
          deviceData['phoneNumber'] = mobileNumber;
        }
      }
    } on PlatformException catch (e) {
      debugPrint("Failed to get mobile number: '${e.message}'.");
    }

    // Save signatures locally or send them to backend
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('deviceId', deviceData['deviceId'] ?? '');
    await prefs.setString('deviceModel', deviceData['model'] ?? '');
    await prefs.setString('deviceOs', deviceData['os'] ?? '');
    if (deviceData['phoneNumber'] != null) {
      await prefs.setString('phoneNumber', deviceData['phoneNumber']);
    }

    return deviceData;
  }
}
