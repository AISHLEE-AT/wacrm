import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher.dart';

class WhatsAppService {
  /// Opens WhatsApp natively on mobile with pre-filled message
  static Future<bool> openWhatsApp({
    required String phone,
    required String message,
  }) async {
    // Clean phone number (strip spaces, +, hyphens)
    String cleanPhone = phone.replaceAll(RegExp(r'[^\d]'), '');
    if (cleanPhone.length == 10) {
      cleanPhone = '91$cleanPhone';
    }
    final encodedMessage = Uri.encodeComponent(message);

    // Primary: Mobile App Deep-Link Intent
    final nativeAppUri = Uri.parse('whatsapp://send?phone=$cleanPhone&text=$encodedMessage');
    
    // Fallback: wa.me HTTPS Link
    final webUri = Uri.parse('https://wa.me/$cleanPhone?text=$encodedMessage');

    try {
      if (await canLaunchUrl(nativeAppUri)) {
        return await launchUrl(nativeAppUri, mode: LaunchMode.externalApplication);
      } else if (await canLaunchUrl(webUri)) {
        return await launchUrl(webUri, mode: LaunchMode.externalApplication);
      } else {
        return false;
      }
    } catch (e) {
      debugPrint('Error launching WhatsApp: $e');
      return false;
    }
  }

  /// Launch Native Google Maps App for Turn-by-Turn Navigation ($0 API Cost)
  static Future<bool> openGoogleMapsApp({
    required double destinationLat,
    required double destinationLng,
    double? originLat,
    double? originLng,
  }) async {
    // Turn-by-turn navigation intent
    final googleNavUri = Uri.parse('google.navigation:q=$destinationLat,$destinationLng&mode=d');
    
    // Web / App fallback URL
    final mapsWebUri = originLat != null && originLng != null
        ? Uri.parse('https://www.google.com/maps/dir/?api=1&origin=$originLat,$originLng&destination=$destinationLat,$destinationLng&travelmode=driving')
        : Uri.parse('https://www.google.com/maps/search/?api=1&query=$destinationLat,$destinationLng');

    try {
      if (await canLaunchUrl(googleNavUri)) {
        return await launchUrl(googleNavUri, mode: LaunchMode.externalApplication);
      } else if (await canLaunchUrl(mapsWebUri)) {
        return await launchUrl(mapsWebUri, mode: LaunchMode.externalApplication);
      } else {
        return false;
      }
    } catch (e) {
      debugPrint('Error launching Google Maps: $e');
      return false;
    }
  }

  /// Launch 1-Tap UPI Payment Intent (GPay, PhonePe, Paytm, BHIM)
  static Future<bool> openUpiPayment({
    required String upiId,
    required String name,
    required double amount,
    required String note,
  }) async {
    final encodedName = Uri.encodeComponent(name);
    final encodedNote = Uri.encodeComponent(note);
    final upiUri = Uri.parse(
      'upi://pay?pa=$upiId&pn=$encodedName&am=${amount.toStringAsFixed(2)}&cu=INR&tn=$encodedNote',
    );

    try {
      if (await canLaunchUrl(upiUri)) {
        return await launchUrl(upiUri, mode: LaunchMode.externalApplication);
      } else {
        return false;
      }
    } catch (e) {
      debugPrint('Error launching UPI Payment: $e');
      return false;
    }
  }

  /// Automated Ride Confirmation Message Template for WhatsApp with Auto Live GPS Pin
  static String getRideConfirmationTemplate({
    required String vehicleCategory,
    required String pickupAddress,
    required String dropoffAddress,
    required double fare,
    String? pincode,
    double? lat,
    double? lng,
    String? riderName,
  }) {
    StringBuffer sb = StringBuffer();
    sb.writeln('🚗 *RideO Booking Request*');
    if (riderName != null && riderName.isNotEmpty) {
      sb.writeln('👤 *Rider*: $riderName');
    }
    sb.writeln('• *Vehicle*: $vehicleCategory');
    sb.writeln('• *Pickup*: $pickupAddress');
    if (pincode != null && pincode.isNotEmpty) {
      sb.writeln('• *Pincode*: $pincode');
    }
    sb.writeln('• *Dropoff*: $dropoffAddress');
    sb.writeln('• *Estimated Fare*: ₹${fare.toStringAsFixed(0)}');
    
    if (lat != null && lng != null) {
      sb.writeln('\n📍 *Live GPS Location Pin*: https://maps.google.com/?q=$lat,$lng');
    }
    sb.writeln('\nPlease confirm availability!');
    return sb.toString();
  }

  /// Generic Auto Location-Pinned WhatsApp Message Helper
  static String buildLocationPinnedMessage({
    required String header,
    required Map<String, String> details,
    required String address,
    required String pincode,
    double? lat,
    double? lng,
  }) {
    StringBuffer sb = StringBuffer();
    sb.writeln(header);
    sb.writeln('');
    details.forEach((key, value) {
      if (value.isNotEmpty) {
        sb.writeln('• *$key*: $value');
      }
    });
    sb.writeln('• *Address*: $address');
    if (pincode.isNotEmpty) {
      sb.writeln('• *Pincode*: $pincode');
    }
    if (lat != null && lng != null) {
      sb.writeln('📍 *Live GPS Location Pin*: https://maps.google.com/?q=$lat,$lng');
    }
    return sb.toString();
  }
}
