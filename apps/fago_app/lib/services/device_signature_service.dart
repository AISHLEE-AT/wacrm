import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart';

class DeviceSignature {
  final String deviceId;
  final String brand;
  final String model;
  final String osVersion;
  final String deviceName;
  final String signatureHash;

  DeviceSignature({
    required this.deviceId,
    required this.brand,
    required this.model,
    required this.osVersion,
    required this.deviceName,
    required this.signatureHash,
  });

  Map<String, dynamic> toJson() => {
        'device_id': deviceId,
        'brand': brand,
        'model': model,
        'os_version': osVersion,
        'device_name': deviceName,
        'signature_hash': signatureHash,
      };

  factory DeviceSignature.fromJson(Map<String, dynamic> json) => DeviceSignature(
        deviceId: json['device_id'] ?? '',
        brand: json['brand'] ?? '',
        model: json['model'] ?? '',
        osVersion: json['os_version'] ?? '',
        deviceName: json['device_name'] ?? '',
        signatureHash: json['signature_hash'] ?? '',
      );
}

class DeviceSignatureService {
  static final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  /// Capture full hardware signature of the current mobile device
  static Future<DeviceSignature> getDeviceSignature() async {
    String deviceId = 'unknown_device';
    String brand = 'Unknown';
    String model = 'Unknown';
    String osVersion = 'Unknown';
    String deviceName = 'Mobile Device';

    try {
      if (Platform.isAndroid) {
        final androidInfo = await _deviceInfo.androidInfo;
        deviceId = androidInfo.id; // Unique Android build / hardware ID
        brand = androidInfo.brand;
        model = androidInfo.model;
        osVersion = 'Android ${androidInfo.version.release} (API ${androidInfo.version.sdkInt})';
        deviceName = '${androidInfo.brand} ${androidInfo.model}';
      } else if (Platform.isIOS) {
        final iosInfo = await _deviceInfo.iosInfo;
        deviceId = iosInfo.identifierForVendor ?? 'ios_vendor_id';
        brand = 'Apple';
        model = iosInfo.model;
        osVersion = 'iOS ${iosInfo.systemVersion}';
        deviceName = iosInfo.name;
      }
    } catch (e) {
      debugPrint('Device signature capture error: $e');
    }

    final signatureHash = '${brand}_${model}_$deviceId'.replaceAll(RegExp(r'\s+'), '_');

    return DeviceSignature(
      deviceId: deviceId,
      brand: brand,
      model: model,
      osVersion: osVersion,
      deviceName: deviceName,
      signatureHash: signatureHash,
    );
  }
}
